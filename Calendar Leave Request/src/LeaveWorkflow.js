var LeaveWorkflow = (function () {
  'use strict';

  var DEFAULT_PENDING_PREFIX = 'LEAVE_APPROVAL_PENDING_';
  var RECORD_SUFFIX = '_RECORD';
  var DEFAULT_ORPHAN_THRESHOLD_HOURS = 48;

  function toMilliseconds(hours) {
    return Number.isFinite(hours) ? hours * 60 * 60 * 1000 : null;
  }

  function coerceTimestamp(value) {
    if (!value) {
      return null;
    }

    var date = new Date(value);
    return Number.isNaN(date.valueOf()) ? null : date;
  }

  function buildLogger(logService) {
    if (!logService) {
      return {
        error: function () {},
        warn: function () {},
        info: function () {}
      };
    }

    return {
      error: typeof logService.error === 'function' ? logService.error.bind(logService) : function () {},
      warn: typeof logService.warn === 'function' ? logService.warn.bind(logService) : function () {},
      info: typeof logService.info === 'function' ? logService.info.bind(logService) : function () {}
    };
  }

  function cleanupOrphanApprovalRecords(options) {
    options = options || {};

    var stateStore = options.stateStore;
    var logService = options.logService;
    var clearTokenMapping = options.clearTokenMapping;
    var removePendingLogEntriesForEvent = options.removePendingLogEntriesForEvent;
    var clearApprovalRecord = options.clearApprovalRecord;
    var eventLookup = options.eventLookup;
    var pendingPrefix = options.pendingPrefix || DEFAULT_PENDING_PREFIX;
    var now = options.now || new Date();
    var orphanThresholdHours = options.orphanThresholdHours;

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

    var logger = buildLogger(logService);
    var summary = {
      scanned: 0,
      removed: 0,
      invalidRecords: 0,
      skippedWithPending: 0,
      skippedFresh: 0,
      tokensCleared: 0,
      removedLogRows: 0,
      errors: []
    };

    var entries;
    try {
      entries = stateStore.getByPrefix(pendingPrefix) || {};
    } catch (error) {
      var loadErrorMessage = error && (error.message || String(error));
      logger.error('LeaveWorkflow.cleanupOrphanApprovalRecords', {
        message: 'Failed to load pending entries for orphan cleanup',
        error: loadErrorMessage
      });
      summary.errors.push(loadErrorMessage);
      return summary;
    }

    var pendingEventIds = new Set();
    Object.keys(entries).forEach(function (key) {
      if (!key.endsWith(RECORD_SUFFIX) && key.startsWith(pendingPrefix)) {
        var eventId = key.substring(pendingPrefix.length);
        if (eventId) {
          pendingEventIds.add(eventId);
        }
      }
    });

    var thresholdHours = typeof orphanThresholdHours === 'number' ? orphanThresholdHours : DEFAULT_ORPHAN_THRESHOLD_HOURS;
    var orphanThresholdMs = toMilliseconds(thresholdHours);
    var nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();

    Object.keys(entries).forEach(function (key) {
      if (!key.endsWith(RECORD_SUFFIX)) {
        return;
      }

      summary.scanned += 1;

      var eventId = key.substring(pendingPrefix.length, key.length - RECORD_SUFFIX.length);
      if (!eventId) {
        summary.invalidRecords += 1;
        try {
          stateStore.remove(key);
        } catch (removeError) {
          var removeErrorMessage = removeError && (removeError.message || String(removeError));
          logger.warn('LeaveWorkflow.cleanupOrphanApprovalRecords', {
            message: 'Failed to remove orphan approval record with missing eventId',
            key: key,
            error: removeErrorMessage
          });
          summary.errors.push(removeErrorMessage);
        }
        return;
      }

      if (pendingEventIds.has(eventId)) {
        summary.skippedWithPending += 1;
        return;
      }

      var rawValue = entries[key];
      var record = null;

      if (typeof rawValue === 'string') {
        try {
          record = JSON.parse(rawValue);
        } catch (parseError) {
          var parseErrorMessage = parseError && (parseError.message || String(parseError));
          logger.warn('LeaveWorkflow.cleanupOrphanApprovalRecords', {
            message: 'Failed to parse approval record; proceeding with cleanup',
            eventId: eventId,
            error: parseErrorMessage
          });
          summary.invalidRecords += 1;
        }
      }

      var recordStatus = (function () {
        if (!record) return null;
        if (typeof record.status === 'string') return record.status.toLowerCase();
        if (typeof record.state === 'string') return record.state.toLowerCase();
        return null;
      })();

      var timestampCandidates = [];
      if (record) {
        ['lastActivityAt', 'updatedAt', 'lastNotifiedAt', 'sentAt', 'createdAt', 'queuedAt'].forEach(function (field) {
          if (record[field]) {
            timestampCandidates.push(record[field]);
          }
        });
      }

      var recordTimestamp = timestampCandidates
        .map(coerceTimestamp)
        .find(function (value) { return value instanceof Date; });

      var recordAgeMs = recordTimestamp ? nowMs - recordTimestamp.getTime() : null;
      var isStale = typeof orphanThresholdMs === 'number' && orphanThresholdMs >= 0 && recordAgeMs !== null
        ? recordAgeMs >= orphanThresholdMs
        : false;

      var eventExists = true;
      if (typeof eventLookup === 'function') {
        try {
          eventExists = Boolean(eventLookup(eventId, record));
        } catch (lookupError) {
          var lookupErrorMessage = lookupError && (lookupError.message || String(lookupError));
          logger.warn('LeaveWorkflow.cleanupOrphanApprovalRecords', {
            message: 'Failed to verify event existence during orphan cleanup',
            eventId: eventId,
            error: lookupErrorMessage
          });
          summary.errors.push(lookupErrorMessage);
          eventExists = false;
        }
      }

      if (!isStale && eventExists) {
        var isWaitingState = recordStatus && ['pending', 'waiting', 'queued'].indexOf(recordStatus) !== -1;
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

      var tokens = [];
      if (record && record.approveToken) tokens.push(record.approveToken);
      if (record && record.rejectToken) tokens.push(record.rejectToken);

      tokens.forEach(function (token) {
        try {
          clearTokenMapping(token);
          summary.tokensCleared += 1;
        } catch (tokenError) {
          var tokenErrorMessage = tokenError && (tokenError.message || String(tokenError));
          logger.warn('LeaveWorkflow.cleanupOrphanApprovalRecords', {
            message: 'Failed to clear token during orphan cleanup',
            eventId: eventId,
            token: token,
            error: tokenErrorMessage
          });
          summary.errors.push(tokenErrorMessage);
        }
      });

      try {
        var removedRows = removePendingLogEntriesForEvent(eventId);
        if (typeof removedRows === 'number' && Number.isFinite(removedRows)) {
          summary.removedLogRows += removedRows;
        }
      } catch (logError) {
        var logErrorMessage = logError && (logError.message || String(logError));
        logger.warn('LeaveWorkflow.cleanupOrphanApprovalRecords', {
          message: 'Failed to remove log rows during orphan cleanup',
          eventId: eventId,
          error: logErrorMessage
        });
        summary.errors.push(logErrorMessage);
      }

      try {
        clearApprovalRecord(eventId);
        summary.removed += 1;
      } catch (clearError) {
        var clearErrorMessage = clearError && (clearError.message || String(clearError));
        logger.warn('LeaveWorkflow.cleanupOrphanApprovalRecords', {
          message: 'Failed to clear approval record during orphan cleanup',
          eventId: eventId,
          error: clearErrorMessage
        });
        summary.errors.push(clearErrorMessage);
      }

      var recordKey = key;
      try {
        stateStore.remove(recordKey);
      } catch (recordCleanupError) {
        var recordCleanupErrorMessage = recordCleanupError && (recordCleanupError.message || String(recordCleanupError));
        logger.warn('LeaveWorkflow.cleanupOrphanApprovalRecords', {
          message: 'Failed to remove approval record entry during orphan cleanup',
          eventId: eventId,
          key: recordKey,
          error: recordCleanupErrorMessage
        });
        summary.errors.push(recordCleanupErrorMessage);
      }

      try {
        stateStore.remove(pendingPrefix + eventId);
      } catch (cleanupRemoveError) {
        var cleanupRemoveErrorMessage = cleanupRemoveError && (cleanupRemoveError.message || String(cleanupRemoveError));
        logger.warn('LeaveWorkflow.cleanupOrphanApprovalRecords', {
          message: 'Failed to remove pending marker after orphan cleanup',
          eventId: eventId,
          key: pendingPrefix + eventId,
          error: cleanupRemoveErrorMessage
        });
        summary.errors.push(cleanupRemoveErrorMessage);
      }
    });

    return summary;
  }

  return {
    cleanupOrphanApprovalRecords: cleanupOrphanApprovalRecords,
    DEFAULT_PENDING_PREFIX: DEFAULT_PENDING_PREFIX,
    DEFAULT_ORPHAN_THRESHOLD_HOURS: DEFAULT_ORPHAN_THRESHOLD_HOURS,
    RECORD_SUFFIX: RECORD_SUFFIX
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LeaveWorkflow;
}
