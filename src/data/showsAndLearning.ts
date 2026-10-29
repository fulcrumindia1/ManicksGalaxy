import { AuthenticityTier } from './catalog';

export interface ShowChapter {
  index: number;
  title: string;
  subtitle: string;
  objectSlug: string;
  cameraPreset: 'default' | 'above' | 'equator' | 'rings' | 'moons' | 'system';
  scaleNotice: string;
  authenticityTier: AuthenticityTier;
  narrationScript: string;
  keyFact: string;
  durationSec: number;
}

export interface PlanetariumShow {
  slug: string;
  title: string;
  eyebrow: string;
  audience: string;
  approxDuration: string;
  summary: string;
  chapters: ShowChapter[];
}

export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  relatedSlug: string;
}

export interface TeacherLesson {
  slug: string;
  title: string;
  gradeBand: string;
  duration: string;
  objective: string;
  misconceptionFocus: string;
  launchShowSlug?: string;
  launchObjectSlug?: string;
  checkpoints: string[];
}

export interface GlossaryTerm {
  term: string;
  symbolOrUnit?: string;
  definition: string;
  example: string;
}

export const PLANETARIUM_SHOWS: PlanetariumShow[] = [
  {
    slug: 'first-flight',
    title: 'First Flight: From Earth to the Deep Cosmos',
    eyebrow: 'Flagship Guided Show · 7 Chapters',
    audience: 'All Ages · Beginner Friendly',
    approxDuration: '~7 min interactive',
    summary: 'Lift off from Earth’s blue atmospheric rim, cross the Solar System to orbit Saturn’s icy rings, trace Orion in our stellar neighborhood, and step back to the Milky Way.',
    chapters: [
      {
        index: 0,
        title: 'Our Home, Earth',
        subtitle: 'Liftoff into low orbit above our ocean planet',
        objectSlug: 'earth',
        cameraPreset: 'default',
        scaleNotice: 'Real-time 3D globe · 23.44° axial tilt accurately modeled.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'Welcome inside the dome. Beneath us turns Earth—the only confirmed harbor for life in the universe, sheltered by a paper-thin blue veil of nitrogen and oxygen air.',
        keyFact: 'Earth orbits at 1 Astronomical Unit (149.6 million km)—light from the Sun takes 8 minutes and 20 seconds to reach us.',
        durationSec: 18,
      },
      {
        index: 1,
        title: 'Our Closest Neighbor, the Moon',
        subtitle: 'Crossing 384,400 kilometers of space',
        objectSlug: 'moon',
        cameraPreset: 'equator',
        scaleNotice: 'True Moon distance equals ~30 Earth diameters (1.28 light-seconds).',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'Just 1.3 light-seconds from home orbits the Moon. Locked in synchronous rotation, it keeps its dark basaltic plains facing Earth while its cratered farside looks out toward deep space.',
        keyFact: 'Moon phases come from sunlight angles as the Moon orbits Earth—never from Earth’s shadow.',
        durationSec: 18,
      },
      {
        index: 2,
        title: 'A Family Around the Sun',
        subtitle: 'Eight planets sharing one ecliptic plane',
        objectSlug: 'sun',
        cameraPreset: 'system',
        scaleNotice: 'Educational spacing active: planetary orbits and sizes compressed so all 8 worlds remain visible together.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'Pulling back reveals our star, the Sun—holding 99.86% of the Solar System’s mass. Four small rocky planets orbit close in, separated by the asteroid belt from four giant outer worlds.',
        keyFact: 'If the Sun were the size of a basketball, Earth would be a 2.2-mm peppercorn 26 meters away.',
        durationSec: 20,
      },
      {
        index: 3,
        title: 'Saturn, the Ringed World',
        subtitle: 'Nearly ten times farther from the Sun than Earth',
        objectSlug: 'saturn',
        cameraPreset: 'rings',
        scaleNotice: 'Saturn’s 0.902 polar flattening and 26.73° ring tilt reflect Cassini measurements.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'At 9.5 Astronomical Units—79 light-minutes from the Sun—we arrive at Saturn. Its rings span 282,000 kilometers, yet are composed of billions of individual water-ice particles often only 10 meters thick.',
        keyFact: 'Pause or click "Explore This Object" anytime to orbit Saturn’s rings freely, then resume your seat.',
        durationSec: 22,
      },
      {
        index: 4,
        title: 'Among the Stars of Orion',
        subtitle: 'Jumping across scale frames into interstellar light-years',
        objectSlug: 'orion-nebula',
        cameraPreset: 'default',
        scaleNotice: 'Labeled Scale Jump: Moving from light-hours (Solar System) to 1,344 light-years (Orion Molecular Cloud).',
        authenticityTier: 'OBSERVED',
        narrationScript: 'Stepping beyond our Solar System requires a new ruler: the light-year. In the constellation Orion, glowing hydrogen clouds 1,344 light-years away are collapsing right now into newborn stars and planetary disks.',
        keyFact: 'Stars in a constellation look flat on our night sky, yet sit hundreds of light-years apart in 3D depth.',
        durationSec: 20,
      },
      {
        index: 5,
        title: 'Our Galactic Island, the Milky Way',
        subtitle: 'Mapping 100,000 light-years from the inside out',
        objectSlug: 'milky-way',
        cameraPreset: 'above',
        scaleNotice: 'Scientific Reconstruction: No camera has left our galaxy; spiral structure is mapped from internal Gaia & radio data.',
        authenticityTier: 'RECONSTRUCTED',
        narrationScript: 'Our Sun is just one star among hundreds of billions orbiting the Milky Way every 230 million years. Because no spacecraft has ever flown outside our galaxy, this top-down view is a data-driven scientific reconstruction.',
        keyFact: 'Every star you see with the unaided eye at night belongs to our local neighborhood inside the Milky Way.',
        durationSec: 20,
      },
      {
        index: 6,
        title: 'Finale: Only the Beginning',
        subtitle: 'Returning home with a cosmic perspective',
        objectSlug: 'earth',
        cameraPreset: 'above',
        scaleNotice: 'End of guided route · Your discoveries are saved locally in My Voyage.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'From rocky exoplanets around red dwarf stars to trillions of distant galaxies, every measurement deepens our curiosity—and reminds us how precious our pale blue world truly is. You’ve only seen the beginning.',
        keyFact: 'Every destination in this show remains open for hands-on 360° inspection and source verification.',
        durationSec: 18,
      },
    ],
  },
  {
    slug: 'rings-of-saturn',
    title: 'The Rings of Saturn: Cassini’s Legacy',
    eyebrow: 'Planetary Deep Dive · 4 Chapters',
    audience: 'Ages 9+ & Enthusiasts',
    approxDuration: '~4 min interactive',
    summary: 'Examine Saturn from pole to ring-edge, discover how gravity carves the Cassini Division, and visit hazy Titan and ocean-venting Enceladus.',
    chapters: [
      {
        index: 0,
        title: 'Approaching the Gas Giant',
        subtitle: 'Why Saturn bulges 10% wider at its equator',
        objectSlug: 'saturn',
        cameraPreset: 'equator',
        scaleNotice: 'Rapid 10h 33m rotation flattens Saturn’s poles visibly.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'Spinning once every ten and a half hours, fluid hydrogen and helium bulge outward at Saturn’s equator, creating the most oblate planet in our Solar System.',
        keyFact: 'Saturn’s mean density (0.687 g/cm³) is lower than liquid water.',
        durationSec: 18,
      },
      {
        index: 1,
        title: 'Razor-Thin Ice Architecture',
        subtitle: 'Viewing the ring plane from above and edge-on',
        objectSlug: 'saturn',
        cameraPreset: 'rings',
        scaleNotice: 'Ring thickness-to-width ratio is thinner than a sheet of tissue paper.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'Every particle in Saturn’s rings is a tiny icy moonlet on its own Keplerian orbit. Resonances with moons like Mimas sweep out the 4,800-kilometer Cassini Division.',
        keyFact: 'Twice every 29.5-year Saturn orbit, the rings turn edge-on to Earth and nearly vanish in small telescopes.',
        durationSec: 18,
      },
      {
        index: 2,
        title: 'Titan’s Methane Seas',
        subtitle: 'A moon larger than the planet Mercury',
        objectSlug: 'titan',
        cameraPreset: 'default',
        scaleNotice: 'Golden photochemical tholin haze modeled from Cassini/Huygens.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'Beyond the main rings orbits Titan—wrapped in nitrogen air thicker than Earth’s, where liquid methane rains down onto icy riverbeds.',
        keyFact: 'ESA’s Huygens probe landed on Titan in January 2005—the farthest landing from Earth to date.',
        durationSec: 18,
      },
      {
        index: 3,
        title: 'Ocean Worlds of the Outer System',
        subtitle: 'Comparing Saturn’s moons with Jupiter’s Europa',
        objectSlug: 'europa',
        cameraPreset: 'default',
        scaleNotice: 'Subsurface oceans kept liquid by tidal flexing rather than sunlight.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'Like Saturn’s Enceladus, Jupiter’s icy moon Europa hides a salty global ocean beneath its fractured crust—expanding where life might exist in the universe.',
        keyFact: 'Europa contains roughly twice the liquid water volume of all Earth’s oceans combined.',
        durationSec: 18,
      },
    ],
  },
  {
    slug: 'worlds-beyond',
    title: 'Worlds Beyond: Exoplanets & Reconstructions',
    eyebrow: 'Science Literacy · 3 Chapters',
    audience: 'Curious Minds & Classrooms',
    approxDuration: '~3 min interactive',
    summary: 'Learn how astronomers detect unseen planets 40 light-years away—and why honest science separates measured orbits from reconstructed surfaces.',
    chapters: [
      {
        index: 0,
        title: 'Seven Worlds Around TRAPPIST-1',
        subtitle: 'Measuring starlight dips to 0.5% precision',
        objectSlug: 'trappist-1e',
        cameraPreset: 'default',
        scaleNotice: 'RECONSTRUCTED SURFACE: Radius & 6.1-day orbit are real; clouds & oceans are illustrative.',
        authenticityTier: 'RECONSTRUCTED',
        narrationScript: 'Forty light-years away, seven Earth-sized planets cross in front of an ultracool red dwarf star. Transit dips reveal TRAPPIST-1e’s exact diameter, even though no camera can yet resolve its continents.',
        keyFact: 'Over 5,700 exoplanets have been confirmed in our Milky Way galaxy.',
        durationSec: 20,
      },
      {
        index: 1,
        title: 'Lava Skies of 55 Cancri e',
        subtitle: 'Reading infrared heat with the James Webb Space Telescope',
        objectSlug: '55-cancri-e',
        cameraPreset: 'equator',
        scaleNotice: 'RECONSTRUCTED SURFACE: Dayside temperature (~1,800 °C) measured via JWST secondary eclipse.',
        authenticityTier: 'RECONSTRUCTED',
        narrationScript: 'Whipping around its star in under 18 hours, super-Earth 55 Cancri e glows in infrared light—revealing heat redistribution consistent with a volatile atmosphere over molten rock.',
        keyFact: 'Super-Earths (between Earth and Neptune in size) are common in the galaxy despite being absent from our Solar System.',
        durationSec: 20,
      },
      {
        index: 2,
        title: 'Why Earth Remains Extraordinary',
        subtitle: 'Comparing exoplanet clues with our home biosphere',
        objectSlug: 'earth',
        cameraPreset: 'default',
        scaleNotice: 'Observed & Data-Based reference world.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'Studying alien atmospheres teaches us how rare and delicate Earth’s oxygen-rich sky and liquid oceans truly are.',
        keyFact: 'Earth’s atmospheric oxygen + methane disequilibrium is the benchmark biosignature astronomers search for.',
        durationSec: 18,
      },
    ],
  },
];

export const ASTRONOMY_QUIZZES: QuizQuestion[] = [
  {
    id: 'q-saturn-rings',
    topic: 'Solar System Physics',
    question: 'What are Saturn’s bright main rings actually made of?',
    options: [
      'Solid flat disks of painted rock spinning as one piece',
      'Billions of independent orbiting chunks of mostly water ice',
      'Glowing rings of hot plasma trapped by solar wind',
      'Clouds of pure hydrogen gas frozen into a single hoop',
    ],
    correctIndex: 1,
    explanation: 'Correct! Spectroscopy and Cassini measurements show Saturn’s rings are ~99.9% water ice particles—from dust grains to house-sized boulders—each orbiting Saturn on its own Keplerian path.',
    relatedSlug: 'saturn',
  },
  {
    id: 'q-earth-seasons',
    topic: 'Earth & Orbits',
    question: 'What is the primary physical cause of Earth’s four seasons?',
    options: [
      'Earth moving much closer to the Sun in July and farther in January',
      'Solar flares heating Earth every six months',
      'Earth’s 23.44° tilted rotational axis changing sunlight angles across hemispheres',
      'The Moon blocking part of the Sun’s warmth each winter',
    ],
    correctIndex: 2,
    explanation: 'Spot on! Earth is actually closest to the Sun in early January. Our 23.44° axial tilt causes the Northern and Southern Hemispheres to take turns tilting toward steeper, longer daily sunlight.',
    relatedSlug: 'earth',
  },
  {
    id: 'q-milky-way-honesty',
    topic: 'Scientific Literacy',
    question: 'Why is every "top-down outside image" of the Milky Way Galaxy labeled as a Reconstruction?',
    options: [
      'Because cameras don’t work in deep space vacuum',
      'Because Earth sits inside the Milky Way’s disk and no spacecraft has ever traveled outside it',
      'Because galaxies are invisible in all wavelengths of light',
      'Because the Milky Way has no spiral arms',
    ],
    correctIndex: 1,
    explanation: 'Exactly! Even Voyager 1 has traveled less than one light-day from Earth, whereas the Milky Way’s disk is thousands of light-years thick. Astronomers reconstruct its barred-spiral shape from internal Gaia star distances and radio surveys.',
    relatedSlug: 'milky-way',
  },
  {
    id: 'q-venus-temp',
    topic: 'Planetary Atmospheres',
    question: 'Why does Venus have a hotter surface (464 °C) than Mercury, even though Mercury is closer to the Sun?',
    options: [
      'Venus spins much faster than Earth',
      'Venus has a dense 96.5% carbon dioxide atmosphere causing a runaway greenhouse effect',
      'Venus is an active star undergoing fusion',
      'Venus has four large moons squeezing its core',
    ],
    correctIndex: 1,
    explanation: 'Correct! Mercury has virtually no atmosphere to retain heat, whereas Venus’s crushing carbon dioxide atmosphere and sulfuric acid clouds trap outgoing infrared radiation.',
    relatedSlug: 'venus',
  },
];

export const TEACHER_LESSONS: TeacherLesson[] = [
  {
    slug: 'scale-and-giants',
    title: 'Lesson 01: Rocky Worlds vs. Gas & Ice Giants',
    gradeBand: 'Grades 4–8 (Ages 9–14)',
    duration: '25–35 min classroom session',
    objective: 'Compare planetary diameters, densities, and compositions across terrestrial planets and outer giants while distinguishing true-scale ratios from educational diagrams.',
    misconceptionFocus: 'Textbook diagrams draw planets nearly equal in size and evenly spaced—hiding that Jupiter is 11× Earth’s width and Neptune orbits 30× farther from the Sun.',
    launchObjectSlug: 'saturn',
    checkpoints: [
      'Open Compare Worlds: Switch Earth vs. Jupiter between "Presentation Scale" and "True Scale Ratio" (1:11.0).',
      'Inspect Saturn in 360°: Switch from "From Above" to "Ring Edge" to demonstrate how 26.7° tilt changes apparent ring width.',
      'Ask students: Why do gas giants have no solid landing surface?',
    ],
  },
  {
    slug: 'reasons-for-seasons',
    title: 'Lesson 02: Axial Tilt, Day Length & Planetary Seasons',
    gradeBand: 'Grades 5–9 (Ages 10–15)',
    duration: '20–30 min classroom session',
    objective: 'Connect axial obliquity (Earth 23.4°, Mars 25.2°, Uranus 97.8°) to seasonal sunlight angles and polar day/night cycles.',
    misconceptionFocus: 'Students frequently draw an exaggerated oval orbit and claim summer happens when Earth is closer to the Sun.',
    launchObjectSlug: 'earth',
    checkpoints: [
      'Inspect Earth with Science Labels ON to highlight its 23.44° tilted axis and sunlit terminator.',
      'Compare Earth’s 23.4° tilt with Uranus’s 97.8° sideways tilt (42-year polar summer/winter).',
      'Complete Quiz Question #2 together as an exit ticket.',
    ],
  },
  {
    slug: 'honest-astronomy-media',
    title: 'Lesson 03: Observed Photo, Simulation, or Artist Reconstruction?',
    gradeBand: 'Grades 6–12 (Ages 11–18)',
    duration: '30 min media-literacy lab',
    objective: 'Evaluate astronomical visuals critically using provenance metadata: Observed telescope data vs. Data-Based 3D models vs. Reconstructed exoplanets.',
    misconceptionFocus: 'Believing high-resolution exoplanet renderings or top-down Milky Way maps are direct photographs.',
    launchShowSlug: 'worlds-beyond',
    checkpoints: [
      'Launch the 3-chapter "Worlds Beyond" show in Classroom Mode.',
      'Open the Sources & Provenance tab on Orion Nebula (OBSERVED), Saturn (DATA-BASED), and TRAPPIST-1e (RECONSTRUCTED).',
      'Have students identify what is measured (radius, period, spectra) vs. extrapolated (cloud patterns).',
    ],
  },
];

export const ASTRONOMY_GLOSSARY: GlossaryTerm[] = [
  {
    term: 'Astronomical Unit (AU)',
    symbolOrUnit: '1 AU = 149,597,870.7 km',
    definition: 'The average distance between Earth and the Sun, used as the standard yardstick inside planetary systems.',
    example: 'Earth orbits at 1.00 AU; Saturn orbits at 9.58 AU; Neptune orbits at 30.07 AU.',
  },
  {
    term: 'Light-Year (ly)',
    symbolOrUnit: '1 ly ≈ 9.461 × 10¹² km',
    definition: 'A unit of distance (not time!): how far light travels through vacuum in one Julian year (365.25 days) at 299,792.458 km/s.',
    example: 'Proxima Centauri is 4.24 light-years away; the Orion Nebula is 1,344 light-years away.',
  },
  {
    term: 'Constellation vs. Asterism',
    symbolOrUnit: '88 IAU Regions',
    definition: 'An official constellation is one of 88 exact sky boundary regions defined by the IAU in 1930. An asterism is a familiar informal star pattern (like the Big Dipper or Summer Triangle).',
    example: 'The Big Dipper is a 7-star asterism inside the larger constellation Ursa Major.',
  },
  {
    term: 'Transit Photometry',
    symbolOrUnit: 'ΔF / F ≈ (Rp / R*)²',
    definition: 'Detecting an exoplanet by measuring the tiny, repeating dip in a host star’s brightness when the planet crosses in front of the star’s disk.',
    example: 'TRAPPIST-1’s seven rocky planets were sized accurately using transit dips.',
  },
  {
    term: 'Axial Obliquity (Tilt)',
    symbolOrUnit: 'Degrees (°)',
    definition: 'The angle between a planet’s rotational axis and the perpendicular to its orbital plane around its star.',
    example: 'Earth’s 23.44° obliquity drives our four seasons; Uranus rolls on its side at 97.77°.',
  },
  {
    term: 'Terminator',
    symbolOrUnit: 'Day–Night Boundary',
    definition: 'The moving twilight line separating the sunlit dayside hemisphere of a planetary body from its shadowed nightside.',
    example: 'Craters on the Moon cast dramatic, measurable shadows right along the lunar terminator.',
  },
];
