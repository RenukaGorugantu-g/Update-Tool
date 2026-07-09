import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'updates.json'
);

const sprintRetentionDays = 14;

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

const pruneItems = (items, days = sprintRetentionDays) => {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  return items.filter((update) => {
    const timestamp = Date.parse(
      update.createdAt || update.updatedAt || update.timestamp || ''
    );

    if (Number.isNaN(timestamp)) {
      return true;
    }

    return timestamp >= cutoff;
  });
};

export const createUpdatesStore = (filePath = defaultPath) => ({
  async getAll() {
    const items = await readStore(filePath);
    const retained = pruneItems(items, sprintRetentionDays);

    if (retained.length !== items.length) {
      await writeStore(filePath, retained);
    }

    return retained;
  },

  async save(update) {
    const items = pruneItems(await readStore(filePath), sprintRetentionDays);
    const idx = items.findIndex((entry) => entry.id === update.id);
    const now = new Date().toISOString();
    const toSave = {
      ...update,
      comments: Array.isArray(update.comments) ? update.comments : [],
      updatedAt: now,
      createdAt: update.createdAt || now
    };

    if (idx === -1) {
      items.push(toSave);
    } else {
      items[idx] = toSave;
    }

    await writeStore(filePath, items);
    return toSave;
  },

  async remove(id) {
    const items = pruneItems(await readStore(filePath), sprintRetentionDays);
    const idx = items.findIndex((entry) => entry.id === id);
    if (idx === -1) return false;
    items.splice(idx, 1);
    await writeStore(filePath, items);
    return true;
  },

  async cleanupOlderThan(days = sprintRetentionDays) {
    const items = await readStore(filePath);
    const remaining = pruneItems(items, days);
    const removed = items.length - remaining.length;

    if (removed > 0) {
      await writeStore(filePath, remaining);
    }

    return removed;
  },

  async clearAll() {
    await writeStore(filePath, []);
    return 0;
  }
});

export { defaultPath };