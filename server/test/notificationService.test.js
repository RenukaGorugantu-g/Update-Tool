import test from 'node:test';
import assert from 'node:assert/strict';

import { createNotificationService } from '../notificationService.js';

test('employee updates send a formatted Google Chat stand-up message', async () => {
  const calls = [];

  const service = createNotificationService({
    sendGmailMessage: async () => ({ ok: true }),
    sendChatMessage: async (spaceId, payload) => {
      calls.push({ spaceId, payload });
      return { status: 200 };
    }
  });

  const result = await service.notifyUpdateSubmission({
    update: {
      date: '2026-07-07',
      projectName: 'MELS Platform',
      priority: 'high',
      completed: ['Reviewed onboarding flow'],
      working: ['Prepared launch checklist'],
      blockers: ['Waiting for sign-off'],
      employeeName: 'Renuka'
    },
    user: {
      name: 'Renuka',
      email: 'renuka@example.com',
      department: 'Development'
    }
  });

  assert.equal(result.chatStatus, 'sent');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].spaceId, 'space_mels');
  assert.equal(typeof calls[0].payload, 'object');
  assert.match(calls[0].payload.text, /Daily Stand-up/i);
  assert.match(calls[0].payload.text, /Renuka/);
  assert.match(calls[0].payload.text, /MELS Platform/);
});

test('chat delivery is treated as successful when Gmail is unavailable', async () => {
  const service = createNotificationService({
    sendGmailMessage: async () => {
      throw new Error('Missing Gmail OAuth credentials.');
    },
    sendChatMessage: async () => ({ status: 200 })
  });

  const result = await service.notifyUpdateSubmission({
    update: {
      projectName: 'MELS Platform',
      priority: 'medium',
      completed: [],
      working: ['Checking deployment'],
      blockers: ['None'],
      employeeName: 'Renuka'
    },
    user: {
      name: 'Renuka',
      email: 'renuka@example.com',
      department: 'Development'
    }
  });

  assert.equal(result.chatStatus, 'sent');
  assert.equal(result.emailStatus, 'failed');
  assert.equal(result.deliveryStatus, 'ok');
});
