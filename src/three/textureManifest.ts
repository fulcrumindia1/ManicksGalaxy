/**
 * textureManifest.ts — Authoritative manifest for all planet texture assets.
 *
 * Each entry documents the source, license, resolution, authenticity tier,
 * and file paths for texture maps used by the planetarium renderer.
 *
 * DO NOT label procedural or AI-generated imagery as observed/composite.
 */

import type { TextureStyle, AuthenticityTier } from '../data/catalog';

export interface TextureAssetEntry {
  /** Internal unique ID */
  assetId: string;
  /** Human-readable title for the asset */
  title: string;
  /** Source organization or creator */
  creator: string;
  /** License string */
  license: string;
  /** One-line credit for display in UI */
  creditLine: string;
  /** Source URL where the asset or its parent data was obtained */
  sourceUrl: string;
  /** Resolution description */
  resolution: string;
  /** Date/epoch of the source data */
  sourceDate: string;
  /** Whether it is observed, composite, data-derived, or illustrative */
  authenticity: AuthenticityTier;
  /** Any processing notes */
  processingNotes: string;
}

export interface PlanetTextureSet {
  /** The texture style this set corresponds to */
  textureStyle: TextureStyle;
  /** Day-side albedo (color) map — relative to /public */
  dayMap2k: string;
  /** Optional higher-res day map for desktop */
  dayMap4k?: string;
  /** Night-side city-lights / emission map */
  nightMap2k?: string;
  /** Cloud transparency map (greyscale or RGBA) */
  cloudMap2k?: string;
  /** Surface normal map (tangent-space) */
  normalMap2k?: string;
  /** Specular / roughness map */
  specularMap2k?: string;
  /** Ring color map (for ringed planets) */
  ringMap?: string;
  /** Ring alpha (transparency) map */
  ringAlphaMap?: string;
  /** Source provenance entries */
  sources: TextureAssetEntry[];
}

/**
 * Master manifest of all real texture assets.
 * Keyed by TextureStyle for O(1) lookup.
 */
export const TEXTURE_MANIFEST: Partial<Record<TextureStyle, PlanetTextureSet>> = {
  earth: {
    textureStyle: 'earth',
    dayMap2k: '/assets/planets/earth/earth_day_2k.jpg',
    dayMap4k: '/assets/planets/earth/earth_day_4k.jpg',
    nightMap2k: '/assets/planets/earth/earth_night_2k.jpg',
    cloudMap2k: '/assets/planets/earth/earth_clouds_2k.jpg',
    normalMap2k: '/assets/planets/earth/earth_normal_2k.jpg',
    specularMap2k: '/assets/planets/earth/earth_specular_2k.jpg',
    sources: [
      {
        assetId: 'SSS-EARTH-DAY-2K',
        title: 'Earth Day Map 2K — Blue Marble Composite',
        creator: 'Solar System Scope / NASA Visible Earth',
        license: 'CC BY 4.0 (Solar System Scope)',
        creditLine:
          'Earth day map: NASA Visible Earth Blue Marble imagery, processed by Solar System Scope. CC BY 4.0.',
        sourceUrl: 'https://www.solarsystemscope.com/textures/',
        resolution: '2048 × 1024',
        sourceDate: 'Blue Marble Next Generation 2004 composite',
        authenticity: 'OBSERVED',
        processingNotes:
          'Equirectangular projection derived from NASA Blue Marble Next Generation satellite composites (Terra/MODIS). Processed by Solar System Scope for interactive use.',
      },
      {
        assetId: 'SSS-EARTH-DAY-4K',
        title: 'Earth Day Map 4K/8K — Blue Marble Composite',
        creator: 'Solar System Scope / NASA Visible Earth',
        license: 'CC BY 4.0 (Solar System Scope)',
        creditLine:
          'Earth day map (high-res): NASA Visible Earth Blue Marble imagery, processed by Solar System Scope. CC BY 4.0.',
        sourceUrl: 'https://www.solarsystemscope.com/textures/',
        resolution: '8192 × 4096 (served as 4K for interactive use)',
        sourceDate: 'Blue Marble Next Generation 2004 composite',
        authenticity: 'OBSERVED',
        processingNotes:
          'Higher resolution version of the same NASA composite. Used for desktop quality tier.',
      },
      {
        assetId: 'SSS-EARTH-NIGHT-2K',
        title: 'Earth Night Lights Map 2K',
        creator: 'Solar System Scope / NASA Earth Observatory',
        license: 'CC BY 4.0 (Solar System Scope)',
        creditLine:
          'Earth city lights: NASA Earth Observatory / NOAA VIIRS Black Marble composite. CC BY 4.0.',
        sourceUrl: 'https://www.solarsystemscope.com/textures/',
        resolution: '2048 × 1024',
        sourceDate: 'Black Marble 2012/2016 composite',
        authenticity: 'OBSERVED',
        processingNotes:
          'Composite of nighttime satellite observations showing artificial illumination. Static representation — does not reflect real-time conditions.',
      },
      {
        assetId: 'SSS-EARTH-CLOUDS-2K',
        title: 'Earth Cloud Map 2K',
        creator: 'Solar System Scope / NASA',
        license: 'CC BY 4.0 (Solar System Scope)',
        creditLine:
          'Earth cloud layer: Representative composite cloud pattern. Static — not live satellite weather. CC BY 4.0.',
        sourceUrl: 'https://www.solarsystemscope.com/textures/',
        resolution: '2048 × 1024',
        sourceDate: 'Representative composite (not real-time)',
        authenticity: 'OBSERVED',
        processingNotes:
          'Static representative cloud pattern derived from satellite observations. Clearly labeled as non-live weather data.',
      },
      {
        assetId: 'SSS-EARTH-NORMAL-2K',
        title: 'Earth Normal Map 2K',
        creator: 'Solar System Scope',
        license: 'CC BY 4.0 (Solar System Scope)',
        creditLine:
          'Earth normal/bump map: Solar System Scope. CC BY 4.0.',
        sourceUrl: 'https://www.solarsystemscope.com/textures/',
        resolution: '2048 × 1024',
        sourceDate: 'Derived from topographic data',
        authenticity: 'DATA-BASED',
        processingNotes:
          'Normal map derived from global elevation data. Subtle effect at planetary scale — topography is exaggerated for visual feedback on interactive globe.',
      },
      {
        assetId: 'SSS-EARTH-SPECULAR-2K',
        title: 'Earth Specular Map 2K',
        creator: 'Solar System Scope',
        license: 'CC BY 4.0 (Solar System Scope)',
        creditLine:
          'Earth specular map: Solar System Scope. CC BY 4.0.',
        sourceUrl: 'https://www.solarsystemscope.com/textures/',
        resolution: '2048 × 1024',
        sourceDate: 'Derived from land/water mask',
        authenticity: 'DATA-BASED',
        processingNotes:
          'Water/land mask used to differentiate ocean specular reflections from matte land surfaces.',
      },
    ],
  },
};

/**
 * Returns the texture set for a given style, or undefined if no real textures exist.
 */
export function getTextureSet(style: TextureStyle): PlanetTextureSet | undefined {
  return TEXTURE_MANIFEST[style];
}

