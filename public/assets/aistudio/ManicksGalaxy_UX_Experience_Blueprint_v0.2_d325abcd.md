# ManicksGalaxy — End-to-End Planetarium Experience & UI/UX Blueprint

**Version:** 0.2 — UX expansion of PRD v0.1  
**Date:** 29 October 2026  
**Status:** Product and interaction design proposal; this is a design specification, not a completed scientific simulation.  
**North-star experience:** Arrive curious → enter the planetarium → launch from Earth → explore and learn → finish a guided show → keep discovering.  
**Core promise:** *The universe is not just something you read about. It's somewhere you can explore.*

---

## 1. Product experience vision

ManicksGalaxy is an immersive web planetarium supported by a rigorously sourced interactive astronomy encyclopedia. It combines three complementary experiences: **guided cinematic shows** (lean back), **free 3D exploration** (lean forward), and **structured discovery/learning** (understand what you just saw). Every visitor can switch between them without losing context.

### Experience design principles

1. **Wonder first, understanding always.** Spectacle introduces discovery; facts, context and references give it meaning.
2. **One spatial journey.** Maintain camera/context continuity between overview, object focus, and learning overlay wherever technically possible.
3. **Agency is sacred.** Skip intro, pause animation, reset camera, go home, switch modes, and access search at any time.
4. **Make depth optional.** Child-friendly explanations first; expandable scientific details and source provenance.
5. **No fake science.** Label observed, data-based, reconstructed and artistic scenes. Identify deliberate scale exaggeration.
6. **Desktop immersive, mobile usable.** Full controls where devices support them; fast non-WebGL fallbacks for everything educational.
7. **Inclusive by default.** Captions, keyboard support, touch targets, contrast, reduced motion, no forced audio, no surprise location permission.
8. **Site and app in one product.** Landing, discovery, article, show and classroom pages share a unified identity and navigation.

## 2. Audience and entry intents

| Visitor intent | Entry affordance | Fastest successful outcome |
| --- | --- | --- |
| 'Show me something incredible' | Enter Planetarium | Start an optional guided 8-minute First Flight show |
| 'I want Saturn' | Global search / Explore Planets | Orbit Saturn in ≤3 meaningful actions from landing |
| 'What's in the sky tonight?' | Sky Tonight | See sky map using manually chosen city or voluntary location |
| 'I am teaching the solar system' | For Teachers / Classroom | Start a shareable lesson / presentation view without sign-up |
| 'I want reliable facts' | Encyclopedia | Source-labelled searchable object entry |
| 'I have a slow phone or reduced-motion setting' | Lightweight Experience | Static visual + navigation + all essential content |

No login, audio setup, or onboarding questionnaire is required to start the main experience.

## 3. Full visitor journey: from first pixel to the finale

### Scene 00 — Landing / The invitation

- **Visitor sees:** A realistic-looking Earth or Saturn in a black cosmos, tiny stars, softly lit celestial typography and a minimal navigation bar. A short elegant opening message: **YOUR UNIVERSE AWAITS**.
- **Primary CTAs:** **Enter the Planetarium**; **Explore the Universe**.
- **Secondary action:** **See What's in the Sky Tonight**.
- **Interaction:** Subtle mouse/parallax response on capable devices; use high-quality static art if motion is reduced or the GPU is weak.
- **Purpose:** Inspire immediately, while clearly showing the site is interactive and educational.
- **Do not:** Start sound automatically, block with a forced cutscene, download gigabytes before showing navigation.

### Scene 01 — Observatory lobby / Choose your experience

- A full-width 'virtual dome' with a 180° perspective star canopy. Onscreen cards float unobtrusively below the horizon.
- **Three choices:** **First Flight** (beginner-friendly guided show), **Explore on Your Own**, **Classroom & Group Show**.
- Smaller controls: Narration On/Off (off by default), Captions On/Off (on when narration is used), Motion level, Quality Auto/Low/High, Full screen. Show expected data usage if substantial.
- Small notice: 'Views may combine actual observations, scientific simulations, and labelled artistic reconstructions.'

### Scene 02 — Launch / Earth to orbit

- Smooth, skippable camera sequence: a blue atmospheric rim → Earth in full view → Moon → solar system overview.
- Educational annotations: 'You are viewing Earth from space', 'The Moon orbits Earth', 'Objects are not shown to scale' when applicable.
- **Show controls:** Pause/Resume, Back 15 seconds (within a guided chapter), Chapters, Explore this object, Skip intro, Exit show, Captions.
- On mobile or reduced-motion: discrete cross-fades and optional still frames instead of forced flying movement.

### Scene 03 — Solar system / Your first destinations

- Time controls and highlighted orbit paths; selectable planets. A guided show can steer attention, but the visitor can take over the camera.
- **Reveal:** orbital paths and relative position; a visual scale mode that explicitly differentiates 'True ratios' vs 'Educational spacing'.
- **Branch:** Click Saturn → travel to Saturn; click an info chip → learn fact; return to guided route at the chapter bookmark.

### Scene 04 — Planet encounter / A world you can inspect

- Planet fills much of viewport. Orbit camera: drag, pinch/scroll to zoom, reset, presets 'From above', 'Equator', 'Rings', 'Moons'.
- Facts drawer: Overview / Structure / Atmosphere / Moons / Missions / Sources.
- Context controls: Return to System, Compare with Earth, Continue Show, Bookmark.
- **Data status:** Show whether asset is observed texture, data-based motion or reconstruction.

### Scene 05 — Stars & constellations

- Transition across scale frames (not falsely presented as one continuous, physically proportionate universe). Viewer enters a stellar perspective or realistic Earth-based sky.
- Highlight Orion, the Big Dipper asterism or another verified group, and show line overlay separately from scientific constellation boundaries.
- Star details use catalogue-derived position, magnitude and distance; optional cultural stories clearly attributed.

### Scene 06 — Deep cosmos

- Milky Way structure → nebula/telescope gallery → other galaxies / exoplanet systems with explicit distinction between actual imagery and visualizations.
- Wonder moments can include NASA-licensed footage between interactive scenes; these are not described as freely orbitable 3D.

### Scene 07 — Finale / The universe is vast

- Brief visual montage of encountered destinations; final perspective on scale and light travel time. The tone should convey curiosity, not an inaccurate 'edge of the universe' claim.
- Close with: **You've only seen the beginning.**
- **Actions:** Explore Again, Continue from Saturn, Sky Tonight, Choose Another Journey, View My Voyage.

### Scene 08 — My Voyage / Meaningful completion

- Guest-only, locally stored souvenir: visited destinations, chapters completed, 3 remembered facts, 'next mission'. Optional printable classroom recap.
- No personally identifying information required. No child profiles needed for initial release.
- Returning visitors may start from their last location or selected discovery card.

## 4. Sitemap: comprehensive page inventory

### Global public site / discovery

| URL | Page / template | User purpose | Priority |
| --- | --- | --- | --- |
| `/` | Cinematic Landing / Home | Understand value and enter | P0 |
| `/enter` | Planetarium Lobby | Choose how to experience | P0 |
| `/shows` | Planetarium Shows | Browse narrated journeys | P0 |
| `/shows/first-flight` | First Flight Guided Show | End-to-end beginner journey | P0 |
| `/shows/[slug]` | Reusable Show Player | Guided chapter experience | P1 |
| `/explore` | Universe Explorer / Mission Control | Search & choose a destination | P0 |
| `/explore/solar-system` | Solar System Explorer | Spatial overview | P0 |
| `/explore/planets` | Planet Directory | Filter and browse planets | P0 |
| `/explore/galaxies` | Galaxy Directory | Browse deep-sky highlights | P1 |
| `/explore/nebulae` | Nebula Gallery | Explore real observation media | P1 |
| `/explore/exoplanets` | Exoplanet Discovery | Search verified exoplanet data | P1 |
| `/explore/constellations` | Constellation Atlas | Explore 88 official constellations | P0/P1 |
| `/object/[slug]` | Celestial Object Detail | 360° viewer + encyclopedia | P0 |
| `/sky-tonight` | Night Sky Viewer | Sky at chosen location/time | P1 |
| `/compare` | Compare Worlds | Compare radius, mass, day, gravity | P1 |
| `/timeline` | Cosmic / Solar Time Machine | Historical or orbital timeline | P1 |
| `/missions` | Spacecraft / Mission Directory | Browse verified missions | P2 |
| `/missions/[slug]` | Mission Detail | Missions, diagrams, footage, chronology | P2 |

### Learning, schools and support

| URL | Page / template | User purpose | Priority |
| --- | --- | --- | --- |
| `/learn` | Learning Hub | Concepts by subject & age | P0 |
| `/learn/topics/[slug]` | Interactive Lesson | Learn a focused astronomy concept | P1 |
| `/learn/quizzes/[slug]` | Quiz / Challenge | Test understanding | P1 |
| `/glossary` | Astronomy Glossary | Explain scientific vocabulary | P1 |
| `/for-teachers` | Educator Portal | Ready-to-present lesson collections | P1 |
| `/for-teachers/lesson/[slug]` | Teacher Lesson Plan | Objectives, steps and links | P1 |
| `/my-voyage` | Voyage Passport | View exploration recap | P0 |
| `/collections` | Curated Collections | Save thematic discoveries | P1 |
| `/search` | Global Search Results | Find all objects and learning content | P0 |
| `/about` | Project About | Mission and approach | P1 |
| `/sources` | Scientific & media sources | Credibility, methodology, rights | P0 |
| `/accessibility` | Accessibility & motion controls | Inclusive access / help | P0 |
| `/help` | Controls and Help | Explain how to navigate | P0 |

**Template strategy:** 30 URL patterns do *not* require 30 unique page designs. Reuse ~9 core templates: Landing, Lobby, Show Player, Explorer, Directory, Object Detail, Article/Lesson, Classroom, Passport/Utility.

## 5. Navigation system & global UI

**Desktop header:** `ManicksGalaxy` logo | `Planetarium` | `Explore` | `Sky Tonight` | `Learn` | `For Teachers` | search icon | accessibility/settings.

**Mobile:** brand + Search + Menu; primary experiences surfaced as bottom navigation when in exploration mode (`Universe`, `Journeys`, `Discover`, `My Voyage`) with a back/exit affordance.

**Immersive viewer HUD:** corner logo/home and exit, current destination breadcrumb, short floating facts panel, unobtrusive camera and time tray, show controls only when relevant. Auto-hide nonessential controls in presentation mode, show them on movement/keyboard focus/tap.

**Search:** debounced results by Planets / Stars / Constellations / Galaxies / Lessons; suggested queries like 'Saturn', 'Orion', 'black holes'. Support keyboard shortcut `/` or Ctrl+K if it doesn't conflict with accessibility.

**Persistent preferences:** local storage for narration, captions, reduced motion, text size, quality tier and last destination (respect privacy settings). Never override OS reduced-motion without explicit user preference.

## 6. Landing page — detailed section-by-section specification

1. **Navigation:** translucent/nav-on-dark header; logo, menu, search, accessible settings. Darken background as needed for contrast.
2. **Hero / The threshold:** 65–100svh area. Huge planet occupying right/center; controlled star depth; headline **YOUR UNIVERSE AWAITS** and copy **Step inside a living planetarium. Travel from Earth to the farthest worlds we can study.** Primary **Enter the Planetarium**; secondary **Explore Freely**. 'Scroll to discover' indicator. Optional tiny 'Visuals are simulations' notice.
3. **What can you explore?** Three illustrated action cards: **Visit a Planet**, **Tour the Cosmos**, **Find Your Stars**. Actual links with relevant preview states.
4. **The Solar System at a Glance:** slim interactive horizontal planet rail; highlight on hover/focus/tap; clicking changes a preview, not an enormous heavy scene until user chooses 'Inspect'.
5. **Featured Planetarium Shows:** 3–4 editorial cards with title, age/difficulty, accessibility labels, and approximate duration; e.g. First Flight, Journey to Saturn, Our Changing Night Sky, Galaxies Beyond. Avoid presenting proposed durations as timed verified assets.
6. **A Moment of Wonder:** high-impact full-bleed telescope image/scene with a brief, sourced fact + 'Explore the story'. Provide media credits.
7. **Explore the Sky Tonight:** manually selected city or optional geolocation, date/time, three visible highlights, 'Open Sky Map'. No default permission prompt.
8. **Learning for Everyone:** quick mode cards **Young Explorers**, **Curious Minds**, **Classroom**; complexity choice changes language and scaffolding, not scientific facts.
9. **Science you can trust:** Observed vs data-based vs reconstructed explainer; NASA/ESA/data-source attribution only, no false institutional partnership.
10. **Next Journey CTA:** return to a full-width 'Begin your journey' banner.
11. **Footer:** Site map, sources and media licenses, privacy, accessibility, contact/about, support/help, copyright for original product work.

**Landing success conditions:** clear value in first viewport; primary CTA works without login; mobile visitors can find search; no forced audio or autoplay flashing; content remains accessible before 3D finishes loading.

### Landing wireframe (desktop)

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ ✦ ManicksGalaxy    Planetarium  Explore  Sky Tonight  Learn  For Teachers     Search  ⚙ │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  DISCOVER THE COSMOS                         [Large cinematic Earth/Saturn render]       │
│  YOUR UNIVERSE AWAITS.                              ⭘                                 │
│  Step inside a living planetarium.                                                       │
│  [ ENTER THE PLANETARIUM ]  [ EXPLORE FREELY ]                                           │
│                                                        Scroll to discover ↓              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│   VISIT A PLANET               TOUR THE COSMOS             FIND YOUR STARS                 │
│   [planet preview]             [galaxy preview]           [constellation preview]          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  THE SOLAR SYSTEM AT A GLANCE                 ☿  ♀  ⊕  ♂  ♃  ♄  ♅  ♆                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  FEATURED PLANETARIUM SHOWS                        [Journey cards with Start action]      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  THE SKY TONIGHT                      [City selector] [Date] [Open Sky Map]               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  LEARN AT YOUR OWN PACE   Young Explorers / Curious Minds / For Teachers                  │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                        [ READY FOR LIFTOFF? ENTER NOW ]                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## 7. Planetarium Lobby specification

- **Visual:** Immersive domed stars and glowing horizon; three elegant experience cards centered, with atmospheric low-chrome HUD.
- **Card 1:** First Flight — introductory narrated/captioned show, great for first-timers.
- **Card 2:** Free Exploration — open navigation/map immediately.
- **Card 3:** Classroom Show — presenter mode with lesson checkpoints and clean projection view.
- **Optional preferences:** Narration, captions, motion, quality. All adjustable later.
- **Safety:** Exit and 'Skip' visible; no flashing, strobe, sudden sound or vestibular-inducing camera spin.

## 8. Immersive show player: controls and state transitions

### Show stages

`Ready → Loading preview → Playing → Paused / Exploring object → Resuming chapter → Finale → Voyage summary`

### Universal bottom player

`Chapter title + progress | Previous | Play/Pause | Next | Explore This | Chapters | Captions | Exit`

- Pressing **Explore This** saves chapter timestamp and camera destination; switch to object viewer with visible **Return to Show**.
- **Chapter menu** provides random access and learning summary, never only 'next'.
- Pause automatically on tab hidden if narration/video; preserve sync state.
- Keyboard: Space pause/resume if safe, arrows navigate selected controls (not blanket canvas key traps), Esc dismiss overlay or presentation view, Tab all controls.
- 'Time travel' applies only where astronomy model supports a valid time range; don't imply scientific precision for arbitrary galaxy motion.
- Avoid forcing the user to watch travel transitions; every camera journey is skippable.

## 9. Object/planet detail page UI

**Desktop split:** 70–75% immersive canvas (adaptive) and 25–30% collapsible info drawer. On mobile, full-screen object with a bottom sheet. A control strip floats below the object when it doesn't obscure key visuals.

**Object page hierarchy**

1. Eyebrow: `GAS GIANT · SOLAR SYSTEM` + visual authenticity badge.
2. Giant title: `SATURN`, short learning hook and distance context.
3. **Explore** actions: orbit drag, zoom, camera presets, reset, labels on/off, real/educational scale toggle.
4. Info tabs: `Overview`, `Atmosphere`, `Rings`, `Moons`, `Missions`, `Sources` (only relevant tabs on other objects).
5. Fact tiles: diameter, length of day, orbital period, gravity (sourced and unit-aware).
6. Related links: `Compare with Earth`, `See Titan`, `Start Saturn Journey`, `Back to Solar System`.
7. Teacher mode: key concepts, misconception warnings, printable snapshot (licensed assets considered).

### Object screen wireframe

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│ ← SOLAR SYSTEM   /   SATURN                          SEARCH      CAMERA       EXIT │
├─────────────────────────────────────────────────────┬─────────────────────────────┤
│                                                     │ SATURN                      │
│                                                     │ Gas giant · Data-based      │
│           [3D, orbitable Saturn scene]               │ [Overview] [Rings] [Moons]  │
│                                                     │ One compelling introduction │
│                                                     │ Key facts                   │
│                                                     │ [Compare] [Visit Titan]     │
├─────────────────────────────────────────────────────┤ [Sources / media credits]   │
│ [Orbit] [Zoom] [Ring edge] [Top view] [Reset] [Scale]│                             │
└─────────────────────────────────────────────────────┴─────────────────────────────┘
```

## 10. Additional critical screens

### Explorer / Mission Control

- Full universe navigator with search, recent destinations, curated category portals and controlled zoom across **named scale bands** (planetary / stellar / galactic / cosmic web). Labeled scale jumps are allowed; false 'truly continuous scale' is not.
- Map layers: names, orbits, constellations, mission paths, scientific catalogues; default uncluttered.

### Sky Tonight

- Star chart with date/time, manual location and optional geolocation. Highlights upcoming/rising objects within known prediction boundaries, never claim precise sighting through weather/clouds unless integrated with up-to-date weather service.
- Toggles for stars, planets, constellations, asterisms, magnitude and cardinal directions; provide non-canvas event list.

### Constellation detail

- Earth-observer sky chart + isolated constellation artwork, member stars and mythology/cultural variants sourced. Distinguish IAU-defined sky regions from informal line drawings.

### Learning Hub

- Concept-first paths: Solar System Basics, Stars & Lifecycles, Galaxies, Night Sky, Space Exploration, Gravity/Orbits, Light and Time. Age/depth chips; quick experiments and quizzes; accessible text alternative.

### Teacher Portal

- Lessons that tie an objective to a chosen scene; one-click presentation mode, classroom-safe show control, checkpoints, discussion questions, and downloadable handouts in later phase. Avoid mandatory student accounts.

### Voyage Passport / End screen

- Journey map, places visited, short verified fact highlights, learning badges earned for educational actions (not meaningless engagement). Guest local storage and 'Clear data' control.

## 11. Visual design system

**Art direction:** Observationally grounded astronomy + museum-quality editorial design + premium cinematic interface. Avoid sci-fi weapons/ship cockpit chrome or gratuitous neon.

| Token | Proposal | Why |
| --- | --- | --- |
| `--bg-space` | `#030713` | Primary deep space |
| `--surface` | `#101729` | Cards / drawers |
| `--surface-glass` | translucent navy | Overlays without obscuring object |
| `--text-primary` | `#F7FAFF` | Main labels |
| `--text-secondary` | `#B8C4DE` | Secondary information |
| `--accent-cyan` | `#79D9ED` | Interactive links and map focus |
| `--accent-orbit` | `#D7B77B` | Solar / exploration accent |
| `--accent-violet` | `#9F95F0` | Deep-space distinction |
| `--success` | `#9FDFB6` | Confirmed result |
| `--border` | `rgba(220,235,255,.14)` | Subtle card definition |

**Typography:** Editorial title font such as Space Grotesk/Manrope (license review), paired with highly legible UI type such as Inter. Responsive fluid headings, minimum comfortably readable text, generous line-height and no long fine-print over detailed images. Use established minimum contrast thresholds.

**Composition:** Large planetary hero, 12-column desktop grid, modest glass panels, generous whitespace, restrained glowing halos, subtle linework suggesting orbital paths. UI overlays must not cover important science details.

**Components:** `CosmicHeader`, `MegaSearch`, `PlanetHero`, `JourneyCard`, `WorldCard`, `StoryChapter`, `DomeCanvas`, `CameraToolbar`, `KnowledgeDrawer`, `PlanetariumControls`, `ScaleLegend`, `ObjectBadge`, `SourceDrawer`, `LearningModeSelect`, `ConstellationOverlay`, `PassportCard`, `QualityPicker`, `AccessibilityPanel`.

## 12. Motion and sound direction

### Motion choreography

| Trigger | Motion response | Platform responsibility |
| --- | --- | --- |
| Home opens | Subtle planet rotation and star twinkle | WebGL scene / composited CSS |
| Hover card | Small lift / rim highlight, no full-screen shake | Motion |
| Tap Enter Planetarium | Circular iris-to-space or restrained crossfade | Motion + router |
| Start show | Camera transition around actual objects, not a video masquerading as interactive scene | React Three Fiber |
| Click planet | Fly-to with time/scale transition label; interruptible | Three.js camera rig |
| Open facts | Drawer slides/fades without pausing rotation unless requested | Motion |
| Reveal constellation | Lines draw gradually while actual star markers remain stable | Three.js + Motion overlay |
| Finish journey | Camera pulls back / postcard recap appears | Three.js + Motion |
| Reduced motion | Discrete cuts, fades, static illustrations | Accessible variant |

**Timing guidance:** UI feedback 120–250 ms, large drawer transitions 250–450 ms; long camera journeys should be user-controlled or skippable rather than hard-timed. Smoothness matters more than dramatic duration.

**Audio:** No autoplay. Optional original/licensed orchestral ambient soundtrack, spatial sound only if it enhances comprehension; mute available everywhere. Optional voiceover + synchronized captions. No claim that sound travels through a vacuum; soundtrack is an artistic accompaniment.

## 13. Responsive and fallback UX

- **Desktop:** Full 3D viewport, side drawers, extensive camera presets and keyboard support.
- **Tablet:** Canvas with slide-over facts drawer; touch pinch/orbit; show controls dock.
- **Mobile:** Simpler LOD, bottom sheets, larger touch targets, constrained camera controls, 'Focus' action; content-first when GPU underpowered.
- **Low-spec / no WebGL:** Static image or short video with accessible factual summaries; quiz and encyclopedia fully functional.
- **Loading:** Skeleton/fact preview first; meaningful % only if asset pipeline can calculate it; allow cancel.
- **Failures:** Scene fails → retry / lower-quality / read article. Location denied → manual city input. NASA API unavailable → versioned cached data + last-updated note.
- **School networks:** Compressed media, limited third-party scripts, optional low-bandwidth mode, no required login.

## 14. Accessibility, child safety and trust gates

1. Accessible global navigation, proper semantic headings and landmarks, visible focus and skip link.
2. All control functionality operable with mouse/touch/keyboard where feasible; alternative text workflows for 3D-only gestures.
3. Reduced motion must affect page transitions and 3D flight sequences; optional still experience.
4. Captions and transcripts for all educational narration; no essential educational content only in audio.
5. Never force geolocation, microphone, headset or personal account before exploration.
6. Age-appropriate language; no user-generated public chat for MVP; child guest browsing by default.
7. Source and license for every significant image/model, authenticity tier and deliberate scale change visible.
8. Avoid making visitors believe they landed on real filmed exoplanet terrain when it is reconstructed.
9. High color contrast and font size settings; visually obvious control names rather than unlabeled icons only.

## 15. MVP release slices (prioritized)

**Slice A — irresistible entry + real core interaction:**
- Cinematic, responsive landing page (all primary sections, lightweight previews).
- Planetarium Lobby with working paths and accessible settings.
- Solar System Explorer, verified Saturn 360° viewer, source-labelled encyclopedia drawer.
- 3–5 chapter 'First Flight' with play/pause/skip/exit and return-to-show behavior.
- Global search, fallback article views, initial voyage recap.

**Slice B — learning and larger content:**
- Full eight-planet explorer and dedicated object entries; selected moons.
- All 88 constellation entries with featured interactive examples; Sky Tonight.
- Learning Hub and quiz mini modules; teacher classroom mode.
- Four editorial journeys, Compare Worlds and more faithful time controls.

**Slice C — broad universe:**
- Deep-space, galaxy, nebula and exoplanet galleries, cinematic clips with individual rights attribution.
- Additional educational journeys, favorites/collections, advanced data overlays.
- Richer mobile performance tiers and optional WebXR after feasibility testing.

The dates/durations/quantities in product planning are targets; validate with team and technical profiling, not guarantees.

## 16. Page-level acceptance criteria

**Landing**: A new visitor understands the product within a few seconds; can click Planetarium / Explore / Search on desktop and mobile; no audio starts without consent; first meaningful content is available before 3D assets load.

**Lobby**: All three modes navigate to working destinations; user can skip settings; keyboard and touch work; preferences persist responsibly.

**Guided show**: Pause/resume, skip, chapter jump, Explore This, Return to Show and Exit work; captions sync when audio enabled; motion-limited variant exists; chapter progress recovers after interruption.

**Planet viewer**: Full horizontal camera revolution, vertical orbit/pitch limits, zoom, reset, named camera presets and sourced facts all work; correct texture/source label; no false scale claim.

**Explorer**: Visitors can search and select any available MVP planet, follow its route to object view, and return to the correct explorer context.

**Learning**: All featured goals have text equivalents and an understandable answer; sources are available; no quiz requires precise timing or difficult movement.

**Recap**: End-screen shows visited chapters and a few learned facts; visitor can explore next without logging in; local saved record can be cleared.

**Performance**: Test at least desktop integrated GPU, mid-range phone, high-end phone, poor-network and disabled-WebGL; dynamic quality selection avoids crashing or a permanently black canvas.

## 17. Product measurements

- First meaningful interactive choice / first successful planet-orbit / first sourced fact revealed.
- Click-through Landing → Lobby → Started show, plus Landing → Explore.
- Chapter start/completion, pauses/skips/returns, meaningful educational interactions.
- Search success, exit/back behavior, errors and falls back to text.
- School and mobile accessibility failures and reduced-motion feature parity.
- Rights-provenance coverage and scientific review completeness.
- Respect children's privacy; avoid individualized behavioral tracking for children and use aggregated privacy-safe site quality analytics after legal review.

## 18. Implementation guidance and references

The UI layer should use Next.js + React + TypeScript; Motion handles nav and overlays, while Three.js + React Three Fiber handles interactive celestial rendering. Astronomy calculations need documented data frames and source provenance. Use a shared route-aware scene state (e.g. destination, camera mode, scene scale, active chapter) to connect the explorer and show player. Keep cinematic NASA/ESA media distinct from real-time control.

**UX benchmarks to study — inspiration, not assets to copy:**
- NASA's Eyes hub: https://science.nasa.gov/eyes/ — real-data 3D exploration and mission journeys.
- NASA's Eyes on the Solar System: https://eyes.nasa.gov/apps/solar-system/ — follow, time, orbit and mission-layer interaction concepts.
- Stellarium Web: https://stellarium-web.org/ — sky chart and observer viewpoint interaction patterns.

**Asset and rights plan:** See `ManicksGalaxy_PRD_v0.1.md` and `ManicksGalaxy_Asset_Source_Register.csv`; retain originals and source/license metadata. NASA/ESA affiliation must not be implied merely because their media or data is used.

---

## 19. The differentiator

The competitive idea is not a larger catalogue or more elaborate space wallpaper. It is **a coherent museum-grade journey connecting planetarium storytelling, interactive 360° exploration, a trustworthy encyclopedia, and school-friendly learning** within one intuitive experience.

Every important screen answers one of three questions: **Where can I go? What am I seeing? What can I learn?**
