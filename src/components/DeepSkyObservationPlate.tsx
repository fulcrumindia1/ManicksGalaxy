import React, { useState } from 'react';
import { CelestialObject } from '../data/catalog';

interface DeepSkyObservationPlateProps {
  object: CelestialObject;
}

export const DeepSkyObservationPlate: React.FC<DeepSkyObservationPlateProps> = ({ object }) => {
  const [wavelengthLayer, setWavelengthLayer] = useState<'optical' | 'infrared' | 'annotated'>('annotated');
  const isMilkyWay = object.slug === 'milky-way';

  return (
    <div
      className="w-full h-full relative flex flex-col items-center justify-center bg-[#030713] overflow-hidden p-6"
      data-testid="deep-sky-plate"
    >
      {/* Honest Scientific Framing Notice */}
      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
        <div className="w-full aspect-[16/10] max-h-[62vh] rounded-xl border border-white/15 bg-[#060B19] relative overflow-hidden flex items-center justify-center">
          {isMilkyWay ? (
            <svg
              viewBox="0 0 800 500"
              className="w-full h-full"
              role="img"
              aria-label="Scientific top-down structural reconstruction of the Milky Way Galaxy showing the Sun's location in the Orion Arm"
            >
              <defs>
                <radialGradient id="mwCore" cx="50%" cy="50%" r="45%">
                  <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.95" />
                  <stop offset="22%" stopColor="#FDE68A" stopOpacity="0.55" />
                  <stop offset="55%" stopColor="#818CF8" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#060B19" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="800" height="500" fill="#050915" />
              {/* Galactic halo glow */}
              <ellipse cx="400" cy="250" rx="310" ry="215" fill="url(#mwCore)" />

              {/* Central Galactic Bar */}
              <ellipse
                cx="400"
                cy="250"
                rx="88"
                ry="26"
                transform="rotate(-28 400 250)"
                fill="#FEF08A"
                fillOpacity={wavelengthLayer === 'infrared' ? 0.85 : 0.65}
              />

              {/* Logarithmic Barred Spiral Arms */}
              {[0, Math.PI, Math.PI * 0.5, Math.PI * 1.5].map((offset, idx) => {
                const points: string[] = [];
                for (let t = 0; t <= 4.3; t += 0.1) {
                  const r = 46 * Math.exp(0.36 * t);
                  if (r > 235) break;
                  const ang = t + offset - 0.45;
                  const x = 400 + Math.cos(ang) * r * 1.22;
                  const y = 250 + Math.sin(ang) * r * 0.92;
                  points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
                }
                return (
                  <polyline
                    key={idx}
                    points={points.join(' ')}
                    fill="none"
                    stroke={wavelengthLayer === 'infrared' ? '#FB923C' : idx < 2 ? '#93C5FD' : '#C4B5FD'}
                    strokeWidth={idx < 2 ? 22 : 14}
                    strokeLinecap="round"
                    strokeOpacity={0.32}
                  />
                );
              })}

              {/* Annotated Gaia Measurement Markers */}
              {wavelengthLayer === 'annotated' && (
                <g className="font-mono">
                  {/* Galactic Center Sgr A* */}
                  <circle cx="400" cy="250" r="4" fill="#FDE047" />
                  <text x="412" y="246" fill="#FEF08A" fontSize="11">
                    Sagittarius A* (Galactic Center)
                  </text>

                  {/* Solar System position ~26,670 ly out */}
                  <circle cx="400" cy="362" r="6" fill="none" stroke="#79D9ED" strokeWidth="2" />
                  <circle cx="400" cy="362" r="2.5" fill="#79D9ED" />
                  <line x1="400" y1="250" x2="400" y2="362" stroke="#79D9ED" strokeDasharray="4 4" strokeOpacity="0.65" />
                  <text x="414" y="366" fill="#79D9ED" fontSize="11">
                    Sun &amp; Earth (Orion Spur · 26,670 ly)
                  </text>

                  {/* Gaia Survey Reach Circle */}
                  <circle
                    cx="400"
                    cy="362"
                    r="68"
                    fill="#79D9ED"
                    fillOpacity="0.06"
                    stroke="#79D9ED"
                    strokeDasharray="3 3"
                    strokeOpacity="0.5"
                  />
                  <text x="242" y="424" fill="#B8C4DE" fontSize="10">
                    High-precision Gaia parallax sphere
                  </text>

                  {/* Scale bar */}
                  <line x1="560" y1="455" x2="740" y2="455" stroke="#F7FAFF" strokeWidth="1.5" />
                  <line x1="560" y1="450" x2="560" y2="460" stroke="#F7FAFF" strokeWidth="1.5" />
                  <line x1="740" y1="450" x2="740" y2="460" stroke="#F7FAFF" strokeWidth="1.5" />
                  <text x="612" y="446" fill="#F7FAFF" fontSize="11">
                    ~35,000 light-years
                  </text>
                </g>
              )}
            </svg>
          ) : (
            <svg
              viewBox="0 0 800 500"
              className="w-full h-full"
              role="img"
              aria-label="Multi-wavelength telescope observation diagram of the Orion Nebula M42 showing the Trapezium stars and Orion Bar"
            >
              <defs>
                <radialGradient id="m42Core" cx="48%" cy="46%" r="48%">
                  <stop offset="0%" stopColor={wavelengthLayer === 'infrared' ? '#FDE047' : '#FDF2F8'} stopOpacity="0.95" />
                  <stop offset="24%" stopColor={wavelengthLayer === 'infrared' ? '#FB923C' : '#F472B6'} stopOpacity="0.62" />
                  <stop offset="56%" stopColor={wavelengthLayer === 'infrared' ? '#7C2D12' : '#6366F1'} stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#050915" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="m43Wing" cx="62%" cy="32%" r="30%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#050915" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="800" height="500" fill="#050915" />
              <ellipse cx="390" cy="240" rx="320" ry="210" fill="url(#m42Core)" />
              <ellipse cx="480" cy="175" rx="180" ry="120" fill="url(#m43Wing)" />

              {/* Ionization Shock Front / Orion Bar */}
              <path
                d="M 210 340 Q 395 295 575 355"
                fill="none"
                stroke={wavelengthLayer === 'infrared' ? '#FDBA74' : '#F9A8D4'}
                strokeWidth="12"
                strokeOpacity="0.45"
                strokeLinecap="round"
              />

              {/* Trapezium Newborn OB Stars */}
              <circle cx="385" cy="228" r="4.5" fill="#FFFFFF" />
              <circle cx="396" cy="222" r="3.5" fill="#E0F2FE" />
              <circle cx="394" cy="236" r="3.5" fill="#E0F2FE" />
              <circle cx="380" cy="237" r="3.0" fill="#BAE6FD" />

              {wavelengthLayer === 'annotated' && (
                <g className="font-mono">
                  <circle cx="389" cy="230" r="22" fill="none" stroke="#79D9ED" strokeDasharray="3 3" />
                  <text x="418" y="226" fill="#79D9ED" fontSize="11">
                    Trapezium Cluster (θ¹ Orionis · UV Ionizing Source)
                  </text>
                  <text x="345" y="346" fill="#FDE68A" fontSize="11">
                    Orion Bar Photodissociation Ridge
                  </text>
                  <circle cx="325" cy="268" r="5" fill="none" stroke="#D7B77B" />
                  <text x="165" y="272" fill="#D7B77B" fontSize="10">
                    Protoplanetary Disks (Proplyds)
                  </text>
                  <text x="565" y="458" fill="#F7FAFF" fontSize="11">
                    Span: 24 light-years · Dist: 1,344 ly
                  </text>
                </g>
              )}
            </svg>
          )}
        </div>

        {/* Wavelength & Annotation Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 w-full px-1">
          <div className="text-xs text-[#B8C4DE]">
            <span>Why not 360° orbitable?</span>
            <span className="mx-2 text-white/30">·</span>
            <span>
              {isMilkyWay
                ? 'No camera can exit our 100,000-ly galaxy; structure is mapped from internal star & radio distances.'
                : 'At 1,344 light-years away, Earth telescopes observe M42 from a single vantage line of sight.'}
            </span>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0D1526] border border-white/15">
            {(['annotated', 'optical', 'infrared'] as const).map((layer) => (
              <button
                key={layer}
                type="button"
                onClick={() => setWavelengthLayer(layer)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  wavelengthLayer === layer
                    ? 'bg-[#79D9ED] text-[#030713]'
                    : 'text-[#B8C4DE] hover:text-white'
                }`}
              >
                {layer === 'annotated'
                  ? 'Annotated Science'
                  : layer === 'optical'
                  ? 'Optical / H-alpha'
                  : 'Infrared Dust View'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
