const normalizeListValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? '').trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/\r?\n/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

export const mergeUpdatesRecords = (existing: any[] = [], incoming: any[] = []) => {
  const byKey = new Map<string, any>();
  const merged = [...(existing || []), ...(incoming || [])].filter((entry) => Boolean(entry && (entry.id || entry.employeeId)));

  merged.forEach((entry) => {
    const key = String(entry.id || `${entry.employeeId || 'unknown'}::${entry.date || ''}::${entry.timestamp || ''}`).trim();
    const previous = byKey.get(key);
    const mergedEntry = previous
      ? {
          ...previous,
          ...entry,
          id: previous.id || entry.id || key,
          employeeId: entry.employeeId || previous.employeeId || '',
          employeeName: entry.employeeName || previous.employeeName || '',
          department: entry.department || previous.department || 'General',
          pod: entry.pod || previous.pod || 'India Pod',
          projectName: entry.projectName || previous.projectName || '',
          date: entry.date || previous.date || '',
          timestamp: entry.timestamp || previous.timestamp || '',
          comments: Array.isArray(entry.comments) ? entry.comments : Array.isArray(previous.comments) ? previous.comments : [],
          completed: normalizeListValue(entry.completed).length > 0 ? normalizeListValue(entry.completed) : normalizeListValue(previous.completed),
          working: normalizeListValue(entry.working).length > 0 ? normalizeListValue(entry.working) : normalizeListValue(previous.working),
          blockers: normalizeListValue(entry.blockers).length > 0 ? normalizeListValue(entry.blockers) : normalizeListValue(previous.blockers),
          files: Array.isArray(entry.files) ? entry.files : Array.isArray(previous.files) ? previous.files : []
        }
      : {
          ...entry,
          id: entry.id || key,
          comments: Array.isArray(entry.comments) ? entry.comments : []
        };

    byKey.set(key, mergedEntry);
  });

  return Array.from(byKey.values()).sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
};
