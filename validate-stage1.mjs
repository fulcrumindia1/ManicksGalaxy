import { spawn } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;
const BASE_HOST = 'http://127.0.0.1:3000';
const OUT_DIR = resolve('screenshots/stage1');

mkdirSync(OUT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('[Stage 1 Validator] Launching Headless Chrome on port', PORT);
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

  async function waitForPlanetarium() {
    for (let i = 0; i < 25; i++) {
      await sleep(500);
      const evalRes = await send('Runtime.evaluate', {
        expression: 'Boolean(window.__planetarium && window.__planetarium.setGlobeState)',
        returnByValue: true,
      });
      if (evalRes.result?.value === true) {
        break;
      }
    }
    // Pause continuous spin
    await send('Runtime.evaluate', {
      expression: `
        const pauseBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Pause'));
        if (pauseBtn) pauseBtn.click();
      `,
    });
    await sleep(400);
  }

  async function takeShot(name, label) {
    console.log(`  📸 Capturing: ${name} (${label})...`);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shot.result.data, 'base64');
    const filePath = resolve(OUT_DIR, `${name}.png`);
    writeFileSync(filePath, buffer);
    console.log(`     Saved ${buffer.length} bytes -> ${filePath}`);
  }

  async function setGlobe(camPos, rotationY) {
    await send('Runtime.evaluate', {
      expression: `
        if (window.__planetarium) {
          window.__planetarium.setGlobeState({
            camPos: [${camPos[0]}, ${camPos[1]}, ${camPos[2]}],
            rotationY: ${rotationY}
          });
        }
      `,
    });
    await sleep(500);
  }

  // ==========================================
  // 1. MERCURY VALIDATION
  // ==========================================
  console.log('\n--- 1. Validating Mercury ---');
  await send('Page.navigate', { url: `${BASE_HOST}/#object/mercury` });
  await waitForPlanetarium();

  // Caloris Planitia hemisphere
  await setGlobe([0, 0.25, 3.2], 0.0);
  await takeShot('01_mercury_caloris_planitia', 'Mercury Caloris Basin & volcanic plains');

  // Opposite cratered hemisphere
  await setGlobe([0, 0.25, 3.2], 3.14);
  await takeShot('02_mercury_cratered_highlands', 'Mercury opposite cratered hemisphere');

  // North polar region
  await setGlobe([0.01, 3.4, 0.01], 0.0);
  await takeShot('03_mercury_north_pole', 'Mercury North Pole (permanently shadowed ice craters)');

  // ==========================================
  // 2. VENUS VALIDATION (Cloud Deck & Magellan Radar)
  // ==========================================
  console.log('\n--- 2. Validating Venus (Cloud Deck & Magellan Radar) ---');
  await send('Page.navigate', { url: `${BASE_HOST}/#object/venus` });
  await waitForPlanetarium();

  // Natural UV/Visible cloud deck
  await setGlobe([0, 0.25, 3.2], 0.0);
  await takeShot('04_venus_visible_clouds', 'Venus visible sulfuric acid cloud deck (Akatsuki/Pioneer)');

  // Day/night terminator
  await setGlobe([-2.2, 0.4, 2.2], 1.2);
  await takeShot('05_venus_cloud_terminator', 'Venus cloud deck day/night terminator');

  // Toggle Magellan Radar Surface!
  console.log('  Toggling Magellan Radar Surface...');
  await send('Runtime.evaluate', {
    expression: `
      const radarBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Magellan Radar'));
      if (radarBtn) radarBtn.click();
    `,
  });
  await sleep(800);

  // Maxwell Montes / Ishtar Terra
  await setGlobe([0, 0.4, 3.2], 0.85);
  await takeShot('06_venus_radar_maxwell_ishtar', 'Venus Magellan Radar — Ishtar Terra & Maxwell Montes');

  // Aphrodite Terra equatorial continent
  await setGlobe([0, 0.1, 3.2], 2.8);
  await takeShot('07_venus_radar_aphrodite_terra', 'Venus Magellan Radar — Aphrodite Terra equatorial highlands');

  // Polar radar view
  await setGlobe([0.01, 3.4, 0.01], 0.0);
  await takeShot('08_venus_radar_north_pole', 'Venus Magellan Radar — North Polar view');

  // ==========================================
  // 3. MOON VALIDATION
  // ==========================================
  console.log('\n--- 3. Validating Earth\'s Moon ---');
  await send('Page.navigate', { url: `${BASE_HOST}/#object/moon` });
  await waitForPlanetarium();

  // Nearside maria (Procellarum, Tranquillitatis, Imbrium)
  await setGlobe([0, 0.25, 3.2], 1.57);
  await takeShot('09_moon_nearside_maria', 'Moon Nearside Maria (Procellarum, Imbrium, Tranquillitatis)');

  // Farside cratered highlands
  await setGlobe([0, 0.25, 3.2], -1.57);
  await takeShot('10_moon_farside_highlands', 'Moon Farside heavily cratered anorthositic highlands');

  // South Pole (Aitken Basin)
  await setGlobe([0.01, -3.4, 0.01], 0.0);
  await takeShot('11_moon_south_pole_aitken', 'Moon South Pole & Aitken basin rim');

  // ==========================================
  // 4. MARS VALIDATION
  // ==========================================
  console.log('\n--- 4. Validating Mars ---');
  await send('Page.navigate', { url: `${BASE_HOST}/#object/mars` });
  await waitForPlanetarium();

  // Valles Marineris & Tharsis Montes (Olympus Mons)
  await setGlobe([0, 0.25, 3.2], 0.8);
  await takeShot('12_mars_valles_marineris_tharsis', 'Mars Valles Marineris canyon & Tharsis volcanoes');

  // Syrtis Major & Hellas Basin
  await setGlobe([0, 0.25, 3.2], 3.8);
  await takeShot('13_mars_syrtis_major_hellas', 'Mars Syrtis Major Planum & Hellas impact basin');

  // North Polar Ice Cap
  await setGlobe([0.01, 3.4, 0.01], 0.8);
  await takeShot('14_mars_north_polar_cap', 'Mars Planum Boreum water/CO2 polar ice cap');

  // ==========================================
  // 5. SCIENTIFIC SOURCES & PROVENANCE TAB
  // ==========================================
  console.log('\n--- 5. Validating Scientific Sources & Provenance Tab ---');
  await send('Runtime.evaluate', {
    expression: `
      const srcTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sources') || b.textContent.includes('Provenance'));
      if (srcTab) srcTab.click();
    `,
  });
  await sleep(600);
  await takeShot('15_mars_scientific_provenance_tab', 'Mars Scientific & Asset Provenance Tab');

  // ==========================================
  // 6. MOBILE VIEWPORT (375x667)
  // ==========================================
  console.log('\n--- 6. Validating Mobile Viewport (375x667) ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(800);
  await takeShot('16_mobile_viewport_375x667', 'Mars Mobile Viewport (375x667 iPhone SE)');

  // Reset emulation
  await send('Emulation.clearDeviceMetricsOverride');

  console.log('\n✅ Stage 1 Visual Validation complete! All screenshots captured.');
  chrome.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal validator error:', err);
  process.exit(1);
});

