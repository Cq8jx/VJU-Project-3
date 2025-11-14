'use strict';

const assert = require('assert');
const path = require('path');

const { cleanupOrphanApprovalRecords, DEFAULT_PENDING_PREFIX } = require(path.join('..', 'src', 'LeaveWorkflow.js'));

function createLogger() {
  const entries = [];
  const create = (level) => (message, details) => {
    entries.push({ level, message, details });
  };

  return {
    entries,
    logger: {
      error: create('error'),
      warn: create('warn'),
      info: create('info')
    }
  };
}

function createStateStore(entriesMap) {
  const removedKeys = [];
  return {
    getByPrefix: () => ({ ...entriesMap }),
    remove: (key) => {
      removedKeys.push(key);
      delete entriesMap[key];
    },
    removedKeys
  };
}

(function shouldSkipActiveApprovals() {
  const now = new Date('2025-05-01T00:00:00.000Z');
  const stateStore = createStateStore({
    [`${DEFAULT_PENDING_PREFIX}abc_RECORD`]: JSON.stringify({
      eventId: 'abc',
      status: 'PENDING',
      lastActivityAt: '2025-04-30T23:00:00.000Z',
      approveToken: 'tok-1',
      rejectToken: 'tok-2'
    })
  });

  const loggerBundle = createLogger();
  const tokensCleared = [];

  const summary = cleanupOrphanApprovalRecords({
    stateStore,
    logService: loggerBundle.logger,
    clearTokenMapping: (token) => tokensCleared.push(token),
    removePendingLogEntriesForEvent: () => {
      throw new Error('log rows should not be cleared for active approvals');
    },
    clearApprovalRecord: () => {
      throw new Error('approval record should not be cleared for active approvals');
    },
    now,
    orphanThresholdHours: 72
  });

  assert.strictEqual(summary.removed, 0, 'active approvals must not be removed');
  assert.strictEqual(summary.skippedFresh, 1, 'active approvals should be tracked as skipped');
  assert.strictEqual(tokensCleared.length, 0, 'no tokens should be cleared for active approvals');
  assert.deepStrictEqual(loggerBundle.entries, [], 'no warnings or errors are expected when skipping active approvals');
})();

(function shouldCleanupStaleApprovalsWithoutPendingEntries() {
  const now = new Date('2025-05-01T00:00:00.000Z');
  const staleTimestamp = '2025-04-20T00:00:00.000Z';
  const entriesMap = {
    [`${DEFAULT_PENDING_PREFIX}def_RECORD`]: JSON.stringify({
      eventId: 'def',
      status: 'PENDING',
      lastActivityAt: staleTimestamp,
      approveToken: 'tok-approve',
      rejectToken: 'tok-reject'
    })
  };

  const stateStore = createStateStore(entriesMap);
  const loggerBundle = createLogger();
  const removedTokens = [];
  const clearedEvents = [];
  const removedRowsEvents = [];

  const summary = cleanupOrphanApprovalRecords({
    stateStore,
    logService: loggerBundle.logger,
    clearTokenMapping: (token) => removedTokens.push(token),
    removePendingLogEntriesForEvent: (eventId) => {
      removedRowsEvents.push(eventId);
      return 2;
    },
    clearApprovalRecord: (eventId) => {
      clearedEvents.push(eventId);
    },
    now,
    orphanThresholdHours: 24
  });

  assert.strictEqual(summary.removed, 1, 'stale approval should be removed');
  assert.strictEqual(summary.tokensCleared, 2, 'both tokens must be cleared');
  assert.strictEqual(summary.removedLogRows, 2, 'removed log rows should be added to summary');
  assert.deepStrictEqual(removedTokens.sort(), ['tok-approve', 'tok-reject'], 'all tokens must be cleared');
  assert.deepStrictEqual(clearedEvents, ['def'], 'cleanup must clear the approval record');
  assert.deepStrictEqual(removedRowsEvents, ['def'], 'cleanup must drop log rows for the stale event');
})();

console.log('cleanupOrphanApprovalRecords tests passed');
