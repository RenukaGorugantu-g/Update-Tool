const SPRINT_DAYS = 14;

const safeArray = (value) => Array.isArray(value)
  ? value.filter((entry) => typeof entry === 'string' && entry.trim())
  : [];

const getEmployeeMatchKey = (user = {}) => {
  const parts = [
    String(user?.email || '').trim().toLowerCase(),
    String(user?.employeeId || '').trim().toLowerCase(),
    String(user?.name || '').trim().toLowerCase()
  ].filter(Boolean);
  return parts.join('|');
};

const getUpdateMatchKeys = (update = {}) => {
  const user = update?.user || {};
  const parts = [
    String(update?.employeeId || '').trim().toLowerCase(),
    String(update?.employeeName || '').trim().toLowerCase(),
    String(user?.email || '').trim().toLowerCase(),
    String(user?.name || '').trim().toLowerCase(),
    String(update?.department || '').trim().toLowerCase()
  ].filter(Boolean);
  return parts;
};

const matchesEmployee = (update, user) => {
  const updateKeys = getUpdateMatchKeys(update);
  const userKey = getEmployeeMatchKey(user);
  if (!updateKeys.length || !userKey) {
    return false;
  }

  const normalizedUserKey = userKey.toLowerCase();
  return updateKeys.some((key) => normalizedUserKey.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedUserKey));
};

export const getRangeStart = (range, now = new Date()) => {
  const base = new Date(now);

  if (range === 'daily') {
    base.setHours(0, 0, 0, 0);
    return base;
  }

  if (range === 'weekly') {
    const day = base.getDay();
    const diff = (day + 6) % 7;
    base.setDate(base.getDate() - diff);
    base.setHours(0, 0, 0, 0);
    return base;
  }

  if (range === 'sprint') {
    base.setDate(base.getDate() - (SPRINT_DAYS - 1));
    base.setHours(0, 0, 0, 0);
    return base;
  }

  if (range === 'monthly') {
    base.setDate(1);
    base.setHours(0, 0, 0, 0);
    return base;
  }

  return new Date(0);
};

export const getPeriodLabel = (range) => {
  switch (range) {
    case 'daily':
      return 'today';
    case 'weekly':
      return 'this week';
    case 'sprint':
      return 'this sprint';
    case 'monthly':
      return 'this month';
    default:
      return 'this period';
  }
};

export const filterUpdatesByRange = (updates, range, now = new Date()) => {
  const start = getRangeStart(range, now);
  return (updates || []).filter((update) => {
    const timestamp = Date.parse(update.timestamp || update.date || '');
    return !Number.isNaN(timestamp) && timestamp >= start.getTime();
  });
};

export const buildTeamAnalytics = ({ updates, users, range, now = new Date() }) => {
  const activeEmployees = (users || []).filter((user) => user.role === 'employee' && user.active);
  const rangeUpdates = filterUpdatesByRange(updates || [], range, now);

  const employeeSummaries = activeEmployees.map((user) => {
    const employeeUpdates = rangeUpdates
      .filter((update) => update.employeeId === user.id || matchesEmployee(update, user))
      .sort((a, b) => Date.parse(b.timestamp || b.date || 0) - Date.parse(a.timestamp || a.date || 0));

    const tasksCompleted = employeeUpdates.reduce((sum, update) => sum + safeArray(update.completed).length, 0);
    const tasksWorking = employeeUpdates.reduce((sum, update) => sum + safeArray(update.working).length, 0);
    const blockers = employeeUpdates.reduce((sum, update) => {
      const blockersList = safeArray(update.blockers).filter((entry) => {
        const normalized = entry.toLowerCase();
        return normalized !== 'none' && normalized !== 'none reported' && normalized.trim() !== '';
      });
      return sum + blockersList.length;
    }, 0);

    return {
      employeeId: user.id,
      employeeName: user.name,
      department: user.department,
      pod: user.pod,
      submittedCount: employeeUpdates.length,
      completionRate: employeeUpdates.length > 0 ? 100 : 0,
      tasksCompleted,
      tasksWorking,
      blockers,
      lastUpdate: employeeUpdates[0]?.date || null,
      updates: employeeUpdates
    };
  });

  const submittedCount = rangeUpdates.length;
  const pendingCount = Math.max(0, activeEmployees.length - submittedCount);
  const completionRate = activeEmployees.length > 0 ? Math.round((submittedCount / activeEmployees.length) * 100) : 0;
  const blockerCount = rangeUpdates.reduce((sum, update) => {
    const blockersList = safeArray(update.blockers).filter((entry) => {
      const normalized = entry.toLowerCase();
      return normalized !== 'none' && normalized !== 'none reported' && normalized.trim() !== '';
    });
    return sum + blockersList.length;
  }, 0);

  return {
    activeEmployees,
    rangeUpdates,
    submittedCount,
    pendingCount,
    completionRate,
    blockerCount,
    employeeSummaries
  };
};

export const exportAnalyticsToCsv = (filename, rows) => {
  if (!rows || rows.length === 0) {
    rows = [{ empty: 'No data available' }];
  }

  const headers = Object.keys(rows[0]);
  const escapeValue = (value) => {
    const text = value == null ? '' : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  const body = [headers.join(','), ...rows.map((row) => headers.map((header) => escapeValue(row[header])).join(','))].join('\n');

  const blob = new Blob([body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
