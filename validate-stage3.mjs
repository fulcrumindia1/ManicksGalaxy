import { spawn } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9223;
const BASE_HOST = 'http://127.0.0.1:3000';
const OUT_DIR = resolve('screenshots/stage3');

mkdirSync(OUT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('[Stage 3 Validator] Launching Headless Chrome on port', PORT);
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
    for (let i = 0; i < 30; i++) {
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

  async function setGlobe(camPos, rotationY) {
    await send('Runtime.evaluate', {
      expression: `
        if (window.__planetarium && window.__planetarium.setGlobeState) {
          window.__planetarium.setGlobeState({
            camPos: [${camPos[0]}, ${camPos[1]}, ${camPos[2]}],
            rotationY: ${rotationY}
          });
        }
      `,
    });
    await sleep(600);
  }

  async function capture(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const data = res.result ? res.result.data : res.data;
    const buf = Buffer.from(data, 'base64');
    writeFileSync(resolve(OUT_DIR, filename), buf);
    console.log(`Saved screenshot: ${filename} (${buf.length} bytes)`);
  }

  async function clickButtonWithText(text) {
    await send('Runtime.evaluate', {
      expression: `
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('${text}'));
        if (btn) btn.click();
      `,
    });
    await sleep(600);
  }

  try {
    // 1. THE SUN
    console.log('Navigating to The Sun (/#object/sun)...');
    await send('Page.navigate', { url: `${BASE_HOST}/#object/sun` });
    await waitForPlanetarium();

    await setGlobe([0, 0.4, 3.2], 0.0);
    await capture('01_sun_granulation_sunspots.png');

    await setGlobe([0.1, 3.4, 0.2], 1.5);
    await capture('02_sun_polar_view.png');

    // 2. EUROPA
    console.log('Navigating to Europa (/#object/europa)...');
    await send('Page.navigate', { url: `${BASE_HOST}/#object/europa` });
    await waitForPlanetarium();

    await setGlobe([0, 0.2, 3.2], 0.0);
    await capture('03_europa_lineae_chaos.png');

    await setGlobe([0, 0.2, 3.2], Math.PI);
    await capture('04_europa_trailing_hemisphere.png');

    // 3. TITAN
    console.log('Navigating to Titan (/#object/titan)...');
    await send('Page.navigate', { url: `${BASE_HOST}/#object/titan` });
    await waitForPlanetarium();

    await setGlobe([0, 0.3, 3.2], 0.0);
    await capture('05_titan_methane_seas_xanadu.png');

    await setGlobe([0, 0.3, 3.2], Math.PI);
    await capture('06_titan_shangrila_dunes.png');

    // 4. PLUTO
    console.log('Navigating to Pluto (/#object/pluto)...');
    await send('Page.navigate', { url: `${BASE_HOST}/#object/pluto` });
    await waitForPlanetarium();

    await setGlobe([0, 0.2, 3.2], 0.0);
    await capture('07_pluto_tombaugh_regio.png');

    await setGlobe([0, 0.2, 3.2], Math.PI);
    await capture('08_pluto_cthulhu_macula.png');

    // 5. ORION NEBULA
    console.log('Navigating to Orion Nebula (/#object/orion-nebula)...');
    await send('Page.navigate', { url: `${BASE_HOST}/#object/orion-nebula` });
    await sleep(2000);

    // Default Annotated Science Plate
    await capture('09_orion_nebula_annotated.png');

    // Optical mode
    await clickButtonWithText('Optical / Visible');
    await capture('10_orion_nebula_optical.png');

    // Infrared mode
    await clickButtonWithText('Infrared Dust View');
    await capture('11_orion_nebula_infrared.png');

    // 6. MILKY WAY
    console.log('Navigating to Milky Way (/#object/milky-way)...');
    await send('Page.navigate', { url: `${BASE_HOST}/#object/milky-way` });
    await sleep(2000);

    // Default Annotated Top-Down Reconstruction
    await capture('12_milky_way_annotated_topdown.png');

    // Optical mode (ISS view)
    await clickButtonWithText('Optical / Visible');
    await capture('13_milky_way_optical_iss.png');

    // Infrared mode (WISE survey)
    await clickButtonWithText('Infrared Dust View');
    await capture('14_milky_way_infrared_wise.png');

    // 7. SOLAR SYSTEM EXPLORER
    console.log('Navigating to Solar System Explorer (/#explorer)...');
    await send('Page.navigate', { url: `${BASE_HOST}/#explorer` });
    await waitForPlanetarium();
    await sleep(1500);
    await capture('15_solar_system_orrery_sun_planets.png');

    // 8. MOBILE VIEWPORT (Pluto on 375x667)
    console.log('Testing Mobile Viewport on Pluto (375x667)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await send('Page.navigate', { url: `${BASE_HOST}/#object/pluto` });
    await waitForPlanetarium();
    await setGlobe([0, 0.2, 3.3], 0.0);
    await capture('16_mobile_pluto_375x667.png');

    // Reset emulation
    await send('Emulation.clearDeviceMetricsOverride');

    console.log('[Stage 3 Validator] All 16 validation screenshots captured successfully!');
  } finally {
    ws.close();
    chrome.kill();
  }
}

run().catch((err) => {
  console.error('Validation failed:', err);
  process.exit(1);
});
