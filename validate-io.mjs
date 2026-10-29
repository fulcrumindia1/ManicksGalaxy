import { spawn } from 'node:child_process';
import fs from 'node:fs';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9230',
  '--no-first-run',
  '--no-default-browser-check',
  '--window-size=1280,800',
  '--user-data-dir=' + process.env.TEMP + '\\chrome_debug_io',
  'http://127.0.0.1:3000/#object/io'
]);

async function run() {
  await new Promise((r) => setTimeout(r, 2000));
  const list = await fetch('http://127.0.0.1:9230/json/list').then((r) => r.json());
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

  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  await send('Page.enable');
  await send('DOM.enable');
  await send('Runtime.enable');

  console.log('[Validator] Navigating to #object/io...');
  await send('Page.navigate', { url: 'http://127.0.0.1:3000/#object/io' });
  await new Promise((r) => setTimeout(r, 2500));

  async function capture(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(res.data, 'base64');
    fs.writeFileSync(`screenshots/io/${filename}`, buf);
    console.log(`[Captured] screenshots/io/${filename} (${buf.length} bytes)`);
  }

  async function evalJs(expr) {
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    return res.result?.value;
  }

  // Check state
  const state = await evalJs(`({
    title: document.querySelector('h1')?.innerText,
    authenticity: document.querySelector('.font-mono.text-\\\\[\\\\#79D9ED\\\\]')?.innerText,
    hasCanvas: document.querySelectorAll('canvas').length,
    variants: Array.from(document.querySelectorAll('[role="group"] button')).map(b => b.innerText)
  })`);
  console.log('[Io State]:', JSON.stringify(state, null, 2));

  // 1. Front View (Sub-Jupiter hemisphere)
  console.log('Testing Angle 1: Front (Sub-Jupiter)...');
  await evalJs(`window.__planetarium?.setCameraPosition(0, 0, 3.2)`);
  await new Promise((r) => setTimeout(r, 800));
  await capture('01_io_front_subjupiter.png');

  // 2. Opposite Hemisphere / Back View (Anti-Jupiter)
  console.log('Testing Angle 2: Back (Anti-Jupiter)...');
  await evalJs(`window.__planetarium?.setCameraPosition(0, 0, -3.2)`);
  await new Promise((r) => setTimeout(r, 800));
  await capture('02_io_back_antijupiter.png');

  // 3. Left View (Leading hemisphere)
  console.log('Testing Angle 3: Left (Leading hemisphere)...');
  await evalJs(`window.__planetarium?.setCameraPosition(-3.2, 0, 0)`);
  await new Promise((r) => setTimeout(r, 800));
  await capture('03_io_left_leading.png');

  // 4. Right View (Trailing hemisphere)
  console.log('Testing Angle 4: Right (Trailing hemisphere)...');
  await evalJs(`window.__planetarium?.setCameraPosition(3.2, 0, 0)`);
  await new Promise((r) => setTimeout(r, 800));
  await capture('04_io_right_trailing.png');

  // 5. North Pole View
  console.log('Testing Angle 5: North Pole (+90 deg)...');
  await evalJs(`window.__planetarium?.setCameraPosition(0.01, 3.2, 0.01)`);
  await new Promise((r) => setTimeout(r, 800));
  await capture('05_io_north_pole.png');

  // 6. South Pole View
  console.log('Testing Angle 6: South Pole (-90 deg)...');
  await evalJs(`window.__planetarium?.setCameraPosition(0.01, -3.2, 0.01)`);
  await new Promise((r) => setTimeout(r, 800));
  await capture('06_io_south_pole.png');

  // 7. Enhanced Scientific Color Mode
  console.log('Testing Mode 2: Enhanced Scientific Color...');
  await evalJs(`window.__planetarium?.setCameraPosition(0, 0, 3.2)`);
  await evalJs(`window.__planetarium?.setSurfaceVariant('enhanced')`);
  await new Promise((r) => setTimeout(r, 1000));
  await capture('07_io_enhanced_scientific_color.png');

  // 8. Observational Coverage Map Mode
  console.log('Testing Mode 3: Observational Coverage Map...');
  await evalJs(`window.__planetarium?.setSurfaceVariant('coverage')`);
  await new Promise((r) => setTimeout(r, 1000));
  await capture('08_io_coverage_confidence_map.png');

  // Reset back to standard
  await evalJs(`window.__planetarium?.setSurfaceVariant('standard')`);
  await new Promise((r) => setTimeout(r, 500));

  console.log('All Io verification screenshots captured successfully!');
  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});

