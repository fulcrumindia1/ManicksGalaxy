import React from 'react';
import { QualityTier, UserPreferences } from '../lib/voyageStore';
import { AppRoute } from './Header';

interface LobbyViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (patch: Partial<UserPreferences>) => void;
  onStartShow: (showSlug: string) => void;
  onNavigate: (route: AppRoute) => void;
  onLaunchClassroom: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  preferences,
  onUpdatePreferences,
  onStartShow,
  onNavigate,
  onLaunchClassroom,
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#030713] relative overflow-hidden flex flex-col justify-between">
      {/* Architectural 180° Perspective Star Dome Canopy */}
      <svg
        viewBox="0 0 1440 420"
        className="w-full h-56 sm:h-72 pointer-events-none select-none opacity-80"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="domeHorizon" cx="50%" cy="100%" r="70%">
            <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.45" />
            <stop offset="65%" stopColor="#091326" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#030713" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1440" height="420" fill="url(#domeHorizon)" />
        <path
          d="M -80 410 Q 720 40 1520 410"
          fill="none"
          stroke="rgba(121, 217, 237, 0.25)"
          strokeWidth="1.5"
        />
        <path
          d="M 40 415 Q 720 120 1400 415"
          fill="none"
          stroke="rgba(215, 183, 123, 0.16)"
          strokeWidth="1"
          strokeDasharray="6 6"
        />
        <line x1="720" y1="30" x2="720" y2="410" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      </svg>

      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 -mt-28 sm:-mt-36 pb-16 relative z-10 w-full">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-medium text-[#79D9ED]">Scene 01 · Observatory Dome Lobby</p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#F7FAFF] mt-2">
            Tonight, the universe is yours.
          </h1>
          <p className="text-sm sm:text-base text-[#B8C4DE] mt-3 leading-relaxed">
            Choose how you would like to begin. Every path stays connected—you can pause a show, inspect a planet in 360°, or return home at any moment.
          </p>
        </div>

        {/* Three Primary Experience Cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="group text-left p-7 rounded-2xl border border-white/15 bg-[#0D1526] hover:border-[#79D9ED] transition-colors flex flex-col justify-between min-h-[235px]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#79D9ED] font-medium">01. Guided Planetarium Shows</span>
                <span className="text-[11px] text-[#B8C4DE] font-mono">8–15 min</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-[#F7FAFF] mt-2">
                Theater Shows
              </h2>
              <div className="mt-3 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => onStartShow('first-flight')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-[#79D9ED]/20 hover:text-[#79D9ED] text-xs font-medium text-[#F7FAFF] transition-colors flex items-center justify-between"
                >
                  <span>1. First Flight: Earth to Saturn</span>
                  <span className="text-[10px] text-[#B8C4DE]">7 ch ↗</span>
                </button>
                <button
                  type="button"
                  onClick={() => onStartShow('our-home-milky-way')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-[#79D9ED]/20 hover:text-[#79D9ED] text-xs font-medium text-[#F7FAFF] transition-colors flex items-center justify-between"
                >
                  <span>2. Our Home in the Milky Way</span>
                  <span className="text-[10px] text-[#B8C4DE]">6 ch ↗</span>
                </button>
                <button
                  type="button"
                  onClick={() => onStartShow('moons-hidden-oceans')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-[#79D9ED]/20 hover:text-[#79D9ED] text-xs font-medium text-[#F7FAFF] transition-colors flex items-center justify-between"
                >
                  <span>3. Moons &amp; Hidden Oceans</span>
                  <span className="text-[10px] text-[#B8C4DE]">6 ch ↗</span>
                </button>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#7F90B0]">
              <span>Captioned · Narration Opt-in</span>
              <button
                type="button"
                onClick={() => onStartShow('first-flight')}
                className="text-[#79D9ED] hover:underline text-[11px] font-semibold"
              >
                Launch First Flight ↗
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('explore')}
            className="group text-left p-7 rounded-2xl border border-white/15 bg-[#0D1526] hover:border-[#79D9ED] transition-colors flex flex-col justify-between min-h-[235px]"
          >
            <div>
              <div className="text-xs text-[#D7B77B] font-medium">02. Interactive Map · Full Control</div>
              <h2 className="font-display text-2xl font-bold text-[#F7FAFF] mt-2 group-hover:text-[#79D9ED] transition-colors">
                Explore on Your Own ↗
              </h2>
              <p className="text-sm text-[#B8C4DE] leading-relaxed mt-3">
                Open Mission Control immediately. Scrub planetary orbits, inspect any world in 360°, or compare Jupiter and Earth side by side.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 text-xs text-[#7F90B0]">
              8 Planets · Moons · Exoplanets · Deep Sky
            </div>
          </button>

          <button
            type="button"
            onClick={onLaunchClassroom}
            className="group text-left p-7 rounded-2xl border border-white/15 bg-[#0D1526] hover:border-[#79D9ED] transition-colors flex flex-col justify-between min-h-[235px]"
          >
            <div>
              <div className="text-xs text-[#9F95F0] font-medium">03. Educator Mode · Zero Sign-Up</div>
              <h2 className="font-display text-2xl font-bold text-[#F7FAFF] mt-2 group-hover:text-[#79D9ED] transition-colors">
                Classroom &amp; Group Show ↗
              </h2>
              <p className="text-sm text-[#B8C4DE] leading-relaxed mt-3">
                Ready-to-present astronomy lessons with discussion checkpoints, common misconception notes, and clean projector framing.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 text-xs text-[#7F90B0]">
              Grades 4–12 · Curriculum-aligned prompts
            </div>
          </button>
        </div>

        {/* Dome Preferences Bar */}
        <div className="mt-8 p-5 rounded-xl border border-white/10 bg-[#091020] flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs font-medium text-[#B8C4DE]">
            Dome Preferences (saved locally on your device)
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-[#F7FAFF]">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.narration}
                onChange={(e) => onUpdatePreferences({ narration: e.target.checked })}
                className="accent-[#79D9ED] w-4 h-4 rounded"
              />
              <span>Voice Narration &amp; Ambient Sound</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.captions}
                onChange={(e) => onUpdatePreferences({ captions: e.target.checked })}
                className="accent-[#79D9ED] w-4 h-4 rounded"
              />
              <span>Synchronized Captions</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.reducedMotion}
                onChange={(e) => onUpdatePreferences({ reducedMotion: e.target.checked })}
                className="accent-[#79D9ED] w-4 h-4 rounded"
              />
              <span>Reduced Motion</span>
            </label>

            <div className="inline-flex items-center gap-2">
              <label htmlFor="lobby-quality-select" className="text-[#B8C4DE]">
                3D Quality:
              </label>
              <select
                id="lobby-quality-select"
                value={preferences.qualityTier}
                onChange={(e) =>
                  onUpdatePreferences({ qualityTier: e.target.value as QualityTier })
                }
                className="px-2.5 py-1 rounded bg-[#030713] border border-white/20 text-xs text-[#F7FAFF]"
              >
                <option value="auto">Auto</option>
                <option value="high">High</option>
                <option value="low">Low Bandwidth / Saver</option>
              </select>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[#7F90B0]">
          Scientific notice: Views combine actual astronomical observations, data-based 3D simulations, and explicitly labelled reconstructions.
        </p>
      </div>
    </div>
  );
};
