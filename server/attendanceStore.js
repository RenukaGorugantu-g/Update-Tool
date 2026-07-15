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

export const createAttendanceStore = (filePath = defaultPath) => ({
  async getAll() {
    return readStore(filePath);
  },

  async save(entry) {
    const items = await readStore(filePath);
    const idx = items.findIndex((current) => current.attendanceId === entry.attendanceId);
    const now = new Date().toISOString();
    const toSave = {
      ...entry,
      createdAt: entry.createdAt || now,
      updatedAt: now
    };

    if (idx === -1) {
      items.push(toSave);
    } else {
      items[idx] = toSave;
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
