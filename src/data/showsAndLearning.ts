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
    title: 'First Flight: Earth to Saturn',
    eyebrow: 'Flagship Guided Show · 7 Chapters',
    audience: 'All Ages · Beginner Friendly',
    approxDuration: '~8 min interactive',
    summary: 'Lift off from Earth’s blue atmospheric rim, visit the Moon, cross the asteroid belt to Mars and Jupiter, and navigate Saturn’s icy rings before returning home.',
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
        title: 'The Inner Solar System Orrery',
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
        title: 'The Red Planet, Mars',
        subtitle: 'Canyon systems and solar system volcanoes',
        objectSlug: 'mars',
        cameraPreset: 'default',
        scaleNotice: 'NASA Viking & MGS MOLA altimetry surface map.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'Crossing outward past Earth, we arrive at Mars. Its thin carbon-dioxide atmosphere reveals the giant shield volcano Olympus Mons and the 4,000-kilometer rift of Valles Marineris.',
        keyFact: 'Olympus Mons is two and a half times taller than Mount Everest and could cover the entire state of Arizona.',
        durationSec: 20,
      },
      {
        index: 4,
        title: 'Jupiter, King of the Planets',
        subtitle: 'A gas giant holding more mass than all other worlds combined',
        objectSlug: 'jupiter',
        cameraPreset: 'equator',
        scaleNotice: 'Jupiter’s 11× Earth diameter and rapid 9h 55m rotation modeled.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'Past the asteroid belt towers Jupiter—more massive than all other planets combined. In its turbulent ammonia clouds churns the Great Red Spot, a high-pressure storm larger than the entire Earth.',
        keyFact: 'Jupiter’s magnetic field is 20,000 times stronger than Earth’s and creates massive polar auroras.',
        durationSec: 22,
      },
      {
        index: 5,
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
        index: 6,
        title: 'Finale: The Pale Blue Dot',
        subtitle: 'Returning home with a cosmic perspective',
        objectSlug: 'earth',
        cameraPreset: 'above',
        scaleNotice: 'End of guided route · Your discoveries are saved locally in My Voyage.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'Looking back from the ring plane of Saturn toward the inner Solar System, Earth is visible as a solitary pale blue speck of light. Every human who ever lived called this tiny oasis home.',
        keyFact: 'Every destination in this show remains open for hands-on 360° inspection and source verification.',
        durationSec: 18,
      },
    ],
  },
  {
    slug: 'our-home-milky-way',
    title: 'Our Home in the Milky Way',
    eyebrow: 'Galactic Journey · 6 Chapters',
    audience: 'All Ages & Space Enthusiasts',
    approxDuration: '~9 min interactive',
    summary: 'Journey from our local star outward through interstellar space, visit the stellar nursery of Orion, and explore the 100,000-light-year barred spiral disk of our home galaxy.',
    chapters: [
      {
        index: 0,
        title: 'The Sun: Nuclear Engine of the System',
        subtitle: 'A yellow dwarf star converting 600 million tons of hydrogen every second',
        objectSlug: 'sun',
        cameraPreset: 'default',
        scaleNotice: 'NASA Solar Dynamics Observatory (SDO) 4K photosphere observation.',
        authenticityTier: 'OBSERVED',
        narrationScript: 'At the gravitational heart of our system burns the Sun. Within its core at 15 million Kelvin, nuclear fusion fuses hydrogen into helium, powering all life and warmth in the planetary system.',
        keyFact: 'The Sun holds 99.86% of the total mass of the entire Solar System.',
        durationSec: 20,
      },
      {
        index: 1,
        title: 'The Boundary of the Solar System',
        subtitle: 'Looking back across the heliosphere',
        objectSlug: 'sun',
        cameraPreset: 'system',
        scaleNotice: 'Heliocentric view compressed for educational perspective.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'Passing beyond the orbits of Uranus and Neptune, we cross the Kuiper Belt and the heliopause—the magnetic boundary where the solar wind gives way to the ambient interstellar medium.',
        keyFact: 'Voyager 1 crossed the heliopause in August 2012 at a distance of 121 AU (18 billion km) from the Sun.',
        durationSec: 20,
      },
      {
        index: 2,
        title: 'The Orion Nebula: Stellar Cradle',
        subtitle: 'Birthplace of stars 1,344 light-years from Earth',
        objectSlug: 'orion-nebula',
        cameraPreset: 'default',
        scaleNotice: 'Hubble Space Telescope high-resolution visible-light mosaic.',
        authenticityTier: 'OBSERVED',
        narrationScript: 'Stepping into the interstellar neighborhood brings us to the Great Orion Nebula. Here in glowing clouds of hydrogen and dust, thousands of baby stars and protoplanetary disks are condensing.',
        keyFact: 'The bright Trapezium cluster at the center of M42 is scarcely 300,000 years old—astronomically brand new.',
        durationSec: 22,
      },
      {
        index: 3,
        title: 'The Barred Spiral Disk',
        subtitle: 'Mapping 100,000 light-years of spiral arms',
        objectSlug: 'milky-way',
        cameraPreset: 'above',
        scaleNotice: 'Scientific Reconstruction based on ESA Gaia DR3 parallax star counts and radio mapping.',
        authenticityTier: 'RECONSTRUCTED',
        narrationScript: 'Looking down upon the Milky Way reveals its majestic barred spiral structure. Hundreds of billions of stars turn in synchrony around a central peanut-shaped bar over 230-million-year cosmic years.',
        keyFact: 'Because humanity is inside the galaxy, no spacecraft has ever photographed the Milky Way from outside.',
        durationSec: 22,
      },
      {
        index: 4,
        title: 'Sagittarius A*: The Galactic Anchor',
        subtitle: 'A four-million-solar-mass supermassive black hole',
        objectSlug: 'sagittarius-a',
        cameraPreset: 'default',
        scaleNotice: 'Event Horizon Telescope 1.3 mm millimeter-VLBI radio observation.',
        authenticityTier: 'OBSERVED',
        narrationScript: 'At the exact dynamical core of the galaxy sits Sagittarius A*. Its gravitational pull bends light from surrounding superheated gas into a glowing ring around an event horizon shadow.',
        keyFact: 'Stars near Sgr A* orbit at up to 8% of the speed of light—thousands of kilometers per second.',
        durationSec: 20,
      },
      {
        index: 5,
        title: 'One Star Among Two Hundred Billion',
        subtitle: 'The fragile beauty of our planetary home',
        objectSlug: 'earth',
        cameraPreset: 'default',
        scaleNotice: 'NASA Blue Marble Next Generation imagery.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'Among hundreds of billions of stars in our galaxy, our journey returns to Earth. A single pale blue oasis whose air and oceans make this cosmic wonder possible.',
        keyFact: 'Every star visible to the unaided human eye at night lies in our tiny local corner of the Milky Way.',
        durationSec: 18,
      },
    ],
  },
  {
    slug: 'moons-hidden-oceans',
    title: 'Moons & Hidden Oceans',
    eyebrow: 'Astrobiology Voyage · 6 Chapters',
    audience: 'Curious Minds & Classrooms',
    approxDuration: '~9 min interactive',
    summary: 'Travel to the outer Solar System where gravitational tides sustain global subsurface oceans beneath miles of fractured ice.',
    chapters: [
      {
        index: 0,
        title: 'The Moon: Barren Basalt Seas',
        subtitle: 'Ancient volcanic plains on a dry satellite',
        objectSlug: 'moon',
        cameraPreset: 'equator',
        scaleNotice: 'NASA LRO Lunar Reconnaissance Orbiter global albedo map.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'Our exploration of moons begins at Earth’s Moon. Its dark "seas" or maria are actually ancient basaltic lava plains, completely devoid of liquid water.',
        keyFact: 'Water on our Moon is confined to permanently shadowed cold traps at the lunar poles.',
        durationSec: 18,
      },
      {
        index: 1,
        title: 'Europa: Fractured Ice & a Salty Sea',
        subtitle: 'Twice the water volume of Earth’s oceans combined',
        objectSlug: 'europa',
        cameraPreset: 'default',
        scaleNotice: 'Galileo SSI & JunoCam color mosaic · Chaos terrain verified.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'Orbiting Jupiter, Europa hides a global saltwater ocean 100 kilometers deep beneath a fractured ice shell, kept liquid by the relentless gravitational squeeze of Jupiter and Io.',
        keyFact: 'Europa contains more liquid water than all of Earth’s surface oceans combined.',
        durationSec: 20,
      },
      {
        index: 2,
        title: 'Titan: Methane Seas & Heavy Skies',
        subtitle: 'The only moon with a dense atmosphere and liquid lakes',
        objectSlug: 'titan',
        cameraPreset: 'default',
        scaleNotice: 'Cassini ISS 938-nm near-infrared surface mosaic.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'At Saturn, Titan presents an alien hydrologic cycle. Beneath a thick golden nitrogen smog, liquid methane and ethane rain down onto riverbeds and pool in vast northern seas.',
        keyFact: 'Titan’s surface atmospheric pressure is 50% greater than sea-level pressure on Earth.',
        durationSec: 22,
      },
      {
        index: 3,
        title: 'Enceladus: Cryovolcanic Geysers',
        subtitle: 'Venting the deep ocean directly into space',
        objectSlug: 'enceladus',
        cameraPreset: 'default',
        scaleNotice: 'Cassini ISS high-resolution mosaic of active south polar terrain.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'Tiny Enceladus reflects 99% of sunlight like fresh snow. At its south pole, warm hydrothermal vents blast water vapor and organic molecules through fractures directly into space.',
        keyFact: 'Cassini detected silica nanoparticles and molecular hydrogen in Enceladus’s plumes—signatures of deep hydrothermal vents.',
        durationSec: 22,
      },
      {
        index: 4,
        title: 'Triton: Nitrogen Geysers at 38 Kelvin',
        subtitle: 'A captured Kuiper Belt ocean world orbiting backward',
        objectSlug: 'triton',
        cameraPreset: 'default',
        scaleNotice: 'Voyager 2 encounter imagery (August 1989).',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'At Neptune, Triton orbits in reverse—a captured Kuiper Belt object like Pluto. Even at -235 degrees Celsius, solar warmth beneath its nitrogen ice drives active cryogeysers.',
        keyFact: 'Triton is slowly spiraling toward Neptune and will eventually be shredded into a spectacular ring system.',
        durationSec: 20,
      },
      {
        index: 5,
        title: 'Pluto: Nitrogen Glaciers at the Edge',
        subtitle: 'Active geology at the frontier of the Solar System',
        objectSlug: 'pluto',
        cameraPreset: 'default',
        scaleNotice: 'NASA New Horizons LORRI/MVIC global color mosaic.',
        authenticityTier: 'DATA-BASED',
        narrationScript: 'At the outer edge of the system, Pluto and its binary partner Charon prove that small, distant worlds can sustain active nitrogen glaciers, convective ice plains, and subsurface oceans.',
        keyFact: 'Sputnik Planitia on Pluto is a Texas-sized glacier of frozen nitrogen, carbon monoxide, and methane.',
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
