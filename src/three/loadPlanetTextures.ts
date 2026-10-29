/**
 * loadPlanetTextures.ts — Asynchronous texture loading with quality tiers,
 * caching, and graceful fallback to procedural textures.
 *
 * Loads real NASA/Solar System Scope equirectangular maps via THREE.TextureLoader.
 * Falls back to procedural generation if loading fails.
 */

import * as THREE from 'three';
import type { TextureStyle } from '../data/catalog';
import type { QualityTier } from '../lib/voyageStore';
import { getTextureSet, type PlanetTextureSet } from './textureManifest';

export interface LoadedPlanetTextures {
  /** Day-side albedo map */
  albedoMap: THREE.Texture;
  /** Surface normal map (tangent-space) */
  normalMap?: THREE.Texture;
  /** Night-side emission (city lights) map */
  nightMap?: THREE.Texture;
  /** Cloud layer map */
  cloudMap?: THREE.Texture;
  /** Specular / roughness map */
  specularMap?: THREE.Texture;
  /** Bump map (from procedural or loaded) */
  bumpMap?: THREE.Texture;
  /** Ring color map */
  ringMap?: THREE.Texture;
  /** Ring alpha map */
  ringAlphaMap?: THREE.Texture;
  /** Whether textures are from real imagery or procedural fallback */
  isRealImagery: boolean;
  /** All disposable textures for cleanup */
  disposables: THREE.Texture[];
}

// Shared texture cache: prevents duplicate loads across scenes
const textureCache = new Map<string, THREE.Texture>();

// Track reference counts so we never dispose a texture still used elsewhere
const textureCacheRefCounts = new Map<string, number>();

const loader = new THREE.TextureLoader();

function loadTextureCached(
  url: string,
  colorSpace: THREE.ColorSpace,
  maxAnisotropy: number,
  wrapS: THREE.Wrapping = THREE.RepeatWrapping,
): Promise<THREE.Texture> {
  const cacheKey = `${url}:${colorSpace}`;
  const existing = textureCache.get(cacheKey);
  if (existing) {
    textureCacheRefCounts.set(cacheKey, (textureCacheRefCounts.get(cacheKey) || 0) + 1);
    return Promise.resolve(existing);
  }

  return new Promise<THREE.Texture>((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = colorSpace;
        texture.anisotropy = maxAnisotropy;
        texture.wrapS = wrapS;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        textureCache.set(cacheKey, texture);
        textureCacheRefCounts.set(cacheKey, 1);
        resolve(texture);
      },
      undefined,
      (err) => {
        console.warn(`[ManicksGalaxy] Failed to load texture: ${url}`, err);
        reject(err);
      }
    );
  });
}

/**
 * Release textures that this particular load instance owns.
 * Only actually disposes the GL resources if refcount drops to zero.
 */
export function releaseLoadedTextures(textures: LoadedPlanetTextures): void {
  for (const tex of textures.disposables) {
    // Find the cache key for this texture
    for (const [key, cached] of textureCache.entries()) {
      if (cached === tex) {
        const count = (textureCacheRefCounts.get(key) || 1) - 1;
        if (count <= 0) {
          textureCache.delete(key);
          textureCacheRefCounts.delete(key);
          tex.dispose();
        } else {
          textureCacheRefCounts.set(key, count);
        }
        break;
      }
    }
  }
}

/**
 * Determines effective quality: use lowQuality if mobile or 'low' tier.
 */
function shouldUseLowQuality(qualityTier: QualityTier): boolean {
  if (qualityTier === 'low') return true;
  if (qualityTier === 'high') return false;
  // 'auto': detect mobile / low-memory devices
  if (typeof navigator !== 'undefined') {
    const isMobile = /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
    if (isMobile) return true;
    // Check device memory (Chrome/Edge)
    const nav = navigator as Navigator & { deviceMemory?: number };
    if (nav.deviceMemory && nav.deviceMemory < 4) return true;
  }
  return false;
}

/**
 * Loads real planet textures from the manifest, falling back gracefully.
 * Returns a LoadedPlanetTextures with isRealImagery=true on success.
 */
export async function loadRealPlanetTextures(
  style: TextureStyle,
  maxAnisotropy: number,
  qualityTier: QualityTier = 'auto',
): Promise<LoadedPlanetTextures | null> {
  const set = getTextureSet(style);
  if (!set) return null;

  const lowQ = shouldUseLowQuality(qualityTier);
  const disposables: THREE.Texture[] = [];

  try {
    // Choose resolution tier for day map
    const dayMapUrl = (!lowQ && set.dayMap4k) ? set.dayMap4k : set.dayMap2k;

    // Load all available textures in parallel
    const promises: Record<string, Promise<THREE.Texture | null>> = {
      albedo: loadTextureCached(dayMapUrl, THREE.SRGBColorSpace, maxAnisotropy),
    };

    if (set.normalMap2k) {
      promises.normal = loadTextureCached(set.normalMap2k, THREE.NoColorSpace, maxAnisotropy);
    }
    if (set.nightMap2k) {
      promises.night = loadTextureCached(set.nightMap2k, THREE.SRGBColorSpace, maxAnisotropy);
    }
    if (set.cloudMap2k) {
      promises.cloud = loadTextureCached(set.cloudMap2k, THREE.SRGBColorSpace, maxAnisotropy);
    }
    if (set.specularMap2k) {
      promises.specular = loadTextureCached(set.specularMap2k, THREE.NoColorSpace, maxAnisotropy);
    }

    const keys = Object.keys(promises);
    const results = await Promise.allSettled(Object.values(promises));

    const textures: Record<string, THREE.Texture | null> = {};
    for (let i = 0; i < keys.length; i++) {
      const result = results[i];
      if (result.status === 'fulfilled' && result.value) {
        textures[keys[i]] = result.value;
        disposables.push(result.value);
      } else {
        textures[keys[i]] = null;
      }
    }

    // Albedo is mandatory
    if (!textures.albedo) {
      return null;
    }

    return {
      albedoMap: textures.albedo,
      normalMap: textures.normal || undefined,
      nightMap: textures.night || undefined,
      cloudMap: textures.cloud || undefined,
      specularMap: textures.specular || undefined,
      isRealImagery: true,
      disposables,
    };
  } catch (err) {
    console.warn(`[ManicksGalaxy] Failed to load real textures for ${style}, will use procedural fallback.`, err);
    return null;
  }
}

