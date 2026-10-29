import { spawn } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;
const BASE_URL = 'http://127.0.0.1:3000/#object/earth';
const OUT_DIR = resolve('screenshots/earth');

mkdirSync(OUT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Spawning Chrome on port', PORT);
  const chrome = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      '--disable-gpu-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--window-size=1280,800',
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  let wsUrl = null;
  for (let attempt = 0; attempt < 30; attempt++) {
    await sleep(400);
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json`);
      const tabs = await res.json();
      const page = tabs.find((t) => t.type === 'page');
      if (page && page.webSocketDebuggerUrl) {
        wsUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve) => (ws.onopen = resolve));

  let msgId = 1;
  const pending = new Map();
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data);
      pending.delete(data.id);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: BASE_URL });

  for (let i = 0; i < 20; i++) {
    await sleep(500);
    const evalRes = await send('Runtime.evaluate', {
      expression: 'Boolean(window.__planetarium && window.__planetarium.setForceProcedural)',
      returnByValue: true,
    });
    if (evalRes.result?.value === true) break;
  }

  // Freeze spin
  await send('Runtime.evaluate', {
    expression: `
      const pauseBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Pause') || b.textContent.includes('Resume'));
      if (pauseBtn && pauseBtn.textContent.includes('Pause')) pauseBtn.click();
    `,
  });
  await sleep(600);

  // 1. Force procedural fallback (Before)
  console.log('Rendering Before (Procedural Fallback)...');
  await send('Runtime.evaluate', {
    expression: `
      window.__planetarium.setForceProcedural(true);
      window.__planetarium.setGlobeState({
        camPos: [0, 0.25, 3.2],
        rotationY: -1.73
      });
    `,
  });
  await sleep(1000);
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(resolve(OUT_DIR, '00_before_procedural_earth.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved 00_before_procedural_earth.png');

  // 2. Restore authentic NASA Blue Marble (After)
  console.log('Rendering After (Authentic NASA Blue Marble)...');
  await send('Runtime.evaluate', {
    expression: `
      window.__planetarium.setForceProcedural(false);
      window.__planetarium.setGlobeState({
        camPos: [0, 0.25, 3.2],
        rotationY: -1.73
      });
    `,
  });
  await sleep(1000);
  shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(resolve(OUT_DIR, '00_after_nasa_earth.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved 00_after_nasa_earth.png');

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
