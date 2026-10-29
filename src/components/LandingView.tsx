import React, { useState } from 'react';
import { ArrowRight, Compass, Eye, Play, SlidersHorizontal } from 'lucide-react';
import { SOLAR_SYSTEM_PLANETS, getObjectBySlug } from '../data/catalog';
import { OBSERVER_CITIES } from '../data/constellationsAndSky';
import { PLANETARIUM_SHOWS } from '../data/showsAndLearning';
import { formatLightTimeFromAu } from '../lib/astronomy';
import { ReadingDepth, UserPreferences } from '../lib/voyageStore';
import { PlanetSceneCanvas } from '../three/PlanetSceneCanvas';
import { AppRoute } from './Header';

interface LandingViewProps {
  preferences: UserPreferences;
  selectedCityId: string;
  onSelectCity: (cityId: string) => void;
  onUpdatePreferences: (patch: Partial<UserPreferences>) => void;
  onNavigate: (route: AppRoute) => void;
  onInspectObject: (slug: string, fromShow?: boolean) => void;
  onStartShow: (showSlug: string) => void;
  onOpenAccessibility: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  preferences,
  selectedCityId,
  onSelectCity,
  onUpdatePreferences,
  onNavigate,
  onInspectObject,
  onStartShow,
  onOpenAccessibility,
}) => {
  const [heroBody, setHeroBody] = useState<'saturn' | 'earth'>('saturn');
  const [previewPlanetSlug, setPreviewPlanetSlug] = useState<string>('saturn');

  const previewPlanet = getObjectBySlug(previewPlanetSlug) || SOLAR_SYSTEM_PLANETS[5];

  return (
    <div className="bg-[#030713] text-[#F7FAFF]">
      {/* Workspace Utility Strip below Top Bar */}
      <div className="border-b border-white/10 bg-[#070D1D]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-[#B8C4DE]">
          <div className="flex flex-wrap items-center gap-2">
            <span>Open Guest Observatory</span>
            <span aria-hidden="true">·</span>
            <span>No Login Required</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Press / anytime to search</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <button
              type="button"
              onClick={() => onNavigate('teachers')}
              className="hover:text-[#F7FAFF] transition-colors whitespace-nowrap shrink-0"
            >
              For Teachers &amp; Classrooms
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onNavigate('compare')}
              className="hover:text-[#F7FAFF] transition-colors whitespace-nowrap shrink-0"
            >
              Compare Worlds
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={onOpenAccessibility}
              className="inline-flex items-center gap-1.5 text-[#79D9ED] hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Motion &amp; Display</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Hero / The Threshold */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[620px]">
          <div className="lg:col-span-6 space-y-6 relative z-10">
            <div className="text-xs font-medium text-[#79D9ED] tracking-wide">
              Interactive Web Planetarium · Verified Astronomy Encyclopedia
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.65rem] font-bold tracking-tight leading-[1.06] text-[#F7FAFF] max-w-xl">
              Your universe awaits.
            </h1>
            <p className="text-base sm:text-lg text-[#B8C4DE] leading-relaxed max-w-xl">
              Step inside a living planetarium. Launch from Earth, inspect worlds in 360 degrees, trace tonight’s constellations, and explore the farthest reaches we can measure—with clear scientific provenance at every stop.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('lobby')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#F7FAFF] text-[#030713] font-semibold text-sm hover:bg-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Enter the Planetarium</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('explore')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-lg border border-white/25 bg-[#0D1526] text-[#F7FAFF] font-semibold text-sm hover:border-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Explore Freely</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('sky')}
                className="px-4 py-3.5 text-sm font-medium text-[#79D9ED] hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                See What’s in the Sky Tonight →
              </button>
            </div>

            <p className="text-xs text-[#7F90B0] pt-1">
              Visuals combine real astronomical ephemerides with labelled data-based 3D simulations. Audio is off by default.
            </p>
          </div>

          {/* Right Column: Live 3D Planetary Viewport Preview */}
          <div className="lg:col-span-6 relative">
            <div className="w-full h-[380px] sm:h-[460px] rounded-2xl border border-white/15 bg-[#060B18] overflow-hidden relative">
              <PlanetSceneCanvas
                mode="hero"
                objectSlug={heroBody}
                isPaused={false}
                reducedMotion={preferences.reducedMotion}
                qualityTier={preferences.qualityTier}
                ariaLabel={`Live 3D preview of ${heroBody === 'saturn' ? 'Saturn and its icy rings' : 'Earth and its Moon'}`}
              />
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 bg-[#080F20]/90 border border-white/15 rounded-xl px-4 py-2.5">
                <div className="text-xs text-[#B8C4DE]">
                  <span className="font-semibold text-[#F7FAFF]">
                    {heroBody === 'saturn' ? 'Saturn · 9.58 AU' : 'Earth · 1.00 AU'}
                  </span>
                  <span className="mx-2 text-white/30">·</span>
                  <span>Data-Based 3D Model</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 p-0.5 rounded-md bg-[#030713] border border-white/10">
                    <button
                      type="button"
                      onClick={() => setHeroBody('saturn')}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${heroBody === 'saturn' ? 'bg-[#79D9ED] text-[#030713]' : 'text-[#B8C4DE] hover:text-white'
                        }`}
                    >
                      Saturn
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroBody('earth')}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${heroBody === 'earth' ? 'bg-[#79D9ED] text-[#030713]' : 'text-[#B8C4DE] hover:text-white'
                        }`}
                    >
                      Earth
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onInspectObject(heroBody)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-md border border-white/20 text-[#F7FAFF] hover:border-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
                  >
                    Orbit in 360° ↗
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Three Complementary Experiences */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-16 lg:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-medium text-[#79D9ED] mb-2">Three Ways to Experience</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7FAFF]">
              Not just knowledge. A new perspective.
            </h2>
          </div>
          <p className="text-sm text-[#B8C4DE] max-w-md">
            Switch effortlessly between guided storytelling, free 360° camera control, and observer sky charts without losing your place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            type="button"
            onClick={() => onInspectObject('saturn')}
            className="group text-left p-7 rounded-2xl border border-white/15 bg-[#0D1526] hover:border-[#79D9ED] transition-colors flex flex-col justify-between min-h-[240px]"
          >
            <div className="flex items-center justify-between text-xs text-[#B8C4DE]">
              <span>01. Lean Forward · 360° Inspection</span>
              <Compass className="w-4 h-4 text-[#79D9ED]" aria-hidden="true" />
            </div>
            <div className="mt-8">
              <h3 className="font-display text-xl font-semibold text-[#F7FAFF] group-hover:text-[#79D9ED] transition-colors">
                Visit a Planet ↗
              </h3>
              <p className="mt-2 text-sm text-[#B8C4DE] leading-relaxed">
                Orbit Saturn’s rings, inspect Jupiter’s Galilean moons, and compare planetary diameters at true physical ratios.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onStartShow('first-flight')}
            className="group text-left p-7 rounded-2xl border border-white/15 bg-[#0D1526] hover:border-[#79D9ED] transition-colors flex flex-col justify-between min-h-[240px]"
          >
            <div className="flex items-center justify-between text-xs text-[#B8C4DE]">
              <span>02. Lean Back · Guided Dome Show</span>
              <Play className="w-4 h-4 text-[#D7B77B]" aria-hidden="true" />
            </div>
            <div className="mt-8">
              <h3 className="font-display text-xl font-semibold text-[#F7FAFF] group-hover:text-[#79D9ED] transition-colors">
                Tour the Cosmos ↗
              </h3>
              <p className="mt-2 text-sm text-[#B8C4DE] leading-relaxed">
                Begin our 7-chapter First Flight show from Earth to the Milky Way. Pause at any chapter to take manual control.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('sky')}
            className="group text-left p-7 rounded-2xl border border-white/15 bg-[#0D1526] hover:border-[#79D9ED] transition-colors flex flex-col justify-between min-h-[240px]"
          >
            <div className="flex items-center justify-between text-xs text-[#B8C4DE]">
              <span>03. Look Up · Live Star Calculation</span>
              <Eye className="w-4 h-4 text-[#9F95F0]" aria-hidden="true" />
            </div>
            <div className="mt-8">
              <h3 className="font-display text-xl font-semibold text-[#F7FAFF] group-hover:text-[#79D9ED] transition-colors">
                Find Your Stars ↗
              </h3>
              <p className="mt-2 text-sm text-[#B8C4DE] leading-relaxed">
                Explore tonight’s sky dome from global cities and distinguish official IAU constellation regions from traditional star lines.
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Section 3: The Solar System at a Glance (Interactive Rail + Preview) */}
      <section className="border-t border-white/10 bg-[#060B18] py-16 lg:py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-medium text-[#D7B77B] mb-2">The Solar System at a Glance</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7FAFF]">
                Eight remarkable worlds around one star.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('explore')}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-white/20 text-[#F7FAFF] hover:border-[#79D9ED] transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              Open 3D Solar System Map ↗
            </button>
          </div>

          {/* 8-Planet Interactive Selector Rail */}
          <div
            role="tablist"
            aria-label="Solar System planets"
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3"
          >
            {SOLAR_SYSTEM_PLANETS.map((planet, index) => {
              const selected = planet.slug === previewPlanet.slug;
              return (
                <button
                  key={planet.slug}
                  role="tab"
                  aria-selected={selected}
                  type="button"
                  onClick={() => setPreviewPlanetSlug(planet.slug)}
                  className={`p-4 rounded-xl border text-left transition-colors ${selected
                      ? 'border-[#79D9ED] bg-[#101C36]'
                      : 'border-white/10 bg-[#0B1324] hover:border-white/30'
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-[#7F90B0]">0{index + 1}</span>
                    <span
                      className="w-5 h-5 rounded-full inline-block"
                      style={{
                        background: `radial-gradient(circle at 32% 30%, ${planet.visual.primaryColor}, ${planet.visual.secondaryColor})`,
                      }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="font-display text-sm font-semibold text-[#F7FAFF] whitespace-nowrap truncate">
                    {planet.name}
                  </div>
                  <div className="font-mono text-[11px] text-[#B8C4DE] mt-0.5 whitespace-nowrap">
                    {planet.metrics.distanceAu?.toFixed(2)} AU
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Planet Lightweight Preview Strip */}
          <div className="mt-5 p-6 sm:p-7 rounded-2xl border border-white/15 bg-[#0D1526] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 space-y-2">
              <div className="text-xs text-[#B8C4DE]">
                <span>{previewPlanet.classification}</span>
                <span className="mx-2 text-white/30">·</span>
                <span className="text-[#79D9ED]">{previewPlanet.authenticityTier}</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-[#F7FAFF]">
                {previewPlanet.name}
              </h3>
              <p className="text-sm text-[#B8C4DE] leading-relaxed">
                {previewPlanet.readingLevels[preferences.readingDepth]}
              </p>
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
              <div>
                <div className="text-xs text-[#7F90B0]">Mean Diameter</div>
                <div className="font-mono text-sm font-semibold text-[#F7FAFF] mt-1">
                  {previewPlanet.metrics.diameterKm.toLocaleString()} km
                </div>
              </div>
              <div>
                <div className="text-xs text-[#7F90B0]">Orbital Period</div>
                <div className="font-mono text-sm font-semibold text-[#F7FAFF] mt-1">
                  {previewPlanet.metrics.orbitalPeriodLabel}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#7F90B0]">Sunlight Travel Time</div>
                <div className="font-mono text-sm font-semibold text-[#D7B77B] mt-1">
                  {formatLightTimeFromAu(previewPlanet.metrics.distanceAu || 1)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#7F90B0]">Known Moons</div>
                <div className="font-mono text-sm font-semibold text-[#F7FAFF] mt-1">
                  {previewPlanet.metrics.moonsCount ?? 0}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex lg:justify-end">
              <button
                type="button"
                onClick={() => onInspectObject(previewPlanet.slug)}
                className="w-full lg:w-auto px-5 py-3 rounded-lg bg-[#79D9ED] text-[#030713] text-xs font-semibold hover:bg-[#9BE4F4] transition-colors whitespace-nowrap shrink-0"
              >
                Inspect {previewPlanet.name} ↗
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Featured Planetarium Shows */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-16 lg:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-medium text-[#79D9ED] mb-2">Inside the Virtual Dome</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7FAFF]">
              Featured planetarium shows.
            </h2>
          </div>
          <p className="text-sm text-[#B8C4DE] max-w-md">
            Captioned by default and interruptible at every stop. Branch out to inspect any world and resume your chapter anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANETARIUM_SHOWS.map((show, idx) => (
            <div
              key={show.slug}
              className="rounded-2xl border border-white/15 bg-[#0D1526] p-7 flex flex-col justify-between"
            >
              <div>
                <div className="text-xs text-[#B8C4DE]">
                  <span>0{idx + 1}. {show.audience}</span>
                  <span className="mx-2 text-white/30">·</span>
                  <span className="font-mono">{show.chapters.length} chapters</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-[#F7FAFF] mt-3">
                  {show.title}
                </h3>
                <p className="text-sm text-[#B8C4DE] leading-relaxed mt-3">
                  {show.summary}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-[#7F90B0]">Captioned · Skippable</span>
                <button
                  type="button"
                  onClick={() => onStartShow(show.slug)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-[#F7FAFF] text-xs font-semibold hover:bg-[#79D9ED] hover:text-[#030713] transition-colors whitespace-nowrap shrink-0"
                >
                  Start Show ↗
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: Sky Tonight + Learning Depth & Scientific Trust */}
      <section className="border-t border-white/10 bg-[#060B18] py-16 lg:py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sky Tonight Manual City Card */}
          <div className="lg:col-span-6 p-7 rounded-2xl border border-white/15 bg-[#0D1526] flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-[#9F95F0] mb-2">Observer Night Sky · Zero Forced Location Prompts</p>
              <h2 className="font-display text-2xl font-bold text-[#F7FAFF]">
                Explore the sky tonight.
              </h2>
              <p className="text-sm text-[#B8C4DE] mt-2 leading-relaxed">
                Select an observatory city manually to calculate local sidereal star positions, Orion’s altitude, and official IAU constellation regions.
              </p>

              <div className="mt-6">
                <label htmlFor="landing-city-select" className="block text-xs font-medium text-[#B8C4DE] mb-2">
                  Observer City Reference
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    id="landing-city-select"
                    value={selectedCityId}
                    onChange={(e) => onSelectCity(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#030713] border border-white/20 text-sm text-[#F7FAFF]"
                  >
                    {OBSERVER_CITIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.region})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => onNavigate('sky')}
                    className="px-5 py-2.5 rounded-lg bg-[#79D9ED] text-[#030713] text-xs font-semibold hover:bg-[#9BE4F4] transition-colors whitespace-nowrap shrink-0"
                  >
                    Open Sky Map ↗
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-[#7F90B0]">
              Featured tonight: Orion (Betelgeuse &amp; Rigel) · Sirius · Pleiades (M45) · Polaris
            </div>
          </div>

          {/* Learning Depth Switcher Card */}
          <div className="lg:col-span-6 p-7 rounded-2xl border border-white/15 bg-[#0D1526] flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-[#79D9ED] mb-2">Adaptive Reading Depth</p>
              <h2 className="font-display text-2xl font-bold text-[#F7FAFF]">
                Learning for every curiosity level.
              </h2>
              <p className="text-sm text-[#B8C4DE] mt-2 leading-relaxed">
                Choose your explanation style across the encyclopedia. Changing reading depth adapts vocabulary and scaffolding—never scientific accuracy.
              </p>

              <div
                role="group"
                aria-label="Reading depth preference"
                className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5"
              >
                {(
                  [
                    { id: 'young', title: 'Young Explorers', sub: 'Ages 7–12 · Clear analogies' },
                    { id: 'curious', title: 'Curious Minds', sub: 'General · Mechanisms & scales' },
                    { id: 'enthusiast', title: 'Enthusiasts', sub: 'Technical · Astrophysics & epochs' },
                  ] as Array<{ id: ReadingDepth; title: string; sub: string }>
                ).map((mode) => {
                  const active = preferences.readingDepth === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => onUpdatePreferences({ readingDepth: mode.id })}
                      aria-pressed={active}
                      className={`p-3.5 rounded-xl border text-left transition-colors ${active
                          ? 'border-[#79D9ED] bg-[#79D9ED]/12 text-[#F7FAFF]'
                          : 'border-white/10 bg-[#070D1D] text-[#B8C4DE] hover:border-white/30'
                        }`}
                    >
                      <div className="text-xs font-semibold text-[#F7FAFF]">{mode.title}</div>
                      <div className="text-[11px] text-[#7F90B0] mt-1">{mode.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[#B8C4DE]">Active across all planet &amp; star panels</span>
              <button
                type="button"
                onClick={() => onNavigate('learn')}
                className="text-[#79D9ED] hover:text-white font-semibold whitespace-nowrap shrink-0"
              >
                Explore Quizzes &amp; Glossary →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Science You Can Trust (Authenticity Tiers) + Liftoff CTA */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-16 lg:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium text-[#D7B77B] mb-2">No Fake Science · Transparent Provenance</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7FAFF]">
              Every scene declares how we know what we see.
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('sources')}
            className="text-xs font-semibold text-[#79D9ED] hover:text-white transition-colors whitespace-nowrap shrink-0 self-start md:self-auto"
          >
            Inspect Scientific &amp; Media Sources Register →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              tier: 'OBSERVED',
              desc: 'Direct telescope or spacecraft electromagnetic measurements (such as multi-wavelength nebula structure). Never faked as orbitable 3D.',
            },
            {
              tier: 'DATA-BASED',
              desc: 'Real-time 3D simulation grounded in measured orbital ephemerides, axial tilts, oblateness, and planetary cartography.',
            },
            {
              tier: 'RECONSTRUCTED',
              desc: 'Scientifically constrained approximation where direct surface imaging is impossible (such as exoplanets or outside the Milky Way).',
            },
            {
              tier: 'ARTISTIC',
              desc: 'Interpretive framing or ambient musical accompaniment clearly distinguished from physical observation.',
            },
          ].map((item) => (
            <div key={item.tier} className="p-5 rounded-xl border border-white/10 bg-[#0B1222]">
              <div className="font-mono text-xs font-semibold text-[#79D9ED]">{item.tier}</div>
              <p className="text-xs text-[#B8C4DE] leading-relaxed mt-2">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Ready for Liftoff Banner */}
        <div className="mt-14 p-8 sm:p-10 rounded-2xl border border-white/15 bg-[#0D1526] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-xs text-[#79D9ED] font-medium">Open Observatory</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7FAFF] mt-1">
              Ready for liftoff? Choose your seat inside the dome.
            </h2>
            <p className="text-sm text-[#B8C4DE] mt-2 max-w-xl">
              Start the beginner-friendly First Flight show, take free control of the Solar System, or launch a projector-ready classroom lesson.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('lobby')}
            className="px-6 py-3.5 rounded-lg bg-[#F7FAFF] text-[#030713] text-sm font-semibold hover:bg-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
          >
            Enter Observatory Lobby ↗
          </button>
        </div>
      </section>

      {/* Clean Institutional Footer */}
      <footer className="border-t border-white/10 py-10 bg-[#030713]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-[#7F90B0]">
          <div className="space-y-1.5 max-w-xl">
            <div className="font-display text-sm font-bold text-[#F7FAFF]">ManicksGalaxy</div>
            <p className="leading-relaxed">
              Interactive web planetarium and source-labelled astronomy encyclopedia. Scientific constants reference NASA NSSDCA, JPL Horizons, ESA Gaia, IAU, and the NASA Exoplanet Archive; no institutional endorsement by NASA or ESA is implied.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[#B8C4DE]">
            <button type="button" onClick={() => onNavigate('lobby')} className="hover:text-white">
              Planetarium
            </button>
            <span aria-hidden="true">·</span>
            <button type="button" onClick={() => onNavigate('compare')} className="hover:text-white">
              Compare Worlds
            </button>
            <span aria-hidden="true">·</span>
            <button type="button" onClick={() => onNavigate('teachers')} className="hover:text-white">
              For Teachers
            </button>
            <span aria-hidden="true">·</span>
            <button type="button" onClick={() => onNavigate('sources')} className="hover:text-white">
              Sources &amp; Licenses
            </button>
            <span aria-hidden="true">·</span>
            <button type="button" onClick={onOpenAccessibility} className="hover:text-white">
              Accessibility
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
