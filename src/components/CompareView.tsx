import React, { useState } from 'react';
import { ArrowLeftRight, Compass } from 'lucide-react';
import { CELESTIAL_CATALOG, getObjectBySlug } from '../data/catalog';
import { computeComparisonRadii } from '../lib/astronomy';

interface CompareViewProps {
  initialSlugA?: string;
  initialSlugB?: string;
  onInspectObject: (slug: string) => void;
}

const COMPARABLE_BODIES = CELESTIAL_CATALOG.filter((c) => c.category !== 'galaxy-nebula');

export const CompareView: React.FC<CompareViewProps> = ({
  initialSlugA = 'jupiter',
  initialSlugB = 'earth',
  onInspectObject,
}) => {
  const [slugA, setSlugA] = useState<string>(initialSlugA);
  const [slugB, setSlugB] = useState<string>(initialSlugB);
  const [scaleMode, setScaleMode] = useState<'true-scale' | 'presentation'>('true-scale');

  const bodyA = getObjectBySlug(slugA) || getObjectBySlug('jupiter')!;
  const bodyB = getObjectBySlug(slugB) || getObjectBySlug('earth')!;

  const { radiusFractionA, radiusFractionB, diameterRatio } = computeComparisonRadii(
    bodyA.metrics.diameterKm,
    bodyB.metrics.diameterKm,
    scaleMode
  );

  const maxVisualPx = 220;
  const sizePxA = Math.max(8, Math.round(radiusFractionA * maxVisualPx));
  const sizePxB = Math.max(8, Math.round(radiusFractionB * maxVisualPx));

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#030713] text-[#F7FAFF] py-10 pb-20">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-medium text-[#79D9ED]">
              Quantitative Planetary Comparison · Scale Literacy
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F7FAFF] mt-1">
              Compare Worlds Side by Side
            </h1>
            <p className="text-sm text-[#B8C4DE] mt-1.5 max-w-2xl">
              Toggle between true physical diameter ratios and presentation scale to see why gas giants and stars dwarf rocky worlds.
            </p>
          </div>

          {/* Scale Mode Segmented Control */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0D1526] border border-white/15 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setScaleMode('true-scale')}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                scaleMode === 'true-scale'
                  ? 'bg-[#79D9ED] text-[#030713]'
                  : 'text-[#B8C4DE] hover:text-white'
              }`}
            >
              True Scale Ratio
            </button>
            <button
              type="button"
              onClick={() => setScaleMode('presentation')}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                scaleMode === 'presentation'
                  ? 'bg-[#D7B77B] text-[#030713]'
                  : 'text-[#B8C4DE] hover:text-white'
              }`}
            >
              Presentation Scale (Exaggerated)
            </button>
          </div>
        </div>

        {/* Selectors */}
        <div className="p-5 rounded-2xl border border-white/15 bg-[#0D1526] flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:flex-1">
            <label htmlFor="compare-select-a" className="block text-xs text-[#B8C4DE] mb-1.5">
              First World
            </label>
            <select
              id="compare-select-a"
              value={bodyA.slug}
              onChange={(e) => setSlugA(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#030713] border border-white/20 text-sm text-[#F7FAFF]"
            >
              {COMPARABLE_BODIES.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name} ({b.metrics.diameterKm.toLocaleString()} km)
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setSlugA(bodyB.slug);
              setSlugB(bodyA.slug);
            }}
            aria-label="Swap compared worlds"
            className="mt-0 sm:mt-5 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#070D1D] text-xs font-medium text-[#B8C4DE] hover:text-white hover:border-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
            <span>Swap</span>
          </button>

          <div className="w-full sm:flex-1">
            <label htmlFor="compare-select-b" className="block text-xs text-[#B8C4DE] mb-1.5">
              Second World
            </label>
            <select
              id="compare-select-b"
              value={bodyB.slug}
              onChange={(e) => setSlugB(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#030713] border border-white/20 text-sm text-[#F7FAFF]"
            >
              {COMPARABLE_BODIES.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name} ({b.metrics.diameterKm.toLocaleString()} km)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Visual Scale Stage */}
        <div className="mt-6 rounded-2xl border border-white/15 bg-[#060B18] p-8 min-h-[340px] flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-mono text-[#79D9ED]">
              Diameter Ratio: {bodyA.name} is{' '}
              {diameterRatio >= 1
                ? `${diameterRatio.toFixed(2)}× wider than`
                : `${(1 / diameterRatio).toFixed(2)}× narrower than`}{' '}
              {bodyB.name}
            </span>
            <span className="text-[#D7B77B] font-mono">
              {scaleMode === 'true-scale'
                ? 'TRUE GEOMETRIC DIAMETER PROPORTION'
                : 'EXAGGERATED LOGARITHMIC SCALE FOR SIDE-BY-SIDE INSPECTION'}
            </span>
          </div>

          <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-10 items-center justify-items-center">
            {[
              { body: bodyA, px: sizePxA, slot: 'a' },
              { body: bodyB, px: sizePxB, slot: 'b' },
            ].map(({ body, px, slot }) => {
              const rx = Math.max(2.5, px / 2);
              const ry = Math.max(2.5, rx * (body.visual.oblateness || 1));
              const gradId = `cmp-grad-${slot}-${body.slug}`;
              const clipId = `cmp-clip-${slot}-${body.slug}`;
              return (
                <div key={`${slot}-${body.slug}`} className="flex flex-col items-center text-center">
                  <div className="h-[248px] w-full flex items-center justify-center relative">
                    <svg
                      viewBox="0 0 320 248"
                      className="w-[320px] h-[248px] overflow-visible"
                      role="img"
                      aria-label={`${body.name} scaled representation (${body.metrics.diameterKm.toLocaleString()} km)`}
                    >
                      <defs>
                        <radialGradient id={gradId} cx="34%" cy="30%" r="70%">
                          <stop offset="0%" stopColor={body.visual.primaryColor} />
                          <stop offset="68%" stopColor={body.visual.secondaryColor} />
                          <stop offset="100%" stopColor="#050914" />
                        </radialGradient>
                        <clipPath id={clipId}>
                          <ellipse cx="160" cy="124" rx={rx} ry={ry} />
                        </clipPath>
                      </defs>

                      {body.visual.hasRings && (
                        <g transform="rotate(-16 160 124)">
                          <ellipse
                            cx="160"
                            cy="124"
                            rx={rx * 2.15}
                            ry={ry * 0.52}
                            fill="none"
                            stroke={body.visual.ringColor || '#E7D3AD'}
                            strokeWidth={Math.max(1.5, rx * 0.22)}
                            strokeOpacity="0.45"
                          />
                        </g>
                      )}

                      <ellipse cx="160" cy="124" rx={rx} ry={ry} fill={`url(#${gradId})`} />

                      {(body.slug === 'jupiter' || body.slug === 'saturn') && rx > 12 && (
                        <g clipPath={`url(#${clipId})`} opacity="0.28">
                          <rect
                            x={160 - rx}
                            y={124 - ry * 0.36}
                            width={rx * 2}
                            height={ry * 0.16}
                            fill={body.visual.secondaryColor}
                          />
                          <rect
                            x={160 - rx}
                            y={124 + ry * 0.12}
                            width={rx * 2}
                            height={ry * 0.14}
                            fill={body.visual.primaryColor}
                          />
                        </g>
                      )}

                      {body.visual.hasRings && (
                        <g transform="rotate(-16 160 124)">
                          <path
                            d={`M ${160 - rx * 2.15} 124 A ${rx * 2.15} ${ry * 0.52} 0 0 0 ${160 + rx * 2.15} 124`}
                            fill="none"
                            stroke={body.visual.ringColor || '#E7D3AD'}
                            strokeWidth={Math.max(1.5, rx * 0.22)}
                            strokeOpacity="0.82"
                          />
                        </g>
                      )}
                    </svg>
                  </div>
                <h2 className="font-display text-xl font-bold text-[#F7FAFF] mt-2">
                  {body.name}
                </h2>
                <div className="font-mono text-xs text-[#B8C4DE] mt-0.5">
                  {body.metrics.diameterKm.toLocaleString()} km diameter
                </div>
                <button
                  type="button"
                  onClick={() => onInspectObject(body.slug)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#79D9ED] hover:text-white"
                >
                  <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Inspect {body.name} in 360° ↗</span>
                </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabular Physical Measurements Table */}
        <div className="mt-6 rounded-2xl border border-white/15 bg-[#0D1526] overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/15 text-xs text-[#7F90B0]">
                <th className="py-3.5 px-5 font-medium">Physical Property</th>
                <th className="py-3.5 px-5 font-semibold text-[#F7FAFF]">{bodyA.name}</th>
                <th className="py-3.5 px-5 font-semibold text-[#F7FAFF]">{bodyB.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-xs sm:text-sm font-mono">
              <tr>
                <td className="py-3.5 px-5 font-sans text-[#B8C4DE]">Classification</td>
                <td className="py-3.5 px-5 font-sans text-[#F7FAFF]">{bodyA.classification}</td>
                <td className="py-3.5 px-5 font-sans text-[#F7FAFF]">{bodyB.classification}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-sans text-[#B8C4DE]">Mean Diameter</td>
                <td className="py-3.5 px-5 text-[#79D9ED]">{bodyA.metrics.diameterLabel}</td>
                <td className="py-3.5 px-5 text-[#79D9ED]">{bodyB.metrics.diameterLabel}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-sans text-[#B8C4DE]">Mass</td>
                <td className="py-3.5 px-5 text-[#F7FAFF]">{bodyA.metrics.massLabel}</td>
                <td className="py-3.5 px-5 text-[#F7FAFF]">{bodyB.metrics.massLabel}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-sans text-[#B8C4DE]">Surface / 1-Bar Gravity</td>
                <td className="py-3.5 px-5 text-[#F7FAFF]">{bodyA.metrics.gravityLabel}</td>
                <td className="py-3.5 px-5 text-[#F7FAFF]">{bodyB.metrics.gravityLabel}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-sans text-[#B8C4DE]">Rotation Period (Day)</td>
                <td className="py-3.5 px-5 text-[#F7FAFF]">{bodyA.metrics.dayLengthLabel}</td>
                <td className="py-3.5 px-5 text-[#F7FAFF]">{bodyB.metrics.dayLengthLabel}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-sans text-[#B8C4DE]">Orbital Period (Year)</td>
                <td className="py-3.5 px-5 text-[#F7FAFF]">{bodyA.metrics.orbitalPeriodLabel}</td>
                <td className="py-3.5 px-5 text-[#F7FAFF]">{bodyB.metrics.orbitalPeriodLabel}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-sans text-[#B8C4DE]">Axial Obliquity (Tilt)</td>
                <td className="py-3.5 px-5 text-[#F7FAFF]">{bodyA.metrics.axialTiltDeg}°</td>
                <td className="py-3.5 px-5 text-[#F7FAFF]">{bodyB.metrics.axialTiltDeg}°</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-sans text-[#B8C4DE]">Representative Temperature</td>
                <td className="py-3.5 px-5 text-[#F7FAFF]">{bodyA.metrics.meanTempLabel}</td>
                <td className="py-3.5 px-5 text-[#F7FAFF]">{bodyB.metrics.meanTempLabel}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
