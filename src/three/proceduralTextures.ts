import * as THREE from 'three';
import { TextureStyle } from '../data/catalog';

function seededNoise(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export interface GeneratedPlanetMaps {
  albedoMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  cloudMap?: THREE.CanvasTexture;
  ringMap?: THREE.CanvasTexture;
  ringAlphaMap?: THREE.CanvasTexture;
}

const mapCache = new Map<string, GeneratedPlanetMaps>();

export function getProceduralPlanetMaps(
  style: TextureStyle,
  maxAnisotropy: number,
  lowQuality = false
): GeneratedPlanetMaps {
  const key = `${style}:${lowQuality ? 'low' : 'std'}`;
  const cached = mapCache.get(key);
  if (cached) return cached;

  const w = lowQuality ? 512 : 1024;
  const h = lowQuality ? 256 : 512;

  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = w;
  albedoCanvas.height = h;
  const ctx = albedoCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const bCtx = bumpCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, w, h);

  const rand = seededNoise(
    style.split('').reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 1337)
  );

  let cloudMap: THREE.CanvasTexture | undefined;
  let ringMap: THREE.CanvasTexture | undefined;
  let ringAlphaMap: THREE.CanvasTexture | undefined;

  if (style === 'saturn') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0.0, '#7c7668'); // North polar hexagon region
    grad.addColorStop(0.12, '#b9a684');
    grad.addColorStop(0.26, '#dfd0ab');
    grad.addColorStop(0.4, '#cbb184');
    grad.addColorStop(0.5, '#f2e4c2'); // Bright equatorial zone
    grad.addColorStop(0.62, '#d5bc8e');
    grad.addColorStop(0.78, '#bfa57d');
    grad.addColorStop(0.9, '#9f8c70');
    grad.addColorStop(1.0, '#756f63');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle atmospheric jet bands
    for (let i = 0; i < 65; i++) {
      const y = rand() * h;
      const bandH = 1 + rand() * 6;
      ctx.fillStyle =
        rand() > 0.5
          ? `rgba(255, 248, 225, ${0.04 + rand() * 0.08})`
          : `rgba(110, 88, 58, ${0.04 + rand() * 0.08})`;
      ctx.fillRect(0, y, w, bandH);
      bCtx.fillStyle = `rgba(200, 200, 200, 0.06)`;
      bCtx.fillRect(0, y, w, bandH);
    }

    // Ring radial texture (1D radial profile mapped onto custom UV RingGeometry)
    const rCanvas = document.createElement('canvas');
    rCanvas.width = 512;
    rCanvas.height = 32;
    const rCtx = rCanvas.getContext('2d')!;

    const aCanvas = document.createElement('canvas');
    aCanvas.width = 512;
    aCanvas.height = 32;
    const aCtx = aCanvas.getContext('2d')!;

    for (let x = 0; x < 512; x++) {
      const t = x / 511; // 0 = inner C ring (1.24 R), 1 = outer A/F ring (2.38 R)
      let alpha = 0;
      let rCol = 225;
      let gCol = 208;
      let bCol = 178;

      if (t < 0.04) {
        alpha = t * 8 * 0.25;
      } else if (t < 0.22) {
        // C Ring (faint, translucent grey-beige)
        alpha = 0.22 + Math.sin(t * 190) * 0.06;
        rCol = 185;
        gCol = 175;
        bCol = 160;
      } else if (t < 0.62) {
        // B Ring (dense, bright icy cream-gold with fine ringlets)
        alpha = 0.86 + Math.sin(t * 340) * 0.09 + Math.cos(t * 95) * 0.04;
        rCol = 238;
        gCol = 222;
        bCol = 190;
      } else if (t < 0.685) {
        // Cassini Division (4,800 km resonance gap!)
        alpha = 0.05;
        rCol = 90;
        gCol = 85;
        bCol = 80;
      } else if (t < 0.94) {
        // A Ring (moderately bright with Encke Gap at ~0.87)
        const encke = Math.abs(t - 0.87) < 0.01 ? 0.08 : 1;
        alpha = (0.64 + Math.sin(t * 260) * 0.07) * encke;
        rCol = 216;
        gCol = 202;
        bCol = 178;
      } else if (t > 0.965 && t < 0.985) {
        // Narrow F Ring
        alpha = 0.42;
      } else {
        alpha = 0.0;
      }

      const clampedA = Math.max(0, Math.min(1, alpha));
      rCtx.fillStyle = `rgb(${rCol}, ${gCol}, ${bCol})`;
      rCtx.fillRect(x, 0, 1, 32);

      const gray = Math.round(clampedA * 255);
      aCtx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
      aCtx.fillRect(x, 0, 1, 32);
    }

    ringMap = new THREE.CanvasTexture(rCanvas);
    ringMap.colorSpace = THREE.SRGBColorSpace;
    ringMap.anisotropy = maxAnisotropy;

    ringAlphaMap = new THREE.CanvasTexture(aCanvas);
    ringAlphaMap.anisotropy = maxAnisotropy;
  } else if (style === 'jupiter') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0.0, '#6e6459');
    grad.addColorStop(0.15, '#c7b093');
    grad.addColorStop(0.24, '#9b5d3f');
    grad.addColorStop(0.34, '#efe0c6');
    grad.addColorStop(0.43, '#a86342');
    grad.addColorStop(0.5, '#f4e8d1');
    grad.addColorStop(0.59, '#9f5738'); // South Equatorial Belt
    grad.addColorStop(0.68, '#e8d4b7');
    grad.addColorStop(0.8, '#b58d6d');
    grad.addColorStop(1.0, '#685e56');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Turbulent festoons and bands
    for (let i = 0; i < 110; i++) {
      const y = rand() * h;
      ctx.fillStyle =
        rand() > 0.5
          ? `rgba(255, 240, 215, ${0.06 + rand() * 0.12})`
          : `rgba(138, 68, 38, ${0.06 + rand() * 0.14})`;
      ctx.beginPath();
      ctx.ellipse(rand() * w, y, 30 + rand() * 120, 2 + rand() * 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Great Red Spot at ~22°S (y ≈ 0.62 * h)
    const grsX = w * 0.58;
    const grsY = h * 0.61;
    const grsGrad = ctx.createRadialGradient(grsX, grsY, 4, grsX, grsY, w * 0.055);
    grsGrad.addColorStop(0, '#c24124');
    grsGrad.addColorStop(0.65, '#9a341e');
    grsGrad.addColorStop(0.9, '#e7c9a9');
    grsGrad.addColorStop(1, 'rgba(231,201,169,0)');
    ctx.save();
    ctx.translate(grsX, grsY);
    ctx.scale(1.65, 1.0);
    ctx.fillStyle = grsGrad;
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.042, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (style === 'earth') {
    // Deep ocean gradient
    const ocean = ctx.createLinearGradient(0, 0, 0, h);
    ocean.addColorStop(0, '#0f294a');
    ocean.addColorStop(0.2, '#134074');
    ocean.addColorStop(0.5, '#0e4d8a');
    ocean.addColorStop(0.8, '#134074');
    ocean.addColorStop(1, '#0f294a');
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, w, h);

    // Stylized continental landmasses (Americas, Eurasia/Africa, Australia, Polar Ice)
    const continents: Array<[number, number, number, number, string]> = [
      [0.21, 0.34, 0.09, 0.13, '#3b7a57'], // North America
      [0.27, 0.62, 0.06, 0.16, '#2e6f40'], // South America
      [0.53, 0.31, 0.08, 0.09, '#4a7c59'], // Europe
      [0.55, 0.52, 0.09, 0.17, '#a98458'], // Africa / Sahara + savanna
      [0.71, 0.34, 0.15, 0.13, '#4f7752'], // Asia
      [0.81, 0.68, 0.06, 0.07, '#b07148'], // Australia
    ];

    for (const [cx, cy, rx, ry, col] of continents) {
      for (let blob = 0; blob < 18; blob++) {
        const bx = (cx + (rand() - 0.5) * rx * 1.4) * w;
        const by = (cy + (rand() - 0.5) * ry * 1.4) * h;
        const brx = (0.015 + rand() * rx * 0.65) * w;
        const bry = (0.02 + rand() * ry * 0.65) * h;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.ellipse(bx, by, brx, bry, rand() * Math.PI, 0, Math.PI * 2);
        ctx.fill();

        bCtx.fillStyle = '#b8b8b8';
        bCtx.beginPath();
        bCtx.ellipse(bx, by, brx, bry, 0, 0, Math.PI * 2);
        bCtx.fill();
      }
    }

    // Polar ice caps
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, w, h * 0.065);
    ctx.fillRect(0, h * 0.91, w, h * 0.09);

    // Separate atmospheric cloud shell map
    const cCanvas = document.createElement('canvas');
    cCanvas.width = w;
    cCanvas.height = h;
    const cCtx = cCanvas.getContext('2d')!;
    for (let i = 0; i < 140; i++) {
      const cx = rand() * w;
      const cy = rand() * h;
      cCtx.fillStyle = `rgba(255, 255, 255, ${0.12 + rand() * 0.28})`;
      cCtx.beginPath();
      cCtx.ellipse(cx, cy, 18 + rand() * 75, 4 + rand() * 14, (rand() - 0.5) * 0.4, 0, Math.PI * 2);
      cCtx.fill();
    }
    cloudMap = new THREE.CanvasTexture(cCanvas);
    cloudMap.colorSpace = THREE.SRGBColorSpace;
    cloudMap.wrapS = THREE.RepeatWrapping;
    cloudMap.anisotropy = maxAnisotropy;
  } else if (style === 'mars') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#d6cfc7');
    grad.addColorStop(0.08, '#b85d3b');
    grad.addColorStop(0.5, '#c86441');
    grad.addColorStop(0.92, '#9e472a');
    grad.addColorStop(1, '#e2dcd5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Dark basaltic albedo features (Syrtis Major, Acidalia)
    for (let i = 0; i < 45; i++) {
      ctx.fillStyle = `rgba(72, 34, 24, ${0.12 + rand() * 0.22})`;
      ctx.beginPath();
      ctx.ellipse(rand() * w, h * (0.15 + rand() * 0.7), 20 + rand() * 80, 12 + rand() * 40, rand(), 0, Math.PI * 2);
      ctx.fill();
    }
    // Valles Marineris scar
    ctx.strokeStyle = 'rgba(58, 22, 14, 0.65)';
    ctx.lineWidth = h * 0.018;
    ctx.beginPath();
    ctx.moveTo(w * 0.36, h * 0.52);
    ctx.bezierCurveTo(w * 0.44, h * 0.54, w * 0.52, h * 0.51, w * 0.6, h * 0.53);
    ctx.stroke();

    // Craters in bump map
    for (let i = 0; i < 120; i++) {
      const cx = rand() * w;
      const cy = rand() * h;
      const r = 3 + rand() * 18;
      bCtx.strokeStyle = 'rgba(220,220,220,0.45)';
      bCtx.fillStyle = 'rgba(85,85,85,0.45)';
      bCtx.beginPath();
      bCtx.arc(cx, cy, r, 0, Math.PI * 2);
      bCtx.fill();
      bCtx.stroke();
    }
  } else if (style === 'uranus') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#b8f3ee');
    grad.addColorStop(0.5, '#7ddbd4');
    grad.addColorStop(1, '#58b4bd');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle Uranus narrow dark/infrared ring map
    const rCanvas = document.createElement('canvas');
    rCanvas.width = 256;
    rCanvas.height = 16;
    const rCtx = rCanvas.getContext('2d')!;
    const aCanvas = document.createElement('canvas');
    aCanvas.width = 256;
    aCanvas.height = 16;
    const aCtx = aCanvas.getContext('2d')!;
    for (let x = 0; x < 256; x++) {
      const t = x / 255;
      const ringlet =
        Math.abs(t - 0.25) < 0.02 ||
        Math.abs(t - 0.52) < 0.018 ||
        Math.abs(t - 0.85) < 0.035;
      rCtx.fillStyle = '#94a3b8';
      rCtx.fillRect(x, 0, 1, 16);
      const a = ringlet ? 135 : 8;
      aCtx.fillStyle = `rgb(${a},${a},${a})`;
      aCtx.fillRect(x, 0, 1, 16);
    }
    ringMap = new THREE.CanvasTexture(rCanvas);
    ringMap.colorSpace = THREE.SRGBColorSpace;
    ringAlphaMap = new THREE.CanvasTexture(aCanvas);
  } else if (style === 'neptune') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#2b59b5');
    grad.addColorStop(0.5, '#3b76d4');
    grad.addColorStop(1, '#1e4294');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 45; i++) {
      ctx.fillStyle =
        rand() > 0.35
          ? `rgba(219, 234, 254, ${0.08 + rand() * 0.22})`
          : `rgba(23, 37, 84, ${0.15 + rand() * 0.2})`;
      ctx.fillRect(rand() * w, rand() * h, 40 + rand() * 140, 2 + rand() * 5);
    }
  } else if (style === 'venus' || style === 'titan') {
    const isTitan = style === 'titan';
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, isTitan ? '#92400e' : '#cbb286');
    grad.addColorStop(0.5, isTitan ? '#d97706' : '#eed8ae');
    grad.addColorStop(1, isTitan ? '#78350f' : '#bfa074');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 65; i++) {
      ctx.fillStyle = `rgba(255, 245, 220, ${0.04 + rand() * 0.08})`;
      ctx.beginPath();
      ctx.ellipse(rand() * w, rand() * h, 60 + rand() * 180, 8 + rand() * 24, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === 'sun') {
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 320; i++) {
      const cx = rand() * w;
      const cy = rand() * h;
      const r = 6 + rand() * 28;
      const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, r);
      g.addColorStop(0, '#fef08a');
      g.addColorStop(0.6, '#f97316');
      g.addColorStop(1, 'rgba(234, 88, 12, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === 'europa') {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, w, h);
    // Reddish-ochre lineae ice fractures
    for (let i = 0; i < 55; i++) {
      ctx.strokeStyle = `rgba(154, 78, 38, ${0.18 + rand() * 0.35})`;
      ctx.lineWidth = 1 + rand() * 2.5;
      ctx.beginPath();
      ctx.moveTo(rand() * w, rand() * h);
      ctx.bezierCurveTo(rand() * w, rand() * h, rand() * w, rand() * h, rand() * w, rand() * h);
      ctx.stroke();

      bCtx.strokeStyle = 'rgba(60, 60, 60, 0.45)';
      bCtx.lineWidth = 2;
      bCtx.stroke();
    }
  } else if (style === 'pluto') {
    ctx.fillStyle = '#9c7e68';
    ctx.fillRect(0, 0, w, h);
    // Cthulhu Macula dark equatorial band
    ctx.fillStyle = '#5c2d22';
    ctx.beginPath();
    ctx.ellipse(w * 0.35, h * 0.56, w * 0.18, h * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    // Bright Sputnik Planitia nitrogen ice basin ("Heart")
    ctx.fillStyle = '#f5ebe0';
    ctx.beginPath();
    ctx.ellipse(w * 0.56, h * 0.48, w * 0.09, h * 0.16, -0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === 'exoplanet-lava') {
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, w, h);
    // Substellar molten hemisphere around x = 0.5
    const magma = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.28);
    magma.addColorStop(0, '#fef08a');
    magma.addColorStop(0.35, '#f97316');
    magma.addColorStop(0.75, '#9a3412');
    magma.addColorStop(1, 'rgba(28, 25, 23, 0)');
    ctx.fillStyle = magma;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 45; i++) {
      ctx.strokeStyle = `rgba(251, 146, 60, ${0.25 + rand() * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rand() * w, rand() * h);
      ctx.lineTo(rand() * w, rand() * h);
      ctx.stroke();
    }
  } else if (style === 'exoplanet-temperate') {
    ctx.fillStyle = '#0f2942';
    ctx.fillRect(0, 0, w, h);
    // Tidally locked "eyeball" open ocean ring + rocky continents + nightside ice
    const sub = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.34);
    sub.addColorStop(0, '#0284c7');
    sub.addColorStop(0.55, '#0f766e');
    sub.addColorStop(0.85, '#cbd5e1');
    sub.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = sub;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 28; i++) {
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.ellipse(rand() * w, rand() * h, 18 + rand() * 48, 12 + rand() * 30, rand(), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === 'io') {
    // Volcanic moon Io: sulfur dioxide frost, orange-red lava rings, dark calderas
    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, 0, w, h);
    // Mottled sulfur-green and orange patches
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = rand() > 0.5 ? 'rgba(132, 204, 22, 0.28)' : 'rgba(234, 88, 12, 0.32)';
      ctx.beginPath();
      ctx.arc(rand() * w, rand() * h, 20 + rand() * 60, 0, Math.PI * 2);
      ctx.fill();
    }
    // Volcanic calderas (Pele, Loki Patera, Prometheus)
    for (let i = 0; i < 35; i++) {
      const cx = rand() * w;
      const cy = rand() * h;
      const r = 4 + rand() * 16;
      // White SO2 frost halo
      ctx.fillStyle = 'rgba(254, 249, 195, 0.75)';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2);
      ctx.fill();
      // Dark red/black caldera pit
      ctx.fillStyle = rand() > 0.4 ? '#451a03' : '#7f1d1d';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      // Bump map indent
      bCtx.fillStyle = 'rgba(40, 40, 40, 0.6)';
      bCtx.beginPath();
      bCtx.arc(cx, cy, r, 0, Math.PI * 2);
      bCtx.fill();
    }
  } else if (style === 'ganymede') {
    // Two-tone icy moon: dark ancient cratered terrain + light grooved sulci
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, w, h);
    // Dark ancient polygonal regions (Galileo Regio)
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.beginPath();
      ctx.ellipse(rand() * w, rand() * h, 40 + rand() * 90, 30 + rand() * 70, rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // Light grooved terrain bands (sulci)
    for (let i = 0; i < 45; i++) {
      ctx.strokeStyle = `rgba(226, 232, 240, ${0.2 + rand() * 0.35})`;
      ctx.lineWidth = 2 + rand() * 4;
      ctx.beginPath();
      const sy = rand() * h;
      ctx.moveTo(0, sy);
      ctx.bezierCurveTo(w * 0.3, sy + (rand() - 0.5) * 50, w * 0.7, sy + (rand() - 0.5) * 50, w, sy + (rand() - 0.5) * 40);
      ctx.stroke();
    }
    // Bright ray craters
    for (let i = 0; i < 60; i++) {
      const cx = rand() * w;
      const cy = rand() * h;
      const r = 2 + rand() * 10;
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === 'callisto') {
    // Dark, ancient, saturated cratered world
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 0, w, h);
    // Valhalla-style concentric multi-ring basin
    const vx = w * 0.42;
    const vy = h * 0.48;
    for (let r = 15; r < 140; r += 12) {
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(vx, vy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    // High density bright ice-excavated craters
    for (let i = 0; i < 220; i++) {
      const cx = rand() * w;
      const cy = rand() * h;
      const r = 1 + rand() * 9;
      ctx.fillStyle = rand() > 0.7 ? '#f1f5f9' : '#9ca3af';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      bCtx.fillStyle = 'rgba(210, 210, 210, 0.35)';
      bCtx.beginPath();
      bCtx.arc(cx, cy, r, 0, Math.PI * 2);
      bCtx.fill();
    }
  } else if (style === 'enceladus') {
    // Ultra-bright icy moon with south-polar blue tiger stripes
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);
    // Subtle ice crust shading
    for (let i = 0; i < 25; i++) {
      ctx.fillStyle = 'rgba(226, 232, 240, 0.4)';
      ctx.beginPath();
      ctx.ellipse(rand() * w, rand() * h * 0.65, 30 + rand() * 50, 15 + rand() * 30, rand(), 0, Math.PI * 2);
      ctx.fill();
    }
    // South polar "Tiger Stripes" (Alexandria, Cairo, Baghdad, Damascus Sulci)
    const tigerColors = ['rgba(56, 189, 248, 0.65)', 'rgba(14, 165, 233, 0.55)', 'rgba(2, 132, 199, 0.45)'];
    for (let i = 0; i < 4; i++) {
      const baseY = h * (0.84 + i * 0.035);
      ctx.strokeStyle = tigerColors[i % tigerColors.length];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.25, baseY);
      ctx.bezierCurveTo(w * 0.4, baseY - 8, w * 0.6, baseY + 8, w * 0.75, baseY - 4);
      ctx.stroke();
      bCtx.strokeStyle = 'rgba(30, 30, 30, 0.5)';
      bCtx.lineWidth = 3;
      bCtx.stroke();
    }
  } else if (style === 'triton') {
    // Cantaloupe terrain, nitrogen frost and pink south polar cap
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, w, h);
    // Cantaloupe dimple texture
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle = rand() > 0.5 ? 'rgba(71, 85, 105, 0.35)' : 'rgba(203, 213, 225, 0.35)';
      ctx.beginPath();
      ctx.arc(rand() * w, rand() * h * 0.65, 4 + rand() * 12, 0, Math.PI * 2);
      ctx.fill();
    }
    // Pinkish-peach nitrogen/methane ice south polar cap
    ctx.fillStyle = 'rgba(251, 207, 232, 0.55)';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.88, w * 0.5, h * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    // Dark geyser streaks trailing north-east from cryovolcanism
    for (let i = 0; i < 20; i++) {
      const gx = w * (0.3 + rand() * 0.4);
      const gy = h * (0.75 + rand() * 0.15);
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + 15 + rand() * 25, gy - 8 - rand() * 10);
      ctx.stroke();
    }
  } else if (style === 'charon') {
    // Grey water-ice crust + reddish Mordor Macula north polar tholin cap + canyon
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(0, 0, w, h);
    // Reddish-brown Mordor Macula at north pole
    const mordor = ctx.createRadialGradient(w * 0.5, 0, 10, w * 0.5, 0, w * 0.25);
    mordor.addColorStop(0, '#7f1d1d');
    mordor.addColorStop(0.5, '#991b1b');
    mordor.addColorStop(1, 'rgba(156, 163, 175, 0)');
    ctx.fillStyle = mordor;
    ctx.fillRect(0, 0, w, h * 0.3);
    // Serenity Chasma equatorial canyon
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.52);
    ctx.bezierCurveTo(w * 0.3, h * 0.5, w * 0.7, h * 0.56, w, h * 0.52);
    ctx.stroke();
    bCtx.strokeStyle = 'rgba(20, 20, 20, 0.7)';
    bCtx.lineWidth = 5;
    bCtx.stroke();
  } else if (style === 'phobos' || style === 'deimos') {
    // Irregular dark carbonaceous Mars moons
    const isPhobos = style === 'phobos';
    ctx.fillStyle = isPhobos ? '#403d39' : '#4a4744';
    ctx.fillRect(0, 0, w, h);
    if (isPhobos) {
      // Giant Stickney crater
      const sx = w * 0.38;
      const sy = h * 0.5;
      const sr = w * 0.14;
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 3;
      ctx.stroke();
      // Radial groove lineations
      for (let i = 0; i < 20; i++) {
        const angle = rand() * Math.PI * 2;
        ctx.strokeStyle = 'rgba(28, 25, 23, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx + Math.cos(angle) * sr, sy + Math.sin(angle) * sr);
        ctx.lineTo(sx + Math.cos(angle) * (sr * 2.2), sy + Math.sin(angle) * (sr * 2.2));
        ctx.stroke();
      }
    } else {
      // Deimos smooth thick regolith
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = 'rgba(120, 113, 108, 0.35)';
        ctx.beginPath();
        ctx.ellipse(rand() * w, rand() * h, 20 + rand() * 40, 10 + rand() * 20, rand(), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (style === 'ceres' || style === 'vesta') {
    // Asteroid belt worlds: Ceres (carbonaceous + Occator salt) vs Vesta (basaltic + Rheasilvia)
    const isCeres = style === 'ceres';
    ctx.fillStyle = isCeres ? '#475569' : '#78716c';
    ctx.fillRect(0, 0, w, h);
    if (isCeres) {
      // Occator Crater bright sodium carbonate faculae
      const ox = w * 0.45;
      const oy = h * 0.42;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ox, oy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.arc(ox, oy, 14, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Vesta south-polar Rheasilvia basin
      const rx = w * 0.5;
      const ry = h * 0.82;
      ctx.fillStyle = '#44403c';
      ctx.beginPath();
      ctx.arc(rx, ry, w * 0.18, 0, Math.PI * 2);
      ctx.fill();
      // Central peak
      ctx.fillStyle = '#d6d3d1';
      ctx.beginPath();
      ctx.arc(rx, ry, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === 'star-red-dwarf') {
    // Proxima Centauri flare star: deep crimson with dark spots and bright flare zones
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#991b1b');
    grad.addColorStop(0.5, '#dc2626');
    grad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // Dark magnetic starspots
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = 'rgba(69, 10, 10, 0.75)';
      ctx.beginPath();
      ctx.arc(rand() * w, rand() * h, 8 + rand() * 24, 0, Math.PI * 2);
      ctx.fill();
    }
    // High-temperature white-gold flare zones
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = 'rgba(254, 240, 138, 0.5)';
      ctx.beginPath();
      ctx.arc(rand() * w, rand() * h, 4 + rand() * 12, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === 'star-red-supergiant') {
    // Betelgeuse: pulsating convective supergranulation, orange-red giant cells
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 80; i++) {
      const cx = rand() * w;
      const cy = rand() * h;
      const r = 20 + rand() * 50;
      const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
      g.addColorStop(0, '#fde047');
      g.addColorStop(0.5, '#ea580c');
      g.addColorStop(1, 'rgba(124, 45, 18, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === 'star-white') {
    // Sirius A: luminous diamond blue-white photosphere
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#bae6fd');
    grad.addColorStop(0.5, '#f8fafc');
    grad.addColorStop(1, '#7dd3fc');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // Subtle granular shimmer
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(rand() * w, rand() * h, 3 + rand() * 15, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === 'deepsky-andromeda' || style === 'deepsky-crab' || style === 'deepsky-blackhole') {
    // Deep-sky fallback textures for sphere preview
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);
    const rad = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.4);
    if (style === 'deepsky-andromeda') {
      rad.addColorStop(0, '#fef3c7');
      rad.addColorStop(0.4, '#38bdf8');
      rad.addColorStop(1, 'rgba(3, 7, 18, 0)');
    } else if (style === 'deepsky-crab') {
      rad.addColorStop(0, '#67e8f9');
      rad.addColorStop(0.5, '#f43f5e');
      rad.addColorStop(1, 'rgba(3, 7, 18, 0)');
    } else {
      rad.addColorStop(0, '#000000');
      rad.addColorStop(0.2, '#f97316');
      rad.addColorStop(1, 'rgba(3, 7, 18, 0)');
    }
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, w, h);
  } else {
    // Mercury & Moon cratered grey regolith
    const isMoon = style === 'moon';
    ctx.fillStyle = isMoon ? '#b8b5ae' : '#9c958d';
    ctx.fillRect(0, 0, w, h);

    if (isMoon) {
      // Dark nearside basaltic maria
      const maria: Array<[number, number, number]> = [
        [0.44, 0.38, 0.08],
        [0.53, 0.42, 0.07],
        [0.61, 0.46, 0.06],
        [0.37, 0.52, 0.09],
      ];
      for (const [mx, my, mr] of maria) {
        ctx.fillStyle = 'rgba(72, 74, 80, 0.68)';
        ctx.beginPath();
        ctx.arc(mx * w, my * h, mr * w, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 180; i++) {
      const cx = rand() * w;
      const cy = rand() * h;
      const r = 2 + rand() * 20;
      ctx.strokeStyle = 'rgba(235, 232, 228, 0.35)';
      ctx.fillStyle = 'rgba(78, 75, 72, 0.28)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      bCtx.strokeStyle = 'rgba(235, 235, 235, 0.55)';
      bCtx.fillStyle = 'rgba(70, 70, 70, 0.55)';
      bCtx.beginPath();
      bCtx.arc(cx, cy, r, 0, Math.PI * 2);
      bCtx.fill();
      bCtx.stroke();
    }
  }

  const albedoMap = new THREE.CanvasTexture(albedoCanvas);
  albedoMap.colorSpace = THREE.SRGBColorSpace;
  albedoMap.wrapS = THREE.RepeatWrapping;
  albedoMap.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.anisotropy = maxAnisotropy;

  const result: GeneratedPlanetMaps = {
    albedoMap,
    bumpMap,
    cloudMap,
    ringMap,
    ringAlphaMap,
  };
  mapCache.set(key, result);
  return result;
}
