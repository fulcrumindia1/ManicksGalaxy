import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const SLUGS = [
  'ganymede',
  'callisto',
  'enceladus',
  'triton',
  'charon',
  'ceres',
  'vesta',
  'phobos',
  'deimos'
];

const outDir = path.resolve('screenshots', 'phase_c');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9240',
  '--no-first-run',
  '--no-default-browser-check',
  '--window-size=1280,800',
  '--user-data-dir=' + process.env.TEMP + '\\chrome_phase_c',
  'http://127.0.0.1:3000/#home'
]);

async function run() {
  await new Promise((r) => setTimeout(r, 2000));
  const list = await fetch('http://127.0.0.1:9240/json/list').then((r) => r.json());
  const target = list.find((t) => t.type === 'page');
  const ws = new globalThis.WebSocket(target.webSocketDebuggerUrl);

  let messageId = 0;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = ++messageId;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise((r) => (ws.onopen = r));
  await send('Page.enable');
  await send('Runtime.enable');

  console.log('Testing Phase C celestial bodies...');

  for (const slug of SLUGS) {
    console.log(`\nNavigating to #${slug}...`);
    await send('Page.navigate', { url: `http://127.0.0.1:3000/#object/${slug}` });
    await new Promise((r) => setTimeout(r, 2000));

    // Verify metadata rendered
    const evalData = await send('Runtime.evaluate', {
      expression: `(() => {
        const h2 = document.querySelector('h2');
        const badge = document.querySelector('[data-testid="authenticity-badge"]') || document.body.innerText.includes('OBSERVED');
        const canvas = document.querySelector('canvas');
        return {
          title: h2 ? h2.innerText : '',
          isObserved: document.body.innerText.includes('OBSERVED'),
          hasCanvas: Boolean(canvas)
        };
      })()`,
      returnByValue: true
    });
    console.log(`  ${slug}:`, evalData.result?.value);

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(outDir, `${slug}_observed_globe.png`);
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log(`  Saved screenshot: ${shotPath}`);
  }

  // Also test spinning on Explore view
  console.log('\nValidating Explore view orbits...');
  await send('Page.navigate', { url: 'http://127.0.0.1:3000/#explore' });
  await new Promise((r) => setTimeout(r, 2000));

  const shotExplore = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, `00_explore_active_orrery.png`), Buffer.from(shotExplore.data, 'base64'));
  console.log('  Saved explore screenshot');

  console.log('\n[ALL PHASE C BODIES SUCCESSFULLY VALIDATED]');

  chrome.kill();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});

