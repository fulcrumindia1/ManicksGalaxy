import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CelestialObject } from '../data/catalog';
import { QualityTier } from '../lib/voyageStore';
import { computeComparisonRadii } from '../lib/astronomy';
import {
  loadRealPlanetTextures,
  releaseLoadedTextures,
  type LoadedPlanetTextures,
} from './loadPlanetTextures';
import { buildCompositeCelestialGroup, BuiltCelestialGroup } from './celestialFactory';

export type CompareCameraPreset = 'front' | 'above' | 'tilted';

export interface CompareSceneCanvasProps {
  bodyA: CelestialObject;
  bodyB: CelestialObject;
  scaleMode: 'true-scale' | 'presentation';
  isPaused?: boolean;
  syncSpin?: boolean;
  cameraPreset?: CompareCameraPreset;
  presetNonce?: number;
  orbitStepCommand?: { yawDeg: number; pitchDeg: number; zoomScale: number; nonce: number };
  qualityTier?: QualityTier;
  showScienceLabels?: boolean;
  onInspectObject?: (slug: string) => void;
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

// Pre-allocated scratch math vectors
const _scratchTargetPos = new THREE.Vector3();
const _scratchLookAt = new THREE.Vector3();
const _scratchSphere = new THREE.Spherical();
const _scratchOffset = new THREE.Vector3();

export const CompareSceneCanvas: React.FC<CompareSceneCanvasProps> = ({
  bodyA,
  bodyB,
  scaleMode,
  isPaused = false,
  syncSpin = true,
  cameraPreset = 'front',
  presetNonce = 0,
  orbitStepCommand,
  qualityTier = 'auto',
  showScienceLabels = false,
  onInspectObject,
  ariaLabel,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [webglAvailable, setWebglAvailable] = useState<boolean>(true);

  const propsRef = useRef({
    bodyA,
    bodyB,
    scaleMode,
    isPaused,
    syncSpin,
    cameraPreset,
    presetNonce,
    qualityTier,
    showScienceLabels,
    onInspectObject,
  });
  propsRef.current = {
    bodyA,
    bodyB,
    scaleMode,
    isPaused,
    syncSpin,
    cameraPreset,
    presetNonce,
    qualityTier,
    showScienceLabels,
    onInspectObject,
  };

  const engineRef = useRef<{
    rebuildComparison: () => void;
    applyCameraPreset: (preset: CompareCameraPreset, instant: boolean) => void;
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
    renderer.toneMappingExposure = 1.15;
    const dpr =
      isSoftwareGl || propsRef.current.qualityTier === 'low'
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
    scene.fog = new THREE.FogExp2(0x030713, 0.0035);

    // Studio Environment Map for metallic/dielectric reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.22;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(40, initW / initH, 0.1, 400);
    camera.position.set(0, 0.2, 5.4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.6;
    controls.maxDistance = 35;
    controls.minPolarAngle = 0.08;
    controls.maxPolarAngle = Math.PI - 0.08;

    // Aligned 3-Point Celestial Lighting Rig (unified across both worlds)
    const sunKeyLight = new THREE.DirectionalLight(0xfff5e4, 2.85);
    sunKeyLight.position.set(6, 3.5, 6.5);
    scene.add(sunKeyLight);

    const hemiFill = new THREE.HemisphereLight(0x79d9ed, 0x091124, 0.45);
    scene.add(hemiFill);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.55);
    rimLight.position.set(-6, 2.0, -5.5);
    scene.add(rimLight);

    // Background starfield points
    const starCount = isSoftwareGl ? 500 : 1000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    let seed = 3891;
    const sRand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const palette = [
      new THREE.Color('#e0f2fe'),
      new THREE.Color('#f8fafc'),
      new THREE.Color('#fef3c7'),
      new THREE.Color('#c7d2fe'),
    ];
    for (let i = 0; i < starCount; i++) {
      const r = 90 + sRand() * 110;
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
      size: isSoftwareGl ? 0.52 : 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Stage groups for the dual worlds
    const stageRoot = new THREE.Group();
    scene.add(stageRoot);

    let activeDisposables: Array<{ dispose: () => void }> = [];
    let spinMeshes: Array<{ mesh: THREE.Mesh; rate: number }> = [];
    let nightMaterials: THREE.Material[] = [];
    const textureCache = new Map<string, LoadedPlanetTextures>();
    let buildGen = 0;
    let transitionActive = false;
    const desiredCamPos = new THREE.Vector3(0, 0.2, 5.4);
    const desiredTarget = new THREE.Vector3(0, 0, 0);

    controls.addEventListener('start', () => {
      transitionActive = false;
    });

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    const clearStage = () => {
      while (stageRoot.children.length > 0) {
        stageRoot.remove(stageRoot.children[0]);
      }
      activeDisposables.forEach((d) => d.dispose());
      activeDisposables = [];
      spinMeshes = [];
      nightMaterials = [];
    };

    const applyCameraPreset = (preset: CompareCameraPreset, instant: boolean) => {
      desiredTarget.set(0, 0, 0);
      switch (preset) {
        case 'above':
          desiredCamPos.set(0, 5.8, 0.3);
          break;
        case 'tilted':
          desiredCamPos.set(1.5, 1.8, 5.0);
          break;
        case 'front':
        default:
          desiredCamPos.set(0, 0.15, 5.2);
          break;
      }

      if (instant) {
        camera.position.copy(desiredCamPos);
        controls.target.copy(desiredTarget);
        controls.update();
        transitionActive = false;
      } else {
        transitionActive = true;
      }
      requestRender();
    };

    const rebuildComparison = () => {
      const currentGen = ++buildGen;
      clearStage();
      const p = propsRef.current;
      const lowQ = isSoftwareGl || p.qualityTier === 'low';

      // 1. Calculate physical diameter ratios
      const { radiusFractionA, radiusFractionB } = computeComparisonRadii(
        p.bodyA.metrics.diameterKm,
        p.bodyB.metrics.diameterKm,
        p.scaleMode
      );

      // 2. Base scale allocation
      const baseVisualRadius = 1.25;
      const scaleA =
        p.scaleMode === 'true-scale'
          ? baseVisualRadius * radiusFractionA
          : baseVisualRadius * Math.pow(radiusFractionA, 0.42);
      const scaleB =
        p.scaleMode === 'true-scale'
          ? baseVisualRadius * radiusFractionB
          : baseVisualRadius * Math.pow(radiusFractionB, 0.42);

      // 3. Spacing: keep bodies clearly separated while allowing room for Saturn's rings
      const hasRingsA = Boolean(p.bodyA.visual.hasRings);
      const hasRingsB = Boolean(p.bodyB.visual.hasRings);
      const ringExtentA = hasRingsA ? (p.bodyA.visual.ringOuterRadius || 2.38) * scaleA : scaleA;
      const ringExtentB = hasRingsB ? (p.bodyB.visual.ringOuterRadius || 2.38) * scaleB : scaleB;
      const separation = Math.max(2.6, (ringExtentA + ringExtentB) * 1.18 + 0.65);

      // Helper to build and mount a body group
      const mountBody = (
        obj: CelestialObject,
        scale: number,
        posX: number,
        slotName: 'A' | 'B',
        cachedTex?: LoadedPlanetTextures | null
      ) => {
        const holder = new THREE.Group();
        holder.position.set(posX, 0, 0);

        const built: BuiltCelestialGroup = buildCompositeCelestialGroup(
          obj,
          maxAnisotropy,
          lowQ,
          p.showScienceLabels,
          false, // Moons omitted in side-by-side scale comparison to focus on primary worlds
          sunKeyLight,
          cachedTex
        );

        built.root.scale.setScalar(Math.max(0.0001, scale));
        holder.add(built.root);
        stageRoot.add(holder);

        activeDisposables.push(...built.disposables);

        // Spin rate: synchronized or relative
        const baseRate = 0.28;
        const rate = p.syncSpin
          ? baseRate
          : baseRate * (slotName === 'A' ? 1.0 : 0.85);

        spinMeshes.push({ mesh: built.spinMesh, rate });
        if (built.nightMesh) {
          spinMeshes.push({ mesh: built.nightMesh, rate });
          nightMaterials.push(built.nightMesh.material as THREE.Material);
        }
        if (built.cloudMesh) {
          spinMeshes.push({ mesh: built.cloudMesh, rate: rate * 1.15 });
        }

        // Subpixel locator beacon for extremely small bodies at true scale (e.g. Pluto vs Sun)
        const isSubpixelTiny = p.scaleMode === 'true-scale' && scale < 0.045;
        if (isSubpixelTiny) {
          const locatorGeo = new THREE.RingGeometry(0.12, 0.14, 32);
          const locatorMat = new THREE.MeshBasicMaterial({
            color: 0x79d9ed,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide,
          });
          activeDisposables.push(locatorGeo, locatorMat);
          const locatorMesh = new THREE.Mesh(locatorGeo, locatorMat);
          locatorMesh.position.set(0, 0, 0);
          holder.add(locatorMesh);
        }
      };

      const cachedA = textureCache.get(p.bodyA.visual.textureStyle);
      const cachedB = textureCache.get(p.bodyB.visual.textureStyle);

      mountBody(p.bodyA, scaleA, -separation / 2, 'A', cachedA);
      mountBody(p.bodyB, scaleB, separation / 2, 'B', cachedB);

      // Asynchronously fetch textures if not yet cached
      if (!cachedA) {
        loadRealPlanetTextures(p.bodyA.visual.textureStyle, maxAnisotropy, p.qualityTier).then(
          (loaded) => {
            if (unmounted || buildGen !== currentGen) return;
            if (loaded) {
              textureCache.set(p.bodyA.visual.textureStyle, loaded);
              rebuildComparison();
            }
          }
        );
      }
      if (!cachedB) {
        loadRealPlanetTextures(p.bodyB.visual.textureStyle, maxAnisotropy, p.qualityTier).then(
          (loaded) => {
            if (unmounted || buildGen !== currentGen) return;
            if (loaded) {
              textureCache.set(p.bodyB.visual.textureStyle, loaded);
              rebuildComparison();
            }
          }
        );
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

    let frameId = 0;
    let unmounted = false;
    let lastTimeMs = performance.now();

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

      if (!p.isPaused) {
        stillMoving = true;
        spinMeshes.forEach((item) => {
          item.mesh.rotation.y += item.rate * dt;
        });
      }

      controls.update();
      return stillMoving;
    }

    // Continuous 60fps animation loop
    function renderLoop(nowMs: number) {
      if (unmounted) return;
      frameId = requestAnimationFrame(renderLoop);
      const dt = Math.min(0.1, Math.max(0, (nowMs - lastTimeMs) / 1000));
      lastTimeMs = nowMs;
      advanceSimulation(dt);
      renderer.render(scene, camera);
    }

    function requestRender() {
      if (unmounted) return;
      advanceSimulation(0);
      renderer.render(scene, camera);
    }

    // Start continuous animation loop immediately
    frameId = requestAnimationFrame(renderLoop);

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
      rebuildComparison,
      applyCameraPreset,
      stepOrbitCamera,
      requestRender,
    };

    // Global imperative handle for automation / CDP scripts
    if (typeof window !== 'undefined') {
      (window as any).__compareScene = {
        camera,
        controls,
        renderer,
        requestRender,
        stepOrbitCamera,
        applyCameraPreset,
        setGlobeState: (opts: { camPos?: [number, number, number]; rotationY?: number }) => {
          transitionActive = false;
          if (opts.camPos) {
            camera.position.set(opts.camPos[0], opts.camPos[1], opts.camPos[2]);
            controls.target.set(0, 0, 0);
            controls.update();
          }
          if (opts.rotationY !== undefined) {
            spinMeshes.forEach((item) => {
              item.mesh.rotation.y = opts.rotationY!;
            });
          }
          requestRender();
        },
      };
    }

    rebuildComparison();
    applyCameraPreset(propsRef.current.cameraPreset, true);

    return () => {
      unmounted = true;
      engineRef.current = null;
      if (typeof window !== 'undefined' && (window as any).__compareScene) {
        delete (window as any).__compareScene;
      }
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      controls.dispose();
      clearStage();
      textureCache.forEach((tex) => releaseLoadedTextures(tex));
      textureCache.clear();
      starGeo.dispose();
      starMat.dispose();
      envRT.dispose();
      renderer.dispose();
    };
  }, []);

  // Prop update reactions
  useEffect(() => {
    engineRef.current?.rebuildComparison();
  }, [bodyA.slug, bodyB.slug, scaleMode, showScienceLabels, qualityTier]);

  useEffect(() => {
    engineRef.current?.applyCameraPreset(cameraPreset, false);
  }, [cameraPreset, presetNonce]);

  useEffect(() => {
    engineRef.current?.requestRender();
  }, [isPaused, syncSpin]);

  useEffect(() => {
    if (!orbitStepCommand || orbitStepCommand.nonce === 0) return;
    engineRef.current?.stepOrbitCamera(
      orbitStepCommand.yawDeg,
      orbitStepCommand.pitchDeg,
      orbitStepCommand.zoomScale
    );
  }, [orbitStepCommand]);

  if (!webglAvailable) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center bg-[#030713] p-6 text-center select-none"
        role="img"
        aria-label={ariaLabel || `Fallback diagram comparing ${bodyA.name} and ${bodyB.name}`}
      >
        <p className="text-xs text-[#B8C4DE]">
          Interactive 3D WebGL comparison unavailable on this display device. Quantitative measurement table remains active below.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={canvasMountRef}
      data-testid="compare-3d-stage"
      data-body-a={bodyA.slug}
      data-body-b={bodyB.slug}
      data-scale-mode={scaleMode}
      role="img"
      aria-label={ariaLabel || `Interactive 3D comparison of ${bodyA.name} and ${bodyB.name}`}
      className="w-full h-full cursor-grab active:cursor-grabbing"
    />
  );
};

