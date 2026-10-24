import test from 'node:test';
import assert from 'node:assert/strict';
import { globalToast, toast } from './ToastContext';

test('Toast: dispatches notification with correct default properties', () => {
  let received: any = null;
  const unsub = globalToast.subscribeToast((t) => {
    received = t;
  });

  const id = toast.success('Queue token generated successfully!');
  unsub();

  assert.ok(id, 'Returns a valid toast ID');
  assert.ok(received, 'Listener receives toast item');
  assert.equal(received.type, 'success');
  assert.equal(received.message, 'Queue token generated successfully!');
  assert.equal(received.duration, 4000);
});

test('Toast deduplication: drops identical messages within deduplication window', () => {
  const dispatched: any[] = [];
  const unsub = globalToast.subscribeToast((t) => {
    dispatched.push(t);
  });

  const id1 = toast.error('Invalid email or password. Please try again.');
  const id2 = toast.error('Invalid email or password. Please try again.');
  unsub();

  assert.ok(id1, 'First dispatch returns ID');
  assert.equal(id2, null, 'Duplicate within window returns null');
  assert.equal(dispatched.length, 1, 'Only one toast was emitted');
});

test('Toast: dispatches different message types with correct durations', () => {
  const items: any[] = [];
  const unsub = globalToast.subscribeToast((t) => {
    items.push(t);
  });

  toast.error('An account with this email already exists.');
  toast.warning('Customer marked as absent.');
  toast.info('Notifications marked as read.');
  unsub();

  assert.equal(items.length, 3);
  const errorToast = items.find((i) => i.type === 'error');
  const warnToast = items.find((i) => i.type === 'warning');
  const infoToast = items.find((i) => i.type === 'info');

  assert.equal(errorToast?.duration, 6000);
  assert.equal(warnToast?.duration, 5000);
  assert.equal(infoToast?.duration, 4000);
});
