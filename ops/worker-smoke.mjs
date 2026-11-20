import { spawn } from 'node:child_process';
const child = spawn(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'dev', '--local', '--ip', '127.0.0.1', '--port', '8787'], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
let logs = '';
child.stdout.on('data', value => { logs += value; });
child.stderr.on('data', value => { logs += value; });
try {
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    try { const result = await fetch('http://127.0.0.1:8787/api/health', { signal: AbortSignal.timeout(1500) }); if (result.status !== 503) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (!ready) throw new Error('Worker did not start');
  for (const path of ['/api/health', '/', '/app']) {
    const result = await fetch('http://127.0.0.1:8787' + path, { signal: AbortSignal.timeout(15000) });
    console.log('Worker smoke', path, result.status);
    if (!result.ok) throw new Error('Worker request failed');
  }
} catch (error) { console.error(String(error)); console.error(logs.slice(-14000)); process.exitCode = 1; }
finally { child.kill(); }
