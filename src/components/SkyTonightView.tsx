import React, { useMemo, useState } from 'react';
import {
  BRIGHT_STARS,
  CatalogStar,
  ConstellationRecord,
  FEATURED_CONSTELLATIONS,
  IAU_CONSTELLATION_DIRECTORY,
  OBSERVER_CITIES,
} from '../data/constellationsAndSky';
import {
  computeLocalSiderealTimeDeg,
  equatorialToHorizontal,
  projectHorizontalToDome,
} from '../lib/astronomy';

interface SkyTonightViewProps {
  selectedCityId: string;
  onSelectCity: (cityId: string) => void;
  onInspectObject: (slug: string) => void;
}

export const SkyTonightView: React.FC<SkyTonightViewProps> = ({
  selectedCityId,
  onSelectCity,
  onInspectObject,
}) => {
  const city = OBSERVER_CITIES.find((c) => c.id === selectedCityId) || OBSERVER_CITIES[0];

  const [dateStr, setDateStr] = useState<string>('2026-10-29');
  const [localHour, setLocalHour] = useState<number>(22.5); // 22:30 local evening
  const [showLineArt, setShowLineArt] = useState<boolean>(true);
  const [showIauBoundaries, setShowIauBoundaries] = useState<boolean>(true);
  const [showStarLabels, setShowStarLabels] = useState<boolean>(true);
  const [selectedConstellationId, setSelectedConstellationId] = useState<string>('orion');
  const [selectedStarId, setSelectedStarId] = useState<string | null>('betelgeuse');
  const [iauQuery, setIauQuery] = useState<string>('');

  // Convert approximate local solar time at city's longitude into UTC Date for sidereal calculation
  const observationDate = useMemo(() => {
    const base = new Date(`${dateStr}T00:00:00.000Z`);
    const tzOffsetHours = city.longitudeDeg / 15;
    const utcHours = localHour - tzOffsetHours;
    return new Date(base.getTime() + utcHours * 3600000);
  }, [dateStr, localHour, city.longitudeDeg]);

  const lstHours = useMemo(() => {
    return computeLocalSiderealTimeDeg(observationDate, city.longitudeDeg) / 15;
  }, [observationDate, city.longitudeDeg]);

  const projectedStars = useMemo(() => {
    const map = new Map<
      string,
      {
        star: CatalogStar;
        cx: number;
        cy: number;
        altitudeDeg: number;
        azimuthDeg: number;
        visible: boolean;
      }
    >();

    BRIGHT_STARS.forEach((star) => {
      const horiz = equatorialToHorizontal(
        { raHours: star.raHours, decDeg: star.decDeg },
        city.latitudeDeg,
        city.longitudeDeg,
        observationDate
      );
      const dome = projectHorizontalToDome(horiz);
      // Map normalized -1..1 onto 600x600 SVG dome with radius 250 centered at (300,300)
      map.set(star.id, {
        star,
        cx: 300 + dome.x * 250,
        cy: 300 + dome.y * 250,
        altitudeDeg: horiz.altitudeDeg,
        azimuthDeg: horiz.azimuthDeg,
        visible: dome.visible,
      });
    });

    return map;
  }, [city.latitudeDeg, city.longitudeDeg, observationDate]);

  const selectedConstellation: ConstellationRecord =
    FEATURED_CONSTELLATIONS.find((c) => c.id === selectedConstellationId) ||
    FEATURED_CONSTELLATIONS[0];

  const selectedStar = selectedStarId ? projectedStars.get(selectedStarId) : undefined;

  const visibleStarsSorted = useMemo(() => {
    return Array.from(projectedStars.values())
      .filter((p) => p.altitudeDeg > 0)
      .sort((a, b) => a.star.mag - b.star.mag);
  }, [projectedStars]);

  const filteredIauDirectory = useMemo(() => {
    const q = iauQuery.trim().toLowerCase();
    if (!q) return IAU_CONSTELLATION_DIRECTORY;
    return IAU_CONSTELLATION_DIRECTORY.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.notableObject.toLowerCase().includes(q)
    );
  }, [iauQuery]);

  const formatClock = (hr: number) => {
    const normalized = ((hr % 24) + 24) % 24;
    const h = Math.floor(normalized);
    const m = Math.round((normalized - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m === 60 ? 59 : m).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#030713] text-[#F7FAFF] py-8 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <div className="mb-6">
          <p className="text-xs font-medium text-[#79D9ED]">
            Observer Sky Dome &amp; Official IAU Constellation Atlas · DATA-BASED
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F7FAFF] mt-1">
            The Sky Tonight
          </h1>
          <p className="text-sm text-[#B8C4DE] mt-1.5 max-w-2xl">
            Star positions calculate dynamically from J2000 Right Ascension &amp; Declination, observer latitude, and Local Sidereal Time. Weather and local cloud cover are not simulated.
          </p>
        </div>

        {/* Observer Controls Bar */}
        <div className="p-5 rounded-2xl border border-white/15 bg-[#0D1526] grid grid-cols-1 md:grid-cols-12 gap-5 items-end mb-6">
          <div className="md:col-span-4">
            <label htmlFor="sky-city-select" className="block text-xs text-[#B8C4DE] mb-1.5">
              Observer Location (Manual Selection)
            </label>
            <select
              id="sky-city-select"
              value={city.id}
              onChange={(e) => onSelectCity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#030713] border border-white/20 text-xs sm:text-sm text-[#F7FAFF]"
            >
              {OBSERVER_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.region})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="sky-date-input" className="block text-xs text-[#B8C4DE] mb-1.5">
              Observation Date
            </label>
            <input
              id="sky-date-input"
              type="date"
              value={dateStr}
              onChange={(e) => e.target.value && setDateStr(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#030713] border border-white/20 text-xs sm:text-sm font-mono text-[#F7FAFF]"
            />
          </div>

          <div className="md:col-span-5">
            <div className="flex items-center justify-between text-xs text-[#B8C4DE] mb-1.5">
              <label htmlFor="sky-time-slider">Local Solar Time</label>
              <span className="font-mono text-[#79D9ED]">
                {formatClock(localHour)} · LST {lstHours.toFixed(2)}h
              </span>
            </div>
            <input
              id="sky-time-slider"
              type="range"
              min={18}
              max={29}
              step={0.25}
              value={localHour}
              onChange={(e) => setLocalHour(Number(e.target.value))}
              className="w-full accent-[#79D9ED]"
            />
          </div>
        </div>

        {/* Main Split: Interactive Sky Dome Chart + Constellation / Star Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Columns: Zenith Stereographic Sky Dome */}
          <div className="lg:col-span-7 rounded-2xl border border-white/15 bg-[#060B18] p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="text-xs text-[#B8C4DE]">
                Looking Straight Up (Zenith Center · North Top · East Left)
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLineArt((p) => !p)}
                  aria-pressed={showLineArt}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                    showLineArt
                      ? 'border-[#79D9ED] bg-[#79D9ED]/15 text-[#79D9ED]'
                      : 'border-white/15 text-[#B8C4DE]'
                  }`}
                >
                  Line Art (Conventional)
                </button>
                <button
                  type="button"
                  onClick={() => setShowIauBoundaries((p) => !p)}
                  aria-pressed={showIauBoundaries}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                    showIauBoundaries
                      ? 'border-[#D7B77B] bg-[#D7B77B]/15 text-[#D7B77B]'
                      : 'border-white/15 text-[#B8C4DE]'
                  }`}
                >
                  IAU Region Boundaries
                </button>
                <button
                  type="button"
                  onClick={() => setShowStarLabels((p) => !p)}
                  aria-pressed={showStarLabels}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                    showStarLabels
                      ? 'border-white/40 bg-white/10 text-[#F7FAFF]'
                      : 'border-white/15 text-[#B8C4DE]'
                  }`}
                >
                  Star Names
                </button>
              </div>
            </div>

            <div className="w-full max-w-[560px] mx-auto aspect-square">
              <svg
                viewBox="0 0 600 600"
                className="w-full h-full select-none"
                role="img"
                aria-label={`Projected night sky dome over ${city.name} at ${formatClock(localHour)}`}
              >
                <defs>
                  <radialGradient id="skyDomeGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#081229" />
                    <stop offset="78%" stopColor="#0c1d3d" />
                    <stop offset="100%" stopColor="#132c57" />
                  </radialGradient>
                  <clipPath id="horizonClip">
                    <circle cx="300" cy="300" r="250" />
                  </clipPath>
                </defs>

                {/* Horizon Circle */}
                <circle
                  cx="300"
                  cy="300"
                  r="250"
                  fill="url(#skyDomeGrad)"
                  stroke="rgba(121, 217, 237, 0.35)"
                  strokeWidth="1.5"
                />

                {/* Altitude Rings (30° and 60° elevation) + Meridian/Prime Vertical */}
                <circle
                  cx="300"
                  cy="300"
                  r="166.6"
                  fill="none"
                  stroke="rgba(255,255,255,0.07)"
                  strokeDasharray="4 4"
                />
                <circle
                  cx="300"
                  cy="300"
                  r="83.3"
                  fill="none"
                  stroke="rgba(255,255,255,0.07)"
                  strokeDasharray="4 4"
                />
                <line x1="300" y1="50" x2="300" y2="550" stroke="rgba(255,255,255,0.06)" />
                <line x1="50" y1="300" x2="550" y2="300" stroke="rgba(255,255,255,0.06)" />

                <g clipPath="url(#horizonClip)">
                  {/* Official IAU Sky Region Boundary Polygon for Selected Constellation */}
                  {showIauBoundaries &&
                    (() => {
                      const polyPts = selectedConstellation.boundaryPolygon.map((pt) => {
                        const h = equatorialToHorizontal(
                          pt,
                          city.latitudeDeg,
                          city.longitudeDeg,
                          observationDate
                        );
                        const d = projectHorizontalToDome(h);
                        return { x: 300 + d.x * 250, y: 300 + d.y * 250, alt: h.altitudeDeg };
                      });
                      if (polyPts.every((p) => p.alt < -15)) return null;
                      return (
                        <polygon
                          points={polyPts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
                          fill="rgba(215, 183, 123, 0.06)"
                          stroke="#D7B77B"
                          strokeWidth="1.2"
                          strokeDasharray="5 4"
                          strokeOpacity="0.65"
                        />
                      );
                    })()}

                  {/* Conventional Constellation Stick Lines */}
                  {showLineArt &&
                    FEATURED_CONSTELLATIONS.map((con) => {
                      const isSelected = con.id === selectedConstellation.id;
                      return con.linePairs.map(([idA, idB], idx) => {
                        const pA = projectedStars.get(idA);
                        const pB = projectedStars.get(idB);
                        if (!pA || !pB || (!pA.visible && !pB.visible)) return null;
                        return (
                          <line
                            key={`${con.id}-${idx}`}
                            x1={pA.cx}
                            y1={pA.cy}
                            x2={pB.cx}
                            y2={pB.cy}
                            stroke={isSelected ? '#79D9ED' : '#94A3B8'}
                            strokeWidth={isSelected ? 1.8 : 1.0}
                            strokeOpacity={isSelected ? 0.85 : 0.35}
                          />
                        );
                      });
                    })}

                  {/* Projected Bright Stars */}
                  {Array.from(projectedStars.values()).map((entry) => {
                    if (!entry.visible) return null;
                    const r = Math.max(2.2, 6.2 - entry.star.mag * 1.15);
                    const isActive = entry.star.id === selectedStarId;
                    return (
                      <g
                        key={entry.star.id}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedStarId(entry.star.id);
                          setSelectedConstellationId(entry.star.constellationId);
                        }}
                      >
                        {isActive && (
                          <circle
                            cx={entry.cx}
                            cy={entry.cy}
                            r={r + 6}
                            fill="none"
                            stroke="#79D9ED"
                            strokeWidth="1.5"
                          />
                        )}
                        <circle
                          cx={entry.cx}
                          cy={entry.cy}
                          r={r}
                          fill={entry.star.colorHex}
                        />
                        {showStarLabels && (entry.star.mag <= 1.85 || isActive) && (
                          <text
                            x={entry.cx + r + 4}
                            y={entry.cy + 3}
                            fill={isActive ? '#79D9ED' : '#CBD5E1'}
                            fontSize="10.5"
                            className="font-sans"
                          >
                            {entry.star.name}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* Cardinal Horizon Bearings */}
                <text x="300" y="38" textAnchor="middle" fill="#79D9ED" fontSize="12" className="font-mono font-semibold">
                  N (0°)
                </text>
                <text x="300" y="572" textAnchor="middle" fill="#79D9ED" fontSize="12" className="font-mono font-semibold">
                  S (180°)
                </text>
                <text x="28" y="304" textAnchor="middle" fill="#79D9ED" fontSize="12" className="font-mono font-semibold">
                  E
                </text>
                <text x="572" y="304" textAnchor="middle" fill="#79D9ED" fontSize="12" className="font-mono font-semibold">
                  W
                </text>
              </svg>
            </div>

            <p className="text-xs text-[#7F90B0] text-center mt-2">
              {city.bortleNote} Click any plotted star to read its catalogue distance and altitude.
            </p>
          </div>

          {/* Right 5 Columns: Constellation Focus + Star Details */}
          <div className="lg:col-span-5 space-y-5">
            {/* Featured Constellation Selector */}
            <div className="p-6 rounded-2xl border border-white/15 bg-[#0D1526] space-y-4">
              <div>
                <label htmlFor="constellation-focus-select" className="block text-xs text-[#79D9ED] font-medium mb-1.5">
                  Featured Constellation Focus
                </label>
                <select
                  id="constellation-focus-select"
                  value={selectedConstellation.id}
                  onChange={(e) => setSelectedConstellationId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#030713] border border-white/20 text-sm font-semibold text-[#F7FAFF]"
                >
                  {FEATURED_CONSTELLATIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.iauCode} · {c.hemisphere})
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-[#B8C4DE]">
                <span>IAU Code: {selectedConstellation.iauCode}</span>
                <span className="mx-2 text-white/30">·</span>
                <span className="font-mono">{selectedConstellation.areaSqDeg} sq. deg.</span>
                <span className="mx-2 text-white/30">·</span>
                <span>{selectedConstellation.bestSeason}</span>
              </div>

              <p className="text-sm text-[#F7FAFF] leading-relaxed">
                {selectedConstellation.summary}
              </p>

              <div className="p-3.5 rounded-xl border border-white/10 bg-[#080E1E] space-y-2 text-xs text-[#B8C4DE]">
                <div>
                  <strong className="text-[#D7B77B]">IAU Region vs. Line Art:</strong>{' '}
                  {selectedConstellation.iauNote}
                </div>
                <div>
                  <strong className="text-[#79D9ED]">Cultural Sky Heritage:</strong>{' '}
                  {selectedConstellation.culturalNote}
                </div>
              </div>

              {selectedConstellation.relatedObjectSlug && (
                <button
                  type="button"
                  onClick={() => onInspectObject(selectedConstellation.relatedObjectSlug!)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#79D9ED] text-[#030713] text-xs font-semibold hover:bg-[#9BE4F4] transition-colors"
                >
                  Inspect Deep-Sky Object Inside {selectedConstellation.name} ↗
                </button>
              )}
            </div>

            {/* Selected Star Catalogue Readout */}
            {selectedStar && (
              <div className="p-6 rounded-2xl border border-white/15 bg-[#0D1526] space-y-3">
                <div className="text-xs text-[#79D9ED] font-medium">
                  Selected Catalogue Star · J2000 Astrometry
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-display text-xl font-bold text-[#F7FAFF]">
                    {selectedStar.star.name}
                  </h2>
                  <span className="font-mono text-xs text-[#B8C4DE]">{selectedStar.star.bayer}</span>
                </div>
                <p className="text-xs text-[#B8C4DE] leading-relaxed">
                  {selectedStar.star.summary}
                </p>
                <div className="grid grid-cols-2 gap-2.5 pt-1 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-[#070D1D] border border-white/10">
                    <span className="block text-[10px] font-sans text-[#7F90B0]">Apparent Magnitude</span>
                    <span className="text-[#F7FAFF]">{selectedStar.star.mag.toFixed(2)} mag</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#070D1D] border border-white/10">
                    <span className="block text-[10px] font-sans text-[#7F90B0]">Distance</span>
                    <span className="text-[#D7B77B]">{selectedStar.star.distanceLy} light-yr</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#070D1D] border border-white/10">
                    <span className="block text-[10px] font-sans text-[#7F90B0]">Current Altitude</span>
                    <span className="text-[#79D9ED]">
                      {selectedStar.altitudeDeg >= 0
                        ? `+${selectedStar.altitudeDeg.toFixed(1)}° (Above Horizon)`
                        : `${selectedStar.altitudeDeg.toFixed(1)}° (Set)`}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#070D1D] border border-white/10">
                    <span className="block text-[10px] font-sans text-[#7F90B0]">Spectral Class</span>
                    <span className="text-[#F7FAFF] truncate block">{selectedStar.star.spectralType}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Accessible Non-Canvas Visible Sky Highlights + IAU Constellation Directory */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 p-6 rounded-2xl border border-white/15 bg-[#0D1526]">
            <h2 className="font-display text-lg font-bold text-[#F7FAFF]">
              Brightest Objects Above {city.name} Right Now ({visibleStarsSorted.length})
            </h2>
            <p className="text-xs text-[#B8C4DE] mt-1 mb-4">
              Accessible text table synchronized with your selected city, date, and hour.
            </p>
            <div className="max-h-72 overflow-y-auto divide-y divide-white/10">
              {visibleStarsSorted.slice(0, 10).map((item) => (
                <button
                  key={item.star.id}
                  type="button"
                  onClick={() => {
                    setSelectedStarId(item.star.id);
                    setSelectedConstellationId(item.star.constellationId);
                  }}
                  className="w-full py-2.5 px-2 flex items-center justify-between text-left hover:bg-white/5 rounded transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#F7FAFF]">{item.star.name}</div>
                    <div className="text-xs text-[#7F90B0]">{item.star.spectralType}</div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <div className="text-[#79D9ED]">Alt +{item.altitudeDeg.toFixed(0)}° · Az {item.azimuthDeg.toFixed(0)}°</div>
                    <div className="text-[#B8C4DE]">mag {item.star.mag.toFixed(2)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 p-6 rounded-2xl border border-white/15 bg-[#0D1526]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h2 className="font-display text-lg font-bold text-[#F7FAFF]">
                Official IAU Constellation Reference
              </h2>
              <input
                type="search"
                value={iauQuery}
                onChange={(e) => setIauQuery(e.target.value)}
                placeholder="Search IAU code or name..."
                aria-label="Search IAU constellations"
                className="px-3 py-1.5 rounded-lg bg-[#030713] border border-white/15 text-xs text-[#F7FAFF]"
              />
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-white/10 text-xs">
              {filteredIauDirectory.map((entry) => (
                <div key={entry.code} className="py-2.5 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-[#79D9ED] mr-2">{entry.code}</span>
                    <strong className="text-[#F7FAFF]">{entry.name}</strong>
                    <span className="text-[#7F90B0] ml-2">({entry.hemisphere})</span>
                  </div>
                  <div className="text-[#B8C4DE] text-right">{entry.notableObject}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
