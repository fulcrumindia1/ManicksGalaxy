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
