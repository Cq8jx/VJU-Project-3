'use strict';

const DEFAULT_PENDING_PREFIX = 'LEAVE_APPROVAL_PENDING_';
const RECORD_SUFFIX = '_RECORD';
const DEFAULT_ORPHAN_THRESHOLD_HOURS = 48;

function toMilliseconds(hours) {
  return Number.isFinite(hours) ? hours * 60 * 60 * 1000 : null;
}

function coerceTimestamp(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function buildLogger(logService) {
  if (!logService) {
    return {
      error: () => {},
      warn: () => {},
      info: () => {}
    };
  }

  return {
    error: typeof logService.error === 'function' ? logService.error.bind(logService) : () => {},
    warn: typeof logService.warn === 'function' ? logService.warn.bind(logService) : () => {},
    info: typeof logService.info === 'function' ? logService.info.bind(logService) : () => {}
  };
}

function cleanupOrphanApprovalRecords(options = {}) {
  const {
    stateStore,
    logService,
    clearTokenMapping,
    removePendingLogEntriesForEvent,
    clearApprovalRecord,
    eventLookup,
    pendingPrefix = DEFAULT_PENDING_PREFIX,
    now = new Date(),
    orphanThresholdHours = DEFAULT_ORPHAN_THRESHOLD_HOURS
  } = options;

  if (!stateStore || typeof stateStore.getByPrefix !== 'function') {
    throw new Error('cleanupOrphanApprovalRecords requires a stateStore with getByPrefix');
  }

  if (typeof stateStore.remove !== 'function') {
    throw new Error('cleanupOrphanApprovalRecords requires stateStore.remove to discard invalid entries');
  }

  if (typeof clearTokenMapping !== 'function') {
    throw new Error('cleanupOrphanApprovalRecords requires a clearTokenMapping function');
  }

  if (typeof removePendingLogEntriesForEvent !== 'function') {
    throw new Error('cleanupOrphanApprovalRecords requires a removePendingLogEntriesForEvent function');
  }

  if (typeof clearApprovalRecord !== 'function') {
    throw new Error('cleanupOrphanApprovalRecords requires a clearApprovalRecord function');
  }

  const logger = buildLogger(logService);
  const summary = {
    scanned: 0,
    removed: 0,
    invalidRecords: 0,
    skippedWithPending: 0,
    skippedFresh: 0,
    tokensCleared: 0,
    removedLogRows: 0,
    errors: []
  };

  let entries;
  try {
    entries = stateStore.getByPrefix(pendingPrefix) || {};
  } catch (error) {
    logger.error('LeaveWorkflow.cleanupOrphanApprovalRecords', {
      message: 'Failed to load pending entries for orphan cleanup',
      error: error && (error.message || String(error))
    });
    summary.errors.push(error && (error.message || String(error)));
    return summary;
  }

  const pendingEventIds = new Set();
  Object.keys(entries).forEach((key) => {
    if (!key.endsWith(RECORD_SUFFIX) && key.startsWith(pendingPrefix)) {
      const eventId = key.substring(pendingPrefix.length);
      if (eventId) {
        pendingEventIds.add(eventId);
      }
    }
  });

  const orphanThresholdMs = toMilliseconds(orphanThresholdHours);
  const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();

  Object.keys(entries).forEach((key) => {
    if (!key.endsWith(RECORD_SUFFIX)) {
      return;
    }

    summary.scanned += 1;

    const eventId = key.substring(pendingPrefix.length, key.length - RECORD_SUFFIX.length);
    if (!eventId) {
      summary.invalidRecords += 1;
      stateStore.remove(key);
      return;
    }

    if (pendingEventIds.has(eventId)) {
      summary.skippedWithPending += 1;
      return;
    }

    const rawValue = entries[key];
    let record = null;

    if (typeof rawValue === 'string') {
      try {
        record = JSON.parse(rawValue);
      } catch (error) {
        logger.warn('LeaveWorkflow.cleanupOrphanApprovalRecords', {
          message: 'Failed to parse approval record; proceeding with cleanup',
          eventId,
          error: error && (error.message || String(error))
        });
        summary.invalidRecords += 1;
      }
    }

    const recordStatus = (() => {
      if (!record) return null;
      if (typeof record.status === 'string') return record.status.toLowerCase();
      if (typeof record.state === 'string') return record.state.toLowerCase();
      return null;
    })();

    const timestampCandidates = [];
    if (record) {
      ['lastActivityAt', 'updatedAt', 'lastNotifiedAt', 'sentAt', 'createdAt', 'queuedAt'].forEach((field) => {
        if (record[field]) {
          timestampCandidates.push(record[field]);
        }
      });
    }

    const recordTimestamp = timestampCandidates
      .map(coerceTimestamp)
      .find((value) => value instanceof Date);

    const recordAgeMs = recordTimestamp ? nowMs - recordTimestamp.getTime() : null;
    const isStale = typeof orphanThresholdMs === 'number' && orphanThresholdMs >= 0 && recordAgeMs !== null
      ? recordAgeMs >= orphanThresholdMs
      : false;

    const eventExists = typeof eventLookup === 'function' ? Boolean(eventLookup(eventId, record)) : true;

    if (!isStale && eventExists) {
      const isWaitingState = recordStatus && ['pending', 'waiting', 'queued'].includes(recordStatus);
      if (!isWaitingState) {
        if (!recordTimestamp) {
          summary.skippedFresh += 1;
          return;
        }

        if (recordAgeMs !== null && recordAgeMs < (orphanThresholdMs || 0)) {
          summary.skippedFresh += 1;
          return;
        }
      } else {
        summary.skippedFresh += 1;
        return;
      }
    }

    const tokens = [];
    if (record && record.approveToken) tokens.push(record.approveToken);
    if (record && record.rejectToken) tokens.push(record.rejectToken);

    tokens.forEach((token) => {
      try {
        clearTokenMapping(token);
        summary.tokensCleared += 1;
      } catch (error) {
        logger.warn('LeaveWorkflow.cleanupOrphanApprovalRecords', {
          message: 'Failed to clear token during orphan cleanup',
          eventId,
          token,
          error: error && (error.message || String(error))
        });
        summary.errors.push(error && (error.message || String(error)));
      }
    });

    try {
      const removedRows = removePendingLogEntriesForEvent(eventId);
      if (typeof removedRows === 'number' && Number.isFinite(removedRows)) {
        summary.removedLogRows += removedRows;
      }
    } catch (error) {
      logger.warn('LeaveWorkflow.cleanupOrphanApprovalRecords', {
        message: 'Failed to remove log rows during orphan cleanup',
        eventId,
        error: error && (error.message || String(error))
      });
      summary.errors.push(error && (error.message || String(error)));
    }

    try {
      clearApprovalRecord(eventId);
      summary.removed += 1;
    } catch (error) {
      logger.warn('LeaveWorkflow.cleanupOrphanApprovalRecords', {
        message: 'Failed to clear approval record during orphan cleanup',
        eventId,
        error: error && (error.message || String(error))
      });
      summary.errors.push(error && (error.message || String(error)));
    }
  });

  return summary;
}

module.exports = {
  cleanupOrphanApprovalRecords,
  DEFAULT_PENDING_PREFIX,
  DEFAULT_ORPHAN_THRESHOLD_HOURS,
  RECORD_SUFFIX
};
