import * as THREE from 'three';
import { CelestialObject } from '../data/catalog';
import { getProceduralPlanetMaps } from './proceduralTextures';
import { LoadedPlanetTextures } from './loadPlanetTextures';

export interface BuiltCelestialGroup {
  root: THREE.Group;
  axialTiltGroup: THREE.Group;
  spinMesh: THREE.Mesh;
  cloudMesh?: THREE.Mesh;
  nightMesh?: THREE.Mesh;
  moonpivots: Array<{ pivot: THREE.Group; speed: number }>;
  disposables: Array<{ dispose: () => void }>;
}

export function createCustomRingGeometry(
  innerRadius: number,
  outerRadius: number,
  segments: number
): THREE.RingGeometry {
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

/**
 * Builds a composite Three.js celestial hierarchy with accurate PBR materials,
 * axial obliquity tilt, oblate gas-giant spheroids, optional rings, clouds,
 * and night-side emission shader for Earth.
 */
export function buildCompositeCelestialGroup(
  obj: CelestialObject,
  maxAnisotropy: number,
  lowQuality: boolean,
  showScienceLabels: boolean,
  includeMoons: boolean,
  sunLightRef?: THREE.DirectionalLight,
  realTextures?: LoadedPlanetTextures | null,
): BuiltCelestialGroup {
  const disposables: Array<{ dispose: () => void }> = [];
  const root = new THREE.Group();

  const hasRealTextures = Boolean(realTextures?.isRealImagery && realTextures.albedoMap);

  // Only use procedural maps as fallback when no real textures available
  const maps = hasRealTextures
    ? null
    : getProceduralPlanetMaps(obj.visual.textureStyle, maxAnisotropy, lowQuality);

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
    let starEmissive = '#f97316';
    if (obj.visual.textureStyle === 'star-red-dwarf') starEmissive = '#dc2626';
    else if (obj.visual.textureStyle === 'star-red-supergiant') starEmissive = '#ea580c';
    else if (obj.visual.textureStyle === 'star-white') starEmissive = '#93c5fd';

    bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: starMap,
      emissive: new THREE.Color(starEmissive),
      emissiveMap: starMap,
      emissiveIntensity: hasRealTextures ? 1.15 : 1.35,
      roughness: 0.4,
      metalness: 0.0,
    });
  } else if (hasRealTextures) {
    // Real NASA/Spacecraft imagery path for Earth, Mercury, Venus, Moon, Mars, Jupiter, Saturn, Uranus, Neptune, Europa, Titan, Pluto, Io
    const isRockyAirless = ['mercury', 'moon', 'mars', 'ceres', 'vesta', 'phobos', 'deimos'].includes(obj.slug);
    const isIo = obj.slug === 'io';
    const isVenus = obj.slug === 'venus';
    const isGasGiant = ['jupiter', 'saturn', 'uranus', 'neptune'].includes(obj.slug);
    const isEuropa = obj.slug === 'europa';
    const isEnceladus = obj.slug === 'enceladus';
    const isTriton = obj.slug === 'triton';
    const isGanymede = obj.slug === 'ganymede';
    const isCallisto = obj.slug === 'callisto';
    const isPlutoCharon = ['pluto', 'charon'].includes(obj.slug);
    const isTitan = obj.slug === 'titan';

    const baseRoughness = isRockyAirless
      ? 0.92
      : isIo
        ? 0.90
        : isEnceladus
          ? 0.28
          : isEuropa
            ? 0.32
            : isTriton
              ? 0.48
              : isVenus
                ? 0.52
                : isPlutoCharon
                  ? 0.68
                  : isGanymede
                    ? 0.72
                    : isCallisto
                      ? 0.82
                      : isGasGiant
                        ? 0.68
                        : isTitan
                          ? 0.72
                          : 0.62;
    const baseMetalness = isRockyAirless ? 0.0 : isIo ? 0.0 : isGasGiant ? 0.0 : 0.02;

    bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: realTextures!.albedoMap,
      normalMap: realTextures!.normalMap || undefined,
      normalScale: new THREE.Vector2(0.08, 0.08), // Subtle — surface terrain at planetary scale
      roughness: baseRoughness,
      metalness: baseMetalness,
    });

    // If specular map is available, use it as roughness modulation
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
      alphaMap: hasRealTextures ? cloudTexture : undefined,
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

  // Part 5: Science Mode Coordinate Reference Gimbal
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

    // Geological landmark markers for Io (USGS / IAU nomenclature coordinates)
    if (obj.slug === 'io') {
      const ioLandmarks = [
        { name: 'Loki Patera', lat: 13.0, lonW: 308.8, desc: 'Largest volcanic depression (~200 km across) with episodic lava lake overturn' },
        { name: 'Pele', lat: -18.7, lonW: 255.3, desc: 'Active sulfur eruption center with 400 km high plume and orange-red fallout ring' },
        { name: 'Prometheus', lat: -1.5, lonW: 153.9, desc: 'Persistent 100 km volcanic plume and active silicate lava flows' },
        { name: 'Babbar Patera', lat: -39.8, lonW: 272.0, desc: 'Steep-walled volcanic caldera depression in southern hemisphere' },
      ];
      ioLandmarks.forEach((lm) => {
        const lonE = (360 - lm.lonW) % 360;
        const phi = THREE.MathUtils.degToRad(90 - lm.lat);
        const theta = THREE.MathUtils.degToRad(lonE + 180);
        const r = 1.018;
        const x = -r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.cos(phi);
        const z = r * Math.sin(phi) * Math.sin(theta);

        const pinGeo = new THREE.SphereGeometry(0.022, 12, 12);
        const pinMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xdc2626,
          emissiveIntensity: 0.85,
          roughness: 0.3,
        });
        disposables.push(pinGeo, pinMat);
        const pin = new THREE.Mesh(pinGeo, pinMat);
        pin.position.set(x, y, z);
        pin.userData.slug = 'io';
        pin.userData.landmarkName = lm.name;
        pin.userData.landmarkDesc = lm.desc;
        spinMesh.add(pin);
      });
    }
  }

  // Part 6: Orbiting 3D Moons & Orbital Tracks
  const moonpivots: Array<{ pivot: THREE.Group; speed: number }> = [];
  if (includeMoons && obj.visual.moons && obj.visual.moons.length > 0) {
    obj.visual.moons.forEach((moon, idx) => {
      const orbitPlane = new THREE.Group();
      orbitPlane.rotation.x = THREE.MathUtils.degToRad(moon.inclinationDeg);
      axialTiltGroup.add(orbitPlane);

      // Orbital track line
      const pts: THREE.Vector3[] = [];
      const segments = 64;
      for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        pts.push(
          new THREE.Vector3(
            Math.cos(theta) * moon.orbitRadius,
            0,
            Math.sin(theta) * moon.orbitRadius
          )
        );
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
      pivot.rotation.y = idx * 2.1 + 0.8;
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

  return { root, axialTiltGroup, spinMesh, cloudMesh, nightMesh, moonpivots, disposables };
}

