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
  console.log('Launching Headless Chrome on port', PORT);
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

  console.log('Navigating to', BASE_URL);
  await send('Page.navigate', { url: BASE_URL });

  // Wait for React and Three.js scene to mount and textures to load
  console.log('Waiting for Earth scene and NASA textures to settle...');
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    const evalRes = await send('Runtime.evaluate', {
      expression: 'Boolean(window.__planetarium && window.__planetarium.setGlobeState)',
      returnByValue: true,
    });
    if (evalRes.result?.value === true) {
      console.log('Planetarium controller ready after', (i + 1) * 500, 'ms');
      break;
    }
  }

  // Click the Pause button in the dock to freeze continuous rotation for deterministic screenshots
  await send('Runtime.evaluate', {
    expression: `
      const pauseBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Pause') || b.textContent.includes('Resume'));
      if (pauseBtn && pauseBtn.textContent.includes('Pause')) {
        pauseBtn.click();
      }
    `,
  });
  await sleep(600);

  // Targets to validate:
  // Standard equator camera is at [0, 0.25, 3.2]
  const targets = [
    {
      name: '01_africa_europe',
      label: 'Africa & Europe view (Greenwich 0° Meridian)',
      camPos: [0, 0.25, 3.2],
      rotationY: -1.73, // Africa & Mediterranean facing camera
    },
    {
      name: '02_asia_india',
      label: 'Asia & Indian Ocean view (~75°E - 90°E)',
      camPos: [0, 0.25, 3.2],
      rotationY: 3.25, // India & Himalayas facing camera
    },
    {
      name: '03_australia_pacific',
      label: 'Australia & Oceania view (~135°E)',
      camPos: [0, -0.4, 3.2], // Centered on Australia
      rotationY: 2.20,
    },
    {
      name: '04_pacific_180_seam',
      label: 'Pacific Ocean (180° Longitude Seam)',
      camPos: [0, 0.2, 3.2],
      rotationY: 1.45, // 180° longitude seam directly facing camera
    },
    {
      name: '05_americas',
      label: 'North & South America view (~80°W)',
      camPos: [0, 0.25, 3.2],
      rotationY: -0.65, // Americas facing camera
    },
    {
      name: '06_north_pole',
      label: 'Arctic & North Pole polar view',
      camPos: [0.01, 3.4, 0.01], // Looking down at North Pole
      rotationY: -1.73,
    },
    {
      name: '07_south_pole',
      label: 'Antarctica & South Pole polar view',
      camPos: [0.01, -3.4, 0.01], // Looking up at South Pole
      rotationY: -1.73,
    },
    {
      name: '08_night_city_lights',
      label: 'Night Hemisphere & City Lights Terminator',
      // Sun light is at (8, 3.2, 6.5). Camera on dark side:
      camPos: [-2.5, 0.5, -2.5],
      rotationY: -1.73,
    },
  ];

  for (const t of targets) {
    console.log(`Setting view: ${t.name} (${t.label})...`);
    await send('Runtime.evaluate', {
      expression: `
        if (window.__planetarium) {
          window.__planetarium.setGlobeState({
            camPos: [${t.camPos[0]}, ${t.camPos[1]}, ${t.camPos[2]}],
            rotationY: ${t.rotationY}
          });
        }
      `,
    });

    await sleep(600); // Allow render update

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot.result?.data) {
      const filePath = resolve(OUT_DIR, `${t.name}.png`);
      writeFileSync(filePath, Buffer.from(shot.result.data, 'base64'));
      console.log(`  Saved screenshot: ${filePath}`);
    }
  }

  // Mobile viewport screenshot (375x667)
  console.log('Capturing mobile viewport (375x667)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(800);
  const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
  if (mobileShot.result?.data) {
    const filePath = resolve(OUT_DIR, '09_mobile_viewport_375x667.png');
    writeFileSync(filePath, Buffer.from(mobileShot.result.data, 'base64'));
    console.log(`  Saved mobile screenshot: ${filePath}`);
  }

  // Also capture Sources tab to verify provenance credits
  console.log('Capturing Sources tab provenance...');
  await send('Emulation.clearDeviceMetricsOverride');
  await sleep(400);
  await send('Runtime.evaluate', {
    expression: `
      const sourcesBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sources'));
      if (sourcesBtn) sourcesBtn.click();
    `,
  });
  await sleep(600);
  const sourcesShot = await send('Page.captureScreenshot', { format: 'png' });
  if (sourcesShot.result?.data) {
    const filePath = resolve(OUT_DIR, '10_scientific_sources_credits.png');
    writeFileSync(filePath, Buffer.from(sourcesShot.result.data, 'base64'));
    console.log(`  Saved sources screenshot: ${filePath}`);
  }

  console.log('All validation screenshots captured successfully!');
  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('Validation failed:', err);
  process.exit(1);
});
