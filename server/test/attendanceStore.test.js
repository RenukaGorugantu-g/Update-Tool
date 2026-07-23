import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createAttendanceStore } from '../attendanceStore.js';

test('attendance store merges records for the same user and date even when attendance ids differ', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'updates-tool-attendance-store-'));
  const storageFile = path.join(tempDir, 'attendance.json');
  const store = createAttendanceStore(storageFile);

  await store.save({ attendanceId: 'att-1', userId: 'u-1', date: '2026-07-17', loginTime: '09:00', status: 'Present' });
  await store.save({ attendanceId: 'att-2', userId: 'u-1', date: '2026-07-17', logoutTime: '18:00', status: 'Auto Logout' });

  const all = await store.getAll();
  assert.equal(all.length, 1);
  assert.equal(all[0].loginTime, '09:00');
  assert.equal(all[0].logoutTime, '18:00');
  assert.equal(all[0].status, 'Present');
});
