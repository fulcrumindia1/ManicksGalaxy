import React, { useState } from 'react';
import { CelestialObject } from '../data/catalog';

interface DeepSkyObservationPlateProps {
  object: CelestialObject;
}

export const DeepSkyObservationPlate: React.FC<DeepSkyObservationPlateProps> = ({ object }) => {
  const [wavelengthLayer, setWavelengthLayer] = useState<'optical' | 'infrared' | 'annotated'>('annotated');
  const slug = object.slug;

  // Scientific dataset metadata for each view mode
  const getDatasetInfo = () => {
    if (slug === 'milky-way') {
      switch (wavelengthLayer) {
        case 'optical':
          return {
            title: 'ISS Expedition Optical Night Panorama',
            facility: 'NASA / International Space Station (ISS073)',
            band: 'Visible Light (400–700 nm)',
            src: '/assets/deepsky/milky-way/milky_way_optical.jpg',
            alt: 'Milky Way galaxy starlight band photographed from orbit aboard the International Space Station',
            caption: 'True visible-light view of our galaxy edge-on as seen from Earth orbit, showing the dark rift of interstellar dust lanes.',
          };
        case 'infrared':
          return {
            title: 'WISE All-Sky Infrared Galaxy Survey',
            facility: 'NASA / Wide-field Infrared Survey Explorer (WISE)',
            band: 'Mid-Infrared (3.4, 4.6, 12, 22 µm)',
            src: '/assets/deepsky/milky-way/milky_way_infrared.jpg',
            alt: 'All-sky mid-infrared survey of the Milky Way showing warm dust and stellar populations',
            caption: 'Infrared wavelengths penetrate cold obscuring dust to reveal starburst regions and the blazing galactic nucleus.',
          };
        case 'annotated':
        default:
          return {
            title: 'Milky Way Barred Spiral Model (Spitzer / Gaia DR3)',
            facility: 'NASA / JPL-Caltech / R. Hurt / ESA Gaia',
            band: 'Data-Informed Structural Reconstruction',
            src: '/assets/deepsky/milky-way/milky_way_topdown.jpg',
            alt: 'Top-down structural reconstruction of the Milky Way Galaxy showing spiral arms and the Sun position',
            caption: 'External face-on reconstruction derived from Spitzer infrared star counts and ESA Gaia parallax distances.',
          };
      }
    } else if (slug === 'andromeda') {
      switch (wavelengthLayer) {
        case 'optical':
          return {
            title: 'GALEX & Palomar Observatory High-Resolution Mosaic of M31',
            facility: 'NASA / JPL-Caltech / GALEX Ultraviolet & Optical',
            band: 'Ultraviolet & Visible Starlight (150–650 nm)',
            src: '/assets/deepsky/andromeda/andromeda_optical.jpg',
            alt: 'Andromeda Galaxy full disc photographed in ultraviolet and visible light',
            caption: 'Ultraviolet and visible mosaic tracing blue young star clusters across the spiral arms of our 1-trillion-star neighbor.',
          };
        case 'infrared':
          return {
            title: 'Herschel Space Observatory & Planck Submillimeter Dust Map',
            facility: 'ESA / NASA / Herschel Space Observatory & Planck',
            band: 'Far-Infrared & Submillimeter (70–850 µm)',
            src: '/assets/deepsky/andromeda/andromeda_infrared.jpg',
            alt: 'Far-infrared emission highlighting cold interstellar dust rings in Andromeda',
            caption: 'Far-infrared radiation mapping the coldest dust lanes where new stars are currently coalescing inside spiral rings.',
          };
        case 'annotated':
        default:
          return {
            title: 'Andromeda Galaxy (M31) Multi-Wavelength Science Plate',
            facility: 'NASA / ESA / STScI & Astrometric Markers',
            band: 'Panchromatic Composite with Satellite Dwarf Galaxies',
            src: '/assets/deepsky/andromeda/andromeda_optical.jpg',
            alt: 'Annotated plate of the Andromeda galaxy with satellite companions',
            caption: 'Core bulge harboring a 100M M☉ black hole, companion dwarf galaxies M32 and M110, and 220,000 ly span.',
          };
      }
    } else if (slug === 'crab-nebula') {
      switch (wavelengthLayer) {
        case 'optical':
          return {
            title: 'Hubble Space Telescope Most Detailed M1 Mosaic',
            facility: 'NASA / ESA / STScI (Hubble WFPC2 Mosaic)',
            band: 'Optical Emission Lines (H-alpha, [S II], [O III])',
            src: '/assets/deepsky/crab/crab_optical.jpg',
            alt: 'Hubble Space Telescope mosaic of the expanding filaments of the Crab Nebula',
            caption: 'Intricate filaments of hydrogen, helium, and oxygen ejected in the supernova of 1054 CE, expanding at 1,500 km/s.',
          };
        case 'infrared':
          return {
            title: 'Herschel Space Observatory & Hubble Infrared Composite',
            facility: 'ESA / NASA / Herschel & STScI',
            band: 'Far-Infrared & Optical Multi-Wavelength',
            src: '/assets/deepsky/crab/crab_infrared.jpg',
            alt: 'Infrared and optical composite tracing warm cosmic dust inside the supernova remnant',
            caption: 'Infrared observations revealing newly formed cosmic dust grains forged in the heart of the ancient exploded star.',
          };
        case 'annotated':
        default:
          return {
            title: 'Crab Pulsar & Wind Nebula Science Plate',
            facility: 'NASA / ESA / Chandra / STScI + Astrometric Markers',
            band: 'Synchrotron Wind and Expanding Supernova Debris',
            src: '/assets/deepsky/crab/crab_optical.jpg',
            alt: 'Annotated telescope plate of the Crab Nebula showing pulsar and expansion dynamics',
            caption: 'Central 30-Hz spinning Crab Pulsar driving relativistic magnetic particle wind across 11 light-years.',
          };
      }
    } else if (slug === 'sagittarius-a') {
      switch (wavelengthLayer) {
        case 'optical':
        case 'annotated':
          return {
            title: 'Great Observatories Multi-Wavelength Galactic Center',
            facility: 'NASA / ESA / CXC / STScI / JPL-Caltech (Hubble, Spitzer, Chandra)',
            band: 'X-ray (blue), Infrared (red/yellow), Visible (cyan)',
            src: '/assets/deepsky/sagittarius-a/sagittarius_a_multispectral.jpg',
            alt: 'Multi-wavelength mosaic of the Galactic Center showing Sagittarius A and stellar nurseries',
            caption: 'Composite penetrating 26,000 light-years of dust to reveal intense star formation and the supermassive black hole core.',
          };
        case 'infrared':
        default:
          return {
            title: 'Chandra X-Ray Observatory Sagittarius A* High-Energy View',
            facility: 'NASA / CXC / Massachusetts Institute of Technology',
            band: 'High-Energy X-Ray (2–10 keV)',
            src: '/assets/deepsky/sagittarius-a/sagittarius_a_xray.jpg',
            alt: 'High-energy X-ray emission surrounding Sagittarius A* supermassive black hole',
            caption: 'Intense X-ray flares produced by million-degree plasma heating as matter spirals toward the event horizon.',
          };
      }
    } else {
      // Default: Orion Nebula (orion-nebula)
      switch (wavelengthLayer) {
        case 'optical':
          return {
            title: 'Hubble Space Telescope M42 Optical Mosaic',
            facility: 'NASA / ESA / STScI (Hubble ACS/WFPC2)',
            band: 'Visible Optical / H-alpha / [O III] (435–658 nm)',
            src: '/assets/deepsky/orion/orion_optical.jpg',
            alt: 'Hubble Space Telescope high-resolution visible light mosaic of the Orion Nebula M42',
            caption: 'Stunning visible emission showing glowing hydrogen (red/orange) and ionized oxygen (teal/blue) energized by newborn stars.',
          };
        case 'infrared':
          return {
            title: 'Spitzer Space Telescope Orion Infrared View',
            facility: 'NASA / JPL-Caltech (Spitzer IRAC/MIPS)',
            band: 'Infrared (3.6, 4.5, 8.0, 24 µm)',
            src: '/assets/deepsky/orion/orion_infrared.jpg',
            alt: 'Spitzer Space Telescope infrared mosaic of the Orion Nebula showing embedded protostars',
            caption: 'Infrared observation piercing dark dust clouds to reveal hundreds of embedded protostars and planetary disks in formation.',
          };
        case 'annotated':
        default:
          return {
            title: 'Hubble Space Telescope Science Plate with Annotations',
            facility: 'NASA / ESA / STScI Hubble ACS + Astrometric Markers',
            band: 'Multi-Wavelength Optical with Coordinate Annotations',
            src: '/assets/deepsky/orion/orion_optical.jpg',
            alt: 'Annotated telescope observation plate of the Orion Nebula showing key astrophysical regions',
            caption: 'Key scientific features resolved: Trapezium ionizing cluster, Orion Bar photo-evaporation front, and proplyds.',
          };
      }
    }
  };

  const dataset = getDatasetInfo();

  return (
    <div
      className="w-full h-full relative flex flex-col items-center justify-center bg-[#030713] overflow-hidden p-6"
      data-testid="deep-sky-plate"
    >
      {/* Honest Scientific Framing Notice */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {/* Main Observation Plate Frame */}
        <div className="w-full aspect-[16/10] max-h-[60vh] rounded-xl border border-white/15 bg-[#060B19] relative overflow-hidden flex items-center justify-center shadow-2xl">
          {/* Authentic Real Telescope Image */}
          <img
            src={dataset.src}
            alt={dataset.alt}
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {/* Scientific Overlay for Annotated Mode */}
          {wavelengthLayer === 'annotated' && (
            <div className="absolute inset-0 pointer-events-none">
              {slug === 'milky-way' ? (
                <svg
                  viewBox="0 0 800 500"
                  className="w-full h-full"
                  role="presentation"
                >
                  <g className="font-mono text-xs">
                    {/* Galactic Center Sgr A* */}
                    <circle cx="400" cy="250" r="5" fill="#FDE047" stroke="#000" strokeWidth="1.5" />
                    <circle cx="400" cy="250" r="14" fill="none" stroke="#FDE047" strokeWidth="1" strokeDasharray="3 3" />
                    <rect x="420" y="238" width="220" height="22" rx="4" fill="#030713" fillOpacity="0.82" stroke="#FDE047" strokeWidth="0.8" />
                    <text x="428" y="253" fill="#FEF08A" fontSize="11" fontWeight="bold">
                      Sagittarius A* (Galactic Center)
                    </text>

                    {/* Solar System position ~26,670 ly out */}
                    <circle cx="400" cy="365" r="7" fill="none" stroke="#79D9ED" strokeWidth="2.5" />
                    <circle cx="400" cy="365" r="3" fill="#79D9ED" />
                    <line x1="400" y1="250" x2="400" y2="365" stroke="#79D9ED" strokeDasharray="4 4" strokeWidth="1.5" strokeOpacity="0.75" />
                    <rect x="420" y="353" width="230" height="22" rx="4" fill="#030713" fillOpacity="0.82" stroke="#79D9ED" strokeWidth="0.8" />
                    <text x="428" y="368" fill="#79D9ED" fontSize="11" fontWeight="bold">
                      Sun &amp; Earth (Orion Spur · 26,670 ly)
                    </text>

                    {/* Gaia Survey Reach Sphere */}
                    <circle
                      cx="400"
                      cy="365"
                      r="65"
                      fill="#79D9ED"
                      fillOpacity="0.08"
                      stroke="#79D9ED"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                      strokeOpacity="0.6"
                    />
                    <rect x="210" y="415" width="180" height="18" rx="3" fill="#030713" fillOpacity="0.82" />
                    <text x="216" y="428" fill="#B8C4DE" fontSize="10">
                      Gaia High-Precision Astrometry
                    </text>

                    {/* Scale bar */}
                    <rect x="548" y="445" width="202" height="32" rx="4" fill="#030713" fillOpacity="0.82" stroke="white" strokeOpacity="0.2" />
                    <line x1="560" y1="465" x2="736" y2="465" stroke="#F7FAFF" strokeWidth="2" />
                    <line x1="560" y1="459" x2="560" y2="471" stroke="#F7FAFF" strokeWidth="2" />
                    <line x1="736" y1="459" x2="736" y2="471" stroke="#F7FAFF" strokeWidth="2" />
                    <text x="602" y="458" fill="#F7FAFF" fontSize="11" fontWeight="bold">
                      ~35,000 light-years
                    </text>
                  </g>
                </svg>
              ) : slug === 'andromeda' ? (
                <svg
                  viewBox="0 0 800 500"
                  className="w-full h-full"
                  role="presentation"
                >
                  <g className="font-mono text-xs">
                    {/* Galactic Bulge / Core */}
                    <circle cx="395" cy="245" r="28" fill="none" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="395" cy="245" r="5" fill="#FEF08A" />
                    <rect x="430" y="233" width="235" height="24" rx="4" fill="#030713" fillOpacity="0.85" stroke="#FDE047" strokeWidth="0.8" />
                    <text x="438" y="249" fill="#FEF08A" fontSize="11" fontWeight="bold">
                      M31 Core (100M M☉ Black Hole)
                    </text>

                    {/* Satellite M32 */}
                    <circle cx="360" cy="335" r="14" fill="none" stroke="#79D9ED" strokeWidth="1.5" />
                    <rect x="220" y="325" width="130" height="22" rx="4" fill="#030713" fillOpacity="0.85" stroke="#79D9ED" strokeWidth="0.8" />
                    <text x="228" y="340" fill="#79D9ED" fontSize="11" fontWeight="bold">
                      M32 (Compact Dwarf)
                    </text>

                    {/* Satellite M110 */}
                    <circle cx="485" cy="140" r="18" fill="none" stroke="#A78BFA" strokeWidth="1.5" />
                    <rect x="510" y="130" width="130" height="22" rx="4" fill="#030713" fillOpacity="0.85" stroke="#A78BFA" strokeWidth="0.8" />
                    <text x="518" y="145" fill="#A78BFA" fontSize="11" fontWeight="bold">
                      M110 (Dwarf Elliptical)
                    </text>

                    {/* Scale bar */}
                    <rect x="520" y="445" width="240" height="32" rx="4" fill="#030713" fillOpacity="0.85" stroke="white" strokeOpacity="0.2" />
                    <text x="532" y="465" fill="#F7FAFF" fontSize="11">
                      Span: 220,000 ly · Dist: 2.54 Mly
                    </text>
                  </g>
                </svg>
              ) : slug === 'crab-nebula' ? (
                <svg
                  viewBox="0 0 800 500"
                  className="w-full h-full"
                  role="presentation"
                >
                  <g className="font-mono text-xs">
                    {/* Crab Pulsar */}
                    <circle cx="400" cy="250" r="6" fill="#67E8F9" stroke="#FFF" strokeWidth="2" />
                    <circle cx="400" cy="250" r="22" fill="none" stroke="#67E8F9" strokeWidth="1.5" strokeDasharray="4 4" />
                    <rect x="430" y="238" width="250" height="24" rx="4" fill="#030713" fillOpacity="0.85" stroke="#67E8F9" strokeWidth="0.8" />
                    <text x="438" y="254" fill="#67E8F9" fontSize="11" fontWeight="bold">
                      Crab Pulsar (Spin: 30.2 rev/s · B~10¹² G)
                    </text>

                    {/* Relativistic Wind Zone */}
                    <ellipse cx="400" cy="250" rx="140" ry="90" fill="none" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="6 3" />
                    <rect x="180" y="320" width="210" height="22" rx="4" fill="#030713" fillOpacity="0.85" stroke="#F43F5E" strokeWidth="0.8" />
                    <text x="188" y="335" fill="#F43F5E" fontSize="11" fontWeight="bold">
                      1054 CE Ejecta (v ~ 1,500 km/s)
                    </text>

                    {/* Scale bar */}
                    <rect x="560" y="445" width="200" height="30" rx="4" fill="#030713" fillOpacity="0.85" stroke="white" strokeOpacity="0.2" />
                    <text x="572" y="464" fill="#F7FAFF" fontSize="11">
                      Span: 11 ly · Dist: 6,500 ly
                    </text>
                  </g>
                </svg>
              ) : slug === 'sagittarius-a' ? (
                <svg
                  viewBox="0 0 800 500"
                  className="w-full h-full"
                  role="presentation"
                >
                  <g className="font-mono text-xs">
                    {/* Sgr A* Event Horizon */}
                    <circle cx="400" cy="250" r="10" fill="#000" stroke="#F97316" strokeWidth="2.5" />
                    <circle cx="400" cy="250" r="26" fill="none" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="3 3" />
                    <rect x="435" y="238" width="250" height="24" rx="4" fill="#030713" fillOpacity="0.85" stroke="#F97316" strokeWidth="0.8" />
                    <text x="443" y="254" fill="#FDBA74" fontSize="11" fontWeight="bold">
                      Sgr A* SMBH (Mass: 4.15 × 10⁶ M☉)
                    </text>

                    {/* Star S2 Pericenter Orbit */}
                    <ellipse cx="400" cy="250" rx="130" ry="75" transform="rotate(-25 400 250)" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="5 3" />
                    <rect x="190" y="300" width="200" height="22" rx="4" fill="#030713" fillOpacity="0.85" stroke="#38BDF8" strokeWidth="0.8" />
                    <text x="198" y="315" fill="#38BDF8" fontSize="11" fontWeight="bold">
                      S2 Orbit (Closest: 17 light-hrs)
                    </text>

                    {/* Scale bar */}
                    <rect x="530" y="445" width="230" height="30" rx="4" fill="#030713" fillOpacity="0.85" stroke="white" strokeOpacity="0.2" />
                    <text x="542" y="464" fill="#F7FAFF" fontSize="11">
                      Distance: 26,670 ly · Galactic Core
                    </text>
                  </g>
                </svg>
              ) : (
                <svg
                  viewBox="0 0 800 500"
                  className="w-full h-full"
                  role="presentation"
                >
                  <g className="font-mono text-xs">
                    {/* Trapezium Newborn OB Stars */}
                    <circle cx="395" cy="225" r="22" fill="none" stroke="#79D9ED" strokeWidth="1.5" strokeDasharray="4 4" />
                    <circle cx="395" cy="225" r="4" fill="#FFFFFF" />
                    <rect x="425" y="213" width="260" height="24" rx="4" fill="#030713" fillOpacity="0.85" stroke="#79D9ED" strokeWidth="0.8" />
                    <text x="433" y="229" fill="#79D9ED" fontSize="11" fontWeight="bold">
                      Trapezium Cluster (θ¹ Ori · UV Source)
                    </text>

                    {/* Orion Bar Photodissociation Ridge */}
                    <path
                      d="M 230 330 Q 400 300 560 345"
                      fill="none"
                      stroke="#FDE68A"
                      strokeWidth="2.5"
                      strokeDasharray="5 3"
                    />
                    <rect x="340" y="348" width="220" height="22" rx="4" fill="#030713" fillOpacity="0.85" stroke="#FDE68A" strokeWidth="0.8" />
                    <text x="348" y="363" fill="#FDE68A" fontSize="11" fontWeight="bold">
                      Orion Bar Photodissociation Front
                    </text>

                    {/* Protoplanetary Disks (Proplyds) */}
                    <circle cx="330" cy="265" r="6" fill="none" stroke="#F472B6" strokeWidth="1.8" />
                    <rect x="155" y="254" width="165" height="22" rx="4" fill="#030713" fillOpacity="0.85" stroke="#F472B6" strokeWidth="0.8" />
                    <text x="163" y="269" fill="#F472B6" fontSize="10" fontWeight="bold">
                      Protoplanetary Disks (Proplyds)
                    </text>

                    {/* Field Scale */}
                    <rect x="575" y="445" width="185" height="30" rx="4" fill="#030713" fillOpacity="0.85" stroke="white" strokeOpacity="0.2" />
                    <text x="585" y="464" fill="#F7FAFF" fontSize="11">
                      Span: 24 ly · Dist: 1,344 ly
                    </text>
                  </g>
                </svg>
              )}
            </div>
          )}

          {/* Dataset Header Pill */}
          <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#030713]/85 backdrop-blur-sm border border-white/15 text-[11px] font-mono text-[#79D9ED]">
            <span className="w-2 h-2 rounded-full bg-[#79D9ED] animate-pulse" />
            <span className="font-semibold text-white">{dataset.facility}</span>
            <span className="text-white/40">|</span>
            <span className="text-[#B8C4DE]">{dataset.band}</span>
          </div>
        </div>

        {/* Dataset Caption */}
        <p className="mt-2 text-xs text-[#B8C4DE] text-center max-w-2xl">
          <strong>{dataset.title}:</strong> {dataset.caption}
        </p>

        {/* Wavelength & Annotation Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 w-full px-1">
          <div className="text-xs text-[#B8C4DE]">
            <span className="text-white font-medium">Authentic Science:</span>
            <span className="mx-2 text-white/30">·</span>
            <span>
              {slug === 'milky-way'
                ? 'External top-down view is a scientific reconstruction from Gaia & Spitzer data; internal optical view is real ISS photography.'
                : slug === 'andromeda'
                  ? 'Real GALEX ultraviolet and Herschel infrared observations of our sister galaxy 2.54 million light-years away.'
                  : slug === 'crab-nebula'
                    ? 'Hubble visible and Herschel infrared observations of the 1054 CE supernova remnant expanding at 1,500 km/s.'
                    : slug === 'sagittarius-a'
                      ? 'Great Observatories multi-wavelength infrared/X-ray data penetrating 26,000 light-years of interstellar dust to Sgr A*.'
                      : 'Observed from Earth/Hubble line of sight at 1,344 light-years; presented as layered multi-spectral astronomical datasets.'}
            </span>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0D1526] border border-white/15">
            {(['annotated', 'optical', 'infrared'] as const).map((layer) => (
              <button
                key={layer}
                type="button"
                onClick={() => setWavelengthLayer(layer)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${wavelengthLayer === layer
                    ? 'bg-[#79D9ED] text-[#030713]'
                    : 'text-[#B8C4DE] hover:text-white'
                  }`}
              >
                {layer === 'annotated'
                  ? 'Annotated Science'
                  : layer === 'optical'
                    ? 'Optical / Visible'
                    : 'Infrared Dust View'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
