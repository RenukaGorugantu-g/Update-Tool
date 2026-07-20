import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createUpdatesStore } from '../updatesStore.js';

test('updates store persists comments for an employee update', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'updates-tool-store-'));
  const storageFile = path.join(tempDir, 'updates.json');
  const store = createUpdatesStore(storageFile);

  await store.save({
    id: 'upd-1',
    employeeId: 'emp-1',
    employeeName: 'Renuka',
    department: 'Development',
    pod: 'India Pod',
    date: '2026-07-08',
    completed: ['Reviewed onboarding flow'],
    working: ['Prepared launch checklist'],
    blockers: ['None'],
    priority: 'high',
    projectName: 'MELS Platform',
    files: [],
    timestamp: '2026-07-08T00:00:00.000Z',
    comments: [{
      id: 'c-1',
      authorName: 'Manager',
      content: 'Nice progress',
      timestamp: '2026-07-08T00:10:00.000Z',
      sentVia: { gmail: false, chat: true, internal: true }
    }]
  });

  const items = await store.getAll();
  assert.equal(items.length, 1);
  assert.equal(items[0].comments[0].content, 'Nice progress');
  assert.equal(items[0].comments[0].sentVia.chat, true);
});

test('updates store keeps historical entries instead of dropping them during readback', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'updates-tool-store-history-'));
  const storageFile = path.join(tempDir, 'updates.json');
  const store = createUpdatesStore(storageFile);

  const oldTimestamp = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  await store.save({
    id: 'old-entry',
    employeeId: 'emp-2',
    employeeName: 'Asha',
    department: 'Operations',
    pod: 'India Pod',
    date: '2026-06-01',
    completed: ['Reviewed reports'],
    working: ['Archived backlog'],
    blockers: ['None'],
    priority: 'medium',
    projectName: 'Ops Report',
    files: [],
    timestamp: oldTimestamp,
    createdAt: oldTimestamp,
    comments: []
  });

  const items = await store.getAll();
  assert.equal(items.length, 1);
  assert.equal(items[0].id, 'old-entry');
});
