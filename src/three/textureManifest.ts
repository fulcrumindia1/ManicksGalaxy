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
  /** Alternate scientific observation map (e.g. Venus Magellan radar surface) */
  radarMap2k?: string;
  /** Enhanced scientific / false-color multispectral composite */
  enhancedMap2k?: string;
  /** Observation coverage / quality confidence map */
  coverageMap2k?: string;
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
  mercury: {
    textureStyle: 'mercury',
    dayMap2k: '/assets/planets/mercury/mercury_2k.jpg',
    sources: [
      {
        assetId: 'NASA-MERC-MESSENGER-2K',
        title: 'Mercury Dual Imaging System (MDIS) Global Albedo Mosaic',
        creator: 'NASA / Johns Hopkins APL / Carnegie Institution / Solar System Scope',
        license: 'NASA Open Data / CC BY 4.0',
        creditLine:
          'Mercury surface map: NASA/JHUAPL/CIW MESSENGER MDIS global mosaic, processed by Solar System Scope. CC BY 4.0.',
        sourceUrl: 'https://www.solarsystemscope.com/textures/',
        resolution: '2048 × 1024',
        sourceDate: 'MESSENGER Orbital Science (2011–2015)',
        authenticity: 'OBSERVED',
        processingNotes:
          'Equirectangular projection derived from MESSENGER MDIS calibrated reflectance images. Features Caloris Planitia, Beethoven Basin, and lobate scarps.',
      },
    ],
  },
  venus: {
    textureStyle: 'venus',
    dayMap2k: '/assets/planets/venus/venus_atmosphere_2k.jpg',
    radarMap2k: '/assets/planets/venus/venus_surface_2k.jpg',
    sources: [
      {
        assetId: 'NASA-VENUS-ATMO-2K',
        title: 'Venus Natural Optical / Ultraviolet Cloud Deck',
        creator: 'NASA / JPL-Caltech / Solar System Scope',
        license: 'NASA Open Data / CC BY 4.0',
        creditLine:
          'Venus visible atmosphere: NASA/JPL Pioneer Venus & Akatsuki cloud deck composite. CC BY 4.0.',
        sourceUrl: 'https://www.solarsystemscope.com/textures/',
        resolution: '2048 × 1024',
        sourceDate: 'Pioneer Venus & JAXA Akatsuki composite',
        authenticity: 'OBSERVED',
        processingNotes:
          'True-color / calibrated UV-visible representation of Venus opaque sulfuric acid cloud deck (~65 km altitude) concealing the solid planetary crust.',
      },
      {
        assetId: 'NASA-MAGELLAN-RADAR-2K',
        title: 'Venus Magellan Synthetic Aperture Radar (SAR) Topography Map',
        creator: 'NASA / JPL-Caltech / USGS Astrogeology Science Center',
        license: 'NASA Open Data / Public Domain',
        creditLine:
          'Venus radar surface: NASA Magellan Synthetic Aperture Radar (SAR) mosaic with interpretive hypsometric coloration. NASA/JPL-Caltech.',
        sourceUrl: 'https://astrogeology.usgs.gov/search/map/Venus/Magellan/Venus_Magellan_Topography_Global_4641m',
        resolution: '2048 × 1024',
        sourceDate: 'Magellan Radar Mapper (1990–1994)',
        authenticity: 'DATA-BASED',
        processingNotes:
          'Radar-derived hypsometric surface map penetrating opaque clouds. Note: Color coding represents radar reflectivity and radar altimetry elevation, not optical photography.',
      },
    ],
  },
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
  moon: {
    textureStyle: 'moon',
    dayMap2k: '/assets/planets/moon/moon_2k.jpg',
    sources: [
      {
        assetId: 'NASA-LRO-LROC-WAC-2K',
        title: 'Lunar Reconnaissance Orbiter Camera (LROC) Global Morphology Map',
        creator: 'NASA / GSFC / Arizona State University / Solar System Scope',
        license: 'NASA Open Data / CC BY 4.0',
        creditLine:
          'Moon surface map: NASA/GSFC/ASU LRO Camera global mosaic. CC BY 4.0 (Solar System Scope).',
        sourceUrl: 'https://www.solarsystemscope.com/textures/',
        resolution: '2048 × 1024',
        sourceDate: 'LROC Science Operations (2009–present)',
        authenticity: 'OBSERVED',
        processingNotes:
          'Equirectangular mosaic from Lunar Reconnaissance Orbiter Wide Angle Camera. Accurately portrays nearside basalt maria (Oceanus Procellarum, Mare Imbrium) and farside cratered anorthositic highlands.',
      },
    ],
  },
  mars: {
    textureStyle: 'mars',
    dayMap2k: '/assets/planets/mars/mars_2k.jpg',
    sources: [
      {
        assetId: 'NASA-MGS-MOLA-VIKING-2K',
        title: 'Mars Global Surveyor & Viking Color Albedo Mosaic',
        creator: 'NASA / JPL / USGS Astrogeology Science Center / Solar System Scope',
        license: 'NASA Open Data / CC BY 4.0',
        creditLine:
          'Mars surface map: NASA/JPL/USGS MOLA and Viking Orbiter color mosaic. CC BY 4.0 (Solar System Scope).',
        sourceUrl: 'https://www.solarsystemscope.com/textures/',
        resolution: '2048 × 1024',
        sourceDate: 'MGS MOLA / Viking MDIM 2.1',
        authenticity: 'OBSERVED',
        processingNotes:
          'Equirectangular map compiled from Mars Global Surveyor MOLA elevation and Viking Orbiter color images. Displays real geographic features: Valles Marineris, Olympus Mons, Tharsis Montes, Syrtis Major, and polar carbon-dioxide/water ice caps.',
      },
    ],
  },
  jupiter: {
    textureStyle: 'jupiter',
    dayMap2k: '/assets/planets/jupiter/jupiter_2k.jpg',
    sources: [
      {
        assetId: 'NASA-JUP-CASSINI-2K',
        title: 'Jupiter Global Cylindrical Cloud Map',
        creator: 'NASA / JPL-Caltech / Space Science Institute / Solar System Scope',
        license: 'NASA Open Data / CC BY 4.0',
        creditLine:
          'Jupiter cloud map: NASA/JPL/SSI Cassini & Juno cylindrical map. CC BY 4.0 (Solar System Scope).',
        sourceUrl: 'https://www.solarsystemscope.com/textures/',
        resolution: '2048 × 1024',
        sourceDate: 'Cassini Jupiter flyby & Juno orbital science',
        authenticity: 'OBSERVED',
        processingNotes:
          'Cylindrical projection from Cassini Imaging Science Subsystem composite data. Captures alternating dark belts, pale zones, Great Red Spot anticyclone, and circumpolar vortices.',
      },
    ],
  },
  saturn: {
    textureStyle: 'saturn',
    dayMap2k: '/assets/planets/saturn/saturn_2k.jpg',
    ringMap: '/assets/planets/saturn/saturn_ring_alpha.png',
    ringAlphaMap: '/assets/planets/saturn/saturn_ring_alpha.png',
    sources: [
      {
        assetId: 'NASA-SAT-CASSINI-2K',
        title: 'Saturn Global Cloud Atmosphere Map & Ring System',
        creator: 'NASA / JPL-Caltech / Space Science Institute / Solar System Scope',
        license: 'NASA Open Data / CC BY 4.0',
        creditLine:
          'Saturn globe & ring system: NASA/JPL/SSI Cassini ISS imagery. CC BY 4.0 (Solar System Scope).',
        sourceUrl: 'https://www.solarsystemscope.com/textures/',
        resolution: '2048 × 1024 (Globe) / 1024 × 64 (Rings)',
        sourceDate: 'Cassini Orbital Tour (2004–2017)',
        authenticity: 'OBSERVED',
        processingNotes:
          'Equirectangular atmosphere map from Cassini ISS wide-angle camera data. Ring texture incorporates radial optical depth profiles for the C ring, B ring, Cassini Division, and A ring.',
      },
    ],
  },
  uranus: {
    textureStyle: 'uranus',
    dayMap2k: '/assets/planets/uranus/uranus_2k.jpg',
    sources: [
      {
        assetId: 'NASA-URA-VOYAGER2-2K',
        title: 'Uranus Global Cloud Deck Map',
        creator: 'NASA / JPL-Caltech / Solar System Scope',
        license: 'NASA Open Data / CC BY 4.0',
        creditLine:
          'Uranus atmosphere map: NASA/JPL Voyager 2 narrow-angle camera composite. CC BY 4.0 (Solar System Scope).',
        sourceUrl: 'https://www.solarsystemscope.com/textures/',
        resolution: '2048 × 1024',
        sourceDate: 'Voyager 2 Flyby (1986) / Color calibrated',
        authenticity: 'OBSERVED',
        processingNotes:
          'Cylindrical map derived from calibrated Voyager 2 imaging data reflecting methane absorption bands in the upper troposphere.',
      },
    ],
  },
  neptune: {
    textureStyle: 'neptune',
    dayMap2k: '/assets/planets/neptune/neptune_2k.jpg',
    sources: [
      {
        assetId: 'NASA-NEP-VOYAGER2-2K',
        title: 'Neptune Global Atmosphere & Storm Map',
        creator: 'NASA / JPL-Caltech / Solar System Scope',
        license: 'NASA Open Data / CC BY 4.0',
        creditLine:
          'Neptune atmosphere map: NASA/JPL Voyager 2 imaging science data. CC BY 4.0 (Solar System Scope).',
        sourceUrl: 'https://www.solarsystemscope.com/textures/',
        resolution: '2048 × 1024',
        sourceDate: 'Voyager 2 Encounter (1989)',
        authenticity: 'OBSERVED',
        processingNotes:
          'Equirectangular map compiled from Voyager 2 clear, green, and orange filter mosaics, showing the azure atmospheric deck and high-altitude methane ice streaks.',
      },
    ],
  },
  sun: {
    textureStyle: 'sun',
    dayMap2k: '/assets/planets/sun/sun_2k.jpg',
    sources: [
      {
        assetId: 'NASA-SDO-SUN-2K',
        title: 'Solar Dynamics Observatory (SDO) Photosphere Map',
        creator: 'NASA / GSFC / Solar System Scope',
        license: 'NASA Open Data / CC BY 4.0',
        creditLine:
          'Sun photosphere map: NASA SDO multi-spectral imagery, processed by Solar System Scope. CC BY 4.0.',
        sourceUrl: 'https://www.solarsystemscope.com/textures/',
        resolution: '2048 × 1024',
        sourceDate: 'Solar Dynamics Observatory Mission Data',
        authenticity: 'DATA-BASED',
        processingNotes:
          'Equirectangular projection derived from NASA Solar Dynamics Observatory AIA and HMI instruments, mapping solar granules and magnetic active regions across the photosphere.',
      },
    ],
  },
  europa: {
    textureStyle: 'europa',
    dayMap2k: '/assets/planets/europa/europa_2k.jpg',
    sources: [
      {
        assetId: 'NASA-GALILEO-EUROPA-2K',
        title: 'Galileo SSI & JunoCam Europa Global Cylindrical Map',
        creator: 'NASA / JPL-Caltech / USGS / Steve Albers',
        license: 'NASA Open Data / Public Domain',
        creditLine:
          'Europa global map: NASA/JPL/USGS Galileo SSI & JunoCam data, cylindrical projection by Steve Albers.',
        sourceUrl: 'https://stevealbers.net/albers/sos/sos.html',
        resolution: '2048 × 1024',
        sourceDate: 'Galileo SSI (1995–2003) & JunoCam (2022)',
        authenticity: 'OBSERVED',
        processingNotes:
          'Equirectangular mosaic blending Galileo Solid-State Imaging (SSI) camera multi-spectral strips with JunoCam flyby imagery, resolving icy chaos terrain, ridged plains, and reddish linea fractures.',
      },
    ],
  },
  titan: {
    textureStyle: 'titan',
    dayMap2k: '/assets/planets/titan/titan_2k.jpg',
    sources: [
      {
        assetId: 'NASA-CASSINI-TITAN-2K',
        title: 'Cassini ISS & VIMS Titan Global Surface Mosaic',
        creator: 'NASA / JPL-Caltech / SSI / Steve Albers',
        license: 'NASA Open Data / Public Domain',
        creditLine:
          'Titan surface map: NASA/JPL/SSI Cassini ISS narrow-angle camera near-infrared mosaic, processed by Steve Albers.',
        sourceUrl: 'https://stevealbers.net/albers/sos/sos.html',
        resolution: '2048 × 1024',
        sourceDate: 'Cassini Orbital Tour (2004–2017)',
        authenticity: 'OBSERVED',
        processingNotes:
          'Equirectangular map compiled from Cassini Imaging Science Subsystem (ISS) narrow-angle camera data using the 938-nm near-infrared filter to penetrate Titan dense photochemical haze, mapping dark hydrocarbon dunes (Shangri-La) and bright icy highlands (Xanadu).',
      },
    ],
  },
  pluto: {
    textureStyle: 'pluto',
    dayMap2k: '/assets/planets/pluto/pluto_2k.jpg',
    sources: [
      {
        assetId: 'NASA-NH-PLUTO-2K',
        title: 'New Horizons LORRI & MVIC Pluto Global Color Mosaic',
        creator: 'NASA / JHUAPL / SwRI / Steve Albers',
        license: 'NASA Open Data / Public Domain',
        creditLine:
          'Pluto global map: NASA/JHUAPL/SwRI New Horizons LORRI panchromatic and MVIC color mosaic, cylindrical map by Steve Albers.',
        sourceUrl: 'https://stevealbers.net/albers/sos/sos.html',
        resolution: '2048 × 1024',
        sourceDate: 'New Horizons Encounter (July 2015)',
        authenticity: 'OBSERVED',
        processingNotes:
          'Equirectangular mosaic from New Horizons Long Range Reconnaissance Imager (LORRI) and Multispectral Visible Imaging Camera (MVIC). Shows Tombaugh Regio, the bright nitrogen-ice glacier Sputnik Planitia, and darker tholin-coated equatorial regions (Cthulhu Macula). Non-encounter hemisphere derived from lower-resolution approach imagery.',
      },
    ],
  },
  io: {
    textureStyle: 'io',
    dayMap2k: '/assets/planets/io/io_natural_2k.jpg',
    dayMap4k: '/assets/planets/io/io_natural_4k.jpg',
    enhancedMap2k: '/assets/planets/io/io_enhanced_2k.jpg',
    coverageMap2k: '/assets/planets/io/io_coverage_2k.png',
    sources: [
      {
        assetId: 'USGS-NASA-IO-GALILEO-VOYAGER-1KM',
        title: 'Io Galileo SSI & Voyager 1 Global Color Merge Mosaic (1 km/pixel)',
        creator: 'USGS Astrogeology Science Center / NASA / JPL',
        license: 'Public Domain / NASA Open Data',
        creditLine:
          'NASA/JPL/USGS Astrogeology: Global color mosaic of Io derived from Galileo Solid-State Imaging (SSI) and Voyager 1/2 clear, green, and violet filter data. Processed and reprojected to equirectangular with polar stereographic integration.',
        sourceUrl: 'https://astrogeology.usgs.gov/search/map/io_galileo_ssi_global_color_merge_mosaic_1km',
        resolution: '4096 × 2048 (master: 11445 × 3643 + polar stereographic caps)',
        sourceDate: 'Galileo SSI (1996–2001) & Voyager 1 (1979)',
        authenticity: 'OBSERVED',
        processingNotes:
          'Equirectangular projection merging USGS equatorial simple cylindrical mosaic with USGS North and South Polar stereographic projections. Natural color approximation based on clear, green, and violet filter composites. Accurately maps verified volcanic calderas Loki Patera, Pele, and Prometheus.',
      },
    ],
  },
  ganymede: {
    textureStyle: 'ganymede',
    dayMap2k: '/assets/planets/ganymede/ganymede_2k.jpg',
    dayMap4k: '/assets/planets/ganymede/ganymede_4k.jpg',
    sources: [
      {
        assetId: 'USGS-NASA-GANYMEDE-GALILEO-VOYAGER',
        title: 'Ganymede Galileo SSI & Voyager 1/2 Global Controlled Mosaic',
        creator: 'USGS Astrogeology / NASA / JPL / Askaniy Anpilogov',
        license: 'NASA Open Data / CC BY-SA 3.0',
        creditLine:
          'Ganymede global mosaic: USGS Astrogeology controlled global mosaic combining NASA Galileo SSI and Voyager 1/2 imaging data.',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ganymede_map_by_Askaniy.png',
        resolution: '4096 × 2048',
        sourceDate: 'Galileo SSI (1996–2000) & Voyager (1979)',
        authenticity: 'OBSERVED',
        processingNotes:
          'Equirectangular global cylindrical mosaic resolving dark ancient cratered terrain (Galileo Regio) and brighter, younger grooved terrain (sulci) created by extensional tectonism.',
      },
    ],
  },
  callisto: {
    textureStyle: 'callisto',
    dayMap2k: '/assets/planets/callisto/callisto_2k.jpg',
    dayMap4k: '/assets/planets/callisto/callisto_4k.jpg',
    sources: [
      {
        assetId: 'USGS-NASA-CALLISTO-GALILEO-VOYAGER',
        title: 'Callisto Galileo SSI & Voyager Global Controlled Mosaic',
        creator: 'USGS Astrogeology / NASA / JPL / John van Vliet / Askaniy Anpilogov',
        license: 'NASA Open Data / CC BY-SA 3.0',
        creditLine:
          'Callisto global mosaic: USGS Astrogeology and NASA Galileo/Voyager mission data, synthesis by John van Vliet & Askaniy Anpilogov.',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Callisto_map_by_Askaniy.png',
        resolution: '4096 × 2048',
        sourceDate: 'Galileo SSI (1996–2001) & Voyager 1/2 (1979)',
        authenticity: 'OBSERVED',
        processingNotes:
          'Equirectangular cylindrical projection showing Callisto ancient heavily cratered ice-rock surface, multi-ring impact structures Valhalla and Asgard, and bright frost deposits.',
      },
    ],
  },
  enceladus: {
    textureStyle: 'enceladus',
    dayMap2k: '/assets/planets/enceladus/enceladus_2k.jpg',
    dayMap4k: '/assets/planets/enceladus/enceladus_4k.jpg',
    sources: [
      {
        assetId: 'NASA-CASSINI-ENCELADUS-PIA18435',
        title: 'Cassini ISS Enceladus Global Color Mosaic',
        creator: 'NASA / JPL-Caltech / Space Science Institute',
        license: 'NASA Open Data / Public Domain',
        creditLine:
          'NASA/JPL-Caltech/SSI: Cassini Imaging Science Subsystem (ISS) global color mosaic of Saturn icy moon Enceladus (PIA18435).',
        sourceUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA18435',
        resolution: '4096 × 2048',
        sourceDate: 'Cassini Equinox and Solstice Missions (November 2014)',
        authenticity: 'OBSERVED',
        processingNotes:
          'Equirectangular cylindrical projection using clear, green, infrared, and ultraviolet filter composites. Accurately maps the south-polar terrain fractures (tiger stripes: Damascus, Baghdad, Alexandria, and Cairo Sulci) that vent cryovolcanic water-ice plumes.',
      },
    ],
  },
  triton: {
    textureStyle: 'triton',
    dayMap2k: '/assets/planets/triton/triton_2k.jpg',
    dayMap4k: '/assets/planets/triton/triton_4k.jpg',
    sources: [
      {
        assetId: 'NASA-VOYAGER2-TRITON-GLOBAL',
        title: 'Voyager 2 Triton Global Cylindrical Map',
        creator: 'NASA / JPL / USGS Astrogeology Science Center',
        license: 'NASA Open Data / Public Domain',
        creditLine:
          'NASA/JPL/USGS Astrogeology: Global color-controlled mosaic of Neptune moon Triton from Voyager 2 narrow-angle camera flyby.',
        sourceUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA00317',
        resolution: '4096 × 2048',
        sourceDate: 'Voyager 2 Flyby (August 1989)',
        authenticity: 'OBSERVED',
        processingNotes:
          'Simple cylindrical equirectangular projection showing Triton cantaloupe terrain, bright pinkish south polar nitrogen frost cap, and dark wind streaks from cryovolcanic nitrogen geysers.',
      },
    ],
  },
  charon: {
    textureStyle: 'charon',
    dayMap2k: '/assets/planets/charon/charon_2k.jpg',
    dayMap4k: '/assets/planets/charon/charon_4k.jpg',
    sources: [
      {
        assetId: 'NASA-NH-CHARON-LORRI-MVIC',
        title: 'New Horizons LORRI & MVIC Charon Global Color Mosaic',
        creator: 'NASA / Johns Hopkins APL / Southwest Research Institute',
        license: 'NASA Open Data / Public Domain',
        creditLine:
          'NASA/JHUAPL/SwRI: New Horizons Long Range Reconnaissance Imager (LORRI) and Multispectral Visible Imaging Camera (MVIC) global mosaic of Charon.',
        sourceUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA22687',
        resolution: '4096 × 2048',
        sourceDate: 'New Horizons Flyby (July 2015)',
        authenticity: 'OBSERVED',
        processingNotes:
          'Equirectangular projection resolving Charon reddish north polar hood (Mordor Macula) coated in organic tholins, massive tectonic chasmata (Serenity Chasma), and southern plains (Vulcan Planitia).',
      },
    ],
  },
  ceres: {
    textureStyle: 'ceres',
    dayMap2k: '/assets/planets/ceres/ceres_2k.jpg',
    sources: [
      {
        assetId: 'NASA-DAWN-CERES-PIA19606',
        title: 'Dawn FC Ceres Global Unannotated Mosaic',
        creator: 'NASA / JPL-Caltech / UCLA / MPS / DLR / IDA',
        license: 'NASA Open Data / Public Domain',
        creditLine:
          'NASA/JPL-Caltech/UCLA/MPS/DLR/IDA: Global mosaic of dwarf planet Ceres from Dawn Framing Camera Survey orbit.',
        sourceUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA19606',
        resolution: '2048 × 1024',
        sourceDate: 'Dawn Mission Survey Orbit (August 2015)',
        authenticity: 'OBSERVED',
        processingNotes:
          'Equirectangular cylindrical projection resolving impact craters and the bright sodium carbonate deposits inside Occator Crater (Cerealia Facula and Vinalia Faculae) and conical cryovolcano Ahuna Mons.',
      },
    ],
  },
  vesta: {
    textureStyle: 'vesta',
    dayMap2k: '/assets/planets/vesta/vesta_2k.jpg',
    sources: [
      {
        assetId: 'NASA-DAWN-VESTA-PIA14703',
        title: 'Dawn FC 4 Vesta Global Photomap',
        creator: 'NASA / JPL-Caltech / UCLA / MPS / DLR / IDA',
        license: 'NASA Open Data / Public Domain',
        creditLine:
          'NASA/JPL-Caltech/UCLA/MPS/DLR/IDA: First global photomap of asteroid 4 Vesta from Dawn Framing Camera imagery.',
        sourceUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA14703',
        resolution: '2048 × 1024',
        sourceDate: 'Dawn Mission High Altitude Mapping Orbit (September 2011)',
        authenticity: 'OBSERVED',
        processingNotes:
          'Simple cylindrical projection showing the massive Rheasilvia south-polar impact basin, central mountain peak, and the parallel equatorial troughs (Divalia Fossae).',
      },
    ],
  },
  phobos: {
    textureStyle: 'phobos',
    dayMap2k: '/assets/planets/phobos/phobos_2k.jpg',
    sources: [
      {
        assetId: 'DLR-NASA-PHOBOS-VIKING-MEX',
        title: 'Phobos Controlled Global Viking & Mars Express Mosaic',
        creator: 'DLR (German Aerospace Center) / NASA Viking / ESA Mars Express',
        license: 'NASA / ESA / DLR Open Science Data',
        creditLine:
          'DLR / NASA / ESA: Global controlled mosaic of Martian moon Phobos derived from Viking Orbiter and Mars Express High Resolution Stereo Camera (HRSC) data.',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Phobos_Viking_Mosaic_DLRcontrol_7200.jpg',
        resolution: '2048 × 1024',
        sourceDate: 'Viking Orbiter & Mars Express (1976–2010)',
        authenticity: 'OBSERVED',
        processingNotes:
          'Simple cylindrical projection centered on Phobos sub-Mars point, accurately mapping the 9-km Stickney impact crater, its ejecta blanket, and parallel surface grooves.',
      },
    ],
  },
  deimos: {
    textureStyle: 'deimos',
    dayMap2k: '/assets/planets/deimos/deimos_2k.jpg',
    sources: [
      {
        assetId: 'NASA-VIKING-MRO-DEIMOS-COLOR',
        title: 'Deimos Global Cylindrical Color Map',
        creator: 'NASA / JPL / University of Arizona (HiRISE) / Phil Stooke',
        license: 'NASA Open Data / Public Domain',
        creditLine:
          'NASA/JPL/Univ of Arizona/Phil Stooke: Global cylindrical map of Martian moon Deimos compiled from Viking Orbiter and MRO HiRISE color imagery.',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Deimos_color_map.jpg',
        resolution: '2048 × 1024',
        sourceDate: 'Viking Orbiter & MRO HiRISE (1977–2009)',
        authenticity: 'OBSERVED',
        processingNotes:
          'Cylindrical projection showing Deimos smooth regolith-mantled surface, prominent craters Swift and Voltaire, and bright albedo streaks along ridges.',
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

