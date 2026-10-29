export type AuthenticityTier = 'OBSERVED' | 'DATA-BASED' | 'RECONSTRUCTED' | 'ARTISTIC';

export type CelestialCategory =
  | 'star'
  | 'planet'
  | 'moon-dwarf'
  | 'galaxy-nebula'
  | 'exoplanet';

export type TextureStyle =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'titan'
  | 'europa'
  | 'pluto'
  | 'exoplanet-ocean'
  | 'exoplanet-lava'
  | 'exoplanet-temperate'
  | 'nebula-emission'
  | 'galaxy-spiral';

export interface MoonSubObject {
  name: string;
  slug?: string;
  radiusRatio: number; // Visual ratio relative to parent
  orbitRadius: number; // Scene units relative to parent radius=1
  inclinationDeg: number;
  speed: number;
  color: string;
  fact: string;
}

export interface SourceProvenance {
  assetId: string;
  title: string;
  organization: string;
  creditLine: string;
  license: string;
  dataEpoch: string;
  authenticityTier: AuthenticityTier;
  referenceUrl: string;
}

export interface CelestialObject {
  slug: string;
  name: string;
  aliases?: string[];
  category: CelestialCategory;
  classification: string;
  scaleBand: 'Planetary System' | 'Stellar Neighborhood' | 'Galactic & Deep Sky';
  authenticityTier: AuthenticityTier;
  authenticityNote: string;
  isOrbitable3D: boolean; // True for 3D planetary/stellar bodies; false for deep-sky telescope plates where 3D orbit would be fake science
  hook: string;
  signatureFact: string;
  readingLevels: {
    young: string;
    curious: string;
    enthusiast: string;
  };
  metrics: {
    diameterKm: number;
    diameterLabel: string;
    massEarth?: number;
    massLabel: string;
    dayLengthLabel: string;
    orbitalPeriodDays: number;
    orbitalPeriodLabel: string;
    gravityMs2?: number;
    gravityLabel: string;
    distanceAu?: number;
    distanceLabel: string;
    meanTempLabel: string;
    axialTiltDeg: number;
    moonsCount?: number;
  };
  tabs: {
    overview: string;
    structure: string;
    ringsOrMoons: string;
    missions: string;
  };
  teacherNotes: {
    keyConcept: string;
    misconceptionWarning: string;
    discussionPrompt: string;
  };
  visual: {
    textureStyle: TextureStyle;
    primaryColor: string;
    secondaryColor: string;
    atmosphereColor?: string;
    oblateness?: number; // e.g. 0.9 for Saturn
    hasRings?: boolean;
    ringInnerRadius?: number;
    ringOuterRadius?: number;
    ringColor?: string;
    orbitSceneDistance?: number; // Educational spacing radius in Solar System explorer
    orbitInitialPhaseDeg?: number;
    moons?: MoonSubObject[];
  };
  sources: SourceProvenance[];
}

export const CELESTIAL_CATALOG: CelestialObject[] = [
  {
    slug: 'sun',
    name: 'The Sun',
    aliases: ['Sol', 'G2V Main-Sequence Star'],
    category: 'star',
    classification: 'G-Type Main-Sequence Star · Solar System',
    scaleBand: 'Planetary System',
    authenticityTier: 'DATA-BASED',
    authenticityNote: '3D photosphere and corona model driven by solar physics parameters and SDO extreme-ultraviolet structure patterns.',
    isOrbitable3D: true,
    hook: 'The blazing gravitational anchor containing 99.86% of all mass in our Solar System.',
    signatureFact: 'Every second, the Sun’s core fuses roughly 600 million metric tons of hydrogen into helium.',
    readingLevels: {
      young: 'The Sun is a giant ball of glowing hot gas—a real star right in our cosmic backyard! It gives Earth light, warmth, and seasons, and holds all eight planets in orbit with its huge gravity.',
      curious: 'Our Sun is a 4.6-billion-year-old yellow dwarf star (spectral type G2V). Deep inside its core, temperatures reach 15 million °C, driving nuclear fusion that radiates energy across the Solar System.',
      enthusiast: 'A Population I G2V main-sequence star in hydrostatic equilibrium, balancing inward gravitational pressure against outward radiation pressure from proton-proton chain fusion in its radiative core.',
    },
    metrics: {
      diameterKm: 1392700,
      diameterLabel: '1,392,700 km (109 × Earth)',
      massEarth: 333000,
      massLabel: '1.989 × 10³⁰ kg (333,000 × Earth)',
      dayLengthLabel: '25.05 days (equator) · 34.4 days (poles)',
      orbitalPeriodDays: 0,
      orbitalPeriodLabel: '~230 million years (Galactic orbit)',
      gravityMs2: 274.0,
      gravityLabel: '274.0 m/s² (27.9 × Earth)',
      distanceAu: 0,
      distanceLabel: '1.00 AU from Earth (8.3 light-min)',
      meanTempLabel: '5,500 °C (photosphere) · 15M °C (core)',
      axialTiltDeg: 7.25,
      moonsCount: 0,
    },
    tabs: {
      overview: 'Without the Sun’s steady output of electromagnetic radiation, liquid water could not exist on Earth’s surface. Photons forged in its core take tens of thousands of years to random-walk through the radiative zone before crossing space to Earth in 8 minutes and 20 seconds.',
      structure: 'Composed of ~73% hydrogen and ~25% helium by mass. Its interior comprises a fusion core, radiative zone, and convective zone, topped by the visible photosphere, chromosphere, and million-degree magnetic corona.',
      ringsOrMoons: 'Rather than moons, the Sun governs 8 major planets, at least 5 recognized dwarf planets, hundreds of thousands of asteroids, and trillions of icy Oort Cloud comets.',
      missions: 'Studied continuously by NASA’s Solar Dynamics Observatory (SDO), ESA/NASA SOHO, Solar Orbiter, and the Parker Solar Probe—which dives directly through the outer solar corona.',
    },
    teacherNotes: {
      keyConcept: 'The Sun is an ordinary star; it looks far larger and brighter than night-sky stars solely because it is ~270,000 times closer than Alpha Centauri.',
      misconceptionWarning: 'The Sun is not "on fire" through chemical combustion—there is no burning with oxygen. Its energy comes from nuclear fusion of hydrogen nuclei.',
      discussionPrompt: 'If sunlight takes 8 minutes and 20 seconds to reach Earth, what does "looking at the Sun safely through a solar filter" tell us about light and time?',
    },
    visual: {
      textureStyle: 'sun',
      primaryColor: '#FDBA4D',
      secondaryColor: '#EA580C',
      atmosphereColor: '#FB923C',
      axialTiltDeg: 7.25,
      orbitSceneDistance: 0,
    } as CelestialObject['visual'] & { axialTiltDeg?: number },
    sources: [
      {
        assetId: 'MG-SOL-001',
        title: 'Solar Fact Sheet & SDO Observational Parameters',
        organization: 'NASA Goddard Space Flight Center / NSSDCA',
        creditLine: 'Physical ephemeris: NASA/GSFC Planetary Data System; Procedural photosphere shader: ManicksGalaxy.',
        license: 'Public Domain (17 U.S.C. § 105) / Original Code',
        dataEpoch: 'J2000 / 2025 Review',
        authenticityTier: 'DATA-BASED',
        referenceUrl: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html',
      },
    ],
  },
  {
    slug: 'mercury',
    name: 'Mercury',
    aliases: ['Hermes', 'Innermost Planet'],
    category: 'planet',
    classification: 'Terrestrial Planet · Solar System',
    scaleBand: 'Planetary System',
    authenticityTier: 'DATA-BASED',
    authenticityNote: 'Cratered regolith geometry and orbital parameters derived from NASA MESSENGER global altimetry and ephemerides.',
    isOrbitable3D: true,
    hook: 'A sun-scorched iron-cored world racing around the Sun every 88 Earth days.',
    signatureFact: 'Despite being closest to the Sun, Mercury is not the hottest planet—Venus is hotter because Mercury lacks a heat-trapping atmosphere.',
    readingLevels: {
      young: 'Mercury is the smallest planet in our Solar System and the closest to the Sun. Because it has almost no air to hold heat in, its sunny side is super hot while its night side freezes!',
      curious: 'Only slightly larger than Earth’s Moon, Mercury possesses an enormous metallic core that makes up ~85% of its radius. Its surface is scarred by ancient impact basins like Caloris Planitia and tall cooling cliffs called lobate scarps.',
      enthusiast: 'Locked in a 3:2 spin-orbit resonance (rotating three times every two revolutions), Mercury exhibits an unexpectedly active dipolar magnetic field (~1% of Earth’s) and water-ice deposits in permanently shadowed polar craters.',
    },
    metrics: {
      diameterKm: 4879,
      diameterLabel: '4,879 km (0.38 × Earth)',
      massEarth: 0.055,
      massLabel: '3.30 × 10²³ kg (0.055 × Earth)',
      dayLengthLabel: '58.6 Earth days (rotation) · 176 days (solar day)',
      orbitalPeriodDays: 87.97,
      orbitalPeriodLabel: '88.0 Earth days',
      gravityMs2: 3.7,
      gravityLabel: '3.70 m/s² (0.38 g)',
      distanceAu: 0.39,
      distanceLabel: '0.39 AU (3.2 light-min from Sun)',
      meanTempLabel: '167 °C mean (-180 °C to +430 °C)',
      axialTiltDeg: 0.03,
      moonsCount: 0,
    },
    tabs: {
      overview: 'Mercury orbits deep inside the Sun’s gravitational well at an average speed of 47.4 km/s. Without a substantial atmosphere, micrometeoroids and solar wind directly weather its silicate crust, creating a tenuous exosphere.',
      structure: 'Mercury’s density (5.43 g/cm³) is second only to Earth’s, indicating an oversized liquid-and-solid iron-nickel core surrounded by a thin 400 km rocky mantle.',
      ringsOrMoons: 'Mercury has no moons and no rings; the Sun’s intense tidal forces make stable lunar orbits narrow and short-lived so close to our star.',
      missions: 'Mariner 10 imaged ~45% of Mercury in 1974–1975. NASA’s MESSENGER orbited from 2011 to 2015, mapping 100% of the globe, and the ESA/JAXA BepiColombo twin-spacecraft mission continues investigation.',
    },
    teacherNotes: {
      keyConcept: 'Proximity to a star alone does not determine surface temperature; atmospheric greenhouse gases play a decisive role.',
      misconceptionWarning: 'Students often assume Mercury is the hottest planet or is tidally locked with one side permanently facing the Sun (disproved by radar in 1965).',
      discussionPrompt: 'How can frozen water ice survive at Mercury’s poles when daytime equator temperatures melt lead?',
    },
    visual: {
      textureStyle: 'mercury',
      primaryColor: '#A8A29E',
      secondaryColor: '#57534E',
      orbitSceneDistance: 6.5,
      orbitInitialPhaseDeg: 42,
    },
    sources: [
      {
        assetId: 'MG-MER-001',
        title: 'Mercury Planetary Fact Sheet & MESSENGER Ephemeris',
        organization: 'NASA / Johns Hopkins APL / Carnegie',
        creditLine: 'Data: NASA/JHUAPL/CIW MESSENGER Archive; Procedural surface albedo: ManicksGalaxy.',
        license: 'Public Domain (NASA PDS)',
        dataEpoch: 'J2000',
        authenticityTier: 'DATA-BASED',
        referenceUrl: 'https://science.nasa.gov/mercury/facts/',
      },
    ],
  },
  {
    slug: 'venus',
    name: 'Venus',
    aliases: ['Morning Star', 'Evening Star'],
    category: 'planet',
    classification: 'Terrestrial Planet · Solar System',
    scaleBand: 'Planetary System',
    authenticityTier: 'DATA-BASED',
    authenticityNote: 'Cloud-top sulfuric haze simulation paired with Magellan radar-derived planetary parameters.',
    isOrbitable3D: true,
    hook: 'Earth’s near-twin in size, wrapped in a crushing carbon-dioxide greenhouse atmosphere.',
    signatureFact: 'Venus rotates backward (retrograde) so slowly that one sidereal rotation takes longer than its entire year around the Sun.',
    readingLevels: {
      young: 'Venus shines like a bright jewel in our morning and evening sky because thick yellowish clouds bounce sunlight back into space. Underneath those clouds, Venus is the hottest planet of all!',
      curious: 'Roughly 95% of Earth’s diameter, Venus experienced a runaway greenhouse effect. Its 96.5% carbon dioxide atmosphere creates surface pressure 92 times Earth’s—equivalent to 900 meters underwater—and bakes its volcanic plains at 464 °C.',
      enthusiast: 'Super-rotating sulfuric acid (H₂SO₄) cloud decks circle Venus in 4 days while the solid lithosphere rotates retrograde every 243.025 days (axial tilt 177.4°), concealing basaltic coronae and shield volcanoes.',
    },
    metrics: {
      diameterKm: 12104,
      diameterLabel: '12,104 km (0.95 × Earth)',
      massEarth: 0.815,
      massLabel: '4.87 × 10²⁴ kg (0.815 × Earth)',
      dayLengthLabel: '243.0 Earth days (retrograde)',
      orbitalPeriodDays: 224.7,
      orbitalPeriodLabel: '224.7 Earth days',
      gravityMs2: 8.87,
      gravityLabel: '8.87 m/s² (0.90 g)',
      distanceAu: 0.72,
      distanceLabel: '0.72 AU (6.0 light-min from Sun)',
      meanTempLabel: '464 °C (hotter than Mercury)',
      axialTiltDeg: 177.36,
      moonsCount: 0,
    },
    tabs: {
      overview: 'In visible light, Venus appears as a serene cream-gold sphere because opaque clouds permanently hide its rocky crust. Radar mappers must pierce the clouds to reveal Maxwell Montes and vast lava plains.',
      structure: 'Like Earth, Venus has an iron core, silicate mantle, and rocky crust, but lacks global plate tectonics—releasing internal heat through widespread volcanism instead.',
      ringsOrMoons: 'Venus has zero natural moons and no ring system.',
      missions: 'Soviet Venera landers returned the only surface photographs before succumbing to heat; NASA’s Magellan mapped 98% of the surface by radar; JAXA’s Akatsuki studied atmospheric waves; VERITAS and DAVINCI are upcoming.',
    },
    teacherNotes: {
      keyConcept: 'Venus is our primary planetary laboratory for understanding runaway greenhouse climate physics.',
      misconceptionWarning: 'Optical telescope views of Venus show cloud tops ~65 km high, not solid ground.',
      discussionPrompt: 'Why would the Sun appear to rise in the west and set in the east if you stood on Venus?',
    },
    visual: {
      textureStyle: 'venus',
      primaryColor: '#E8CFA1',
      secondaryColor: '#B5895A',
      atmosphereColor: '#FDE68A',
      orbitSceneDistance: 9.5,
      orbitInitialPhaseDeg: 135,
    },
    sources: [
      {
        assetId: 'MG-VEN-001',
        title: 'Venus Fact Sheet & Magellan Radar Reference',
        organization: 'NASA / JPL-Caltech',
        creditLine: 'Physical constants: NASA NSSDCA; Cloud deck procedural visualization: ManicksGalaxy.',
        license: 'Public Domain (NASA)',
        dataEpoch: 'J2000',
        authenticityTier: 'DATA-BASED',
        referenceUrl: 'https://science.nasa.gov/venus/facts/',
      },
    ],
  },
  {
    slug: 'earth',
    name: 'Earth',
    aliases: ['Terra', 'Blue Marble', 'Home'],
    category: 'planet',
    classification: 'Terrestrial Ocean World · Solar System',
    scaleBand: 'Planetary System',
    authenticityTier: 'OBSERVED',
    authenticityNote: '3D globe mapped with authentic NASA Blue Marble Next Generation satellite imagery, dynamic night-side city illumination (NASA/NOAA Black Marble), separate transparent cloud shell, and axial obliquity (23.44°).',
    isOrbitable3D: true,
    hook: 'Our ocean-covered home—the only confirmed harbor for life in the cosmos.',
    signatureFact: 'Earth’s 23.44° axial tilt—not its slightly elliptical distance from the Sun—drives our planet’s four seasons.',
    readingLevels: {
      young: 'Earth is our home! Liquid oceans cover 71% of its surface, and a thin blanket of breathable air protects living things from space radiation and meteors.',
      curious: 'Orbiting inside the Sun’s habitable zone, Earth balances plate tectonics, a global liquid-iron magnetic shield, nitrogen-oxygen air, and a stabilizing large Moon to sustain billions of years of biosphere evolution.',
      enthusiast: 'At 5.514 g/cm³, Earth is the densest major planet in the Solar System. Its geodynamo shields the atmosphere from solar-wind sputtering, while carbonate-silicate weathering regulates long-term climate.',
    },
    metrics: {
      diameterKm: 12742,
      diameterLabel: '12,742 km (1.00 × Earth)',
      massEarth: 1.0,
      massLabel: '5.972 × 10²⁴ kg (1.00 × Earth)',
      dayLengthLabel: '23h 56m 04s (sidereal) · 24.0h (solar)',
      orbitalPeriodDays: 365.256,
      orbitalPeriodLabel: '365.25 Earth days',
      gravityMs2: 9.81,
      gravityLabel: '9.81 m/s² (1.00 g)',
      distanceAu: 1.0,
      distanceLabel: '1.00 AU (149.6M km · 8.3 light-min)',
      meanTempLabel: '15 °C global surface mean',
      axialTiltDeg: 23.44,
      moonsCount: 1,
    },
    tabs: {
      overview: 'Seen from orbit, Earth’s defining signature is its razor-thin blue atmospheric limb and dynamic white water-vapor clouds swirling above liquid oceans and continents.',
      structure: 'Differentiated into a solid inner iron-nickel core, convective liquid outer core, silicate mantle, and tectonic oceanic/continental crust topped by the hydrosphere and troposphere-to-exosphere atmosphere.',
      ringsOrMoons: 'Accompanied by one unusually large natural satellite—the Moon (27% Earth’s diameter)—which stabilizes Earth’s axial tilt and drives ocean tides.',
      missions: 'Observed continuously by the International Space Station, Landsat, ESA Copernicus Sentinel fleet, NASA Terra/Aqua/PACE Earth-observing satellites, and DSCOVR at Lagrange Point L1.',
    },
    teacherNotes: {
      keyConcept: 'Seasons occur because Earth’s 23.44° tilted axis points toward the same celestial pole (near Polaris) all year, changing sunlight angles across hemispheres.',
      misconceptionWarning: 'Earth is actually closest to the Sun (perihelion) in early January—proving distance does not cause Northern Hemisphere summer!',
      discussionPrompt: 'Look at the thin blue line of Earth’s atmosphere on the horizon. Why do astronauts say seeing Earth from space changes how they think about borders and climate?',
    },
    visual: {
      textureStyle: 'earth',
      primaryColor: '#2563EB',
      secondaryColor: '#10B981',
      atmosphereColor: '#60A5FA',
      orbitSceneDistance: 13.0,
      orbitInitialPhaseDeg: 215,
      moons: [
        {
          name: 'Moon',
          slug: 'moon',
          radiusRatio: 0.27,
          orbitRadius: 2.8,
          inclinationDeg: 5.14,
          speed: 0.65,
          color: '#D6D3D1',
          fact: 'Orbits at ~384,400 km (true distance is ~30 Earth diameters; compressed here for visibility).',
        },
      ],
    },
    sources: [
      {
        assetId: 'NASA-BMNG-001',
        title: 'Blue Marble Next Generation Global Equirectangular Surface Map',
        organization: 'NASA Earth Observatory / Reto Stöckli',
        creditLine: 'Observed surface imagery: NASA Visible Earth Blue Marble Next Generation / Terra MODIS. Equirectangular map processing by Solar System Scope under CC BY 4.0.',
        license: 'NASA Open Data / CC BY 4.0',
        dataEpoch: '2004 Terra/MODIS Composite',
        authenticityTier: 'OBSERVED',
        referenceUrl: 'https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/',
      },
      {
        assetId: 'NASA-NOAA-NIGHT-001',
        title: 'Earth at Night (Black Marble) City Lights Composite',
        organization: 'NASA Earth Observatory / NOAA NGDC / Suomi NPP VIIRS',
        creditLine: 'Night lights imagery: NASA Earth Observatory & NOAA National Geophysical Data Center. CC BY 4.0 (Solar System Scope).',
        license: 'NASA Open Data / CC BY 4.0',
        dataEpoch: '2012–2016 VIIRS Day/Night Band',
        authenticityTier: 'OBSERVED',
        referenceUrl: 'https://earthobservatory.nasa.gov/features/NightLights',
      },
      {
        assetId: 'MG-EAR-CLOUD-001',
        title: 'Representative Earth Cloud Shell Layer',
        organization: 'NASA / Solar System Scope',
        creditLine: 'Cloud layer: Static representative satellite cloud composite (not live weather). Solar System Scope. CC BY 4.0.',
        license: 'CC BY 4.0',
        dataEpoch: 'Representative Static Composite',
        authenticityTier: 'DATA-BASED',
        referenceUrl: 'https://www.solarsystemscope.com/textures/',
      },
      {
        assetId: 'MG-EAR-001',
        title: 'Earth Planetary Fact Sheet & Geodetic Standards',
        organization: 'NASA Goddard Space Flight Center / NSSDCA',
        creditLine: 'Geophysical & ephemeris parameters: NASA/GSFC Planetary Data System.',
        license: 'Public Domain (NASA)',
        dataEpoch: 'J2000 / WGS84',
        authenticityTier: 'DATA-BASED',
        referenceUrl: 'https://science.nasa.gov/earth/facts/',
      },
    ],
  },
  {
    slug: 'mars',
    name: 'Mars',
    aliases: ['The Red Planet', 'Ares'],
    category: 'planet',
    classification: 'Terrestrial Desert World · Solar System',
    scaleBand: 'Planetary System',
    authenticityTier: 'DATA-BASED',
    authenticityNote: 'Iron-oxide albedo distribution, polar ice caps, and Valles Marineris scar modeled from Mars Global Surveyor data.',
    isOrbitable3D: true,
    hook: 'A cold rust-colored desert world of giant volcanoes, ancient riverbeds, and active robotic explorers.',
    signatureFact: 'Olympus Mons on Mars rises ~21.9 km high—nearly two and a half times the elevation of Mount Everest above sea level.',
    readingLevels: {
      young: 'Mars looks rusty red because iron minerals in its dust oxidized—just like rusty metal on Earth! Robotic rovers drive across Mars today looking for clues of ancient lakes and microscopic life.',
      curious: 'Half the diameter of Earth, Mars preserves geological evidence of liquid water rivers and deltas from over 3.5 billion years ago. Today its thin CO₂ atmosphere (~0.6% Earth’s pressure) supports seasonal CO₂/water frost caps and planet-wide dust storms.',
      enthusiast: 'Lacking a global dipole magnetosphere since ~4 Ga, Mars lost much of its volatile inventory to solar-wind stripping, leaving dichotomous northern lowlands, cratered southern highlands, and the 4,000-km Valles Marineris rift.',
    },
    metrics: {
      diameterKm: 6779,
      diameterLabel: '6,779 km (0.53 × Earth)',
      massEarth: 0.107,
      massLabel: '6.42 × 10²³ kg (0.107 × Earth)',
      dayLengthLabel: '24h 37m 22s (1 Martian Sol)',
      orbitalPeriodDays: 686.98,
      orbitalPeriodLabel: '687.0 Earth days (1.88 years)',
      gravityMs2: 3.72,
      gravityLabel: '3.72 m/s² (0.38 g)',
      distanceAu: 1.52,
      distanceLabel: '1.52 AU (12.7 light-min from Sun)',
      meanTempLabel: '-65 °C mean (-140 °C to +20 °C)',
      axialTiltDeg: 25.19,
      moonsCount: 2,
    },
    tabs: {
      overview: 'With a 24.6-hour day ("sol") and a 25.2° axial tilt remarkably close to Earth’s, Mars experiences distinct seasons—though each season lasts nearly twice as long due to its wider, more elliptical orbit.',
      structure: 'Silicate mantle over a liquid iron-nickel-sulfur core (~1,830 km radius confirmed by NASA InSight seismology), topped by an iron-oxide-rich basaltic crust.',
      ringsOrMoons: 'Orbited by two tiny irregular moons: Phobos (22 km across, spiraling slowly inward) and Deimos (12 km across).',
      missions: 'Home to Curiosi­ty (Gale Crater) and Perseverance + Ingenuity (Jezero Crater), monitored from orbit by Mars Reconnaissance Orbiter, MAVEN, Mars Express, TGO, Hope, and Tianwen-1.',
    },
    teacherNotes: {
      keyConcept: 'Planetary size governs heat retention: smaller worlds cool faster internally, losing magnetic shields and thick atmospheres earlier.',
      misconceptionWarning: '"Red" does not mean hot! Mars has an average temperature of -65 °C—colder than Antarctica.',
      discussionPrompt: 'If radio signals take between 4 and 22 minutes one-way between Earth and Mars, why can’t engineers steer Mars rovers with a live joystick?',
    },
    visual: {
      textureStyle: 'mars',
      primaryColor: '#C2593F',
      secondaryColor: '#7C2D12',
      atmosphereColor: '#FDBA74',
      orbitSceneDistance: 17.0,
      orbitInitialPhaseDeg: 310,
      moons: [
        {
          name: 'Phobos',
          radiusRatio: 0.08,
          orbitRadius: 1.9,
          inclinationDeg: 1.1,
          speed: 1.4,
          color: '#A8A29E',
          fact: 'Orbits Mars three times every single Martian day!',
        },
        {
          name: 'Deimos',
          radiusRatio: 0.06,
          orbitRadius: 2.7,
          inclinationDeg: 1.8,
          speed: 0.7,
          color: '#78716C',
          fact: 'Small outer moon taking 30.3 hours per orbit.',
        },
      ],
    },
    sources: [
      {
        assetId: 'MG-MAR-001',
        title: 'Mars Planetary Fact Sheet & MGS MOLA Reference',
        organization: 'NASA / JPL-Caltech / GSFC',
        creditLine: 'Geophysical data: NASA InSight & MGS Archive; Procedural terrain map: ManicksGalaxy.',
        license: 'Public Domain (NASA)',
        dataEpoch: 'J2000',
        authenticityTier: 'DATA-BASED',
        referenceUrl: 'https://science.nasa.gov/mars/facts/',
      },
    ],
  },
  {
    slug: 'jupiter',
    name: 'Jupiter',
    aliases: ['Jove', 'King of Planets'],
    category: 'planet',
    classification: 'Gas Giant · Solar System',
    scaleBand: 'Planetary System',
    authenticityTier: 'DATA-BASED',
    authenticityNote: 'Oblate spheroid with ammonia zone/belt meteorology, Great Red Spot vortex, and 4 Galilean moons.',
    isOrbitable3D: true,
    hook: 'A colossal hydrogen-helium giant with centuries-old superstorms and a miniature solar system of 95 moons.',
    signatureFact: 'Jupiter is more than twice as massive as all the other planets in our Solar System combined—and spins once in under 10 hours.',
    readingLevels: {
      young: 'Jupiter is the biggest planet around our Sun—more than 1,300 Earths could fit inside its volume! It has no solid ground to stand on, and its famous Great Red Spot is a storm wider than Earth.',
      curious: 'Spinning every 9 hours 55 minutes, Jupiter bulges visibly at its equator and stretches its ammonia clouds into alternating pale zones and dark belts. Deeper down, crushing pressure turns hydrogen into an electrically conducting liquid metal.',
      enthusiast: 'At 317.8 Earth masses, Jupiter’s metallic-hydrogen dynamo generates the largest planetary magnetosphere in the Solar System, driving intense auroras and tidally heating inner Galilean satellites Io and Europa via Laplace resonance.',
    },
    metrics: {
      diameterKm: 139820,
      diameterLabel: '139,820 km (11.0 × Earth)',
      massEarth: 317.8,
      massLabel: '1.898 × 10²⁷ kg (317.8 × Earth)',
      dayLengthLabel: '9h 55m 30s (fastest planet)',
      orbitalPeriodDays: 4332.59,
      orbitalPeriodLabel: '11.86 Earth years',
      gravityMs2: 24.79,
      gravityLabel: '24.79 m/s² (2.53 g at 1 bar)',
      distanceAu: 5.2,
      distanceLabel: '5.20 AU (43.2 light-min from Sun)',
      meanTempLabel: '-110 °C (1-bar cloud tops)',
      axialTiltDeg: 3.13,
      moonsCount: 95,
    },
    tabs: {
      overview: 'Jupiter’s rapid rotation powers jet streams exceeding 500 km/h and sculpts dramatic cyclones at its poles, captured in unprecedented detail by NASA’s Juno spacecraft.',
      structure: 'No solid surface: gaseous hydrogen/helium atmosphere transitions smoothly into supercritical fluid, then liquid metallic hydrogen surrounding a fuzzy, diluted heavy-element core.',
      ringsOrMoons: 'Four large Galilean moons discovered in 1610—volcanic Io, ice-ocean Europa, Ganymede (larger than Mercury!), and cratered Callisto—plus faint dusty rings.',
      missions: 'Visited by Pioneer 10/11, Voyager 1/2, Galileo orbiter & atmospheric probe, Cassini, New Horizons, NASA Juno, and on-route missions ESA JUICE and NASA Europa Clipper.',
    },
    teacherNotes: {
      keyConcept: 'Gas giants have no solid crust; astronomers define "surface radius" and "surface gravity" at the altitude where atmospheric pressure equals 1 bar (Earth sea-level pressure).',
      misconceptionWarning: 'Spacecraft cannot "land" on Jupiter—any probe descending into Jupiter is eventually crushed and vaporized by pressure and heat.',
      discussionPrompt: 'How did Galileo’s 1610 discovery of four moons orbiting Jupiter change humanity’s view of Earth’s place in the universe?',
    },
    visual: {
      textureStyle: 'jupiter',
      primaryColor: '#D6A97A',
      secondaryColor: '#9A5B3E',
      atmosphereColor: '#FDE68A',
      oblateness: 0.935,
      orbitSceneDistance: 24.5,
      orbitInitialPhaseDeg: 75,
      moons: [
        {
          name: 'Io',
          radiusRatio: 0.08,
          orbitRadius: 1.85,
          inclinationDeg: 0.05,
          speed: 1.5,
          color: '#FACC15',
          fact: 'Most volcanically active body in the Solar System due to tidal flexing.',
        },
        {
          name: 'Europa',
          slug: 'europa',
          radiusRatio: 0.075,
          orbitRadius: 2.35,
          inclinationDeg: 0.47,
          speed: 1.05,
          color: '#E2E8F0',
          fact: 'Harbors a global salty liquid-water ocean beneath its fractured ice shell.',
        },
        {
          name: 'Ganymede',
          radiusRatio: 0.105,
          orbitRadius: 2.95,
          inclinationDeg: 0.2,
          speed: 0.72,
          color: '#A8A29E',
          fact: 'Largest moon in the Solar System—bigger in diameter than the planet Mercury.',
        },
        {
          name: 'Callisto',
          radiusRatio: 0.095,
          orbitRadius: 3.6,
          inclinationDeg: 0.5,
          speed: 0.48,
          color: '#78716C',
          fact: 'Ancient, heavily cratered icy world outside Jupiter’s harshest radiation belt.',
        },
      ],
    },
    sources: [
      {
        assetId: 'MG-JUP-001',
        title: 'Jupiter Fact Sheet & Juno Gravity/Cloud Parameters',
        organization: 'NASA / JPL-Caltech / SwRI',
        creditLine: 'Ephemeris & physical constants: NASA/JPL-Caltech; Procedural zone-belt texture: ManicksGalaxy.',
        license: 'Public Domain (NASA)',
        dataEpoch: 'J2000 / Juno Epoch',
        authenticityTier: 'DATA-BASED',
        referenceUrl: 'https://science.nasa.gov/jupiter/facts/',
      },
    ],
  },
  {
    slug: 'saturn',
    name: 'Saturn',
    aliases: ['Cronus', 'The Ringed Jewel'],
    category: 'planet',
    classification: 'Gas Giant · Solar System',
    scaleBand: 'Planetary System',
    authenticityTier: 'DATA-BASED',
    authenticityNote: '3D oblate gas giant (0.902 polar flattening), 26.73° ring inclination, C/B/Cassini/A ring structure, and Titan/Enceladus orbits.',
    isOrbitable3D: true,
    hook: 'A golden hydrogen world crowned by billions of orbiting water-ice ring particles that transform with every viewing angle.',
    signatureFact: 'Saturn’s main rings span ~282,000 km across—three-quarters of the distance from Earth to the Moon—yet are often only 10 to 30 meters thick!',
    readingLevels: {
      young: 'Saturn is famous for its dazzling rings! Even though the rings look solid from far away, they are actually made of billions of floating chunks of bright water ice—from tiny snowballs to house-sized icebergs.',
      curious: 'Tilted at 26.73°, Saturn shows us different faces of its rings over its 29.5-year orbit, including dramatic "ring-plane crossings" when the paper-thin rings turn nearly invisible edge-on. Saturn is also the only planet less dense on average than liquid water (0.687 g/cm³).',
      enthusiast: 'Saturn’s ring architecture (D, C, B, Cassini Division, A, F, G, E) is sculpted by orbital resonances with moons like Mimas (2:1 resonance clearing the 4,800-km Cassini Division) and cryovolcanic plumes from Enceladus feeding the diffuse E ring.',
    },
    metrics: {
      diameterKm: 116460,
      diameterLabel: '116,460 km mean (9.14 × Earth)',
      massEarth: 95.16,
      massLabel: '5.683 × 10²⁶ kg (95.2 × Earth)',
      dayLengthLabel: '10h 33m 38s',
      orbitalPeriodDays: 10759.22,
      orbitalPeriodLabel: '29.45 Earth years',
      gravityMs2: 10.44,
      gravityLabel: '10.44 m/s² (1.06 g at 1 bar)',
      distanceAu: 9.58,
      distanceLabel: '9.58 AU (1.43B km · 79.3 light-min)',
      meanTempLabel: '-140 °C (1-bar cloud tops)',
      axialTiltDeg: 26.73,
      moonsCount: 146,
    },
    tabs: {
      overview: 'Orbit Saturn from above its north polar hexagon down to its razor-thin ring plane. Composed mostly of hydrogen and helium, Saturn spins so rapidly that its equatorial diameter is ~10% wider than its pole-to-pole diameter.',
      structure: 'Upper ammonia-ice haze conceals deeper ammonium hydrosulfide and water clouds, transitioning into liquid molecular and metallic hydrogen around a dense rocky-icy core.',
      ringsOrMoons: '99.9% pure water ice particles form the bright A, B, and C rings, separated by the Cassini Division. Among Saturn’s 146 confirmed moons, hazy Titan has liquid methane seas and tiny Enceladus vents subsurface ocean geysers.',
      missions: 'Pioneer 11 (1979), Voyager 1 & 2 (1980–81), and the historic NASA/ESA/ASI Cassini-Huygens mission (2004–2017), which orbited Saturn 294 times and landed Huygens on Titan. NASA’s Dragonfly rotorcraft will explore Titan next.',
    },
    teacherNotes: {
      keyConcept: 'Saturn’s rings are not solid washers; every icy particle orbits Saturn independently according to Kepler’s laws, moving faster on the inner edge than the outer edge.',
      misconceptionWarning: 'Saying "Saturn would float in a giant bathtub" illustrates its low mean density (0.687 g/cm³ < 1.0 g/cm³), NOT that a gas giant could physically sit intact in water!',
      discussionPrompt: 'Use the "Ring Edge" and "From Above" camera presets. Why did Galileo think Saturn had "ears" that mysteriously vanished two years later?',
    },
    visual: {
      textureStyle: 'saturn',
      primaryColor: '#E5CE9E',
      secondaryColor: '#B89768',
      atmosphereColor: '#FEF3C7',
      oblateness: 0.902,
      hasRings: true,
      ringInnerRadius: 1.24,
      ringOuterRadius: 2.38,
      ringColor: '#E7D3AD',
      orbitSceneDistance: 33.5,
      orbitInitialPhaseDeg: 162,
      moons: [
        {
          name: 'Enceladus',
          radiusRatio: 0.06,
          orbitRadius: 2.65,
          inclinationDeg: 0.02,
          speed: 1.35,
          color: '#F8FAFC',
          fact: 'Brightest icy surface in the Solar System; vents saltwater plumes from its south pole.',
        },
        {
          name: 'Rhea',
          radiusRatio: 0.075,
          orbitRadius: 3.15,
          inclinationDeg: 0.35,
          speed: 0.85,
          color: '#CBD5E1',
          fact: 'Saturn’s second-largest moon, an ancient cratered ice-rock sphere.',
        },
        {
          name: 'Titan',
          slug: 'titan',
          radiusRatio: 0.12,
          orbitRadius: 3.85,
          inclinationDeg: 0.33,
          speed: 0.52,
          color: '#EAB308',
          fact: 'Larger than Mercury and wrapped in a dense nitrogen-methane orange atmosphere.',
        },
      ],
    },
    sources: [
      {
        assetId: 'MG-SAT-001',
        title: 'Cassini-Huygens Ring & Planetary Ephemeris Dataset',
        organization: 'NASA / JPL-Caltech / Space Science Institute / ESA',
        creditLine: 'Ring geometry & constants: NASA/JPL-Caltech Cassini Archive; Procedural PBR shader & ring opacity profile: ManicksGalaxy.',
        license: 'Public Domain (NASA PDS)',
        dataEpoch: 'Cassini Grand Finale / J2000',
        authenticityTier: 'DATA-BASED',
        referenceUrl: 'https://science.nasa.gov/saturn/facts/',
      },
    ],
  },
  {
    slug: 'uranus',
    name: 'Uranus',
    aliases: ['The Sideways Ice Giant'],
    category: 'planet',
    classification: 'Ice Giant · Solar System',
    scaleBand: 'Planetary System',
    authenticityTier: 'DATA-BASED',
    authenticityNote: 'Modeled with 97.77° axial obliquity, cyan methane-absorption atmosphere, and vertical narrow ring system.',
    isOrbitable3D: true,
    hook: 'A pale cyan ice giant knocked onto its side, rolling around the Sun with 21-year-long polar seasons.',
    signatureFact: 'Tilted 97.8°, Uranus essentially orbits on its side—each pole experiences 42 continuous Earth years of sunlight followed by 42 years of darkness.',
    readingLevels: {
      young: 'Uranus is a chilly cyan-blue world called an "ice giant." Unlike other planets that spin like upright tops, Uranus is tipped completely onto its side, rolling along its orbit with thin dark rings!',
      curious: 'Four times wider than Earth, Uranus owes its serene aquamarine hue to atmospheric methane absorbing red sunlight. Beneath its hydrogen-helium air lies a hot, dense mantle of "ices"—water, ammonia, and methane fluids.',
      enthusiast: 'Discovered by William Herschel in 1781—the first planet found with a telescope—Uranus radiates remarkably little excess internal heat compared to Neptune and possesses an offset, 59°-tilted quadrupole-rich magnetosphere.',
    },
    metrics: {
      diameterKm: 50724,
      diameterLabel: '50,724 km (3.98 × Earth)',
      massEarth: 14.54,
      massLabel: '8.681 × 10²⁵ kg (14.5 × Earth)',
      dayLengthLabel: '17h 14m 24s (retrograde)',
      orbitalPeriodDays: 30688.5,
      orbitalPeriodLabel: '84.0 Earth years',
      gravityMs2: 8.87,
      gravityLabel: '8.87 m/s² (0.90 g at 1 bar)',
      distanceAu: 19.2,
      distanceLabel: '19.20 AU (2.66 light-hr from Sun)',
      meanTempLabel: '-195 °C (1-bar cloud tops)',
      axialTiltDeg: 97.77,
      moonsCount: 28,
    },
    tabs: {
      overview: 'Astronomers classify Uranus and Neptune separately from gas giants Jupiter and Saturn because heavy volatile compounds ("ices" of H₂O, NH₃, CH₄) dominate over hydrogen and helium by mass.',
      structure: 'Small rocky silicate/iron core surrounded by an electrically conductive water-ammonia-methane fluid mantle and a methane-tinted hydrogen-helium atmosphere.',
      ringsOrMoons: '13 narrow, dark rings and 28 moons named after characters from Shakespeare and Alexander Pope—including Miranda, Ariel, Umbriel, Titania, and Oberon.',
      missions: 'Visited close-up only once in history: NASA’s Voyager 2 flyby in January 1986; observed remotely by Hubble and JWST (which imaged its glowing infrared rings cleanly).',
    },
    teacherNotes: {
      keyConcept: '"Ice giant" refers to chemical composition (volatile molecules like water, ammonia, methane under high pressure), not blocks of frozen kitchen ice.',
      misconceptionWarning: 'True-color re-processing of Voyager 2 data shows Uranus and Neptune are closer in pale greenish-blue shade than older high-contrast Neptune photos suggested.',
      discussionPrompt: 'What could have happened early in the Solar System’s history to knock an entire giant planet 98 degrees onto its side?',
    },
    visual: {
      textureStyle: 'uranus',
      primaryColor: '#99F6E4',
      secondaryColor: '#38BDF8',
      atmosphereColor: '#A5F3FC',
      oblateness: 0.977,
      hasRings: true,
      ringInnerRadius: 1.45,
      ringOuterRadius: 1.82,
      ringColor: '#94A3B8',
      orbitSceneDistance: 42.5,
      orbitInitialPhaseDeg: 255,
      moons: [
        {
          name: 'Titania',
          radiusRatio: 0.08,
          orbitRadius: 2.4,
          inclinationDeg: 0.3,
          speed: 0.75,
          color: '#CBD5E1',
          fact: 'Largest moon of Uranus, crisscrossed by giant fault canyons.',
        },
      ],
    },
    sources: [
      {
        assetId: 'MG-URA-001',
        title: 'Uranus Fact Sheet & Voyager 2 / JWST Ring Geometry',
        organization: 'NASA / JPL-Caltech / STScI',
        creditLine: 'Physical constants: NASA NSSDCA; True-color palette calibration after Irwin et al. (2024).',
        license: 'Public Domain (NASA)',
        dataEpoch: 'J2000 / 2024 Color Calibration',
        authenticityTier: 'DATA-BASED',
        referenceUrl: 'https://science.nasa.gov/uranus/facts/',
      },
    ],
  },
  {
    slug: 'neptune',
    name: 'Neptune',
    aliases: ['Poseidon', 'Outermost Major Planet'],
    category: 'planet',
    classification: 'Ice Giant · Solar System',
    scaleBand: 'Planetary System',
    authenticityTier: 'DATA-BASED',
    authenticityNote: 'Modeled with supersonic methane cloud streaks, axial tilt (28.32°), and retrograde moon Triton.',
    isOrbitable3D: true,
    hook: 'A windswept azure ice giant 30 times farther from the Sun than Earth—found by mathematical prediction before telescope sight.',
    signatureFact: 'Neptune hosts the fastest sustained planetary winds in the Solar System, whipping frozen methane clouds at over 2,000 km/h.',
    readingLevels: {
      young: 'Neptune is the farthest major planet from our Sun! Sunlight there is 900 times dimmer than on Earth, yet Neptune’s internal heat powers supersonic storms across its blue sky.',
      curious: 'In 1846, mathematicians Urbain Le Verrier and John Couch Adams calculated Neptune’s location from tiny gravitational tugs on Uranus’s orbit—making Neptune a triumph of Newtonian physics.',
      enthusiast: 'Radiating 2.61 times as much thermal energy as it receives from the Sun at 30.07 AU, Neptune drives active tropospheric convection and captured Kuiper Belt object Triton into a decaying retrograde orbit.',
    },
    metrics: {
      diameterKm: 49244,
      diameterLabel: '49,244 km (3.86 × Earth)',
      massEarth: 17.15,
      massLabel: '1.024 × 10²⁶ kg (17.1 × Earth)',
      dayLengthLabel: '16h 06m 36s',
      orbitalPeriodDays: 60195,
      orbitalPeriodLabel: '164.8 Earth years',
      gravityMs2: 11.15,
      gravityLabel: '11.15 m/s² (1.14 g at 1 bar)',
      distanceAu: 30.07,
      distanceLabel: '30.07 AU (4.16 light-hr from Sun)',
      meanTempLabel: '-200 °C (1-bar cloud tops)',
      axialTiltDeg: 28.32,
      moonsCount: 16,
    },
    tabs: {
      overview: 'Since its discovery in September 1846, Neptune completed its very first full 164.8-year orbit in July 2011. High-altitude white methane-ice cirrus clouds cast shadows onto its deeper blue cloud deck.',
      structure: 'Slightly smaller in diameter than Uranus yet 18% more massive—making Neptune the densest giant planet (1.64 g/cm³), rich in high-pressure water-ammonia-methane fluid.',
      ringsOrMoons: 'Five faint dusty rings (Adams, Le Verrier, Galle, Lassell, Arago) and 16 moons dominated by Triton, which orbits backward and erupts nitrogen geysers.',
      missions: 'Explored close-up solely by NASA’s Voyager 2 in August 1989, supplemented by Hubble and JWST infrared observations.',
    },
    teacherNotes: {
      keyConcept: 'Scientific theories make testable predictions: discrepancies in Uranus’s orbit revealed an unseen planet before anyone recognized it at an eyepiece.',
      misconceptionWarning: 'Famous deep-cobalt Voyager 2 images had enhanced contrast to reveal the Great Dark Spot; true human-eye color is a softer cerulean-azure.',
      discussionPrompt: 'How can a planet 4.5 billion kilometers from the Sun have stronger winds than planets much closer to solar heat?',
    },
    visual: {
      textureStyle: 'neptune',
      primaryColor: '#60A5FA',
      secondaryColor: '#2563EB',
      atmosphereColor: '#93C5FD',
      oblateness: 0.983,
      orbitSceneDistance: 50.5,
      orbitInitialPhaseDeg: 18,
      moons: [
        {
          name: 'Triton',
          radiusRatio: 0.085,
          orbitRadius: 2.35,
          inclinationDeg: 156.8,
          speed: -0.82,
          color: '#E2E8F0',
          fact: 'Captured Kuiper Belt world orbiting Neptune backward (retrograde).',
        },
      ],
    },
    sources: [
      {
        assetId: 'MG-NEP-001',
        title: 'Neptune Fact Sheet & Voyager 2 Ephemeris',
        organization: 'NASA / JPL-Caltech',
        creditLine: 'Physical constants: NASA NSSDCA; Procedural atmosphere & cirrus streaks: ManicksGalaxy.',
        license: 'Public Domain (NASA)',
        dataEpoch: 'J2000',
        authenticityTier: 'DATA-BASED',
        referenceUrl: 'https://science.nasa.gov/neptune/facts/',
      },
    ],
  },
  // --- MOONS & DWARF PLANETS ---
  {
    slug: 'moon',
    name: 'Earth’s Moon',
    aliases: ['Luna', 'Selene'],
    category: 'moon-dwarf',
    classification: 'Natural Satellite · Earth–Moon System',
    scaleBand: 'Planetary System',
    authenticityTier: 'DATA-BASED',
    authenticityNote: 'Basaltic maria and anorthositic highlands modeled after Lunar Reconnaissance Orbiter (LRO) global mapping.',
    isOrbitable3D: true,
    hook: 'Our tidally locked rocky companion—the only world beyond Earth where humans have walked.',
    signatureFact: 'The Moon rotates at the exact same rate it orbits Earth (27.3 days), keeping the same hemisphere facing us while experiencing full day-night cycles.',
    readingLevels: {
      young: 'The Moon is Earth’s closest neighbor in space! Its dark patches are ancient flat lava plains called "seas" (maria), and its bright parts are cratered mountains.',
      curious: 'Formed ~4.5 billion years ago after a Mars-sized protoplanet ("Theia") collided with young Earth, the Moon’s gravitational pull drives Earth’s ocean tides and slowly drifts 3.8 cm farther away each year.',
      enthusiast: 'Synchronous rotation (1:1 spin-orbit libration allowing ~59% cumulative visibility from Earth) exposes a crustal dichotomy: thin basalt-flooded nearside maria vs. thick, heavily cratered farside feldspathic highlands.',
    },
    metrics: {
      diameterKm: 3475,
      diameterLabel: '3,475 km (0.27 × Earth)',
      massEarth: 0.0123,
      massLabel: '7.35 × 10²² kg (0.0123 × Earth)',
      dayLengthLabel: '27.32 Earth days (tidally locked)',
      orbitalPeriodDays: 27.32,
      orbitalPeriodLabel: '27.32 days (sidereal) · 29.53 days (phases)',
      gravityMs2: 1.62,
      gravityLabel: '1.62 m/s² (0.165 g — 1/6th Earth)',
      distanceAu: 1.0,
      distanceLabel: '384,400 km from Earth (1.28 light-sec)',
      meanTempLabel: '-183 °C (night) to +106 °C (equator noon)',
      axialTiltDeg: 6.68,
    },
    tabs: {
      overview: 'Moon phases are caused by our changing view of the Moon’s sunlit half as it orbits Earth—never by Earth’s shadow (which only touches the Moon during lunar eclipses).',
      structure: 'Small iron-rich core (~350 km radius), silicate mantle, and an airless regolith-covered crust preserving 4 billion years of Solar System impact history.',
      ringsOrMoons: 'Natural satellite of Earth; South Pole–Aitken basin on the farside holds permanently shadowed water-ice craters targeted by future missions.',
      missions: 'Apollo 11–17 crewed landings (382 kg of lunar samples), Luna, Chang’e 4/5/6 (including first farside sample return), Chandrayaan-1/2/3, SLIM, LRO, and NASA Artemis.',
    },
    teacherNotes: {
      keyConcept: 'Phases result from sun-moon-observer geometry; lunar eclipses happen only when the full Moon crosses Earth’s 5°-tilted orbital plane node.',
      misconceptionWarning: 'There is no permanent "dark side of the Moon"—the farside receives just as much sunlight over a month as the nearside!',
      discussionPrompt: 'Rotate around to the farside of the Moon. Why do you think Earth’s shadow does NOT cause the monthly crescent Moon?',
    },
    visual: {
      textureStyle: 'moon',
      primaryColor: '#D6D3D1',
      secondaryColor: '#78716C',
    },
    sources: [
      {
        assetId: 'MG-LUN-001',
        title: 'Moon Fact Sheet & LRO Global Altimetry Reference',
        organization: 'NASA GSFC / Lunar Reconnaissance Orbiter',
        creditLine: 'Lunar constants: NASA/GSFC LRO; Procedural maria/highland relief: ManicksGalaxy.',
        license: 'Public Domain (NASA)',
        dataEpoch: 'J2000',
        authenticityTier: 'DATA-BASED',
        referenceUrl: 'https://science.nasa.gov/moon/facts/',
      },
    ],
  },
  {
    slug: 'titan',
    name: 'Titan',
    aliases: ['Saturn VI'],
    category: 'moon-dwarf',
    classification: 'Hazy Ocean & Hydrocarbon Moon · Saturn System',
    scaleBand: 'Planetary System',
    authenticityTier: 'DATA-BASED',
    authenticityNote: 'Golden photochemical haze shell modeled from Cassini ISS & Huygens descent data.',
    isOrbitable3D: true,
    hook: 'Saturn’s giant moon—the only moon with a thick atmosphere and liquid seas of methane and ethane on its surface.',
    signatureFact: 'On Titan, water is frozen as hard as bedrock (-179 °C), while methane forms clouds, rain, rivers, and northern seas like Kraken Mare!',
    readingLevels: {
      young: 'Titan is a giant moon of Saturn wrapped in thick orange haze! Instead of water rain, Titan has chilly methane rain that fills real lakes and rivers on its icy ground.',
      curious: 'Larger than the planet Mercury, Titan has a nitrogen-rich atmosphere 1.45 times denser at its surface than Earth’s air. In 2005, the European Huygens probe parachuted through its orange haze and photographed rounded ice-pebbles in a dry riverbed.',
      enthusiast: 'Solar UV photolysis of CH₄ and N₂ in Titan’s upper atmosphere produces complex organic tholin aerosols, while an internal liquid water-ammonia ocean lies beneath its water-ice crust.',
    },
    metrics: {
      diameterKm: 5149,
      diameterLabel: '5,149 km (Larger than Mercury)',
      massEarth: 0.0225,
      massLabel: '1.345 × 10²³ kg',
      dayLengthLabel: '15.95 Earth days (tidally locked to Saturn)',
      orbitalPeriodDays: 15.95,
      orbitalPeriodLabel: '15.95 Earth days around Saturn',
      gravityMs2: 1.35,
      gravityLabel: '1.35 m/s² (0.14 g)',
      distanceAu: 9.58,
      distanceLabel: '1.22M km from Saturn · 9.58 AU from Sun',
      meanTempLabel: '-179 °C (93.7 K surface)',
      axialTiltDeg: 0.3,
    },
    tabs: {
      overview: 'Titan is the only world in the Solar System besides Earth confirmed to maintain stable bodies of liquid on its surface—hydrocarbon seas mapped by Cassini’s cloud-penetrating radar.',
      structure: 'Hydrous silicate core, high-pressure ice shell, subsurface liquid water-ammonia ocean, water-ice bedrock crust, and dense 95% nitrogen / 5% methane atmosphere.',
      ringsOrMoons: 'Orbits outside Saturn’s main rings; shapes nearby ringlet resonances.',
      missions: 'Voyager 1 (1980), Cassini-Huygens (ESA Huygens landed Jan 14, 2005—farthest landing from Earth in history), and upcoming NASA Dragonfly nuclear-powered octocopter.',
    },
    teacherNotes: {
      keyConcept: 'Low gravity + thick air (1.45 bar) makes winged or rotor flight remarkably efficient on Titan—enabling NASA’s Dragonfly helicopter.',
      misconceptionWarning: 'Methane on Titan cannot burn because Titan’s atmosphere contains virtually no free oxygen gas.',
      discussionPrompt: 'How can the same molecule (methane) be an invisible gas on Earth and rain/lakes on Titan?',
    },
    visual: {
      textureStyle: 'titan',
      primaryColor: '#D97706',
      secondaryColor: '#92400E',
      atmosphereColor: '#FBBF24',
    },
    sources: [
      {
        assetId: 'MG-TIT-001',
        title: 'Cassini-Huygens Titan Science Summary',
        organization: 'NASA / JPL-Caltech / ESA / ASI',
        creditLine: 'Data: NASA/ESA Cassini-Huygens Archive; Procedural haze globe: ManicksGalaxy.',
        license: 'Public Domain / ESA Science Educational Use',
        dataEpoch: '2017 Cassini Archive',
        authenticityTier: 'DATA-BASED',
        referenceUrl: 'https://science.nasa.gov/saturn/moons/titan/',
      },
    ],
  },
  {
    slug: 'europa',
    name: 'Europa',
    aliases: ['Jupiter II'],
    category: 'moon-dwarf',
    classification: 'Icy Ocean Moon · Jupiter System',
    scaleBand: 'Planetary System',
    authenticityTier: 'DATA-BASED',
    authenticityNote: 'Fractured water-ice lineae modeled after NASA Galileo and Juno imagery.',
    isOrbitable3D: true,
    hook: 'A bright ice-shelled moon of Jupiter hiding a global saltwater ocean with twice the liquid water of all Earth’s oceans.',
    signatureFact: 'Europa has almost no large impact craters—its young ice shell is continually resurfaced above a warm, tidally flexed ocean.',
    readingLevels: {
      young: 'Europa is covered in smooth, bright water ice crisscrossed by reddish streaks! Scientists have strong evidence that a deep, salty liquid ocean sloshes right underneath the ice.',
      curious: 'Slightly smaller than Earth’s Moon, Europa is flexed continuously by gravitational tug-of-war between Jupiter, Io, and Ganymede. That tidal friction keeps an estimated 60–150 km deep ocean liquid far outside the traditional solar habitable zone.',
      enthusiast: 'Induced magnetic field measurements from NASA’s Galileo spacecraft provide compelling evidence of a global electrically conductive (saline) ocean in contact with a rocky seafloor—making Europa a prime astrobiological target.',
    },
    metrics: {
      diameterKm: 3122,
      diameterLabel: '3,122 km (0.245 × Earth)',
      massEarth: 0.008,
      massLabel: '4.80 × 10²² kg',
      dayLengthLabel: '3.55 Earth days (tidally locked)',
      orbitalPeriodDays: 3.55,
      orbitalPeriodLabel: '3.55 Earth days around Jupiter',
      gravityMs2: 1.31,
      gravityLabel: '1.31 m/s² (0.134 g)',
      distanceAu: 5.2,
      distanceLabel: '670,900 km from Jupiter · 5.20 AU',
      meanTempLabel: '-160 °C (equator) · -220 °C (poles)',
      axialTiltDeg: 0.1,
    },
    tabs: {
      overview: 'Reddish-brown "lineae" fractures across Europa’s surface are thought to contain irradiated salts and sulfates welled up from the ocean below.',
      structure: 'Iron-nickel core, rocky silicate seafloor (potentially hosting hydrothermal vents), ~100 km saltwater ocean, and 15–25 km outer water-ice shell.',
      ringsOrMoons: 'Locked in a 1:2:4 Laplace orbital resonance with Io and Ganymede.',
      missions: 'Voyager 1/2, Galileo orbiter, Juno close flyby (2022), ESA JUICE, and NASA’s dedicated Europa Clipper spacecraft.',
    },
    teacherNotes: {
      keyConcept: 'Habitability does not depend solely on sunlight; tidal heating from gravity can sustain liquid oceans in the cold outer Solar System.',
      misconceptionWarning: 'Europa Clipper is designed to perform dozens of close flybys to study habitability—not drill directly through 20 km of ice.',
      discussionPrompt: 'What three ingredients do astrobiologists look for when evaluating whether an ocean moon could support microbial life?',
    },
    visual: {
      textureStyle: 'europa',
      primaryColor: '#E2E8F0',
      secondaryColor: '#B45309',
    },
    sources: [
      {
        assetId: 'MG-EUR-001',
        title: 'Europa Galileo & Juno Reference Dataset',
        organization: 'NASA / JPL-Caltech',
        creditLine: 'Data: NASA/JPL-Caltech Galileo & Europa Clipper Science Team.',
        license: 'Public Domain (NASA)',
        dataEpoch: '2024 Review',
        authenticityTier: 'DATA-BASED',
        referenceUrl: 'https://science.nasa.gov/jupiter/moons/europa/',
      },
    ],
  },
  {
    slug: 'pluto',
    name: 'Pluto',
    aliases: ['134340 Pluto', 'Kuiper Belt Dwarf Planet'],
    category: 'moon-dwarf',
    classification: 'Dwarf Planet · Kuiper Belt',
    scaleBand: 'Planetary System',
    authenticityTier: 'DATA-BASED',
    authenticityNote: 'Nitrogen-glacier basin (Sputnik Planitia) modeled after NASA New Horizons 2015 flyby.',
    isOrbitable3D: true,
    hook: 'A surprisingly active Kuiper Belt world of water-ice mountains and slow-flowing nitrogen glaciers.',
    signatureFact: 'Pluto and its giant moon Charon are mutually tidally locked—they orbit a shared center of gravity outside Pluto’s body, forever facing each other.',
    readingLevels: {
      young: 'Pluto is a dwarf planet in the icy Kuiper Belt past Neptune! When NASA’s New Horizons flew past in 2015, it revealed a giant bright heart-shaped glacier on Pluto’s surface.',
      curious: 'Reclassified in 2006 as the prototype Kuiper Belt dwarf planet because it shares its orbital zone with thousands of icy objects, Pluto stunned planetary scientists with 3.5-km water-ice mountains and crater-free nitrogen ice plains.',
      enthusiast: 'At 39.5 AU mean semi-major axis (eccentricity 0.249, inclination 17.16°), Pluto’s Tombaugh Regio hosts convecting solid N₂/CO/CH₄ cells in Sputnik Planitia and multilayered blue tholin haze.',
    },
    metrics: {
      diameterKm: 2377,
      diameterLabel: '2,377 km (0.186 × Earth)',
      massEarth: 0.0022,
      massLabel: '1.303 × 10²² kg',
      dayLengthLabel: '6.39 Earth days (retrograde)',
      orbitalPeriodDays: 90560,
      orbitalPeriodLabel: '247.9 Earth years',
      gravityMs2: 0.62,
      gravityLabel: '0.62 m/s² (0.063 g)',
      distanceAu: 39.48,
      distanceLabel: '39.5 AU mean (5.5 light-hr from Sun)',
      meanTempLabel: '-229 °C (44 K)',
      axialTiltDeg: 122.53,
      moonsCount: 5,
    },
    tabs: {
      overview: 'Far from being a dead iceball, Pluto displays active glacial geology, tenuous nitrogen haze layers extending 200 km up, and reddish organic tholins.',
      structure: 'Substantial rocky core (~70% of diameter) surrounded by a water-ice mantle (and possible subsurface ocean) topped by volatile nitrogen, methane, and carbon monoxide ices.',
      ringsOrMoons: 'Binary-like system with Charon (1,212 km—half Pluto’s width!), orbited by four tiny moons: Styx, Nix, Kerberos, and Hydra.',
      missions: 'Explored up close on July 14, 2015 by NASA’s New Horizons spacecraft after a 9.5-year voyage across 4.8 billion kilometers.',
    },
    teacherNotes: {
      keyConcept: 'Scientific classifications evolve as instruments discover new populations: discovering Eris and thousands of Kuiper Belt objects clarified why Pluto belongs to a new class of worlds.',
      misconceptionWarning: 'Calling Pluto a "dwarf planet" does not make its geology any less complex or fascinating!',
      discussionPrompt: 'Note that New Horizons only flew fast past one hemisphere at high resolution—why is the opposite side of Pluto mapped at lower resolution?',
    },
    visual: {
      textureStyle: 'pluto',
      primaryColor: '#D6C5B3',
      secondaryColor: '#7C4A3A',
      atmosphereColor: '#93C5FD',
    },
    sources: [
      {
        assetId: 'MG-PLU-001',
        title: 'New Horizons Pluto Encounter Reference',
        organization: 'NASA / Johns Hopkins APL / SwRI',
        creditLine: 'Data: NASA/JHUAPL/SwRI New Horizons Archive (Note: non-encounter hemisphere lower resolution in real data).',
        license: 'Public Domain (NASA)',
        dataEpoch: '2015 Encounter',
        authenticityTier: 'DATA-BASED',
        referenceUrl: 'https://science.nasa.gov/dwarf-planets/pluto/facts/',
      },
    ],
  },
  // --- DEEP COSMOS: GALAXIES & NEBULAE (Explicitly non-fake-3D where observed, or clearly labeled structure!) ---
  {
    slug: 'orion-nebula',
    name: 'Orion Nebula (M42)',
    aliases: ['Messier 42', 'NGC 1976'],
    category: 'galaxy-nebula',
    classification: 'Diffuse Emission Nebula · Stellar Nursery',
    scaleBand: 'Galactic & Deep Sky',
    authenticityTier: 'OBSERVED',
    authenticityNote: 'Telescope observation plate representation. Real nebulae are 1,344 light-years away and cannot be photographed from 360° angles; presented honestly as a layered astronomical observation.',
    isOrbitable3D: false,
    hook: 'The closest massive star-forming nursery to Earth—visible to the unaided eye as the fuzzy middle "star" in Orion’s Sword.',
    signatureFact: 'Light arriving from the Orion Nebula tonight left those glowing hydrogen clouds around the year 680 CE—1,344 years ago.',
    readingLevels: {
      young: 'The Orion Nebula is a giant glowing cloud of gas and cosmic dust where brand-new baby stars and planets are being born right now!',
      curious: 'Spanning 24 light-years across inside our Milky Way, M42 glows brightly because fierce ultraviolet light from four hot newborn stars—the Trapezium cluster—ionizes surrounding hydrogen, oxygen, and sulfur gas.',
      enthusiast: 'An H II region on the near edge of the Orion Molecular Cloud Complex; Hubble and JWST NIRCam observations resolve hundreds of protoplanetary disks ("proplyds") being photoevaporated by O-type star Theta¹ Orionis C.',
    },
    metrics: {
      diameterKm: 227000000000000,
      diameterLabel: '24 light-years (~2.27 × 10¹⁴ km)',
      massLabel: '~2,000 Solar masses of gas & dust',
      dayLengthLabel: 'Diffuse gas cloud (non-rigid)',
      orbitalPeriodDays: 0,
      orbitalPeriodLabel: 'Orbits Milky Way center (~230 Myr)',
      gravityLabel: 'Local Jeans-instability collapse',
      distanceLabel: '1,344 ± 20 light-years (Gaia/VLBA)',
      meanTempLabel: '~10,000 K (ionized H II gas)',
      axialTiltDeg: 0,
    },
    tabs: {
      overview: 'Unlike a solid planet, a nebula is an immense, tenuous cloud (fewer atoms per cubic centimeter than the best laboratory vacuum on Earth!) that appears luminous across trillions of kilometers of depth.',
      structure: 'Carved into a blister-like cavity ("Orion Bar" photodissociation region) by stellar winds and UV radiation from massive Trapezium stars.',
      ringsOrMoons: 'Contains over 700 young stellar objects and ~180 imaged protoplanetary disks—future solar systems in the making.',
      missions: 'Observed across wavelengths by Hubble Space Telescope, James Webb Space Telescope (NIRCam/MIRI), Chandra X-ray Observatory, and ALMA.',
    },
    teacherNotes: {
      keyConcept: 'Astronomical telescope images often assign specific infrared or narrowband emission wavelengths to visible RGB colors so human eyes can distinguish hydrogen, oxygen, and dust.',
      misconceptionWarning: 'We cannot fly around M42 in real photography; any "fly-through" video of a nebula is a 3D depth-extrapolated visualization, not 360° camera footage.',
      discussionPrompt: 'Find Orion’s Belt in the Sky Tonight view, then look just south to Orion’s Sword. Why does looking farther into space always mean looking back in time?',
    },
    visual: {
      textureStyle: 'nebula-emission',
      primaryColor: '#EC4899',
      secondaryColor: '#38BDF8',
      atmosphereColor: '#A855F7',
    },
    sources: [
      {
        assetId: 'MG-M42-001',
        title: 'Messier 42 — Hubble & JWST Multi-Wavelength Catalog Data',
        organization: 'NASA / ESA / CSA / STScI',
        creditLine: 'Catalog parameters: CDS SIMBAD / STScI; Multi-wavelength emission plate diagram: ManicksGalaxy.',
        license: 'CC BY 4.0 (ESA/Webb) / Public Domain (STScI)',
        dataEpoch: 'ICRS J2000',
        authenticityTier: 'OBSERVED',
        referenceUrl: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-42/',
      },
    ],
  },
  {
    slug: 'milky-way',
    name: 'Milky Way Galaxy',
    aliases: ['Our Home Galaxy', 'Barred Spiral SBbc'],
    category: 'galaxy-nebula',
    classification: 'Barred Spiral Galaxy · Local Group',
    scaleBand: 'Galactic & Deep Sky',
    authenticityTier: 'RECONSTRUCTED',
    authenticityNote: 'External top-down view is a scientific reconstruction! Because humanity lives inside the Milky Way’s Orion Arm, no spacecraft has ever photographed our galaxy from outside.',
    isOrbitable3D: false,
    hook: 'Our vast island of 100–400 billion stars—mapped from the inside out by radio telescopes and ESA’s Gaia astrometry mission.',
    signatureFact: 'Even NASA’s Voyager 1—the farthest spacecraft ever launched—would take millions of years to exit the Milky Way’s disk; every "outside photo" of our galaxy is a data-informed reconstruction!',
    readingLevels: {
      young: 'The Milky Way is our giant home galaxy—a spinning pinwheel of hundreds of billions of stars! Our entire Solar System is just one tiny dot partway out along one spiral arm.',
      curious: 'Spanning ~100,000 light-years across, the Milky Way is a barred spiral galaxy. Because Earth sits inside its dusty disk ~26,000 light-years from the center, we see it across the night sky as a misty band of starlight—and reconstruct its spiral shape using Gaia star distances and radio astronomy.',
      enthusiast: 'Classified as an SBbc barred spiral (~1.15 × 10¹² solar masses including dark matter halo) hosting supermassive black hole Sagittarius A* (4.15 × 10⁶ M☉, imaged by the Event Horizon Telescope) at its galactic nucleus.',
    },
    metrics: {
      diameterKm: 946000000000000000,
      diameterLabel: '~100,000 light-years across',
      massLabel: '~1.15 × 10¹² Solar masses (with dark halo)',
      dayLengthLabel: 'Differential galactic rotation',
      orbitalPeriodDays: 0,
      orbitalPeriodLabel: '~230 million years at Sun’s radius',
      gravityLabel: 'Galactic gravitational potential',
      distanceLabel: '26,670 light-years to Galactic Center (Sgr A*)',
      meanTempLabel: 'Multi-phase ISM (10 K clouds to 10⁶ K halo)',
      axialTiltDeg: 0,
    },
    tabs: {
      overview: 'How do astronomers map a house they can never leave? By measuring exact 3D positions and velocities of over 1.8 billion stars with ESA’s Gaia space observatory and tracking 21-cm neutral hydrogen radio emission through interstellar dust.',
      structure: 'Central peanut-shaped stellar bar, four primary/secondary spiral arms (including Perseus, Scutum-Centaurus, and our local Orion-Cygnus Spur), globular cluster halo, and an extended dark matter halo.',
      ringsOrMoons: 'Surrounded by dozens of dwarf satellite galaxies, most famously the Large and Small Magellanic Clouds visible from Earth’s Southern Hemisphere.',
      missions: 'Mapped from within by ESA Hipparcos & Gaia (DR3), NASA Spitzer GLIMPSE, COBE, Planck, Fermi, and the Event Horizon Telescope (Sgr A*).',
    },
    teacherNotes: {
      keyConcept: 'Distinguishing real photography from scientific reconstruction is essential: top-down Milky Way maps are models built from internal distance measurements, never external photographs.',
      misconceptionWarning: 'Many textbooks print a real photo of Andromeda (M31) or NGC 6744 or an artist’s map and let students assume a probe took a selfie of the Milky Way!',
      discussionPrompt: 'If you are standing in the middle of a forest and aren’t allowed to walk out, how could you draw an accurate top-down map of the forest?',
    },
    visual: {
      textureStyle: 'galaxy-spiral',
      primaryColor: '#A78BFA',
      secondaryColor: '#FDE68A',
      atmosphereColor: '#818CF8',
    },
    sources: [
      {
        assetId: 'MG-MWG-001',
        title: 'Gaia DR3 Galactic Structure & Spitzer Barred Spiral Model',
        organization: 'ESA Gaia DPAC / NASA JPL-Caltech (R. Hurt)',
        creditLine: 'Structural model parameters: ESA/Gaia/DPAC & NASA/JPL-Caltech; Reconstructed diagram: ManicksGalaxy.',
        license: 'CC BY-SA 3.0 IGO (ESA Gaia) / Public Domain',
        dataEpoch: 'Gaia DR3 (2022–2026)',
        authenticityTier: 'RECONSTRUCTED',
        referenceUrl: 'https://www.cosmos.esa.int/web/gaia',
      },
    ],
  },
  // --- EXOPLANETS (Explicitly RECONSTRUCTED 3D from real NASA Exoplanet Archive measurements!) ---
  {
    slug: 'trappist-1e',
    name: 'TRAPPIST-1e',
    aliases: ['2MASS J23062928-0502285 e'],
    category: 'exoplanet',
    classification: 'Temperate Rocky Exoplanet · Aquarius',
    scaleBand: 'Stellar Neighborhood',
    authenticityTier: 'RECONSTRUCTED',
    authenticityNote: 'RECONSTRUCTED 3D VISUALIZATION: Orbit, radius (0.92 R⊕), and mass (0.69 M⊕) are real measurements from transit photometry and TTVs; surface continents/clouds are an artist’s plausible reconstruction—no telescope has resolved surface pixels.',
    isOrbitable3D: true,
    hook: 'An Earth-sized rocky world orbiting inside the habitable zone of an ultracool red dwarf star 40.7 light-years away.',
    signatureFact: 'Seven rocky Earth-sized planets orbit TRAPPIST-1 closer to their tiny star than Mercury orbits our Sun—completing TRAPPIST-1e’s entire year in just 6.1 Earth days!',
    readingLevels: {
      young: 'TRAPPIST-1e is a real rocky planet orbiting another star 40 light-years away! No camera can see its surface closely yet, so scientists measure its size and weight from starlight dips and draw what it might look like.',
      curious: 'Discovered via the transit method (watching starlight dim by ~0.5% as the planet crosses in front of its red dwarf host), TRAPPIST-1e has 92% of Earth’s radius and a bulk density matching an iron-cored rocky world capable of holding liquid water if an atmosphere persists.',
      enthusiast: 'Constrained to 0.920 ± 0.013 R⊕ and 0.692 ± 0.022 M⊕ via Spitzer/JWST transit timing variations (Agol et al. 2021). Likely tidally locked in synchronous rotation with a permanent substellar hemisphere; JWST transmission spectroscopy is actively probing for a secondary atmosphere.',
    },
    metrics: {
      diameterKm: 11720,
      diameterLabel: '11,720 ± 165 km (0.92 × Earth)',
      massEarth: 0.692,
      massLabel: '0.692 ± 0.022 Earth masses',
      dayLengthLabel: '~6.10 Earth days (likely tidally locked)',
      orbitalPeriodDays: 6.1,
      orbitalPeriodLabel: '6.10 Earth days',
      gravityMs2: 8.01,
      gravityLabel: '~8.01 m/s² (0.82 g inferred)',
      distanceAu: 0.029,
      distanceLabel: '40.66 light-years from Earth (0.029 AU from host)',
      meanTempLabel: '~251 K (-22 °C equilibrium; depends on atmosphere)',
      axialTiltDeg: 0,
    },
    tabs: {
      overview: 'TRAPPIST-1e demonstrates both the triumph and humility of exoplanet astronomy: we know its orbital period to seconds and its size within 1.5%, yet its actual surface appearance remains a testable scientific question.',
      structure: 'Bulk density (4.89 g/cm³) indicates a differentiated iron-silicate interior similar to Earth’s, without a bloated hydrogen envelope.',
      ringsOrMoons: 'Part of a tightly packed resonant chain of 7 rocky planets (TRAPPIST-1b through h); from 1e’s sky, neighboring planets would appear larger than Earth’s full Moon!',
      missions: 'Discovered by TRAPPIST ground telescope & NASA Spitzer (2017); atmosphere and thermal emission studied by the James Webb Space Telescope.',
    },
    teacherNotes: {
      keyConcept: 'Exoplanets are almost never seen as detailed spheres; astronomers infer radius from transit depth and mass from gravitational wobbles or transit timing.',
      misconceptionWarning: 'Beautiful exoplanet artworks in news releases are scientific illustrations—never direct photographs of oceans or clouds!',
      discussionPrompt: 'If TRAPPIST-1e keeps one side permanently facing its dim red star, where on the planet might temperatures be mildest ("eyeball Earth" terminator)?',
    },
    visual: {
      textureStyle: 'exoplanet-temperate',
      primaryColor: '#0EA5E9',
      secondaryColor: '#334155',
      atmosphereColor: '#F43F5E',
    },
    sources: [
      {
        assetId: 'MG-EXO-001',
        title: 'NASA Exoplanet Archive — TRAPPIST-1 System Parameters',
        organization: 'NASA Exoplanet Science Institute / Caltech IPAC',
        creditLine: 'Measured parameters: NASA Exoplanet Archive (Agol et al. 2021); Surface texture explicitly labelled RECONSTRUCTED.',
        license: 'Public Domain Archive Data / Original Visualization',
        dataEpoch: 'NEA 2025 Release',
        authenticityTier: 'RECONSTRUCTED',
        referenceUrl: 'https://exoplanetarchive.ipac.caltech.edu/',
      },
    ],
  },
  {
    slug: '55-cancri-e',
    name: '55 Cancri e (Janssen)',
    aliases: ['Janssen', 'HD 75732 e'],
    category: 'exoplanet',
    classification: 'Ultra-Hot Super-Earth · Cancer',
    scaleBand: 'Stellar Neighborhood',
    authenticityTier: 'RECONSTRUCTED',
    authenticityNote: 'RECONSTRUCTED 3D VISUALIZATION: Radius (1.88 R⊕), 17.7-hour orbit, and JWST thermal emission (~1,540–2,000 °C) are measured; glowing magma fissures are a physically motivated reconstruction.',
    isOrbitable3D: true,
    hook: 'A blistering super-Earth whipping around its star every 18 hours—hot enough for a molten rock ocean and vaporized silicate air.',
    signatureFact: 'JWST infrared eclipse measurements suggest 55 Cancri e isn’t bare dark rock—heat redistribution hints at a volatile CO/CO₂ atmosphere above a magma ocean!',
    readingLevels: {
      young: '55 Cancri e orbits so close to its star that one whole "year" there finishes in less than 18 hours! Its daytime side is hot enough to melt solid rock into glowing lava.',
      curious: 'Roughly 1.9 times Earth’s width and 8 times Earth’s mass, this "super-Earth" lies 41 light-years away. In 2024, JWST measured its dayside thermal glow and detected signs of a heavy gas blanket stirred by outgassing magma.',
      enthusiast: 'At 0.0154 AU (orbital period 0.7365 days), 55 Cnc e exhibits secondary eclipse depths in JWST MIRI/NIRCam inconsistent with zero-albedo bare rock (Hu et al. 2024), pointing toward a secondary CO/CO₂ atmosphere sustained by a global magma ocean.',
    },
    metrics: {
      diameterKm: 23900,
      diameterLabel: '23,900 km (1.88 × Earth)',
      massEarth: 7.99,
      massLabel: '7.99 ± 0.33 Earth masses',
      dayLengthLabel: '17h 41m (tidally locked)',
      orbitalPeriodDays: 0.7365,
      orbitalPeriodLabel: '17.68 hours (0.74 Earth days)',
      gravityMs2: 21.8,
      gravityLabel: '~21.8 m/s² (2.2 g inferred)',
      distanceAu: 0.0154,
      distanceLabel: '41.0 light-years from Earth (0.015 AU from host)',
      meanTempLabel: '~1,540 °C to 2,000 °C dayside (JWST)',
      axialTiltDeg: 0,
    },
    tabs: {
      overview: 'Named "Janssen" by the IAU after spectacle-/telescope-maker Zacharias Janssen, 55 Cancri e shows that planets around other stars include extreme "super-Earth" lava worlds with no counterpart in our own Solar System.',
      structure: 'High-density rocky-iron interior topped by a dayside molten silicate ocean and a probable outgassed carbon-monoxide/carbon-dioxide atmosphere.',
      ringsOrMoons: 'Innermost of 5 known planets orbiting Sun-like binary star 55 Cancri A.',
      missions: 'Studied via radial velocity, MOST/Spitzer transits, Hubble, CHEOPS, and JWST NIRCam/MIRI thermal phase curves.',
    },
    teacherNotes: {
      keyConcept: 'Astronomers measure an exoplanet’s temperature without visiting it by comparing system infrared brightness just before and during when the planet passes behind its star (secondary eclipse).',
      misconceptionWarning: 'Early headlines called 55 Cancri e a "solid diamond planet," which later refined star carbon-to-oxygen measurements showed is unlikely.',
      discussionPrompt: 'How does finding "super-Earths" and "lava worlds" expand what we thought solar systems could look like?',
    },
    visual: {
      textureStyle: 'exoplanet-lava',
      primaryColor: '#EA580C',
      secondaryColor: '#1C1917',
      atmosphereColor: '#FB923C',
    },
    sources: [
      {
        assetId: 'MG-EXO-002',
        title: 'NASA Exoplanet Archive & JWST Secondary Eclipse Data (55 Cnc e)',
        organization: 'NASA Exoplanet Archive / STScI / JPL-Caltech',
        creditLine: 'Parameters: NASA Exoplanet Archive & JWST MIRI/NIRCam (Hu et al. 2024); Magma surface labelled RECONSTRUCTED.',
        license: 'Public Domain Archive Data / Original Visualization',
        dataEpoch: '2024 JWST Release',
        authenticityTier: 'RECONSTRUCTED',
        referenceUrl: 'https://exoplanetarchive.ipac.caltech.edu/',
      },
    ],
  },
];

export const SOLAR_SYSTEM_PLANETS = CELESTIAL_CATALOG.filter(
  (obj) => obj.category === 'planet'
);

export function getObjectBySlug(slug: string): CelestialObject | undefined {
  return CELESTIAL_CATALOG.find((item) => item.slug === slug);
}
