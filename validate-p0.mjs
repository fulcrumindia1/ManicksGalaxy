import { spawn } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9224;
const BASE_HOST = 'http://127.0.0.1:3000';
const OUT_DIR = resolve('screenshots/p0');

mkdirSync(OUT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('[P0 Validator] Launching Headless Chrome on port', PORT);
  const chrome = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      '--disable-gpu-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--window-size=1280,820',
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
    } catch {
      // Chrome starting up...
    }
  }

  if (!wsUrl) {
    console.error('Could not connect to Chrome CDP.');
    chrome.kill();
    process.exit(1);
  }

  console.log('Connected to Chrome WebSocket CDP:', wsUrl);
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

  async function capture(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const data = res.result ? res.result.data : res.data;
    const buf = Buffer.from(data, 'base64');
    writeFileSync(resolve(OUT_DIR, filename), buf);
    console.log(`[Captured] ${filename} (${buf.length} bytes)`);
  }

  async function setSelectValues(slugA, slugB) {
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const selA = document.getElementById('compare-select-a');
          const selB = document.getElementById('compare-select-b');
          if (selA) {
            selA.value = '${slugA}';
            selA.dispatchEvent(new Event('change', { bubbles: true }));
          }
          if (selB) {
            selB.value = '${slugB}';
            selB.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })()
      `,
    });
    await sleep(800);
  }

  async function setScaleMode(mode) {
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => 
            '${mode}' === 'true-scale' ? b.textContent.includes('True Scale') : b.textContent.includes('Presentation Scale')
          );
          if (btn) btn.click();
        })()
      `,
    });
    await sleep(600);
  }

  try {
    // Navigate to Compare View
    console.log('Navigating to #compare...');
    await send('Page.navigate', { url: `${BASE_HOST}/#compare` });
    await sleep(1500);

    // Pause spin on compare canvas if running
    await send('Runtime.evaluate', {
      expression: `
        const pauseBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Pause'));
        if (pauseBtn) pauseBtn.click();
      `,
    });
    await sleep(400);

    // 1. Earth vs Titan (True Scale)
    console.log('Testing 1: Earth vs Titan (True Scale)...');
    await setSelectValues('earth', 'titan');
    await setScaleMode('true-scale');
    await sleep(800);
    await capture('01_compare_earth_vs_titan_truescale.png');

    // 2. Earth vs Jupiter (True Scale)
    console.log('Testing 2: Earth vs Jupiter (True Scale)...');
    await setSelectValues('earth', 'jupiter');
    await setScaleMode('true-scale');
    await sleep(800);
    await capture('02_compare_earth_vs_jupiter_truescale.png');

    // 3. Saturn vs Jupiter (True Scale)
    console.log('Testing 3: Saturn vs Jupiter (True Scale)...');
    await setSelectValues('saturn', 'jupiter');
    await setScaleMode('true-scale');
    await sleep(800);
    await capture('03_compare_saturn_vs_jupiter_truescale.png');

    // 4. Moon vs Earth (True Scale)
    console.log('Testing 4: Moon vs Earth (True Scale)...');
    await setSelectValues('moon', 'earth');
    await setScaleMode('true-scale');
    await sleep(800);
    await capture('04_compare_moon_vs_earth_truescale.png');

    // 5. Sun vs Pluto (True Scale Extreme Ratio & Beacon)
    console.log('Testing 5: Sun vs Pluto (True Scale)...');
    await setSelectValues('sun', 'pluto');
    await setScaleMode('true-scale');
    await sleep(1000);
    await capture('05_compare_sun_vs_pluto_truescale.png');

    // 6. Mars vs Mercury (True Scale)
    console.log('Testing 6: Mars vs Mercury (True Scale)...');
    await setSelectValues('mars', 'mercury');
    await setScaleMode('true-scale');
    await sleep(800);
    await capture('06_compare_mars_vs_mercury_truescale.png');

    // 7. Earth vs Jupiter (Presentation Scale)
    console.log('Testing 7: Earth vs Jupiter (Presentation Scale)...');
    await setSelectValues('earth', 'jupiter');
    await setScaleMode('presentation');
    await sleep(800);
    await capture('07_compare_earth_vs_jupiter_presentation.png');

    // 8. Compare Fullscreen Mode Desktop
    console.log('Testing 8: Compare Fullscreen Mode Desktop...');
    await setSelectValues('saturn', 'earth');
    await send('Runtime.evaluate', {
      expression: `
        const fsBtn = document.querySelector('button[title*="Fullscreen"]');
        if (fsBtn) fsBtn.click();
      `,
    });
    await sleep(800);
    await capture('08_compare_fullscreen_desktop.png');

    // Exit fullscreen
    await send('Runtime.evaluate', {
      expression: `
        const exitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Exit Fullscreen'));
        if (exitBtn) exitBtn.click();
      `,
    });
    await sleep(600);

    // 9. Compare Mobile Viewport (375x667)
    console.log('Testing 9: Mobile 375x667 Viewport...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await setSelectValues('earth', 'jupiter');
    await sleep(800);
    await capture('09_compare_mobile_375x667.png');

    // Reset emulation back to desktop
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 820,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(500);

    // 10. Object Detail Fullscreen Desktop (Earth)
    console.log('Testing 10: Object Detail Fullscreen (Earth)...');
    await send('Page.navigate', { url: `${BASE_HOST}/#object/earth` });
    await sleep(1500);
    await send('Runtime.evaluate', {
      expression: `
        const fsBtn = document.querySelector('button[title*="Fullscreen"]');
        if (fsBtn) fsBtn.click();
      `,
    });
    await sleep(800);
    await capture('10_object_fullscreen_desktop.png');

    // 11. Show Player Fullscreen Theater
    console.log('Testing 11: Show Player Fullscreen Theater...');
    await send('Page.navigate', { url: `${BASE_HOST}/#show` });
    await sleep(1500);
    await send('Runtime.evaluate', {
      expression: `
        const theaterBtn = document.querySelector('button[title*="Fullscreen"]');
        if (theaterBtn) theaterBtn.click();
      `,
    });
    await sleep(800);
    await capture('11_show_fullscreen_theater.png');

    // 12. Universe Explorer Fullscreen Orrery
    console.log('Testing 12: Universe Explorer Fullscreen Orrery...');
    await send('Page.navigate', { url: `${BASE_HOST}/#explore` });
    await sleep(1500);
    await send('Runtime.evaluate', {
      expression: `
        const orreryFsBtn = document.querySelector('button[title*="Fullscreen"]');
        if (orreryFsBtn) orreryFsBtn.click();
      `,
    });
    await sleep(800);
    await capture('12_explore_fullscreen_orrery.png');

    console.log('All 12 P0 verification screenshots successfully captured!');
  } catch (err) {
    console.error('Validation error:', err);
  } finally {
    ws.close();
    chrome.kill();
  }
}

run();

