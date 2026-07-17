import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'attendance.json'
);

const ensureDir = async (filePath) => {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
};

const readStore = async (filePath) => {
  await ensureDir(filePath);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    console.error('readStore error', err);
    throw err;
  }
};

const writeStore = async (filePath, data) => {
  await ensureDir(filePath);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const getAttendanceIdentity = (entry = {}) => {
  const userId = String(entry.userId || '').trim();
  const date = String(entry.date || '').trim();
  const email = String(entry.email || '').trim();
  return [userId, date, email].filter(Boolean).join('::');
};

const mergeAttendanceEntry = (existing = {}, incoming = {}) => {
  const now = new Date().toISOString();
  return {
    ...existing,
    ...incoming,
    attendanceId: incoming.attendanceId || existing.attendanceId || `att-${incoming.userId || existing.userId || 'unknown'}-${incoming.date || existing.date || now.slice(0, 10)}`,
    userId: incoming.userId || existing.userId || '',
    employeeName: incoming.employeeName || existing.employeeName || '',
    email: incoming.email || existing.email || '',
    department: incoming.department || existing.department || '',
    date: incoming.date || existing.date || now.slice(0, 10),
    loginTime: incoming.loginTime || existing.loginTime || '',
    logoutTime: incoming.logoutTime || existing.logoutTime || '',
    workingHours: incoming.workingHours || existing.workingHours || '0h',
    idleTime: incoming.idleTime || existing.idleTime || '0m',
    productiveHours: incoming.productiveHours || existing.productiveHours || '0h',
    status: incoming.status || existing.status || 'Present',
    officeRemote: incoming.officeRemote || existing.officeRemote || 'Remote',
    ipAddress: incoming.ipAddress || existing.ipAddress || '',
    device: incoming.device || existing.device || '',
    browser: incoming.browser || existing.browser || '',
    os: incoming.os || existing.os || '',
    createdAt: existing.createdAt || incoming.createdAt || now,
    updatedAt: now
  };
};

export const createAttendanceStore = (filePath = defaultPath) => ({
  async getAll() {
    return readStore(filePath);
  },

  async save(entry) {
    const items = await readStore(filePath);
    const now = new Date().toISOString();
    const incoming = {
      ...entry,
      createdAt: entry.createdAt || now,
      updatedAt: now
    };

    const existingIndex = items.findIndex((current) => {
      if (current.attendanceId && incoming.attendanceId && current.attendanceId === incoming.attendanceId) {
        return true;
      }
      return getAttendanceIdentity(current) && getAttendanceIdentity(current) === getAttendanceIdentity(incoming);
    });

    const toSave = existingIndex === -1
      ? mergeAttendanceEntry({}, incoming)
      : mergeAttendanceEntry(items[existingIndex], incoming);

    if (existingIndex === -1) {
      items.push(toSave);
    } else {
      items[existingIndex] = toSave;
    }

    await writeStore(filePath, items);
    return toSave;
  },

  async remove(attendanceId) {
    const items = await readStore(filePath);
    const next = items.filter((entry) => entry.attendanceId !== attendanceId);
    if (next.length === items.length) return false;
    await writeStore(filePath, next);
    return true;
  },

  async clearAll() {
    await writeStore(filePath, []);
    return 0;
  }
});

export { defaultPath };
