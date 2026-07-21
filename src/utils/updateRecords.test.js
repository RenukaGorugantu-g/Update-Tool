import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeUpdatesRecords } from './updateRecords.ts';

test('mergeUpdatesRecords keeps separate daily submissions for the same employee', () => {
  const existing = [
    {
      id: 'up-emp-1-2026-07-20',
      employeeId: 'emp-1',
      employeeName: 'Asha',
      date: '2026-07-20',
      timestamp: '2026-07-20T08:00:00.000Z',
      completed: ['Yesterday task'],
      working: ['Yesterday work'],
      blockers: ['None'],
      comments: []
    }
  ];

  const incoming = [
    {
      id: 'up-emp-1-2026-07-21',
      employeeId: 'emp-1',
      employeeName: 'Asha',
      date: '2026-07-21',
      timestamp: '2026-07-21T08:00:00.000Z',
      completed: ['Today task'],
      working: ['Today work'],
      blockers: ['None'],
      comments: []
    }
  ];

  const merged = mergeUpdatesRecords(existing, incoming);

  assert.equal(merged.length, 2);
  assert.equal(merged.find((entry) => entry.date === '2026-07-20')?.completed[0], 'Yesterday task');
  assert.equal(merged.find((entry) => entry.date === '2026-07-21')?.working[0], 'Today work');
});
