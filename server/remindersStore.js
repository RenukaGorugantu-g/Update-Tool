import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'reminders.json');

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

export const createRemindersStore = (filePath = defaultPath) => ({
  async getAll() {
    return readStore(filePath);
  },

  async save(reminders) {
    if (!Array.isArray(reminders)) throw new Error('Reminders must be an array.');
    await writeStore(filePath, reminders);
    return reminders;
  }
});

export { defaultPath };
