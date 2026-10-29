import { spawn } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;
const BASE_HOST = 'http://127.0.0.1:3000';
const OUT_DIR = resolve('screenshots/stage2');

mkdirSync(OUT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('[Stage 2 Validator] Launching Headless Chrome on port', PORT);
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
  // 1. JUPITER VALIDATION
  // ==========================================
  console.log('\n--- 1. Validating Jupiter ---');
  await send('Page.navigate', { url: `${BASE_HOST}/#object/jupiter` });
  await waitForPlanetarium();

  // Great Red Spot view
  await setGlobe([0, 0.25, 3.2], 0.2);
  await takeShot('01_jupiter_great_red_spot', 'Jupiter Great Red Spot & ammonia cloud belts');

  // Opposite hemisphere
  await setGlobe([0, 0.25, 3.2], 3.3);
  await takeShot('02_jupiter_opposite_hemisphere', 'Jupiter opposite hemisphere with white ovals');

  // North polar view
  await setGlobe([0.01, 3.4, 0.01], 0.2);
  await takeShot('03_jupiter_polar_view', 'Jupiter North Pole circumpolar storm vortices');

  // Galilean moons overview
  await setGlobe([0, 1.2, 5.5], 0.2);
  await takeShot('04_jupiter_galilean_moons', 'Jupiter with Galilean moons (Io, Europa, Ganymede, Callisto)');

  // ==========================================
  // 2. SATURN VALIDATION (Rings, Oblateness, Cassini Division)
  // ==========================================
  console.log('\n--- 2. Validating Saturn ---');
  await send('Page.navigate', { url: `${BASE_HOST}/#object/saturn` });
  await waitForPlanetarium();

  // Ring tilt view
  await setGlobe([0, 1.45, 5.25], 0.0);
  await takeShot('05_saturn_ring_tilt', 'Saturn ring tilt with Cassini Division & A/B/C rings');

  // From Above (polar view showing planar concentric rings and polar hexagon)
  await setGlobe([0.05, 5.6, 0.45], 0.0);
  await takeShot('06_saturn_from_above', 'Saturn polar view from above ring plane');

  // Ring edge-on view
  await setGlobe([0, 0.08, 5.2], 0.0);
  await takeShot('07_saturn_ring_edge', 'Saturn razor-thin edge-on ring plane');

  // ==========================================
  // 3. URANUS VALIDATION (Ice Giant, 97.77° Tilt)
  // ==========================================
  console.log('\n--- 3. Validating Uranus ---');
  await send('Page.navigate', { url: `${BASE_HOST}/#object/uranus` });
  await waitForPlanetarium();

  // Equator view
  await setGlobe([0, 0.25, 3.2], 0.0);
  await takeShot('08_uranus_equator_view', 'Uranus cyan methane atmosphere & 98° tilted rings');

  // Sunlit pole view
  await setGlobe([2.8, 0.4, 1.5], 0.0);
  await takeShot('09_uranus_pole_sunlit', 'Uranus sunlit polar seasonal view');

  // ==========================================
  // 4. NEPTUNE VALIDATION (Azure Troposphere & Triton)
  // ==========================================
  console.log('\n--- 4. Validating Neptune ---');
  await send('Page.navigate', { url: `${BASE_HOST}/#object/neptune` });
  await waitForPlanetarium();

  // Azure cloud deck & methane cirrus
  await setGlobe([0, 0.25, 3.2], 0.0);
  await takeShot('10_neptune_azure_clouds', 'Neptune azure troposphere with white cirrus streaks');

  // Triton orbit view
  await setGlobe([0, 1.1, 4.8], 1.2);
  await takeShot('11_neptune_triton_orbit', 'Neptune with retrograde moon Triton');

  // ==========================================
  // 5. SOLAR SYSTEM ALL PLANETS
  // ==========================================
  console.log('\n--- 5. Validating Solar System Orrery ---');
  await send('Page.navigate', { url: `${BASE_HOST}/#explore` });
  await sleep(2500); // Allow all 8 planets to assemble & preload
  await takeShot('12_solar_system_all_planets', 'Complete Solar System Explorer with all 8 real planet textures');

  // ==========================================
  // 6. MOBILE VIEWPORT (375x667)
  // ==========================================
  console.log('\n--- 6. Validating Mobile Viewport (375x667) ---');
  await send('Page.navigate', { url: `${BASE_HOST}/#object/saturn` });
  await waitForPlanetarium();
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(800);
  await takeShot('13_mobile_saturn_375x667', 'Saturn Mobile Viewport (375x667 iPhone SE)');

  // Reset emulation
  await send('Emulation.clearDeviceMetricsOverride');

  console.log('\n✅ Stage 2 Visual Validation complete! All screenshots captured.');
  chrome.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal validator error:', err);
  process.exit(1);
});

