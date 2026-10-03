// Serves the production (standalone) build for the Playwright tests: copies public/ and .next/static into .next/standalone (what `next build` leaves for you to do),
// then starts server.js. Env: PORT (default 3100). The build must exist (npx next build) and the NEXT_PUBLIC_* flags are fixed at build time.
//   node scripts/e2e-serve.mjs
import { cpSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const sa = join(root, '.next', 'standalone');
if (!existsSync(join(sa, 'server.js'))) { console.error('no standalone build: run `npx next build` first'); process.exit(1); }
cpSync(join(root, 'public'), join(sa, 'public'), { recursive: true });
cpSync(join(root, '.next', 'static'), join(sa, '.next', 'static'), { recursive: true });
const child = spawn(process.execPath, ['server.js'], { cwd: sa, stdio: 'inherit', env: { ...process.env, PORT: process.env.PORT ?? '3100', HOSTNAME: '127.0.0.1' } });
child.on('exit', (code) => process.exit(code ?? 0));
for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => child.kill(s));
