import React, { useRef, useState } from 'react';
import {
  ArrowLeftRight,
  Compass,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { CELESTIAL_CATALOG, getObjectBySlug } from '../data/catalog';
import { computeComparisonRadii } from '../lib/astronomy';
import { useFullscreen } from '../lib/useFullscreen';
import {
  CompareCameraPreset,
  CompareSceneCanvas,
} from '../three/CompareSceneCanvas';

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
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [syncSpin, setSyncSpin] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<CompareCameraPreset>('front');
  const [presetNonce, setPresetNonce] = useState<number>(0);

  const stageContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    isFullscreen,
    isCinematic,
    toggleFullscreen,
    toggleCinematic,
    exitFullscreen,
  } = useFullscreen(stageContainerRef, { enableKeyboardShortcut: true });

  const bodyA = getObjectBySlug(slugA) || getObjectBySlug('jupiter')!;
  const bodyB = getObjectBySlug(slugB) || getObjectBySlug('earth')!;

  const { diameterRatio } = computeComparisonRadii(
    bodyA.metrics.diameterKm,
    bodyB.metrics.diameterKm,
    scaleMode
  );

  // Subpixel indicator detection (when smaller world is < 2.5% diameter of larger)
  const minDiam = Math.min(bodyA.metrics.diameterKm, bodyB.metrics.diameterKm);
  const maxDiam = Math.max(bodyA.metrics.diameterKm, bodyB.metrics.diameterKm);
  const relativePercent = (minDiam / maxDiam) * 100;
  const isExtremeRatio = scaleMode === 'true-scale' && relativePercent < 2.5;
  const smallerBody = bodyA.metrics.diameterKm < bodyB.metrics.diameterKm ? bodyA : bodyB;
  const largerBody = bodyA.metrics.diameterKm < bodyB.metrics.diameterKm ? bodyB : bodyA;

  const handleApplyPreset = (preset: CompareCameraPreset) => {
    setCameraPreset(preset);
    setPresetNonce((n) => n + 1);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#030713] text-[#F7FAFF] py-8 pb-20">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Page Header (hidden in fullscreen) */}
        {!isFullscreen && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-[#79D9ED]">
                Quantitative Planetary Comparison · Scale Literacy
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F7FAFF] mt-1">
                Compare Worlds Side by Side
              </h1>
              <p className="text-sm text-[#B8C4DE] mt-1.5 max-w-2xl">
                Experience authentic 3D textured worlds rendered with calibrated physical proportions.
                Switch between uncompromised geometric ratio and presentation scale.
              </p>
            </div>

            {/* Scale Mode Segmented Control */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl bg-[#0D1526] border border-white/15 self-start md:self-auto shrink-0 shadow-inner"
              role="radiogroup"
              aria-label="Comparison scale mode"
            >
              <button
                type="button"
                role="radio"
                aria-checked={scaleMode === 'true-scale'}
                onClick={() => setScaleMode('true-scale')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  scaleMode === 'true-scale'
                    ? 'bg-[#79D9ED] text-[#030713] shadow-md'
                    : 'text-[#B8C4DE] hover:text-white'
                }`}
              >
                True Scale Ratio (1:1)
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={scaleMode === 'presentation'}
                onClick={() => setScaleMode('presentation')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  scaleMode === 'presentation'
                    ? 'bg-[#D7B77B] text-[#030713] shadow-md'
                    : 'text-[#B8C4DE] hover:text-white'
                }`}
              >
                Presentation Scale (Logarithmic)
              </button>
            </div>
          </div>
        )}

        {/* World Selectors Bar (hidden in fullscreen) */}
        {!isFullscreen && (
          <div className="p-4 sm:p-5 rounded-2xl border border-white/15 bg-[#0D1526] flex flex-col sm:flex-row items-center gap-4 shadow-lg mb-6">
            <div className="w-full sm:flex-1">
              <label htmlFor="compare-select-a" className="block text-xs font-medium text-[#B8C4DE] mb-1.5">
                First World (Left)
              </label>
              <select
                id="compare-select-a"
                value={bodyA.slug}
                onChange={(e) => setSlugA(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#030713] border border-white/20 text-sm text-[#F7FAFF] focus:border-[#79D9ED] focus:outline-none transition-colors"
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
              className="mt-0 sm:mt-5 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-white/20 bg-[#070D1D] text-xs font-semibold text-[#B8C4DE] hover:text-white hover:border-[#79D9ED] transition-all whitespace-nowrap shrink-0 shadow-sm"
            >
              <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
              <span>Swap Worlds</span>
            </button>

            <div className="w-full sm:flex-1">
              <label htmlFor="compare-select-b" className="block text-xs font-medium text-[#B8C4DE] mb-1.5">
                Second World (Right)
              </label>
              <select
                id="compare-select-b"
                value={bodyB.slug}
                onChange={(e) => setSlugB(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#030713] border border-white/20 text-sm text-[#F7FAFF] focus:border-[#79D9ED] focus:outline-none transition-colors"
              >
                {COMPARABLE_BODIES.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name} ({b.metrics.diameterKm.toLocaleString()} km)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 3D Visual Stage Container (Fullscreen Target) */}
        <div
          ref={stageContainerRef}
          data-testid="compare-stage-wrapper"
          className={`relative rounded-2xl border border-white/15 bg-[#030713] overflow-hidden flex flex-col justify-between transition-all ${
            isFullscreen
              ? 'fixed inset-0 z-50 rounded-none border-0 w-screen h-screen'
              : 'min-h-[480px] h-[540px] sm:h-[600px] shadow-2xl'
          }`}
        >
          {/* 3D Canvas Background */}
          <div className="absolute inset-0 w-full h-full z-0">
            <CompareSceneCanvas
              bodyA={bodyA}
              bodyB={bodyB}
              scaleMode={scaleMode}
              isPaused={isPaused}
              syncSpin={syncSpin}
              cameraPreset={cameraPreset}
              presetNonce={presetNonce}
              onInspectObject={onInspectObject}
              ariaLabel={`Interactive 3D comparison of ${bodyA.name} and ${bodyB.name}`}
            />
          </div>

          {/* Top Overlay Controls Bar */}
          {!isCinematic ? (
            <div className="relative z-10 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
              {/* Ratio Badge & Scale Mode Indicator */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pointer-events-auto">
                <div className="px-3 py-1.5 rounded-lg bg-[#030713]/85 backdrop-blur-md border border-white/20 text-xs font-mono text-[#79D9ED] shadow-lg">
                  <span className="font-semibold">{bodyA.name}</span> is{' '}
                  <span className="font-bold text-white">
                    {diameterRatio >= 1
                      ? `${diameterRatio.toFixed(2)}× wider than`
                      : `${(1 / diameterRatio).toFixed(2)}× narrower than`}
                  </span>{' '}
                  <span className="font-semibold">{bodyB.name}</span>
                </div>
                <div className="px-2.5 py-1.5 rounded-lg bg-[#030713]/70 backdrop-blur-md border border-white/15 text-[11px] font-mono text-[#D7B77B]">
                  {scaleMode === 'true-scale'
                    ? 'TRUE 1:1 GEOMETRIC DIAMETER'
                    : 'LOGARITHMIC PRESENTATION SCALE'}
                </div>
              </div>

              {/* Fullscreen & Cinematic Action Dock */}
              <div className="flex items-center gap-1.5 pointer-events-auto bg-[#030713]/80 backdrop-blur-md border border-white/20 p-1.5 rounded-xl shadow-lg">
                {/* Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit Fullscreen (Esc or F)' : 'Fullscreen 360° Stage (F)'}
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Stage'}
                  className="p-2 rounded-lg text-[#B8C4DE] hover:text-white hover:bg-white/10 transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4 text-[#79D9ED]" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>

                {/* Cinematic (Hide UI) Toggle */}
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
            </div>
          ) : (
            /* Cinematic Mode Minimal Prompt */
            <div className="relative z-10 p-4 flex justify-between items-center pointer-events-none">
              <div />
              <button
                type="button"
                onClick={toggleCinematic}
                className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#030713]/80 backdrop-blur-md border border-white/20 text-xs text-[#B8C4DE] hover:text-white transition-all shadow-lg"
              >
                <EyeOff className="w-3.5 h-3.5 text-[#79D9ED]" />
                <span>Cinematic Mode · Tap or press [C] to restore controls</span>
              </button>
            </div>
          )}

          {/* Subpixel Callout Banner (when smaller world is < 2.5% of larger in true-scale) */}
          {!isCinematic && isExtremeRatio && (
            <div className="relative z-10 px-4 sm:px-6 pointer-events-none">
              <div className="max-w-2xl mx-auto p-2.5 sm:p-3 rounded-xl bg-[#070D1D]/90 backdrop-blur-md border border-[#79D9ED]/40 text-xs text-[#EAF6FF] shadow-2xl pointer-events-auto flex items-start gap-2.5">
                <span className="text-[#79D9ED] font-bold text-sm leading-none mt-0.5">ⓘ</span>
                <div>
                  <span className="font-semibold text-[#79D9ED]">Subpixel Scale Callout:</span>{' '}
                  {smallerBody.name} is only{' '}
                  <span className="font-mono font-bold text-white">
                    {relativePercent.toFixed(2)}%
                  </span>{' '}
                  the physical diameter of {largerBody.name}. A cyan locator beacon marks its position.
                  Zoom in with mouse wheel or pinch gesture to explore without geometric distortion.
                </div>
              </div>
            </div>
          )}

          {/* Bottom Floating Control Dock */}
          {!isCinematic && (
            <div className="relative z-10 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-none">
              {/* Left & Right Object Labels with 360° Jump Link */}
              <div className="w-full flex justify-between items-center px-2 pointer-events-auto">
                <div className="flex flex-col items-start bg-[#030713]/70 backdrop-blur-sm p-2 rounded-lg border border-white/10">
                  <div className="font-display font-bold text-sm sm:text-base text-white">
                    {bodyA.name}
                  </div>
                  <div className="text-[11px] font-mono text-[#B8C4DE]">
                    {bodyA.metrics.diameterKm.toLocaleString()} km
                  </div>
                  <button
                    type="button"
                    onClick={() => onInspectObject(bodyA.slug)}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#79D9ED] hover:text-white hover:underline transition-colors"
                  >
                    <Compass className="w-3 h-3" />
                    <span>360° View</span>
                  </button>
                </div>

                {/* Fullscreen In-Canvas World Selectors if in fullscreen mode */}
                {isFullscreen && (
                  <div className="hidden md:flex items-center gap-2 bg-[#030713]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                    <select
                      value={bodyA.slug}
                      onChange={(e) => setSlugA(e.target.value)}
                      className="bg-[#0D1526] text-xs text-white border border-white/20 rounded px-2 py-1"
                    >
                      {COMPARABLE_BODIES.map((b) => (
                        <option key={b.slug} value={b.slug}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setSlugA(bodyB.slug);
                        setSlugB(bodyA.slug);
                      }}
                      className="p-1 rounded bg-[#070D1D] text-xs text-[#B8C4DE] hover:text-white"
                      title="Swap"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>
                    <select
                      value={bodyB.slug}
                      onChange={(e) => setSlugB(e.target.value)}
                      className="bg-[#0D1526] text-xs text-white border border-white/20 rounded px-2 py-1"
                    >
                      {COMPARABLE_BODIES.map((b) => (
                        <option key={b.slug} value={b.slug}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <div className="h-4 w-px bg-white/20 mx-1" />
                    <button
                      type="button"
                      onClick={() =>
                        setScaleMode(scaleMode === 'true-scale' ? 'presentation' : 'true-scale')
                      }
                      className="px-2 py-1 text-xs font-semibold rounded bg-[#070D1D] text-[#79D9ED] hover:bg-white/10"
                    >
                      {scaleMode === 'true-scale' ? 'True Scale' : 'Presentation'}
                    </button>
                  </div>
                )}

                <div className="flex flex-col items-end text-right bg-[#030713]/70 backdrop-blur-sm p-2 rounded-lg border border-white/10">
                  <div className="font-display font-bold text-sm sm:text-base text-white">
                    {bodyB.name}
                  </div>
                  <div className="text-[11px] font-mono text-[#B8C4DE]">
                    {bodyB.metrics.diameterKm.toLocaleString()} km
                  </div>
                  <button
                    type="button"
                    onClick={() => onInspectObject(bodyB.slug)}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#79D9ED] hover:text-white hover:underline transition-colors"
                  >
                    <Compass className="w-3 h-3" />
                    <span>360° View</span>
                  </button>
                </div>
              </div>

              {/* Central Floating Interactive Controls Dock */}
              <div className="mx-auto flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-xl bg-[#030713]/90 backdrop-blur-md border border-white/20 shadow-2xl pointer-events-auto">
                {/* Pause / Spin Button */}
                <button
                  type="button"
                  onClick={() => setIsPaused((p) => !p)}
                  title={isPaused ? 'Resume Rotation' : 'Pause Rotation'}
                  aria-label={isPaused ? 'Resume Rotation' : 'Pause Rotation'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0D1526] text-[#B8C4DE] hover:text-white hover:bg-white/10 transition-colors"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-[#79D9ED]" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>

                {/* Synchronized Spin Toggle */}
                <button
                  type="button"
                  onClick={() => setSyncSpin((s) => !s)}
                  title={
                    syncSpin
                      ? 'Synchronized: Both worlds spin at lockstep 20s period'
                      : 'Physical: Worlds spin according to physical sidereal rotation speeds'
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    syncSpin
                      ? 'bg-[#79D9ED]/20 text-[#79D9ED] border border-[#79D9ED]/40'
                      : 'bg-[#0D1526] text-[#B8C4DE] hover:text-white'
                  }`}
                >
                  Sync Spin: {syncSpin ? 'On' : 'Physical'}
                </button>

                <div className="h-4 w-px bg-white/20 mx-0.5" />

                {/* Camera Presets */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('front')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      cameraPreset === 'front'
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-[#B8C4DE] hover:text-white'
                    }`}
                  >
                    Front
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('above')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      cameraPreset === 'above'
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-[#B8C4DE] hover:text-white'
                    }`}
                  >
                    Above
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('tilted')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      cameraPreset === 'tilted'
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-[#B8C4DE] hover:text-white'
                    }`}
                  >
                    Tilted
                  </button>
                </div>

                <div className="h-4 w-px bg-white/20 mx-0.5" />

                {/* Reset Camera */}
                <button
                  type="button"
                  onClick={() => handleApplyPreset('front')}
                  title="Reset Camera View"
                  aria-label="Reset Camera View"
                  className="p-1.5 rounded-lg text-[#B8C4DE] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* In Fullscreen: Exit Button */}
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

        {/* Tabular Physical Measurements Table (Preserved) */}
        <div className="mt-8 rounded-2xl border border-white/15 bg-[#0D1526] overflow-x-auto shadow-xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Physical Measurement Comparison</h3>
            <span className="text-xs font-mono text-[#B8C4DE]">NASA Planetary Fact Sheet Data</span>
          </div>
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
