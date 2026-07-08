import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

if (existsSync('server/package.json')) {
  execFileSync('npm', ['install', '--prefix', 'server'], { stdio: 'inherit', shell: true });
} else {
  console.log('Skipping server dependency install; server/package.json is not present.');
}
