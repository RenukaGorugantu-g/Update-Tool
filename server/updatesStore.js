import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'updates.json');

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

export const createUpdatesStore = (filePath = defaultPath) => ({
  async getAll() {
    return readStore(filePath);
  },

  async save(update) {
    const items = await readStore(filePath);
    const idx = items.findIndex(u => u.id === update.id);
    const now = new Date().toISOString();
    const toSave = { ...update, updatedAt: now, createdAt: update.createdAt || now };

    if (idx === -1) {
      items.push(toSave);
    } else {
      items[idx] = toSave;
    }

    await writeStore(filePath, items);
    return toSave;
  },

  async remove(id) {
    const items = await readStore(filePath);
    const idx = items.findIndex(u => u.id === id);
    if (idx === -1) return false;
    items.splice(idx, 1);
    await writeStore(filePath, items);
    return true;
  },

  // Removes updates older than `days` (default 7 days). Returns number removed.
  async cleanupOlderThan(days = 7) {
    const items = await readStore(filePath);
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const remaining = items.filter(u => {
      const t = new Date(u.createdAt || u.updatedAt || Date.now()).getTime();
      return t >= cutoff;
    });
    const removed = items.length - remaining.length;
    if (removed > 0) {
      await writeStore(filePath, remaining);
    }
    return removed;
  }
});

export { defaultPath };
