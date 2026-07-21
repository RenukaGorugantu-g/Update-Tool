import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTeamAnalytics } from './reporting.js';

test('buildTeamAnalytics maps updates to employees by email and name when employeeId is missing', () => {
  const users = [
    {
      id: 'emp-1',
      name: 'Renuka Gorugantu',
      email: 'renuka@maplelearningsolutions.com',
      role: 'employee',
      active: true,
      department: 'Development Team',
      pod: 'India Pod'
    }
  ];

  const updates = [
    {
      id: 'u-1',
      employeeId: '',
      employeeName: 'Renuka Gorugantu',
      department: 'Development Team',
      pod: 'India Pod',
      date: '2026-07-21',
      timestamp: '2026-07-21T10:00:00.000Z',
      completed: ['Reviewed onboarding'],
      working: ['Testing flow'],
      blockers: ['None'],
      projectName: 'MELS',
      user: {
        name: 'Renuka Gorugantu',
        email: 'renuka@maplelearningsolutions.com',
        department: 'Development Team'
      }
    }
  ];

  const analytics = buildTeamAnalytics({ updates, users, range: 'daily' });

  assert.equal(analytics.employeeSummaries[0].submittedCount, 1);
  assert.equal(analytics.employeeSummaries[0].employeeName, 'Renuka Gorugantu');
  assert.equal(analytics.employeeSummaries[0].updates.length, 1);
});
