import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultStoragePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'tokens.json');

const ensureStorageDirectory = async (storageFilePath) => {
  const directory = path.dirname(storageFilePath);
  await fs.mkdir(directory, { recursive: true });
};

const readTokenStore = async (storageFilePath) => {
  await ensureStorageDirectory(storageFilePath);

  try {
    const contents = await fs.readFile(storageFilePath, 'utf8');
    if (!contents.trim()) {
      return {};
    }

    return JSON.parse(contents);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }

    console.error('Unable to read token store:', error);
    throw error;
  }
};

const writeTokenStore = async (storageFilePath, tokenStore) => {
  await ensureStorageDirectory(storageFilePath);
  await fs.writeFile(storageFilePath, JSON.stringify(tokenStore, null, 2));
};

// Create a storage interface that can later be swapped for a database.
export const createTokenStore = (storageFilePath = defaultStoragePath) => ({
  async getAll() {
    return readTokenStore(storageFilePath);
  },

  async getToken(email) {
    const store = await readTokenStore(storageFilePath);
    return store[email] ? { ...store[email] } : null;
  },

  async saveToken(email, tokenData) {
    const store = await readTokenStore(storageFilePath);
    store[email] = {
      ...tokenData,
      updatedAt: new Date().toISOString()
    };
    await writeTokenStore(storageFilePath, store);
    return store[email];
  },

  async removeToken(email) {
    const store = await readTokenStore(storageFilePath);
    if (!store[email]) {
      return false;
    }

    delete store[email];
    await writeTokenStore(storageFilePath, store);
    return true;
  }
});

export const loadTokenStore = async (storageFilePath = defaultStoragePath) => {
  return readTokenStore(storageFilePath);
};

export const saveTokenStore = async (tokenStore, storageFilePath = defaultStoragePath) => {
  await writeTokenStore(storageFilePath, tokenStore);
};

export const getStoredToken = async (storageFilePath = defaultStoragePath, email) => {
  const store = await readTokenStore(storageFilePath);
  return store[email] ? { ...store[email] } : null;
};

export const saveStoredToken = async (storageFilePath = defaultStoragePath, email, tokenData) => {
  const store = await readTokenStore(storageFilePath);
  store[email] = {
    ...tokenData,
    updatedAt: new Date().toISOString()
  };
  await writeTokenStore(storageFilePath, store);
  return store[email];
};

export const removeStoredToken = async (storageFilePath = defaultStoragePath, email) => {
  const store = await readTokenStore(storageFilePath);
  if (!store[email]) {
    return false;
  }

  delete store[email];
  await writeTokenStore(storageFilePath, store);
  return true;
};

export { defaultStoragePath };
