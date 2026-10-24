import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEstimatedWait, formatWaitTimeDisplay } from './predictionEngine';
import { isValidTransition, isTokenTerminal, isTokenActive } from './tokenStateMachine';

test('PredictionEngine: 0 customers ahead with idle counter returns 1 min wait', () => {
  const result = calculateEstimatedWait(0, 5, 0, 1, false);
  assert.equal(result.queuePosition, 1);
  assert.equal(result.customersAhead, 0);
  assert.equal(result.estimatedWaitMinutes, 1);
  assert.equal(result.urgencyLevel, 'immediate');
});

test('PredictionEngine: 3 customers ahead with 6 min average returns correct wait', () => {
  const result = calculateEstimatedWait(3, 6, 0, 1, false);
  assert.equal(result.queuePosition, 4);
  assert.equal(result.customersAhead, 3);
  // 3 * 6 = 18 mins
  assert.equal(result.estimatedWaitMinutes, 18);
  assert.equal(result.urgencyLevel, 'waiting');
});

test('PredictionEngine: multiple active counters distributes wait time', () => {
  const singleCounter = calculateEstimatedWait(4, 5, 0, 1, false);
  const twoCounters = calculateEstimatedWait(4, 5, 0, 2, false);
  assert.ok(twoCounters.estimatedWaitMinutes < singleCounter.estimatedWaitMinutes);
});

test('PredictionEngine: formatWaitTimeDisplay handles minutes and hours properly', () => {
  assert.equal(formatWaitTimeDisplay(0), '< 1 min');
  assert.equal(formatWaitTimeDisplay(1), '1 min');
  assert.equal(formatWaitTimeDisplay(14), '14 mins');
  assert.equal(formatWaitTimeDisplay(75), '1h 15m');
  assert.equal(formatWaitTimeDisplay(120), '2h');
});

test('TokenStateMachine: validates legal state transitions', () => {
  assert.equal(isValidTransition('WAITING', 'CALLED'), true);
  assert.equal(isValidTransition('CALLED', 'SERVING'), true);
  assert.equal(isValidTransition('SERVING', 'COMPLETED'), true);
  assert.equal(isValidTransition('WAITING', 'CANCELLED'), true);
  assert.equal(isValidTransition('SKIPPED', 'CALLED'), true);

  // Illegal transitions
  assert.equal(isValidTransition('COMPLETED', 'WAITING'), false);
  assert.equal(isValidTransition('CANCELLED', 'SERVING'), false);
  assert.equal(isValidTransition('WAITING', 'COMPLETED'), false);
});

test('TokenStateMachine: terminal and active status helpers', () => {
  assert.equal(isTokenTerminal('COMPLETED'), true);
  assert.equal(isTokenTerminal('CANCELLED'), true);
  assert.equal(isTokenTerminal('WAITING'), false);

  assert.equal(isTokenActive('WAITING'), true);
  assert.equal(isTokenActive('CALLED'), true);
  assert.equal(isTokenActive('SERVING'), true);
  assert.equal(isTokenActive('COMPLETED'), false);
});
