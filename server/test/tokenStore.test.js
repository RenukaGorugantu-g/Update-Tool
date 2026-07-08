import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createTokenStore, getStoredToken, saveStoredToken, removeStoredToken } from '../tokenStore.js';

test('token store persists refresh tokens per user', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'updates-tool-token-store-'));
  const storageFile = path.join(tempDir, 'tokens.json');
  const tokenStore = createTokenStore(storageFile);

  await tokenStore.saveToken('sandeep@gmail.com', {
    refreshToken: 'refresh-123',
    name: 'Sandeep'
  });

  const persistedToken = await tokenStore.getToken('sandeep@gmail.com');
  assert.equal(persistedToken?.refreshToken, 'refresh-123');
  assert.equal(persistedToken?.name, 'Sandeep');

  await tokenStore.removeToken('sandeep@gmail.com');
  assert.equal(await tokenStore.getToken('sandeep@gmail.com'), null);
});

test('token store helpers work with a supplied file path', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'updates-tool-token-store-'));
  const storageFile = path.join(tempDir, 'tokens.json');

  await saveStoredToken(storageFile, 'krishna@gmail.com', {
    refreshToken: 'refresh-456',
    name: 'Krishna'
  });

  const persistedToken = await getStoredToken(storageFile, 'krishna@gmail.com');
  assert.equal(persistedToken?.refreshToken, 'refresh-456');
  assert.equal(persistedToken?.name, 'Krishna');

  await removeStoredToken(storageFile, 'krishna@gmail.com');
  assert.equal(await getStoredToken(storageFile, 'krishna@gmail.com'), null);
});
