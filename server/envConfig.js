import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const loadServerEnv = () => {
  const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env');
  return dotenv.config({ path: envPath });
};
