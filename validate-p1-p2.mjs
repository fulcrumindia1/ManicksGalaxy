import { spawn } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9225;
const BASE_HOST = 'http://127.0.0.1:3000';
const OUT_DIR = resolve('screenshots/p1-p2');

mkdirSync(OUT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('[P1-P2 Validator] Launching Headless Chrome on port', PORT);
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
      // Waiting for Chrome...
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

  async function navigate(url, waitMs = 1500) {
    await send('Page.navigate', { url });
    await sleep(waitMs);
  }

  try {
    // 1. Lobby View with Expanded Planetarium Shows
    console.log('1. Checking Lobby View...');
    await navigate(`${BASE_HOST}/#lobby`, 1500);
    await capture('01_lobby_planetarium_shows.png');

    // 2. Show Player: Our Home in the Milky Way
    console.log('2. Checking Show: Our Home in the Milky Way...');
    await navigate(`${BASE_HOST}/#show/our-home-milky-way`, 2000);
    await capture('02_show_milky_way_chapter1.png');

    // 3. Show Player: Moons & Hidden Oceans
    console.log('3. Checking Show: Moons & Hidden Oceans...');
    await navigate(`${BASE_HOST}/#show/moons-hidden-oceans`, 2000);
    await capture('03_show_moons_oceans_chapter1.png');

    // 4. Object Detail: Io (Volcanic Jovian Moon)
    console.log('4. Checking Object Detail: Io...');
    await navigate(`${BASE_HOST}/#object/io`, 2000);
    await capture('04_object_io_volcanic_globe.png');

    // 5. Object Detail: Enceladus (Tiger Stripes Icy Moon)
    console.log('5. Checking Object Detail: Enceladus...');
    await navigate(`${BASE_HOST}/#object/enceladus`, 2000);
    await capture('05_object_enceladus_tiger_stripes.png');

    // 6. Object Detail: Triton (Cantaloupe Terrain)
    console.log('6. Checking Object Detail: Triton...');
    await navigate(`${BASE_HOST}/#object/triton`, 2000);
    await capture('06_object_triton_nitrogen_frost.png');

    // 7. Object Detail: Proxima Centauri (Red Dwarf Star)
    console.log('7. Checking Object Detail: Proxima Centauri...');
    await navigate(`${BASE_HOST}/#object/proxima-centauri`, 2000);
    await capture('07_object_proxima_red_dwarf.png');

    // 8. Object Detail: Betelgeuse (Red Supergiant Star)
    console.log('8. Checking Object Detail: Betelgeuse...');
    await navigate(`${BASE_HOST}/#object/betelgeuse`, 2000);
    await capture('08_object_betelgeuse_supergiant.png');

    // 9. Object Detail: Sirius (Luminous White Star)
    console.log('9. Checking Object Detail: Sirius...');
    await navigate(`${BASE_HOST}/#object/sirius`, 2000);
    await capture('09_object_sirius_white_star.png');

    // 10. Deep Sky: Andromeda Galaxy (M31) Observation Plate
    console.log('10. Checking Deep Sky: Andromeda Galaxy...');
    await navigate(`${BASE_HOST}/#object/andromeda`, 2000);
    await capture('10_deepsky_andromeda_plate.png');

    // 11. Deep Sky: Crab Nebula (M1) Observation Plate
    console.log('11. Checking Deep Sky: Crab Nebula...');
    await navigate(`${BASE_HOST}/#object/crab-nebula`, 2000);
    await capture('11_deepsky_crab_nebula_plate.png');

    // 12. Deep Sky: Sagittarius A* (Supermassive Black Hole)
    console.log('12. Checking Deep Sky: Sagittarius A*...');
    await navigate(`${BASE_HOST}/#object/sagittarius-a`, 2000);
    await capture('12_deepsky_sagittarius_a_plate.png');

    // 13. Explore View with Distance-to-Scale Orrery Mode
    console.log('13. Checking Explore View in Distance to Scale Mode...');
    await navigate(`${BASE_HOST}/#explore`, 2000);
    // Click scale mode toggle twice to reach 'Distance to Scale'
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Scale:'));
          if (btn) {
            btn.click(); // switch to true-ratios
            setTimeout(() => {
              btn.click(); // switch to distance-scale
            }, 300);
          }
        })()
      `,
    });
    await sleep(1500);
    await capture('13_explore_distance_scale_orrery.png');

    console.log('All P1-P2 validations and screenshots completed successfully!');
  } finally {
    ws.close();
    chrome.kill();
  }
}

run().catch((err) => {
  console.error('Validation failed:', err);
  process.exit(1);
});

