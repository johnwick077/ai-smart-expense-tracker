const { spawn } = require('child_process');
const path = require('path');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('\n======================================================');
console.log(' STARTING AI SMART EXPENSE TRACKER (BACKEND + FRONTEND)');
console.log('======================================================\n');

// 1. Launch Backend Server (Port 5000)
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe',
  shell: true
});

backend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[36m[Backend]\x1b[0m ${data}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[Backend Error]\x1b[0m ${data}`);
});

// 2. Launch Vite Frontend Dev Server (Port 5173)
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'pipe',
  shell: true
});

frontend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[35m[Frontend]\x1b[0m ${data}`);
});

frontend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[33m[Frontend Info]\x1b[0m ${data}`);
});

const cleanup = () => {
  console.log('\nShutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
