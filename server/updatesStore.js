import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const normalizeName = (value) => String(value || '').trim();
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const mergeEmployeeIdentity = (update, existing = {}) => {
  const user = update?.user || {};
  const employeeName = normalizeName(update?.employeeName || existing?.employeeName || user?.name || '');
  const employeeEmail = normalizeEmail(update?.user?.email || existing?.user?.email || update?.email || '');
  const department = normalizeName(update?.department || existing?.department || user?.department || 'General');
  const pod = normalizeName(update?.pod || existing?.pod || 'India Pod');
  const employeeId = String(update?.employeeId || existing?.employeeId || '').trim();

  return {
    ...update,
    employeeName,
    department,
    pod,
    employeeId,
    user: {
      ...(user || {}),
      name: employeeName || user?.name || '',
      email: employeeEmail || user?.email || '',
      department
    }
  };
};

const defaultPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'updates.json'
);

const sprintRetentionDays = Number.parseInt(process.env.UPDATE_RETENTION_DAYS || process.env.SPRINT_RETENTION_DAYS || '0', 10);

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
  const retentionDays = Number.isFinite(days) ? Number(days) : 0;
  if (retentionDays <= 0) {
    return items;
  }

  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

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
      ...mergeEmployeeIdentity(update, idx >= 0 ? items[idx] : {}),
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