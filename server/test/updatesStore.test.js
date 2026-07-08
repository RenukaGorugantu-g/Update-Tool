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
