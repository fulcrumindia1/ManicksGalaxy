import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Eye,
  EyeOff,
  List,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Subtitles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { getObjectBySlug } from '../data/catalog';
import { PLANETARIUM_SHOWS, PlanetariumShow } from '../data/showsAndLearning';
import { UserPreferences } from '../lib/voyageStore';
import { useFullscreen } from '../lib/useFullscreen';
import { audioEngine } from '../three/audioEngine';
import { PlanetSceneCanvas } from '../three/PlanetSceneCanvas';
import { DeepSkyObservationPlate } from './DeepSkyObservationPlate';
import { AppRoute } from './Header';

interface ShowPlayerViewProps {
  showSlug: string;
  chapterIndex: number;
  preferences: UserPreferences;
  onChangeShow: (showSlug: string) => void;
  onChangeChapter: (nextChapterIndex: number) => void;
  onUpdatePreferences: (patch: Partial<UserPreferences>) => void;
  onExploreStop: (objectSlug: string, showSlug: string, chapterIndex: number) => void;
  onFinishShow: () => void;
  onNavigate: (route: AppRoute) => void;
}

export const ShowPlayerView: React.FC<ShowPlayerViewProps> = ({
  showSlug,
  chapterIndex,
  preferences,
  onChangeShow,
  onChangeChapter,
  onUpdatePreferences,
  onExploreStop,
  onFinishShow,
  onNavigate,
}) => {
  const show: PlanetariumShow =
    PLANETARIUM_SHOWS.find((s) => s.slug === showSlug) || PLANETARIUM_SHOWS[0];
  const safeIndex = Math.max(0, Math.min(show.chapters.length - 1, chapterIndex));
  const chapter = show.chapters[safeIndex];
  const chapterObject = getObjectBySlug(chapter.objectSlug) || getObjectBySlug('earth')!;

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [chaptersOpen, setChaptersOpen] = useState<boolean>(true);

  const theaterRef = useRef<HTMLDivElement | null>(null);
  const {
    isFullscreen,
    isCinematic,
    toggleFullscreen,
    toggleCinematic,
  } = useFullscreen(theaterRef, { enableKeyboardShortcut: true });

  // Reset chapter timer when chapter or show changes
  useEffect(() => {
    setElapsedSec(0);
    if (preferences.narration && isPlaying) {
      audioEngine.startAmbient();
      audioEngine.speakNarration(chapter.narrationScript, true);
    } else {
      audioEngine.cancelNarration();
    }
  }, [show.slug, safeIndex, preferences.narration]);

  // Cleanup audio on unmount or pause
  useEffect(() => {
    if (!isPlaying || !preferences.narration) {
      audioEngine.cancelNarration();
      if (!preferences.narration) audioEngine.stopAmbient();
    } else if (preferences.narration && isPlaying) {
      audioEngine.startAmbient();
    }
  }, [isPlaying, preferences.narration]);

  useEffect(() => {
    return () => {
      audioEngine.cancelNarration();
      audioEngine.stopAmbient();
    };
  }, []);

  // Pause automatically when browser tab becomes hidden (PRD Section 8 requirement)
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        setIsPlaying(false);
        audioEngine.cancelNarration();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Safe Spacebar keyboard toggle when focus is not inside interactive controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toUpperCase();
      if (['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'].includes(tag)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Advance elapsed chapter timer smoothly
  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      setElapsedSec((prev) => {
        if (prev + 0.5 >= chapter.durationSec) {
          if (safeIndex < show.chapters.length - 1) {
            onChangeChapter(safeIndex + 1);
          } else {
            setIsPlaying(false);
          }
          return 0;
        }
        return prev + 0.5;
      });
    }, 500);
    return () => window.clearInterval(interval);
  }, [isPlaying, safeIndex, chapter.durationSec, show.chapters.length, onChangeChapter]);

  const overallProgressPct = Math.min(
    100,
    ((safeIndex + Math.min(1, elapsedSec / chapter.durationSec)) / show.chapters.length) * 100
  );

  const isSolarSystemOverview = chapter.cameraPreset === 'system';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#030713] flex flex-col lg:flex-row">
      {/* Main Immersive Planetarium Stage */}
      <div
        ref={theaterRef}
        data-testid="show-player-stage"
        className={`flex-1 relative flex flex-col justify-between overflow-hidden transition-all ${
          isFullscreen
            ? 'fixed inset-0 z-50 w-screen h-screen bg-[#030713]'
            : 'min-h-[560px] lg:min-h-[calc(100vh-4rem)]'
        }`}
      >
        {/* Top Stage Header Bar */}
        {!isCinematic ? (
          <div className="relative z-20 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[#030713]/90 border-b border-white/10">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <label htmlFor="show-switcher" className="sr-only">
                Select Planetarium Show
              </label>
              <select
                id="show-switcher"
                value={show.slug}
                onChange={(e) => onChangeShow(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#0D1526] border border-white/15 text-xs font-semibold text-[#F7FAFF]"
              >
                {PLANETARIUM_SHOWS.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.title}
                  </option>
                ))}
              </select>
              <span className="font-mono text-[#79D9ED]">
                Chapter {String(safeIndex + 1).padStart(2, '0')} / {String(show.chapters.length).padStart(2, '0')}
              </span>
              <span className="text-white/30" aria-hidden="true">·</span>
              <span className="font-mono text-[#D7B77B]">{chapter.authenticityTier}</span>
            </div>

            <div className="flex items-center gap-2">
              {!isFullscreen && (
                <button
                  type="button"
                  onClick={() => setChaptersOpen((prev) => !prev)}
                  aria-expanded={chaptersOpen}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-[#0D1526] text-xs font-medium text-[#F7FAFF] hover:border-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
                >
                  <List className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{chaptersOpen ? 'Hide Itinerary' : 'Chapters'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigate('lobby')}
                className="px-3 py-1.5 rounded-lg border border-white/20 text-xs font-medium text-[#B8C4DE] hover:text-white hover:border-white/40 transition-colors whitespace-nowrap shrink-0"
              >
                Exit Show
              </button>

              {/* Fullscreen & Cinematic Action Buttons */}
              <div className="flex items-center gap-1 border-l border-white/15 pl-2 ml-1">
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit Fullscreen (Esc or F)' : 'Fullscreen Theater (F)'}
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Theater'}
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

        {/* Center 3D / Observation Viewport */}
        <div className="flex-1 relative min-h-[360px]">
          {chapterObject.isOrbitable3D || isSolarSystemOverview ? (
            <div className="absolute inset-0">
              <PlanetSceneCanvas
                mode={isSolarSystemOverview ? 'solar-system' : 'object'}
                objectSlug={chapter.objectSlug}
                cameraPreset={chapter.cameraPreset}
                presetNonce={safeIndex + 1}
                isPaused={!isPlaying || preferences.reducedMotion}
                reducedMotion={preferences.reducedMotion}
                showScienceLabels={true}
                qualityTier={preferences.qualityTier}
                ariaLabel={`Show Chapter ${safeIndex + 1}: ${chapter.title}`}
              />
            </div>
          ) : (
            <div className="absolute inset-0">
              <DeepSkyObservationPlate object={chapterObject} />
            </div>
          )}

          {/* Non-occluding Top-Left Chapter Title & Scale Notice */}
          <div className="relative z-10 pointer-events-none p-4 sm:p-6 max-w-xl">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F7FAFF]">
              {chapter.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#B8C4DE] mt-1">{chapter.subtitle}</p>
            <p className="text-[11px] font-mono text-[#79D9ED] mt-1.5">{chapter.scaleNotice}</p>
          </div>
        </div>

        {/* Floating Captions in Cinematic Mode */}
        {isCinematic && preferences.captions && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 max-w-2xl px-4 py-3 rounded-xl bg-[#030713]/85 backdrop-blur-md border border-white/20 text-center pointer-events-none shadow-2xl">
            <p className="text-sm text-[#F7FAFF] leading-relaxed">
              “{chapter.narrationScript}”
            </p>
          </div>
        )}

        {/* Bottom Synchronized Captions + Universal Show Player Bar */}
        {!isCinematic && (
          <div className="relative z-20 px-4 sm:px-6 pb-5 pt-3 bg-[#050B1B] border-t border-white/10">
            {preferences.captions && (
              <div
                role="region"
                aria-live="polite"
                aria-label="Show captions"
                className="max-w-3xl mx-auto mb-4 px-4 py-3 rounded-xl bg-[#0B1428] border border-white/15 text-center"
              >
                <p className="text-sm sm:text-base text-[#F7FAFF] leading-relaxed">
                  “{chapter.narrationScript}”
                </p>
              </div>
            )}

            {/* Progress Bar */}
            <div className="max-w-4xl mx-auto mb-3">
              <div
                role="progressbar"
                aria-valuenow={Math.round(overallProgressPct)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Show progress"
                className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden"
              >
                <svg viewBox="0 0 100 2" preserveAspectRatio="none" className="w-full h-full block">
                  <rect x="0" y="0" width={Math.max(0, Math.min(100, overallProgressPct))} height="2" fill="#79D9ED" />
                </svg>
              </div>
            </div>

            {/* Controls */}
            <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={safeIndex === 0}
                  onClick={() => onChangeChapter(Math.max(0, safeIndex - 1))}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-white/15 bg-[#0D1526] text-xs font-medium text-[#F7FAFF] disabled:opacity-40 hover:border-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
                >
                  <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => setElapsedSec((prev) => Math.max(0, prev - 15))}
                  aria-label="Rewind 15 seconds in current chapter"
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-white/15 bg-[#0D1526] text-xs font-medium text-[#B8C4DE] hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>-15s</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlaying((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F7FAFF] text-[#030713] text-xs font-semibold hover:bg-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Resume</span>
                    </>
                  )}
                </button>

                {safeIndex < show.chapters.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => onChangeChapter(safeIndex + 1)}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border border-white/15 bg-[#0D1526] text-xs font-medium text-[#F7FAFF] hover:border-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Next Chapter</span>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onFinishShow}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#D7B77B] text-[#030713] text-xs font-semibold hover:bg-[#e7cb96] transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Complete &amp; View My Voyage →</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    onExploreStop(chapter.objectSlug, show.slug, safeIndex);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#79D9ED]/60 bg-[#79D9ED]/12 text-[#79D9ED] text-xs font-semibold hover:bg-[#79D9ED] hover:text-[#030713] transition-colors whitespace-nowrap shrink-0"
                >
                  <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Explore This Object ↗</span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ captions: !preferences.captions })}
                  aria-pressed={preferences.captions}
                  aria-label="Toggle synchronized captions"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    preferences.captions
                      ? 'border-[#79D9ED] text-[#79D9ED] bg-[#0D1526]'
                      : 'border-white/15 text-[#B8C4DE] bg-[#0D1526]'
                  }`}
                >
                  <Subtitles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Captions</span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ narration: !preferences.narration })}
                  aria-pressed={preferences.narration}
                  aria-label="Toggle voice narration and ambient sound"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    preferences.narration
                      ? 'border-[#79D9ED] text-[#79D9ED] bg-[#0D1526]'
                      : 'border-white/15 text-[#B8C4DE] bg-[#0D1526]'
                  }`}
                >
                  {preferences.narration ? (
                    <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>{preferences.narration ? 'Sound On' : 'Muted'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit Fullscreen Theater (Esc or F)' : 'Fullscreen Theater (F)'}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/15 bg-[#0D1526] text-xs font-medium text-[#B8C4DE] hover:text-white hover:border-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5 text-[#79D9ED]" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                  <span>{isFullscreen ? 'Exit Theater' : 'Theater'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Chapter Itinerary Sidebar */}
      {!isFullscreen && chaptersOpen && (
        <aside
          aria-label="Show itinerary and chapter facts"
          className="w-full lg:w-[340px] border-t lg:border-t-0 lg:border-l border-white/10 bg-[#080E1E] p-6 flex flex-col justify-between shrink-0"
        >
          <div>
            <div className="text-xs font-medium text-[#79D9ED]">{show.eyebrow}</div>
            <h2 className="font-display text-lg font-bold text-[#F7FAFF] mt-1">
              Show Itinerary
            </h2>
            <p className="text-xs text-[#B8C4DE] mt-1">
              Jump directly to any stop or branch out into 360° inspection.
            </p>

            <div className="mt-5 space-y-1.5">
              {show.chapters.map((ch) => {
                const active = ch.index === safeIndex;
                return (
                  <button
                    key={ch.index}
                    type="button"
                    onClick={() => onChangeChapter(ch.index)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-colors ${
                      active
                        ? 'border-[#79D9ED] bg-[#101D38] text-[#F7FAFF]'
                        : 'border-transparent text-[#B8C4DE] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="font-mono text-[11px] text-[#79D9ED]">
                      {String(ch.index + 1).padStart(2, '0')}. {ch.authenticityTier}
                    </div>
                    <div className="text-sm font-semibold mt-0.5">{ch.title}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="text-xs font-medium text-[#D7B77B]">Key Chapter Takeaway</div>
            <p className="text-xs text-[#B8C4DE] leading-relaxed mt-2">
              {chapter.keyFact}
            </p>
          </div>
        </aside>
      )}
    </div>
  );
};
