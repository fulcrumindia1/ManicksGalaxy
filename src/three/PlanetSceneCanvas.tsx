import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  CELESTIAL_CATALOG,
  CelestialObject,
  SOLAR_SYSTEM_PLANETS,
  TextureStyle,
  getObjectBySlug,
} from '../data/catalog';
import { computeOrbitalAngleRad } from '../lib/astronomy';
import { QualityTier } from '../lib/voyageStore';
import { getProceduralPlanetMaps } from './proceduralTextures';
import {
  loadRealPlanetTextures,
  releaseLoadedTextures,
  type LoadedPlanetTextures,
} from './loadPlanetTextures';

export type CameraPreset = 'default' | 'above' | 'equator' | 'rings' | 'moons' | 'system';

export interface PlanetSceneCanvasProps {
  mode: 'object' | 'solar-system' | 'hero';
  objectSlug: string;
  surfaceVariant?: 'standard' | 'radar';
  cameraPreset?: CameraPreset;
  presetNonce?: number;
  orbitStepCommand?: { yawDeg: number; pitchDeg: number; zoomScale: number; nonce: number };
  isPaused?: boolean;
  reducedMotion?: boolean;
  showScienceLabels?: boolean;
  scaleMode?: 'educational' | 'true-ratios';
  timeSpeedDaysPerSec?: number;
  qualityTier?: QualityTier;
  onSelectObject?: (slug: string) => void;
  ariaLabel?: string;
}

const detectSoftwareGl = (): { supported: boolean; isSoftwareGl: boolean } => {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = (probeCanvas.getContext('webgl2') ||
      probeCanvas.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return { supported: false, isSoftwareGl: true };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    const isSoft = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return { supported: true, isSoftwareGl: isSoft };
  } catch {
    return { supported: false, isSoftwareGl: true };
  }
};

// Pre-allocated scratch math helpers (zero GC inside animation loop)
const _scratchTargetPos = new THREE.Vector3();
const _scratchLookAt = new THREE.Vector3();
const _scratchSphere = new THREE.Spherical();
const _scratchOffset = new THREE.Vector3();
const _scratchSunDir = new THREE.Vector3();

function createCustomRingGeometry(innerRadius: number, outerRadius: number, segments: number): THREE.RingGeometry {
  const geo = new THREE.RingGeometry(innerRadius, outerRadius, segments, 4);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const v3 = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v3.fromBufferAttribute(pos, i);
    const radius = v3.length();
    const t = (radius - innerRadius) / Math.max(0.001, outerRadius - innerRadius);
    uv.setXY(i, t, 0.5);
  }
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function buildCompositeCelestialGroup(
  obj: CelestialObject,
  maxAnisotropy: number,
  lowQuality: boolean,
  showScienceLabels: boolean,
  includeMoons: boolean,
  sunLightRef?: THREE.DirectionalLight,
  realTextures?: LoadedPlanetTextures | null,
): {
  root: THREE.Group;
  spinMesh: THREE.Mesh;
  cloudMesh?: THREE.Mesh;
  nightMesh?: THREE.Mesh;
  moonpivots: Array<{ pivot: THREE.Group; speed: number }>;
  disposables: Array<{ dispose: () => void }>;
} {
  const disposables: Array<{ dispose: () => void }> = [];
  const root = new THREE.Group();

  const hasRealTextures = realTextures?.isRealImagery && realTextures.albedoMap;

  // Only use procedural maps as fallback when no real textures available
  const maps = hasRealTextures ? null : getProceduralPlanetMaps(obj.visual.textureStyle, maxAnisotropy, lowQuality);

  // Tilt group applies true physical axial obliquity
  const axialTiltGroup = new THREE.Group();
  axialTiltGroup.rotation.z = THREE.MathUtils.degToRad(obj.metrics.axialTiltDeg || 0);
  root.add(axialTiltGroup);

  const segs = lowQuality ? 32 : 64;
  // Part 1: Primary planetary body spheroid (oblate scaled for gas giants)
  const bodyGeo = new THREE.SphereGeometry(1, segs, segs);
  disposables.push(bodyGeo);

  const isStar = obj.category === 'star';
  let bodyMat: THREE.MeshStandardMaterial;

  if (isStar) {
    const starMap = hasRealTextures ? realTextures!.albedoMap : maps?.albedoMap;
    bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: starMap,
      emissive: new THREE.Color('#f97316'),
      emissiveMap: starMap,
      emissiveIntensity: hasRealTextures ? 1.15 : 1.35,
      roughness: 0.4,
      metalness: 0.0,
    });
  } else if (hasRealTextures) {
    // Real NASA/Satellite imagery path for Earth, Mercury, Venus, Moon, Mars, Jupiter, Saturn, Uranus, Neptune, Europa, Titan, Pluto
    const isRockyAirless = ['mercury', 'moon', 'mars'].includes(obj.slug);
    const isVenus = obj.slug === 'venus';
    const isGasGiant = ['jupiter', 'saturn', 'uranus', 'neptune'].includes(obj.slug);
    const isIcyMoon = ['europa', 'pluto'].includes(obj.slug);
    const isTitan = obj.slug === 'titan';
    const baseRoughness = isRockyAirless
      ? 0.88
      : isVenus
      ? 0.52
      : isGasGiant
      ? 0.68
      : isIcyMoon
      ? 0.38
      : isTitan
      ? 0.72
      : 0.62;
    const baseMetalness = isRockyAirless ? 0.02 : isGasGiant ? 0.0 : isIcyMoon ? 0.04 : 0.04;

    bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: realTextures!.albedoMap,
      normalMap: realTextures!.normalMap || undefined,
      normalScale: new THREE.Vector2(0.08, 0.08), // Subtle — surface terrain at planetary scale
      roughness: baseRoughness,
      metalness: baseMetalness,
    });

    // If specular map is available, use it as roughness modulation
    // (ocean areas should be more reflective, land areas rougher)
    if (realTextures!.specularMap) {
      bodyMat.roughnessMap = realTextures!.specularMap;
      bodyMat.roughness = 0.85; // Base roughness; specular map reduces for oceans
      bodyMat.metalness = 0.06;
    }
  } else {
    bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: maps!.albedoMap,
      bumpMap: maps!.bumpMap,
      bumpScale: obj.category === 'planet' && obj.visual.hasRings ? 0.008 : 0.024,
      roughness: obj.slug === 'earth' ? 0.58 : obj.slug === 'europa' ? 0.32 : 0.78,
      metalness: 0.06,
    });
  }
  disposables.push(bodyMat);

  const spinMesh = new THREE.Mesh(bodyGeo, bodyMat);
  if (obj.visual.oblateness) {
    spinMesh.scale.set(1, obj.visual.oblateness, 1);
  }
  spinMesh.userData.slug = obj.slug;
  axialTiltGroup.add(spinMesh);

  // Part 1b: Night-side city-lights emissive layer (Earth only, real textures)
  // Dedicated shader ensures city lights ONLY illuminate the night hemisphere
  let nightMesh: THREE.Mesh | undefined;
  if (hasRealTextures && realTextures!.nightMap && sunLightRef) {
    const nightGeo = new THREE.SphereGeometry(1.002, segs, segs);
    const sunDirInit = sunLightRef.position.clone().normalize();
    const nightMat = new THREE.ShaderMaterial({
      uniforms: {
        tNight: { value: realTextures!.nightMap },
        uSunDirection: { value: sunDirInit },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        void main() {
          vUv = uv;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tNight;
        uniform vec3 uSunDirection;
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        void main() {
          vec4 nightTex = texture2D(tNight, vUv);
          float sunDot = dot(normalize(vWorldNormal), normalize(uSunDirection));
          // Sharp daylight cutoff: 0.0 in sunlight, 1.0 in shadow
          float nightFactor = 1.0 - smoothstep(-0.22, 0.02, sunDot);
          gl_FragColor = vec4(nightTex.rgb * nightFactor, nightFactor);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    disposables.push(nightGeo, nightMat);
    nightMesh = new THREE.Mesh(nightGeo, nightMat);
    nightMesh.renderOrder = 1;
    axialTiltGroup.add(nightMesh);
  }

  // Part 2: Cloud shell — use real cloud texture if available, else procedural
  let cloudMesh: THREE.Mesh | undefined;
  const cloudTexture = hasRealTextures ? realTextures!.cloudMap : maps?.cloudMap;
  if (cloudTexture) {
    const cloudGeo = new THREE.SphereGeometry(1.018, segs, segs);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: cloudTexture,
      transparent: true,
      alphaMap: hasRealTextures ? cloudTexture : undefined, // Use cloud map as its own alpha for real textures
      opacity: hasRealTextures ? 0.92 : 0.82,
      roughness: 0.92,
      metalness: 0.0,
      depthWrite: false,
    });
    disposables.push(cloudGeo, cloudMat);
    cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    cloudMesh.renderOrder = 2;
    axialTiltGroup.add(cloudMesh);
  }

  // Part 3: Atmospheric limb / Solar corona shell
  if (obj.visual.atmosphereColor) {
    const atmoGeo = new THREE.SphereGeometry(isStar ? 1.14 : 1.055, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(obj.visual.atmosphereColor),
      transparent: true,
      opacity: isStar ? 0.24 : 0.14,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(atmoGeo, atmoMat);
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    if (obj.visual.oblateness) {
      atmoMesh.scale.set(1, obj.visual.oblateness, 1);
    }
    axialTiltGroup.add(atmoMesh);
  }

  // Part 4: Multi-band Planetary Ring System (Saturn C/B/Cassini/A/F or Uranus rings)
  if (obj.visual.hasRings && obj.visual.ringInnerRadius && obj.visual.ringOuterRadius) {
    const ringGeo = createCustomRingGeometry(
      obj.visual.ringInnerRadius,
      obj.visual.ringOuterRadius,
      lowQuality ? 64 : 96
    );
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: realTextures?.ringMap || maps?.ringMap,
      alphaMap: realTextures?.ringAlphaMap || maps?.ringAlphaMap,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 0.45,
      metalness: 0.08,
      depthWrite: false,
    });
    disposables.push(ringGeo, ringMat);
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.renderOrder = 2;
    axialTiltGroup.add(ringMesh);
  }

  // Part 5: Science Mode Coordinate Reference Gimbal (Rotational Axis + Equatorial Ring)
  if (showScienceLabels) {
    const axisGeo = new THREE.CylinderGeometry(0.012, 0.012, 2.85, 12);
    const axisMat = new THREE.MeshStandardMaterial({
      color: 0x79d9ed,
      emissive: 0x164e63,
      roughness: 0.25,
      metalness: 0.65,
    });
    disposables.push(axisGeo, axisMat);
    const axisRod = new THREE.Mesh(axisGeo, axisMat);
    axialTiltGroup.add(axisRod);

    const eqGeo = new THREE.TorusGeometry(1.14, 0.008, 8, 64);
    eqGeo.rotateX(Math.PI / 2);
    const eqMat = new THREE.MeshBasicMaterial({
      color: 0xd7b77b,
      transparent: true,
      opacity: 0.55,
    });
    disposables.push(eqGeo, eqMat);
    const eqRing = new THREE.Mesh(eqGeo, eqMat);
    axialTiltGroup.add(eqRing);
  }

  // Part 6: Orbiting 3D Moons & Orbital Tracks
  const moonpivots: Array<{ pivot: THREE.Group; speed: number }> = [];
  if (includeMoons && obj.visual.moons && obj.visual.moons.length > 0) {
    obj.visual.moons.forEach((moon, idx) => {
      const orbitPlane = new THREE.Group();
      orbitPlane.rotation.x = THREE.MathUtils.degToRad(moon.inclinationDeg);
      axialTiltGroup.add(orbitPlane);

      // Delicate orbital track line
      const pts: THREE.Vector3[] = [];
      const segments = 64;
      for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(theta) * moon.orbitRadius, 0, Math.sin(theta) * moon.orbitRadius));
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x79d9ed,
        transparent: true,
        opacity: 0.24,
      });
      disposables.push(lineGeo, lineMat);
      orbitPlane.add(new THREE.LineLoop(lineGeo, lineMat));

      const pivot = new THREE.Group();
      pivot.rotation.y = (idx * 2.1) + 0.8;
      orbitPlane.add(pivot);

      const mGeo = new THREE.SphereGeometry(moon.radiusRatio, 20, 20);
      const mMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(moon.color),
        roughness: 0.72,
        metalness: 0.05,
      });
      disposables.push(mGeo, mMat);
      const mMesh = new THREE.Mesh(mGeo, mMat);
      mMesh.position.set(moon.orbitRadius, 0, 0);
      if (moon.slug) {
        mMesh.userData.slug = moon.slug;
      }
      pivot.add(mMesh);
      moonpivots.push({ pivot, speed: moon.speed });
    });
  }

  return { root, spinMesh, cloudMesh, nightMesh, moonpivots, disposables };
}

export const PlanetSceneCanvas: React.FC<PlanetSceneCanvasProps> = ({
  mode,
  objectSlug,
  surfaceVariant = 'standard',
  cameraPreset = 'default',
  presetNonce = 0,
  orbitStepCommand,
  isPaused = false,
  reducedMotion = false,
  showScienceLabels = false,
  scaleMode = 'educational',
  timeSpeedDaysPerSec = 12,
  qualityTier = 'auto',
  onSelectObject,
  ariaLabel,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [webglAvailable, setWebglAvailable] = useState<boolean>(true);

  const propsRef = useRef({
    mode,
    objectSlug,
    surfaceVariant,
    cameraPreset,
    presetNonce,
    isPaused,
    reducedMotion,
    showScienceLabels,
    scaleMode,
    timeSpeedDaysPerSec,
    qualityTier,
    onSelectObject,
  });
  propsRef.current = {
    mode,
    objectSlug,
    surfaceVariant,
    cameraPreset,
    presetNonce,
    isPaused,
    reducedMotion,
    showScienceLabels,
    scaleMode,
    timeSpeedDaysPerSec,
    qualityTier,
    onSelectObject,
  };

  // Imperative scene controller ref so React prop updates can trigger camera transitions & subject swaps cleanly
  const engineRef = useRef<{
    rebuildSubject: () => void;
    applyCameraPreset: (preset: CameraPreset, instant: boolean) => void;
    stepOrbitCamera: (yawDeg: number, pitchDeg: number, zoomScale: number) => void;
    requestRender: () => void;
  } | null>(null);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const { supported, isSoftwareGl } = detectSoftwareGl();
    if (!supported) {
      setWebglAvailable(false);
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl && propsRef.current.qualityTier !== 'low',
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebglAvailable(false);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    const dpr = isSoftwareGl || propsRef.current.qualityTier === 'low'
      ? 1
      : Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x030713, 1);

    const initW = Math.max(1, container.clientWidth);
    const initH = Math.max(1, container.clientHeight);
    renderer.setSize(initW, initH);
    renderer.domElement.className = 'block w-full h-full outline-none';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglAvailable(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030713);
    scene.fog = new THREE.FogExp2(0x030713, 0.0028);

    // Mandatory studio environment map for PBR reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.22;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, initW / initH, 0.1, 450);
    camera.position.set(0, 1.1, 4.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = propsRef.current.mode === 'solar-system';
    controls.minDistance = 1.65;
    controls.maxDistance = 120;
    controls.minPolarAngle = 0.08;
    controls.maxPolarAngle = Math.PI - 0.08;

    // 3-Point Celestial Lighting Rig (Warm Solar Key + Cool Cosmic Hemisphere Fill + Subtle Rim)
    const sunKeyLight = new THREE.DirectionalLight(0xfff5e4, 2.75);
    sunKeyLight.position.set(8, 3.2, 6.5);
    scene.add(sunKeyLight);

    const solarPointLight = new THREE.PointLight(0xffedd5, 0, 160, 0.4);
    solarPointLight.position.set(0, 0, 0);
    scene.add(solarPointLight);

    const hemiFill = new THREE.HemisphereLight(0x79d9ed, 0x091124, 0.42);
    scene.add(hemiFill);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.55);
    rimLight.position.set(-7, 2.5, -6);
    scene.add(rimLight);

    // Procedural 3D Starfield (Points)
    const starCount = isSoftwareGl ? 650 : 1400;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    let seed = 4201;
    const sRand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const palette = [
      new THREE.Color('#e0f2fe'),
      new THREE.Color('#f8fafc'),
      new THREE.Color('#fef3c7'),
      new THREE.Color('#fed7aa'),
      new THREE.Color('#c7d2fe'),
    ];
    for (let i = 0; i < starCount; i++) {
      const r = 115 + sRand() * 140;
      const theta = sRand() * Math.PI * 2;
      const phi = Math.acos(2 * sRand() - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.cos(phi);
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      const col = palette[Math.floor(sRand() * palette.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: isSoftwareGl ? 0.55 : 0.48,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Dynamic Subject Container
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    let activeDisposables: Array<{ dispose: () => void }> = [];
    let activeSpinMeshes: Array<{ mesh: THREE.Mesh; rate: number }> = [];
    let activeMoonPivots: Array<{ pivot: THREE.Group; speed: number }> = [];
    let activeNightMaterials: THREE.Material[] = [];
    let forceProceduralFallback = false;
    const cachedPlanetTextures = new Map<string, LoadedPlanetTextures>();
    let buildGeneration = 0;
    let solarPlanets: Array<{
      obj: CelestialObject;
      holder: THREE.Group;
      meshGroup: THREE.Group;
      orbitDist: number;
    }> = [];
    let clickables: THREE.Object3D[] = [];
    let simDays = 0;

    // Camera transition state
    let transitionActive = false;
    const desiredCamPos = new THREE.Vector3(0, 1.1, 4.2);
    const desiredTarget = new THREE.Vector3(0, 0, 0);

    controls.addEventListener('start', () => {
      transitionActive = false;
    });

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    const clearStage = () => {
      while (stageGroup.children.length > 0) {
        stageGroup.remove(stageGroup.children[0]);
      }
      activeDisposables.forEach((d) => d.dispose());
      activeDisposables = [];
      activeSpinMeshes = [];
      activeMoonPivots = [];
      activeNightMaterials = [];
      solarPlanets = [];
      clickables = [];
    };

    const applyCameraPreset = (preset: CameraPreset, instant: boolean) => {
      const p = propsRef.current;
      const obj = getObjectBySlug(p.objectSlug) || CELESTIAL_CATALOG[0];
      const hasRings = Boolean(obj.visual.hasRings);

      desiredTarget.set(0, 0, 0);
      if (p.mode === 'solar-system' || preset === 'system') {
        desiredCamPos.set(0, 32, 54);
      } else if (p.mode === 'hero') {
        desiredCamPos.set(hasRings ? -0.75 : -0.65, hasRings ? 1.25 : 0.48, hasRings ? 5.75 : 3.35);
        desiredTarget.set(0, hasRings ? -0.16 : -0.06, 0);
      } else {
        switch (preset) {
          case 'above':
            desiredCamPos.set(0.05, hasRings ? 5.6 : 3.6, 0.45);
            break;
          case 'equator':
            desiredCamPos.set(0, 0.1, hasRings ? 5.35 : 3.25);
            break;
          case 'rings':
            desiredCamPos.set(1.75, 0.34, 5.05);
            break;
          case 'moons':
            desiredCamPos.set(0, 2.05, 6.8);
            break;
          default:
            desiredCamPos.set(
              hasRings ? 1.25 : 0.65,
              hasRings ? 1.45 : 0.65,
              hasRings ? 5.45 : 3.35
            );
            break;
        }
      }

      if (instant || p.reducedMotion) {
        camera.position.copy(desiredCamPos);
        controls.target.copy(desiredTarget);
        controls.update();
        transitionActive = false;
      } else {
        transitionActive = true;
      }
      requestRender();
    };

    const rebuildSubject = () => {
      const currentGen = ++buildGeneration;
      clearStage();
      const p = propsRef.current;
      const lowQ = isSoftwareGl || p.qualityTier === 'low';
      controls.enablePan = p.mode === 'solar-system';
      controls.enableRotate = p.mode !== 'hero';
      controls.enableZoom = p.mode !== 'hero';

      if (p.mode === 'solar-system') {
        sunKeyLight.intensity = 0.35;
        solarPointLight.intensity = 3.2;
        controls.minDistance = 8;
        controls.maxDistance = 125;

        // Build Sun at origin
        const sunObj = getObjectBySlug('sun')!;
        const cachedSunTex = cachedPlanetTextures.get('sun:standard');
        const sunBuilt = buildCompositeCelestialGroup(
          sunObj,
          maxAnisotropy,
          lowQ,
          false,
          false,
          sunKeyLight,
          cachedSunTex
        );
        sunBuilt.root.scale.setScalar(2.6);
        stageGroup.add(sunBuilt.root);
        activeDisposables.push(...sunBuilt.disposables);
        activeSpinMeshes.push({ mesh: sunBuilt.spinMesh, rate: 0.12 });
        clickables.push(sunBuilt.spinMesh);

        // Asteroid Belt InstancedMesh (>150 varied rocky asteroids between Mars 17 & Jupiter 24.5)
        const astCount = lowQ ? 110 : 200;
        const astGeo = new THREE.DodecahedronGeometry(0.11, 0);
        const astMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.88,
          metalness: 0.12,
        });
        const astInstanced = new THREE.InstancedMesh(astGeo, astMat, astCount);
        activeDisposables.push(astGeo, astMat);

        const dummy = new THREE.Object3D();
        const c = new THREE.Color();
        for (let i = 0; i < astCount; i++) {
          const r = 19.6 + (i % 17) * 0.19 + Math.sin(i * 7.3) * 0.4;
          const angle = (i / astCount) * Math.PI * 2 + Math.cos(i * 3.1) * 0.2;
          const yOff = Math.sin(i * 11.7) * 0.45;
          dummy.position.set(Math.cos(angle) * r, yOff, Math.sin(angle) * r);
          dummy.rotation.set(i * 0.7, i * 1.1, i * 0.3);
          const s = 0.85 + ((i * 13) % 30) / 100; // ±15% scale variation
          dummy.scale.set(s * 1.2, s * 0.85, s);
          dummy.updateMatrix();
          astInstanced.setMatrixAt(i, dummy.matrix);
          const shade = 0.48 + ((i * 7) % 25) / 100;
          c.setRGB(shade, shade * 0.95, shade * 0.88);
          astInstanced.setColorAt(i, c);
        }
        astInstanced.instanceMatrix.needsUpdate = true;
        if (astInstanced.instanceColor) astInstanced.instanceColor.needsUpdate = true;
        astInstanced.computeBoundingSphere();
        stageGroup.add(astInstanced);

        // Build all 8 Solar System Planets + Orbital Paths
        SOLAR_SYSTEM_PLANETS.forEach((planet) => {
          const dist = planet.visual.orbitSceneDistance || 10;
          const pts: THREE.Vector3[] = [];
          const segs = 96;
          for (let i = 0; i < segs; i++) {
            const th = (i / segs) * Math.PI * 2;
            pts.push(new THREE.Vector3(Math.cos(th) * dist, 0, Math.sin(th) * dist));
          }
          const oGeo = new THREE.BufferGeometry().setFromPoints(pts);
          const oMat = new THREE.LineBasicMaterial({
            color: planet.slug === p.objectSlug ? 0x79d9ed : 0x334155,
            transparent: true,
            opacity: planet.slug === p.objectSlug ? 0.75 : 0.42,
          });
          activeDisposables.push(oGeo, oMat);
          stageGroup.add(new THREE.LineLoop(oGeo, oMat));

          const holder = new THREE.Group();
          const cachedTex = cachedPlanetTextures.get(`${planet.visual.textureStyle}:standard`);
          const built = buildCompositeCelestialGroup(
            planet,
            maxAnisotropy,
            lowQ,
            p.showScienceLabels,
            false,
            sunKeyLight,
            cachedTex
          );

          // Scale mode: True planet-to-planet ratios vs Educational legibility
          const earthDiam = 12742;
          const ratioToEarth = planet.metrics.diameterKm / earthDiam;
          const visualScale =
            p.scaleMode === 'true-ratios'
              ? Math.max(0.14, ratioToEarth * 0.22)
              : Math.max(0.45, Math.pow(ratioToEarth, 0.36) * 0.62);

          built.root.scale.setScalar(visualScale);
          holder.add(built.root);
          stageGroup.add(holder);

          const angle = computeOrbitalAngleRad(
            planet.metrics.orbitalPeriodDays,
            planet.visual.orbitInitialPhaseDeg || 0,
            simDays
          );
          holder.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);

          activeDisposables.push(...built.disposables);
          activeSpinMeshes.push({ mesh: built.spinMesh, rate: 0.35 });
          if (built.nightMesh) {
            activeSpinMeshes.push({ mesh: built.nightMesh, rate: 0.35 });
            activeNightMaterials.push(built.nightMesh.material as THREE.Material);
          }
          clickables.push(built.spinMesh);
          solarPlanets.push({ obj: planet, holder, meshGroup: built.root, orbitDist: dist });
        });

        // Preload real planet textures for solar-system mode if not yet loaded
        const stylesToPreload: TextureStyle[] = [
          'sun',
          'mercury',
          'venus',
          'earth',
          'mars',
          'jupiter',
          'saturn',
          'uranus',
          'neptune',
        ];
        stylesToPreload.forEach((style) => {
          const cKey = `${style}:standard`;
          if (!cachedPlanetTextures.has(cKey)) {
            loadRealPlanetTextures(style, maxAnisotropy, p.qualityTier).then((loaded) => {
              if (unmounted || buildGeneration !== currentGen) return;
              if (loaded) {
                cachedPlanetTextures.set(cKey, loaded);
                rebuildSubject();
              }
            });
          }
        });
      } else {
        sunKeyLight.intensity = 2.75;
        solarPointLight.intensity = 0;
        controls.minDistance = 1.65;
        controls.maxDistance = 16;

        const targetObj = getObjectBySlug(p.objectSlug) || getObjectBySlug('saturn')!;
        const variantKey = p.surfaceVariant || 'standard';
        const cacheKey = `${targetObj.visual.textureStyle}:${variantKey}`;
        const cachedTex = forceProceduralFallback ? null : cachedPlanetTextures.get(cacheKey);

        const buildSingle = (texturesToUse?: LoadedPlanetTextures | null) => {
          clearStage();
          const built = buildCompositeCelestialGroup(
            targetObj,
            maxAnisotropy,
            lowQ,
            p.showScienceLabels,
            p.mode === 'object',
            sunKeyLight,
            texturesToUse
          );
          stageGroup.add(built.root);
          activeDisposables.push(...built.disposables);
          activeSpinMeshes.push({ mesh: built.spinMesh, rate: 0.16 });
          if (built.nightMesh) {
            activeSpinMeshes.push({ mesh: built.nightMesh, rate: 0.16 });
            activeNightMaterials.push(built.nightMesh.material as THREE.Material);
          }
          if (built.cloudMesh) {
            activeSpinMeshes.push({ mesh: built.cloudMesh, rate: 0.21 });
          }
          activeMoonPivots.push(...built.moonpivots);
          built.root.traverse((child) => {
            if ((child as THREE.Mesh).isMesh && child.userData.slug) {
              clickables.push(child);
            }
          });
          if (!isSoftwareGl) {
            renderer.compile(scene, camera);
          }
          requestRender();
        };

        // If cached textures exist, build immediately with them
        buildSingle(cachedTex);

        // If not yet cached, attempt to load real textures asynchronously
        if (!cachedTex && !forceProceduralFallback) {
          loadRealPlanetTextures(targetObj.visual.textureStyle, maxAnisotropy, p.qualityTier, p.surfaceVariant).then((loaded) => {
            if (unmounted || buildGeneration !== currentGen) return;
            if (loaded) {
              cachedPlanetTextures.set(cacheKey, loaded);
              buildSingle(loaded);
            }
          });
        }
      }

      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }
      requestRender();
    };

    const stepOrbitCamera = (yawDeg: number, pitchDeg: number, zoomScale: number) => {
      transitionActive = false;
      _scratchOffset.copy(camera.position).sub(controls.target);
      _scratchSphere.setFromVector3(_scratchOffset);
      _scratchSphere.theta += THREE.MathUtils.degToRad(yawDeg);
      _scratchSphere.phi = THREE.MathUtils.clamp(
        _scratchSphere.phi + THREE.MathUtils.degToRad(pitchDeg),
        0.12,
        Math.PI - 0.12
      );
      _scratchSphere.radius = THREE.MathUtils.clamp(
        _scratchSphere.radius * zoomScale,
        controls.minDistance,
        controls.maxDistance
      );
      _scratchOffset.setFromSpherical(_scratchSphere);
      camera.position.copy(controls.target).add(_scratchOffset);
      camera.lookAt(controls.target);
      controls.update();
      requestRender();
    };

    // Raycasting on click for planet/moon selection
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
      if (!propsRef.current.onSelectObject || clickables.length === 0) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickables, false);
      if (hits.length > 0) {
        const slug = hits[0].object.userData.slug as string | undefined;
        if (slug && slug !== propsRef.current.objectSlug) {
          propsRef.current.onSelectObject(slug);
        } else if (slug && propsRef.current.mode === 'solar-system') {
          propsRef.current.onSelectObject(slug);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Software-WebGL friendly frame pacing + on-demand coalescing
    let frameId = 0;
    let timerId = 0;
    let unmounted = false;
    let renderBusy = false;
    let renderDirty = false;
    let lastTimeMs = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (unmounted) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            timerId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            timerId = window.setTimeout(cb, 85);
          }
        };
        timerId = window.setTimeout(poll, 5);
      } else {
        timerId = window.setTimeout(cb, 85);
      }
    }

    function advanceSimulation(dt: number): boolean {
      const p = propsRef.current;
      let stillMoving = false;

      if (transitionActive) {
        const alpha = 1 - Math.exp(-5.5 * dt);
        _scratchTargetPos.copy(camera.position).lerp(desiredCamPos, alpha);
        _scratchLookAt.copy(controls.target).lerp(desiredTarget, alpha);
        camera.position.copy(_scratchTargetPos);
        controls.target.copy(_scratchLookAt);
        if (
          camera.position.distanceToSquared(desiredCamPos) < 0.0008 &&
          controls.target.distanceToSquared(desiredTarget) < 0.0008
        ) {
          camera.position.copy(desiredCamPos);
          controls.target.copy(desiredTarget);
          transitionActive = false;
        } else {
          stillMoving = true;
        }
      }

      const animateMotion = !p.isPaused && !p.reducedMotion;
      if (animateMotion) {
        stillMoving = true;
        activeSpinMeshes.forEach((item) => {
          item.mesh.rotation.y += item.rate * dt;
        });
        activeMoonPivots.forEach((mp) => {
          mp.pivot.rotation.y += mp.speed * 0.35 * dt;
        });
        if (p.mode === 'solar-system') {
          simDays += p.timeSpeedDaysPerSec * dt;
          solarPlanets.forEach((sp) => {
            const ang = computeOrbitalAngleRad(
              sp.obj.metrics.orbitalPeriodDays,
              sp.obj.visual.orbitInitialPhaseDeg || 0,
              simDays
            );
            sp.holder.position.set(
              Math.cos(ang) * sp.orbitDist,
              0,
              Math.sin(ang) * sp.orbitDist
            );
          });
        }
      }

      if (activeNightMaterials.length > 0) {
        const sunDir = _scratchSunDir.copy(sunKeyLight.position).normalize();
        activeNightMaterials.forEach((mat) => {
          const shaderMat = mat as THREE.ShaderMaterial;
          if (shaderMat.uniforms?.uSunDirection) {
            shaderMat.uniforms.uSunDirection.value.copy(sunDir);
          }
        });
      }

      controls.update();
      return stillMoving;
    }

    function requestRender() {
      if (unmounted) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (unmounted) return;
        renderDirty = false;
        const nowMs = performance.now();
        const dt = Math.min(0.1, Math.max(0, (nowMs - lastTimeMs) / 1000));
        lastTimeMs = nowMs;
        const keepGoing = advanceSimulation(dt);
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (unmounted) return;
          if (renderDirty || keepGoing) {
            requestRender();
          }
        };

        if (isSoftwareGl) {
          afterDraw(done);
        } else {
          done();
        }
      });
    }

    controls.addEventListener('change', () => {
      requestRender();
    });

    const resizeObserver = new ResizeObserver(() => {
      if (!container || unmounted) return;
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    });
    resizeObserver.observe(container);

    engineRef.current = {
      rebuildSubject,
      applyCameraPreset,
      stepOrbitCamera,
      requestRender,
    };

    if (typeof window !== 'undefined') {
      (window as any).__planetarium = {
        camera,
        controls,
        renderer,
        requestRender,
        stepOrbitCamera,
        applyCameraPreset,
        setCameraPosition: (x: number, y: number, z: number) => {
          transitionActive = false;
          camera.position.set(x, y, z);
          controls.target.set(0, 0, 0);
          controls.update();
          requestRender();
        },
        setGlobeState: (opts: { camPos?: [number, number, number]; rotationY?: number }) => {
          transitionActive = false;
          if (opts.camPos) {
            camera.position.set(opts.camPos[0], opts.camPos[1], opts.camPos[2]);
            controls.target.set(0, 0, 0);
            controls.update();
          }
          if (opts.rotationY !== undefined) {
            activeSpinMeshes.forEach((item) => {
              item.mesh.rotation.y = opts.rotationY!;
            });
          }
          requestRender();
        },
        setForceProcedural: (val: boolean) => {
          forceProceduralFallback = val;
          rebuildSubject();
        },
        setSurfaceVariant: (variant: 'standard' | 'radar') => {
          propsRef.current.surfaceVariant = variant;
          rebuildSubject();
        },
      };
    }

    rebuildSubject();
    applyCameraPreset(propsRef.current.cameraPreset, true);

    return () => {
      unmounted = true;
      engineRef.current = null;
      if (typeof window !== 'undefined' && (window as any).__planetarium) {
        delete (window as any).__planetarium;
      }
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      controls.dispose();
      clearStage();
      cachedPlanetTextures.forEach((tex) => releaseLoadedTextures(tex));
      cachedPlanetTextures.clear();
      starGeo.dispose();
      starMat.dispose();
      envRT.dispose();
      renderer.dispose();
    };
  }, []);

  // Rebuild subject when objectSlug, mode, surfaceVariant, science labels, scaleMode, or qualityTier change
  useEffect(() => {
    engineRef.current?.rebuildSubject();
    engineRef.current?.applyCameraPreset(cameraPreset, mode === 'hero');
  }, [mode, objectSlug, surfaceVariant, showScienceLabels, scaleMode, qualityTier]);

  // Apply camera preset when preset or nonce changes
  useEffect(() => {
    engineRef.current?.applyCameraPreset(cameraPreset, false);
  }, [cameraPreset, presetNonce]);

  // Trigger render loop resume/pause when motion state changes
  useEffect(() => {
    engineRef.current?.requestRender();
  }, [isPaused, reducedMotion, timeSpeedDaysPerSec]);

  // Step camera from accessible button controls
  useEffect(() => {
    if (!orbitStepCommand || orbitStepCommand.nonce === 0) return;
    engineRef.current?.stepOrbitCamera(
      orbitStepCommand.yawDeg,
      orbitStepCommand.pitchDeg,
      orbitStepCommand.zoomScale
    );
  }, [orbitStepCommand]);

  const fallbackObj = getObjectBySlug(objectSlug) || CELESTIAL_CATALOG[0];

  if (!webglAvailable) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center bg-[#030713] p-6 text-center select-none"
        role="img"
        aria-label={ariaLabel || `${fallbackObj.name} static scientific diagram fallback`}
      >
        <svg viewBox="0 0 260 200" className="w-60 h-44 mb-3">
          <defs>
            <radialGradient id="fbSphere" cx="35%" cy="30%" r="68%">
              <stop offset="0%" stopColor={fallbackObj.visual.primaryColor} />
              <stop offset="65%" stopColor={fallbackObj.visual.secondaryColor} />
              <stop offset="100%" stopColor="#050814" />
            </radialGradient>
          </defs>
          {fallbackObj.visual.hasRings && (
            <ellipse
              cx="130"
              cy="100"
              rx="105"
              ry="28"
              fill="none"
              stroke={fallbackObj.visual.ringColor || '#E7D3AD'}
              strokeWidth="14"
              strokeOpacity="0.65"
              transform="rotate(-16 130 100)"
            />
          )}
          <circle cx="130" cy="100" r="52" fill="url(#fbSphere)" />
        </svg>
        <p className="text-xs text-[#B8C4DE] max-w-sm">
          Lightweight non-WebGL diagram active for <strong>{fallbackObj.name}</strong>. All verified encyclopedia facts and measurements remain available.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={canvasMountRef}
      data-testid="planetarium-webgl-stage"
      data-active-slug={objectSlug}
      data-scene-mode={mode}
      role="img"
      aria-label={ariaLabel || `Interactive 3D view of ${fallbackObj.name}`}
      className="w-full h-full cursor-grab active:cursor-grabbing"
    />
  );
};
