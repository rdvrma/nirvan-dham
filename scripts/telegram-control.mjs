import nextEnv from '@next/env';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
nextEnv.loadEnvConfig(root);
const stateFile = path.resolve(process.env.TELEGRAM_STATE_FILE || path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), '.local', 'share'), 'NirvanDham', 'telegram-bot', 'state.json'));
const folder = path.dirname(stateFile);
const stopFile = `${stateFile}.stop`;
let running = false;
try {
  const pid = Number(fs.readFileSync(`${stateFile}.lock`, 'utf8'));
  if (Number.isSafeInteger(pid) && pid > 0) {
    process.kill(pid, 0);
    running = true;
  }
} catch { /* no active local runner */ }

const command = process.argv[2];
if (command === 'status') {
  console.log(running ? 'Telegram bot is running on this computer.' : 'Telegram bot is not running on this computer.');
} else if (command === 'stop') {
  if (!running) console.log('Telegram bot is not running.');
  else {
    fs.writeFileSync(stopFile, 'stop', { mode: 0o600 });
    console.log('Stop requested. The bot will finish its current reply/poll and stop within about two minutes.');
  }
} else if (command === 'start') {
  if (running) console.log('Telegram bot is already running.');
  else if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.SARVAM_API_KEY) {
    console.error('Set TELEGRAM_BOT_TOKEN and SARVAM_API_KEY in .env.local first.');
    process.exitCode = 1;
  } else {
    fs.mkdirSync(folder, { recursive: true, mode: 0o700 });
    fs.rmSync(stopFile, { force: true });
    const output = fs.openSync(path.join(folder, 'stdout.log'), 'a', 0o600);
    const errors = fs.openSync(path.join(folder, 'stderr.log'), 'a', 0o600);
    const child = spawn(process.execPath, [path.join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs'), path.join(root, 'scripts', 'telegram-bot.ts')], {
      cwd: root, detached: true, windowsHide: true, stdio: ['ignore', output, errors],
    });
    child.on('error', () => { console.error('Could not launch the bot.'); process.exitCode = 1; });
    child.unref();
    fs.closeSync(output);
    fs.closeSync(errors);
    console.log('Bot launch requested in the background. Check npm run bot:status and the local logs.');
  }
} else {
  console.error('Usage: node scripts/telegram-control.mjs start|stop|status');
  process.exitCode = 1;
}
