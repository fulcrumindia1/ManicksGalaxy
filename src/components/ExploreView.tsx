import React, { useMemo, useRef, useState } from 'react';
import {
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Scale,
  Search,
} from 'lucide-react';
import { CELESTIAL_CATALOG, CelestialCategory } from '../data/catalog';
import { useFullscreen } from '../lib/useFullscreen';
import { UserPreferences } from '../lib/voyageStore';
import { PlanetSceneCanvas } from '../three/PlanetSceneCanvas';
import { AppRoute } from './Header';

interface ExploreViewProps {
  preferences: UserPreferences;
  onInspectObject: (slug: string) => void;
  onNavigate: (route: AppRoute) => void;
}

type CategoryFilter = 'all' | CelestialCategory;

export const ExploreView: React.FC<ExploreViewProps> = ({
  preferences,
  onInspectObject,
  onNavigate,
}) => {
  const [viewTab, setViewTab] = useState<'directory' | 'solar-map'>('solar-map');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState<string>('');
  const [orbitsPaused, setOrbitsPaused] = useState<boolean>(false);
  const [scaleMode, setScaleMode] = useState<'educational' | 'true-ratios' | 'distance-scale'>('educational');
  const [timeSpeed, setTimeSpeed] = useState<number>(30);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [highlightedSlug, setHighlightedSlug] = useState<string>('saturn');

  const solarMapContainerRef = useRef<HTMLDivElement | null>(null);
  const {
    isFullscreen,
    isCinematic,
    toggleFullscreen,
    toggleCinematic,
    exitFullscreen,
  } = useFullscreen(solarMapContainerRef, { enableKeyboardShortcut: true });

  const filteredObjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CELESTIAL_CATALOG.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.classification.toLowerCase().includes(q) ||
        item.hook.toLowerCase().includes(q) ||
        (item.aliases || []).some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [categoryFilter, query]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#030713] text-[#F7FAFF]">
      {/* Mission Control Header & Mode Switcher */}
      <div className="border-b border-white/10 bg-[#070D1D]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-[#79D9ED]">
              Mission Control · Named Scale Bands (Planetary · Stellar · Galactic)
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F7FAFF] mt-1">
              Universe Explorer
            </h1>
            <p className="text-sm text-[#B8C4DE] mt-1.5 max-w-2xl">
              Navigate the 3D Solar System orbital plane or browse verified encyclopedia records across planets, moons, nebulae, and exoplanets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#030713] border border-white/15">
              <button
                type="button"
                onClick={() => setViewTab('solar-map')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${viewTab === 'solar-map'
                  ? 'bg-[#79D9ED] text-[#030713]'
                  : 'text-[#B8C4DE] hover:text-white'
                  }`}
              >
                3D Solar System Map
              </button>
              <button
                type="button"
                onClick={() => setViewTab('directory')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${viewTab === 'directory'
                  ? 'bg-[#79D9ED] text-[#030713]'
                  : 'text-[#B8C4DE] hover:text-white'
                  }`}
              >
                Encyclopedia Directory ({CELESTIAL_CATALOG.length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('compare')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-white/20 bg-[#0D1526] text-xs font-semibold text-[#F7FAFF] hover:border-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
            >
              <Scale className="w-3.5 h-3.5 text-[#D7B77B]" aria-hidden="true" />
              <span>Compare Worlds</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode A: Interactive 3D Solar System Orbital Map */}
      {viewTab === 'solar-map' && (
        <section className={`${isFullscreen ? 'p-0' : 'max-w-[1280px] mx-auto px-4 sm:px-6 py-6'}`}>
          <div
            ref={solarMapContainerRef}
            data-testid="solar-map-stage"
            className={`transition-all overflow-hidden relative ${isFullscreen
              ? 'fixed inset-0 z-50 rounded-none border-0 w-screen h-screen bg-[#030713]'
              : 'rounded-2xl border border-white/15 bg-[#060B18] h-[520px] sm:h-[600px] shadow-2xl'
              }`}
          >
            <PlanetSceneCanvas
              mode="solar-system"
              objectSlug={highlightedSlug}
              isPaused={orbitsPaused || preferences.reducedMotion}
              reducedMotion={preferences.reducedMotion}
              showScienceLabels={showLabels}
              scaleMode={scaleMode}
              timeSpeedDaysPerSec={timeSpeed}
              qualityTier={preferences.qualityTier}
              onSelectObject={(slug) => onInspectObject(slug)}
              ariaLabel="Interactive 3D Solar System orbital map with Sun, 8 planets, and Asteroid Belt"
            />

            {/* Top-left transparent scale honesty notice */}
            {!isCinematic && (
              <div className="absolute top-4 left-4 z-10 pointer-events-none bg-[#050B1A]/90 border border-white/15 rounded-xl px-4 py-2.5 max-w-md shadow-lg">
                <div className="text-xs font-semibold text-[#F7FAFF]">
                  Heliocentric Ecliptic Overview · DATA-BASED
                </div>
                <p className="text-[11px] text-[#B8C4DE] mt-0.5">
                  {scaleMode === 'educational'
                    ? 'Educational spacing & compressed planet radii active so rocky worlds remain visible alongside Jupiter and Saturn.'
                    : scaleMode === 'true-ratios'
                      ? 'True Planet-to-Planet Radius Ratios active (Jupiter 11× Earth); orbital distances remain compressed to fit viewport.'
                      : 'Distance to Scale active: orbits proportionally spaced by AU distance (0.39 AU to 30.1 AU). Zoom out to see outer giants.'}
                </p>
              </div>
            )}

            {/* Top-right Fullscreen & Cinematic Action Buttons */}
            {!isCinematic ? (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5 rounded-xl bg-[#030713]/80 backdrop-blur-md border border-white/20 shadow-lg">
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit Fullscreen (Esc or F)' : 'Fullscreen Orrery (F)'}
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Solar System'}
                  className="p-2 rounded-lg text-[#B8C4DE] hover:text-white hover:bg-white/10 transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4 text-[#79D9ED]" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={toggleCinematic}
                  title="Cinematic Mode (C) - Hide UI overlays"
                  aria-label="Toggle Cinematic Mode"
                  className="p-2 rounded-lg text-[#B8C4DE] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="absolute top-4 right-4 z-30 pointer-events-auto">
                <button
                  type="button"
                  onClick={toggleCinematic}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#030713]/85 backdrop-blur-md border border-white/20 text-xs text-[#B8C4DE] hover:text-white transition-all shadow-lg"
                >
                  <EyeOff className="w-3.5 h-3.5 text-[#79D9ED]" />
                  <span>Cinematic Mode · Tap or press [C] to restore controls</span>
                </button>
              </div>
            )}

            {/* Bottom Unified Control Dock */}
            {!isCinematic && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[min(940px,94%)] bg-[#091224]/95 backdrop-blur-md border border-white/15 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOrbitsPaused((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7FAFF] text-[#030713] text-xs font-semibold hover:bg-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
                  >
                    {orbitsPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    <span>{orbitsPaused ? 'Play Orbits' : 'Pause Orbits'}</span>
                  </button>

                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#030713] border border-white/10 text-xs">
                    <label htmlFor="orbit-speed-slider" className="text-[#B8C4DE] whitespace-nowrap">
                      Speed: <span className="font-mono text-[#F7FAFF]">{timeSpeed} d/s</span>
                    </label>
                    <input
                      id="orbit-speed-slider"
                      type="range"
                      min={1}
                      max={365}
                      value={timeSpeed}
                      onChange={(e) => setTimeSpeed(Number(e.target.value))}
                      className="w-24 accent-[#79D9ED]"
                      title="Adjust orbital speed (1 to 365 days/second)"
                    />
                    <div className="flex items-center gap-1 border-l border-white/10 pl-1.5 ml-0.5">
                      <button
                        type="button"
                        onClick={() => setTimeSpeed(15)}
                        className={`px-1.5 py-0.5 text-[10px] rounded ${timeSpeed === 15 ? 'bg-[#79D9ED] text-[#030713] font-bold' : 'text-[#B8C4DE] hover:text-white'}`}
                      >
                        1×
                      </button>
                      <button
                        type="button"
                        onClick={() => setTimeSpeed(60)}
                        className={`px-1.5 py-0.5 text-[10px] rounded ${timeSpeed === 60 ? 'bg-[#79D9ED] text-[#030713] font-bold' : 'text-[#B8C4DE] hover:text-white'}`}
                      >
                        4×
                      </button>
                      <button
                        type="button"
                        onClick={() => setTimeSpeed(365)}
                        className={`px-1.5 py-0.5 text-[10px] rounded ${timeSpeed === 365 ? 'bg-[#79D9ED] text-[#030713] font-bold' : 'text-[#B8C4DE] hover:text-white'}`}
                      >
                        1yr/s
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setScaleMode((prev) =>
                        prev === 'educational'
                          ? 'true-ratios'
                          : prev === 'true-ratios'
                            ? 'distance-scale'
                            : 'educational'
                      )
                    }
                    className="px-3 py-1.5 rounded-lg border border-white/15 bg-[#0D1526] text-xs font-medium text-[#F7FAFF] hover:border-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
                  >
                    Scale:{' '}
                    {scaleMode === 'educational'
                      ? 'Educational Spacing'
                      : scaleMode === 'true-ratios'
                        ? 'True Planet Ratios'
                        : 'Distance to Scale'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLabels((prev) => !prev)}
                    aria-pressed={showLabels}
                    className="px-3 py-1.5 rounded-lg border border-white/15 bg-[#0D1526] text-xs font-medium text-[#B8C4DE] hover:text-white transition-colors whitespace-nowrap shrink-0"
                  >
                    Axes: {showLabels ? 'On' : 'Off'}
                  </button>
                </div>

                {/* Quick Fly-To Planet Selector & Fullscreen Toggle */}
                <div className="flex items-center gap-2">
                  <label htmlFor="quick-planet-jump" className="text-xs text-[#B8C4DE] whitespace-nowrap">
                    Inspect World:
                  </label>
                  <select
                    id="quick-planet-jump"
                    value={highlightedSlug}
                    onChange={(e) => setHighlightedSlug(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#030713] border border-white/20 text-xs text-[#F7FAFF]"
                  >
                    <option value="sun">The Sun</option>
                    <option value="mercury">Mercury</option>
                    <option value="venus">Venus</option>
                    <option value="earth">Earth</option>
                    <option value="mars">Mars</option>
                    <option value="jupiter">Jupiter</option>
                    <option value="saturn">Saturn</option>
                    <option value="uranus">Uranus</option>
                    <option value="neptune">Neptune</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => onInspectObject(highlightedSlug)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#79D9ED] text-[#030713] text-xs font-semibold hover:bg-[#9BE4F4] transition-colors whitespace-nowrap shrink-0"
                  >
                    Open 360° ↗
                  </button>

                  {isFullscreen && (
                    <button
                      type="button"
                      onClick={exitFullscreen}
                      className="ml-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/40 text-red-300 border border-red-500/30 hover:bg-red-900/50"
                    >
                      Exit Fullscreen
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Encyclopedia Directory & Filter Controls (always visible below or in Directory tab) */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 pb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Functional Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filter celestial catalog by category"
            className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#0D1526] border border-white/15"
          >
            {(
              [
                { id: 'all', label: 'All Destinations' },
                { id: 'planet', label: '8 Planets' },
                { id: 'moon-dwarf', label: 'Moons & Dwarf Planets' },
                { id: 'galaxy-nebula', label: 'Galaxies & Nebulae' },
                { id: 'exoplanet', label: 'Exoplanets' },
              ] as Array<{ id: CategoryFilter; label: string }>
            ).map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={categoryFilter === tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${categoryFilter === tab.id
                  ? 'bg-[#79D9ED] text-[#030713] font-semibold'
                  : 'text-[#B8C4DE] hover:text-white'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <label htmlFor="explore-filter-input" className="sr-only">
              Filter destinations by name or type
            </label>
            <Search
              className="w-4 h-4 text-[#7F90B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="explore-filter-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter worlds, moons, M42..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#0D1526] border border-white/15 text-sm text-[#F7FAFF] placeholder:text-[#7F90B0]"
            />
          </div>
        </div>

        {filteredObjects.length === 0 ? (
          <div className="p-12 rounded-2xl border border-white/10 bg-[#0D1526] text-center">
            <p className="text-sm text-[#B8C4DE]">
              No catalog destinations match “{query}”.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setCategoryFilter('all');
              }}
              className="mt-3 px-4 py-2 rounded-lg border border-white/20 text-xs font-semibold text-[#79D9ED] hover:text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredObjects.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => onInspectObject(item.slug)}
                className="group text-left p-6 rounded-2xl border border-white/15 bg-[#0D1526] hover:border-[#79D9ED] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-[#B8C4DE] truncate">
                      <span>{item.scaleBand}</span>
                      <span className="mx-1.5 text-white/30">·</span>
                      <span className="font-mono text-[#79D9ED]">{item.authenticityTier}</span>
                    </div>
                    <span
                      className="w-6 h-6 rounded-full shrink-0"
                      style={{
                        background: `radial-gradient(circle at 32% 30%, ${item.visual.primaryColor}, ${item.visual.secondaryColor})`,
                      }}
                      aria-hidden="true"
                    />
                  </div>

                  <h2 className="font-display text-xl font-bold text-[#F7FAFF] mt-3 group-hover:text-[#79D9ED] transition-colors">
                    {item.name}
                  </h2>
                  <p className="text-xs text-[#7F90B0] mt-0.5">{item.classification}</p>
                  <p className="text-sm text-[#B8C4DE] leading-relaxed mt-3">
                    {item.hook}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="font-mono text-[#B8C4DE]">{item.metrics.diameterLabel.split('(')[0].trim()}</span>
                  <span className="font-semibold text-[#79D9ED] group-hover:translate-x-0.5 transition-transform">
                    {item.isOrbitable3D ? 'Inspect 360° ↗' : 'View Observation ↗'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
