import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GraduationCap,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Scale,
} from 'lucide-react';
import { CELESTIAL_CATALOG, getObjectBySlug } from '../data/catalog';
import { ReadingDepth, ShowBookmark, UserPreferences } from '../lib/voyageStore';
import { useFullscreen } from '../lib/useFullscreen';
import { CameraPreset, PlanetSceneCanvas } from '../three/PlanetSceneCanvas';
import { DeepSkyObservationPlate } from './DeepSkyObservationPlate';
import { AppRoute } from './Header';

interface ObjectDetailViewProps {
  objectSlug: string;
  preferences: UserPreferences;
  showBookmark: ShowBookmark | null;
  classroomPresentation: boolean;
  onUpdatePreferences: (patch: Partial<UserPreferences>) => void;
  onSelectObject: (slug: string) => void;
  onCompareWithEarth: (slug: string) => void;
  onReturnToShow: () => void;
  onStartRelatedShow: (showSlug: string) => void;
  onNavigate: (route: AppRoute) => void;
}

type DrawerTab = 'overview' | 'structure' | 'moons' | 'missions' | 'sources';

export const ObjectDetailView: React.FC<ObjectDetailViewProps> = ({
  objectSlug,
  preferences,
  showBookmark,
  classroomPresentation,
  onUpdatePreferences,
  onSelectObject,
  onCompareWithEarth,
  onReturnToShow,
  onStartRelatedShow,
  onNavigate,
}) => {
  const object = getObjectBySlug(objectSlug) || getObjectBySlug('saturn')!;
  const [activeTab, setActiveTab] = useState<DrawerTab>('overview');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('default');
  const [presetNonce, setPresetNonce] = useState<number>(1);
  const [spinPaused, setSpinPaused] = useState<boolean>(false);
  const [showScienceAxes, setShowScienceAxes] = useState<boolean>(false);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  const [teacherOpen, setTeacherOpen] = useState<boolean>(classroomPresentation);
  const [surfaceVariant, setSurfaceVariant] = useState<'standard' | 'radar'>('standard');
  const [orbitCmd, setOrbitCmd] = useState<{
    yawDeg: number;
    pitchDeg: number;
    zoomScale: number;
    nonce: number;
  }>({ yawDeg: 0, pitchDeg: 0, zoomScale: 1, nonce: 0 });

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const {
    isFullscreen,
    isCinematic,
    toggleFullscreen,
    toggleCinematic,
    exitFullscreen,
  } = useFullscreen(viewportRef, { enableKeyboardShortcut: true });

  // Reset preset when switching objects
  useEffect(() => {
    setCameraPreset(object.visual.hasRings ? 'rings' : 'default');
    setPresetNonce((n) => n + 1);
    setActiveTab('overview');
    setSurfaceVariant('standard');
  }, [object.slug, object.visual.hasRings]);

  useEffect(() => {
    if (classroomPresentation) setTeacherOpen(true);
  }, [classroomPresentation]);

  // Keyboard shortcut 'H' to toggle HUD dock visibility
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toUpperCase();
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const triggerStep = (yawDeg: number, pitchDeg: number, zoomScale: number) => {
    setOrbitCmd((prev) => ({ yawDeg, pitchDeg, zoomScale, nonce: prev.nonce + 1 }));
  };

  const applyPreset = (p: CameraPreset) => {
    setCameraPreset(p);
    setPresetNonce((n) => n + 1);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#030713] text-[#F7FAFF] flex flex-col lg:flex-row">
      {/* Left/Center 70% Immersive Viewport */}
      <div
        ref={viewportRef}
        data-testid="object-viewport"
        className={`flex-1 relative flex flex-col justify-between overflow-hidden transition-all ${isFullscreen
            ? 'fixed inset-0 z-50 w-screen h-screen bg-[#030713]'
            : 'min-h-[520px] lg:min-h-[calc(100vh-4rem)]'
          }`}
      >
        {/* Top Breadcrumb & Return-to-Show Bar */}
        {!isCinematic ? (
          <div className="relative z-20 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 bg-[#030713]/92 border-b border-white/10">
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => onNavigate('explore')}
                className="inline-flex items-center gap-1.5 text-[#B8C4DE] hover:text-white font-medium transition-colors whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Explorer</span>
              </button>
              <span className="text-white/30" aria-hidden="true">/</span>
              <span className="text-[#F7FAFF] font-semibold">{object.name}</span>
              <span className="text-white/30" aria-hidden="true">·</span>
              <span className="font-mono text-[#79D9ED]">
                {object.slug === 'venus' && surfaceVariant === 'radar' ? 'DATA-BASED' : object.authenticityTier}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {showBookmark && (
                <button
                  type="button"
                  onClick={onReturnToShow}
                  className="px-3.5 py-1.5 rounded-lg bg-[#D7B77B] text-[#030713] text-xs font-semibold hover:bg-[#e6c993] transition-colors whitespace-nowrap shrink-0"
                >
                  Return to Show (Ch. {showBookmark.chapterIndex + 1}) ↗
                </button>
              )}

              {!isFullscreen && (
                <button
                  type="button"
                  onClick={() => setDrawerOpen((prev) => !prev)}
                  aria-expanded={drawerOpen}
                  className="px-3 py-1.5 rounded-lg border border-white/15 bg-[#0D1526] text-xs font-medium text-[#F7FAFF] hover:border-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
                >
                  {drawerOpen ? 'Hide Encyclopedia' : 'Show Encyclopedia'}
                </button>
              )}

              {/* Fullscreen & Cinematic Action Dock */}
              <div className="flex items-center gap-1 border-l border-white/15 pl-2 ml-1">
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit Fullscreen (Esc or F)' : 'Fullscreen 360° Dome (F)'}
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Stage'}
                  className="p-1.5 rounded-lg border border-white/15 bg-[#0D1526] text-xs font-medium text-[#B8C4DE] hover:text-white hover:border-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5 text-[#79D9ED]" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={toggleCinematic}
                  title="Cinematic Mode (C) - Hide UI overlays"
                  aria-label="Toggle Cinematic Mode"
                  className="p-1.5 rounded-lg border border-white/15 bg-[#0D1526] text-xs font-medium text-[#B8C4DE] hover:text-white hover:border-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-30 p-4 flex justify-end pointer-events-none">
            <button
              type="button"
              onClick={toggleCinematic}
              className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#030713]/85 backdrop-blur-md border border-white/20 text-xs text-[#B8C4DE] hover:text-white transition-all shadow-lg"
            >
              <EyeOff className="w-3.5 h-3.5 text-[#79D9ED]" />
              <span>Cinematic Mode · Tap or press [C] to restore controls</span>
            </button>
          </div>
        )}

        {/* Central Unobstructed 3D / Observation Viewport */}
        <div className="flex-1 relative min-h-[380px]">
          {object.isOrbitable3D ? (
            <div className="absolute inset-0">
              <PlanetSceneCanvas
                mode="object"
                objectSlug={object.slug}
                surfaceVariant={surfaceVariant}
                cameraPreset={cameraPreset}
                presetNonce={presetNonce}
                orbitStepCommand={orbitCmd}
                isPaused={spinPaused || preferences.reducedMotion}
                reducedMotion={preferences.reducedMotion}
                showScienceLabels={showScienceAxes}
                qualityTier={preferences.qualityTier}
                onSelectObject={onSelectObject}
                ariaLabel={`Interactive 360 degree 3D scene of ${object.name}`}
              />
            </div>
          ) : (
            <div className="absolute inset-0">
              <DeepSkyObservationPlate object={object} />
            </div>
          )}

          {/* Top-Left Minimal Spec & Authenticity Provenance Overlay */}
          {!isCinematic && (
            <div className="relative z-10 pointer-events-none p-4 sm:p-5 max-w-md">
              <div className="inline-block bg-[#060C1C]/90 border border-white/15 rounded-xl px-3.5 py-2">
                <div className="text-[11px] font-mono text-[#79D9ED]">
                  {object.isOrbitable3D ? '360° ORBITABLE 3D MODEL' : 'ASTRONOMICAL OBSERVATION'} ·{' '}
                  {object.slug === 'venus' && surfaceVariant === 'radar' ? 'DATA-BASED' : object.authenticityTier}
                </div>
                <p className="text-[11px] text-[#B8C4DE] mt-0.5 leading-snug">
                  {object.slug === 'venus' && surfaceVariant === 'radar'
                    ? 'NASA Magellan Synthetic Aperture Radar (SAR) false-color topographic altimetry penetrating the opaque cloud deck.'
                    : object.authenticityNote}
                </p>
              </div>
            </div>
          )}

          {/* Collapsible Unified Bottom Camera Control Dock (3D Objects only) */}
          {!isCinematic && object.isOrbitable3D && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[min(920px,94%)] flex flex-col items-center">
              <button
                type="button"
                onClick={() => setDockCollapsed((prev) => !prev)}
                aria-expanded={!dockCollapsed}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-t-lg border border-b-0 border-white/15 bg-[#091224] text-[11px] font-medium text-[#B8C4DE] hover:text-white transition-colors"
              >
                {dockCollapsed ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Show Camera Controls (H)</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Hide Controls (H)</span>
                  </>
                )}
              </button>

              {!dockCollapsed && (
                <div
                  role="toolbar"
                  aria-label="3D Camera and Science Controls"
                  className="w-full bg-[#091224]/95 border border-white/15 rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-center gap-2"
                >
                  {/* Accessible Keyboard/Click Orbit & Zoom Controls */}
                  <button
                    type="button"
                    onClick={() => triggerStep(-28, 0, 1)}
                    aria-label="Orbit camera left"
                    className="px-2.5 py-1.5 rounded-lg border border-white/15 bg-[#030713] text-xs text-[#F7FAFF] hover:border-[#79D9ED] whitespace-nowrap shrink-0"
                  >
                    ↶ Orbit Left
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerStep(28, 0, 1)}
                    aria-label="Orbit camera right"
                    className="px-2.5 py-1.5 rounded-lg border border-white/15 bg-[#030713] text-xs text-[#F7FAFF] hover:border-[#79D9ED] whitespace-nowrap shrink-0"
                  >
                    ↷ Orbit Right
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerStep(0, 0, 0.82)}
                    aria-label="Zoom camera closer"
                    className="px-2.5 py-1.5 rounded-lg border border-white/15 bg-[#030713] text-xs text-[#F7FAFF] hover:border-[#79D9ED] whitespace-nowrap shrink-0"
                  >
                    ＋ Zoom
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerStep(0, 0, 1.22)}
                    aria-label="Zoom camera out"
                    className="px-2.5 py-1.5 rounded-lg border border-white/15 bg-[#030713] text-xs text-[#F7FAFF] hover:border-[#79D9ED] whitespace-nowrap shrink-0"
                  >
                    － Zoom
                  </button>

                  <span className="h-4 w-px bg-white/15 mx-0.5 hidden sm:inline-block" aria-hidden="true" />

                  {/* Venus Dual Observation Mode (Visible Clouds vs Magellan Radar) */}
                  {object.slug === 'venus' && (
                    <>
                      <div className="inline-flex rounded-lg p-0.5 bg-[#030713] border border-white/15" role="group" aria-label="Venus Surface View">
                        <button
                          type="button"
                          onClick={() => setSurfaceVariant('standard')}
                          className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${surfaceVariant === 'standard'
                            ? 'bg-[#79D9ED]/20 text-[#79D9ED] border border-[#79D9ED]/40'
                            : 'text-[#B8C4DE] hover:text-white'
                            }`}
                        >
                          Visible Cloud Deck
                        </button>
                        <button
                          type="button"
                          onClick={() => setSurfaceVariant('radar')}
                          className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${surfaceVariant === 'radar'
                            ? 'bg-[#EAB308]/20 text-[#FDE047] border border-[#EAB308]/40'
                            : 'text-[#B8C4DE] hover:text-white'
                            }`}
                        >
                          Magellan Radar Surface
                        </button>
                      </div>
                      <span className="h-4 w-px bg-white/15 mx-0.5 hidden sm:inline-block" aria-hidden="true" />
                    </>
                  )}

                  {/* Named Camera Presets */}
                  <button
                    type="button"
                    onClick={() => applyPreset('above')}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs whitespace-nowrap shrink-0 ${cameraPreset === 'above'
                      ? 'border-[#79D9ED] bg-[#79D9ED]/15 text-[#79D9ED]'
                      : 'border-white/15 bg-[#030713] text-[#B8C4DE] hover:text-white'
                      }`}
                  >
                    From Above
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('equator')}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs whitespace-nowrap shrink-0 ${cameraPreset === 'equator'
                      ? 'border-[#79D9ED] bg-[#79D9ED]/15 text-[#79D9ED]'
                      : 'border-white/15 bg-[#030713] text-[#B8C4DE] hover:text-white'
                      }`}
                  >
                    Equator
                  </button>
                  {object.visual.hasRings && (
                    <button
                      type="button"
                      onClick={() => applyPreset('rings')}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs whitespace-nowrap shrink-0 ${cameraPreset === 'rings'
                        ? 'border-[#79D9ED] bg-[#79D9ED]/15 text-[#79D9ED]'
                        : 'border-white/15 bg-[#030713] text-[#B8C4DE] hover:text-white'
                        }`}
                    >
                      Ring Tilt
                    </button>
                  )}
                  {object.visual.moons && object.visual.moons.length > 0 && (
                    <button
                      type="button"
                      onClick={() => applyPreset('moons')}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs whitespace-nowrap shrink-0 ${cameraPreset === 'moons'
                        ? 'border-[#79D9ED] bg-[#79D9ED]/15 text-[#79D9ED]'
                        : 'border-white/15 bg-[#030713] text-[#B8C4DE] hover:text-white'
                        }`}
                    >
                      Moons View
                    </button>
                  )}

                  <span className="h-4 w-px bg-white/15 mx-0.5 hidden sm:inline-block" aria-hidden="true" />

                  {/* Science Axis & Motion Toggles */}
                  <button
                    type="button"
                    onClick={() => setShowScienceAxes((prev) => !prev)}
                    aria-pressed={showScienceAxes}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs whitespace-nowrap shrink-0 ${showScienceAxes
                      ? 'border-[#D7B77B] text-[#D7B77B] bg-[#030713]'
                      : 'border-white/15 text-[#B8C4DE] bg-[#030713] hover:text-white'
                      }`}
                  >
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Tilt Axis ({object.metrics.axialTiltDeg}°)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpinPaused((prev) => !prev)}
                    aria-pressed={spinPaused}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/15 bg-[#030713] text-xs text-[#F7FAFF] hover:border-[#79D9ED] whitespace-nowrap shrink-0"
                  >
                    {spinPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    <span>{spinPaused ? 'Spin' : 'Pause'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('default')}
                    aria-label="Reset camera view"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/15 bg-[#030713] text-xs text-[#B8C4DE] hover:text-white whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" aria-hidden="true" />
                    <span>Reset</span>
                  </button>

                  <span className="h-4 w-px bg-white/15 mx-0.5 hidden sm:inline-block" aria-hidden="true" />

                  {/* Fullscreen Button in Dock */}
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Exit Fullscreen (Esc or F)' : 'Fullscreen 360° Dome (F)'}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/15 bg-[#030713] text-xs text-[#B8C4DE] hover:text-white whitespace-nowrap shrink-0"
                  >
                    {isFullscreen ? <Minimize2 className="w-3 h-3 text-[#79D9ED]" /> : <Maximize2 className="w-3 h-3" />}
                    <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right 30% Collapsible Knowledge & Provenance Drawer */}
      {!isFullscreen && drawerOpen && (
        <aside
          aria-label={`${object.name} encyclopedia panel`}
          className="w-full lg:w-[410px] xl:w-[440px] border-t lg:border-t-0 lg:border-l border-white/10 bg-[#080F20] p-6 sm:p-7 overflow-y-auto lg:max-h-[calc(100vh-4rem)] shrink-0 space-y-6"
        >
          {/* Header & Reading Level Switcher */}
          <div>
            <div className="text-xs text-[#B8C4DE]">
              <span>{object.classification}</span>
              <span className="mx-1.5 text-white/30">·</span>
              <span className="font-mono text-[#79D9ED]">{object.authenticityTier}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F7FAFF] mt-1">
              {object.name}
            </h1>
            <p className="text-sm text-[#B8C4DE] mt-2 leading-relaxed">{object.hook}</p>

            {/* Quick Reading Depth Selector */}
            <div className="mt-4 flex items-center justify-between gap-2 p-1 rounded-lg bg-[#030713] border border-white/10">
              {(
                [
                  { id: 'young', label: 'Ages 7–12' },
                  { id: 'curious', label: 'Curious Minds' },
                  { id: 'enthusiast', label: 'Enthusiast' },
                ] as Array<{ id: ReadingDepth; label: string }>
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onUpdatePreferences({ readingDepth: lvl.id })}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${preferences.readingDepth === lvl.id
                    ? 'bg-[#79D9ED] text-[#030713] font-semibold'
                    : 'text-[#B8C4DE] hover:text-white'
                    }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info Tabs */}
          <div
            role="tablist"
            aria-label="Encyclopedia sections"
            className="flex flex-wrap gap-1 border-b border-white/10 pb-2"
          >
            {(
              [
                { id: 'overview', label: 'Overview' },
                { id: 'structure', label: 'Structure' },
                {
                  id: 'moons',
                  label: object.visual.hasRings ? 'Rings & Moons' : 'Neighborhood',
                },
                { id: 'missions', label: 'Missions' },
                { id: 'sources', label: 'Sources' },
              ] as Array<{ id: DrawerTab; label: string }>
            ).map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={activeTab === t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${activeTab === t.id
                  ? 'bg-white/15 text-[#F7FAFF]'
                  : 'text-[#B8C4DE] hover:text-white'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Panel Body */}
          <div className="space-y-4 text-sm text-[#B8C4DE] leading-relaxed">
            {activeTab === 'overview' && (
              <>
                <p className="text-[#F7FAFF]">{object.readingLevels[preferences.readingDepth]}</p>
                <p>{object.tabs.overview}</p>
                <div className="p-4 rounded-xl border border-white/10 bg-[#0D162C]">
                  <div className="text-xs font-medium text-[#D7B77B]">Signature Fact</div>
                  <p className="text-xs text-[#F7FAFF] mt-1 leading-relaxed">
                    {object.signatureFact}
                  </p>
                </div>
              </>
            )}

            {activeTab === 'structure' && (
              <div className="space-y-3">
                <h2 className="font-display text-base font-semibold text-[#F7FAFF]">
                  Interior &amp; Atmosphere
                </h2>
                <p>{object.tabs.structure}</p>
              </div>
            )}

            {activeTab === 'moons' && (
              <div className="space-y-4">
                <h2 className="font-display text-base font-semibold text-[#F7FAFF]">
                  {object.visual.hasRings ? 'Ring System & Satellites' : 'Orbital Companions'}
                </h2>
                <p>{object.tabs.ringsOrMoons}</p>
                {object.visual.moons && object.visual.moons.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {object.visual.moons.map((m) => (
                      <div
                        key={m.name}
                        className="p-3 rounded-lg border border-white/10 bg-[#0D162C] flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="text-xs font-semibold text-[#F7FAFF]">{m.name}</div>
                          <p className="text-xs text-[#B8C4DE] mt-0.5">{m.fact}</p>
                        </div>
                        {m.slug && (
                          <button
                            type="button"
                            onClick={() => onSelectObject(m.slug!)}
                            className="text-xs font-semibold text-[#79D9ED] hover:text-white whitespace-nowrap shrink-0"
                          >
                            Visit ↗
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'missions' && (
              <div className="space-y-3">
                <h2 className="font-display text-base font-semibold text-[#F7FAFF]">
                  Spacecraft &amp; Observatory Heritage
                </h2>
                <p>{object.tabs.missions}</p>
              </div>
            )}

            {activeTab === 'sources' && (
              <div className="space-y-3">
                <h2 className="font-display text-base font-semibold text-[#F7FAFF]">
                  Scientific &amp; Asset Provenance
                </h2>
                {object.sources.map((src) => (
                  <div
                    key={src.assetId}
                    className="p-4 rounded-xl border border-white/10 bg-[#0D162C] space-y-1.5 text-xs"
                  >
                    <div className="font-mono text-[#79D9ED]">
                      {src.assetId} · {src.authenticityTier} · Epoch {src.dataEpoch}
                    </div>
                    <div className="font-semibold text-[#F7FAFF]">{src.title}</div>
                    <div className="text-[#B8C4DE]">{src.organization}</div>
                    <div className="text-[#7F90B0]">{src.creditLine}</div>
                    <div className="text-[#7F90B0]">License: {src.license}</div>
                    <a
                      href={src.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block pt-1 text-[#79D9ED] hover:underline"
                    >
                      Official Reference Documentation ↗
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quantitative Fact Tiles (Tabular Numerals) */}
          <dl className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
            <div className="p-3.5 rounded-xl border border-white/10 bg-[#0C1427]">
              <dt className="text-[11px] text-[#7F90B0]">Diameter / Span</dt>
              <dd className="font-mono text-xs font-semibold text-[#F7FAFF] mt-1">
                {object.metrics.diameterLabel}
              </dd>
            </div>
            <div className="p-3.5 rounded-xl border border-white/10 bg-[#0C1427]">
              <dt className="text-[11px] text-[#7F90B0]">Orbital Period</dt>
              <dd className="font-mono text-xs font-semibold text-[#F7FAFF] mt-1">
                {object.metrics.orbitalPeriodLabel}
              </dd>
            </div>
            <div className="p-3.5 rounded-xl border border-white/10 bg-[#0C1427]">
              <dt className="text-[11px] text-[#7F90B0]">Rotation / Day</dt>
              <dd className="font-mono text-xs font-semibold text-[#F7FAFF] mt-1">
                {object.metrics.dayLengthLabel}
              </dd>
            </div>
            <div className="p-3.5 rounded-xl border border-white/10 bg-[#0C1427]">
              <dt className="text-[11px] text-[#7F90B0]">Gravity</dt>
              <dd className="font-mono text-xs font-semibold text-[#F7FAFF] mt-1">
                {object.metrics.gravityLabel}
              </dd>
            </div>
            <div className="p-3.5 rounded-xl border border-white/10 bg-[#0C1427]">
              <dt className="text-[11px] text-[#7F90B0]">Distance</dt>
              <dd className="font-mono text-xs font-semibold text-[#D7B77B] mt-1">
                {object.metrics.distanceLabel}
              </dd>
            </div>
            <div className="p-3.5 rounded-xl border border-white/10 bg-[#0C1427]">
              <dt className="text-[11px] text-[#7F90B0]">Temperature</dt>
              <dd className="font-mono text-xs font-semibold text-[#F7FAFF] mt-1">
                {object.metrics.meanTempLabel}
              </dd>
            </div>
          </dl>

          {/* Related Actions */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            {object.category !== 'galaxy-nebula' && object.slug !== 'earth' && (
              <button
                type="button"
                onClick={() => onCompareWithEarth(object.slug)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#79D9ED] text-[#030713] text-xs font-semibold hover:bg-[#9BE4F4] transition-colors whitespace-nowrap shrink-0"
              >
                <Scale className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Compare with Earth</span>
              </button>
            )}
            {object.slug === 'earth' && (
              <button
                type="button"
                onClick={() => onCompareWithEarth('jupiter')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#79D9ED] text-[#030713] text-xs font-semibold hover:bg-[#9BE4F4] transition-colors whitespace-nowrap shrink-0"
              >
                <Scale className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Compare with Jupiter</span>
              </button>
            )}
            {object.slug === 'saturn' && (
              <>
                <button
                  type="button"
                  onClick={() => onSelectObject('titan')}
                  className="px-3.5 py-2 rounded-lg border border-white/20 text-xs font-semibold text-[#F7FAFF] hover:border-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
                >
                  Visit Moon Titan ↗
                </button>
                <button
                  type="button"
                  onClick={() => onStartRelatedShow('rings-of-saturn')}
                  className="px-3.5 py-2 rounded-lg border border-white/20 text-xs font-semibold text-[#F7FAFF] hover:border-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
                >
                  Saturn Guided Show ↗
                </button>
              </>
            )}
          </div>

          {/* Educator / Classroom Guide Disclosure */}
          <div className="border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => setTeacherOpen((prev) => !prev)}
              aria-expanded={teacherOpen}
              className="w-full flex items-center justify-between text-xs font-semibold text-[#9F95F0] hover:text-white py-1"
            >
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" aria-hidden="true" />
                <span>Classroom &amp; Educator Notes</span>
              </span>
              <span>{teacherOpen ? '−' : '+'}</span>
            </button>

            {teacherOpen && (
              <div className="mt-3 p-4 rounded-xl border border-white/10 bg-[#0D1529] space-y-2.5 text-xs text-[#B8C4DE]">
                <div>
                  <strong className="text-[#F7FAFF]">Core Concept:</strong> {object.teacherNotes.keyConcept}
                </div>
                <div>
                  <strong className="text-[#D7B77B]">Common Misconception:</strong>{' '}
                  {object.teacherNotes.misconceptionWarning}
                </div>
                <div>
                  <strong className="text-[#79D9ED]">Discussion Prompt:</strong>{' '}
                  {object.teacherNotes.discussionPrompt}
                </div>
              </div>
            )}
          </div>

          {/* Quick Planet Switcher Footer */}
          <div className="border-t border-white/10 pt-4">
            <label htmlFor="drawer-jump-select" className="block text-[11px] text-[#7F90B0] mb-1.5">
              Jump directly to another catalog entry
            </label>
            <select
              id="drawer-jump-select"
              value={object.slug}
              onChange={(e) => onSelectObject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#030713] border border-white/15 text-xs text-[#F7FAFF]"
            >
              {CELESTIAL_CATALOG.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name} ({c.authenticityTier})
                </option>
              ))}
            </select>
          </div>
        </aside>
      )}
    </div>
  );
};
