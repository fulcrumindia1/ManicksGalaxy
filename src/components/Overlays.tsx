import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { CELESTIAL_CATALOG } from '../data/catalog';
import { FEATURED_CONSTELLATIONS } from '../data/constellationsAndSky';
import { PLANETARIUM_SHOWS } from '../data/showsAndLearning';
import { QualityTier, ReadingDepth, UserPreferences } from '../lib/voyageStore';
import { AppRoute } from './Header';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelectObject: (slug: string) => void;
  onStartShow: (showSlug: string) => void;
  onNavigate: (route: AppRoute) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  open,
  onClose,
  onSelectObject,
  onStartShow,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      window.setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const objectHits = CELESTIAL_CATALOG.filter(
      (o) =>
        !q ||
        o.name.toLowerCase().includes(q) ||
        o.classification.toLowerCase().includes(q) ||
        o.hook.toLowerCase().includes(q) ||
        (o.aliases || []).some((a) => a.toLowerCase().includes(q))
    ).map((o) => ({
      id: `obj-${o.slug}`,
      title: o.name,
      meta: `${o.classification} · ${o.authenticityTier}`,
      action: () => {
        onClose();
        onSelectObject(o.slug);
      },
    }));

    const constellationHits = FEATURED_CONSTELLATIONS.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q)
    ).map((c) => ({
      id: `con-${c.id}`,
      title: `${c.name} (Constellation)`,
      meta: `Official IAU Sky Region (${c.iauCode}) · Sky Tonight`,
      action: () => {
        onClose();
        onNavigate('sky');
      },
    }));

    const showHits = PLANETARIUM_SHOWS.filter(
      (s) => !q || s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q)
    ).map((s) => ({
      id: `show-${s.slug}`,
      title: s.title,
      meta: `Planetarium Show · ${s.chapters.length} Chapters`,
      action: () => {
        onClose();
        onStartShow(s.slug);
      },
    }));

    return [...objectHits, ...constellationHits, ...showHits].slice(0, 10);
  }, [query, onClose, onSelectObject, onNavigate, onStartShow]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Universe Search"
      className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center pt-16 sm:pt-24 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-[#0B1325] p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="text-xs font-semibold text-[#79D9ED]">
            Search Planets, Moons, Constellations &amp; Shows
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search dialog"
            className="p-1.5 rounded-lg text-[#B8C4DE] hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <Search
            className="w-4 h-4 text-[#7F90B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try Saturn, Jupiter, Orion, TRAPPIST-1e, First Flight..."
            aria-label="Search query"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#030713] border border-white/20 text-sm text-[#F7FAFF] placeholder:text-[#7F90B0]"
          />
        </div>

        {/* Suggested Queries */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#7F90B0]">
          <span>Quick jump:</span>
          {['Saturn', 'Jupiter', 'Orion', 'TRAPPIST-1e', 'Milky Way'].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => setQuery(term)}
              className="text-[#79D9ED] hover:underline"
            >
              {term}
            </button>
          ))}
        </div>

        <div className="mt-4 max-h-80 overflow-y-auto divide-y divide-white/10">
          {results.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#B8C4DE]">
              No matching entries found for “{query}”.
            </p>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className="w-full py-3 px-2 flex items-center justify-between text-left hover:bg-white/5 rounded-lg transition-colors"
              >
                <div>
                  <div className="text-sm font-semibold text-[#F7FAFF]">{item.title}</div>
                  <div className="text-xs text-[#B8C4DE] mt-0.5">{item.meta}</div>
                </div>
                <span className="text-xs text-[#79D9ED] font-semibold ml-3">Open ↗</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface AccessibilityModalProps {
  open: boolean;
  preferences: UserPreferences;
  onUpdatePreferences: (patch: Partial<UserPreferences>) => void;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  open,
  preferences,
  onUpdatePreferences,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Accessibility, Motion and Display Settings"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#0B1325] p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-[#79D9ED]">Inclusive Observatory Controls</div>
            <h2 className="font-display text-xl font-bold text-[#F7FAFF]">
              Motion, Display &amp; Captions
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close accessibility settings"
            className="p-1.5 rounded-lg text-[#B8C4DE] hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-sm">
          <label className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-white/10 bg-[#060C1A] cursor-pointer">
            <div>
              <div className="font-semibold text-[#F7FAFF]">Reduced Motion</div>
              <div className="text-xs text-[#B8C4DE]">
                Replaces continuous 3D orbital spin and camera glides with calm discrete cuts.
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.reducedMotion}
              onChange={(e) => onUpdatePreferences({ reducedMotion: e.target.checked })}
              className="accent-[#79D9ED] w-4 h-4 mt-1"
            />
          </label>

          <label className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-white/10 bg-[#060C1A] cursor-pointer">
            <div>
              <div className="font-semibold text-[#F7FAFF]">Larger Reading Type</div>
              <div className="text-xs text-[#B8C4DE]">
                Scales root typography up for effortless classroom and low-vision legibility.
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.largeText}
              onChange={(e) => onUpdatePreferences({ largeText: e.target.checked })}
              className="accent-[#79D9ED] w-4 h-4 mt-1"
            />
          </label>

          <label className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-white/10 bg-[#060C1A] cursor-pointer">
            <div>
              <div className="font-semibold text-[#F7FAFF]">High-Contrast Borders</div>
              <div className="text-xs text-[#B8C4DE]">
                Increases structural panel border contrast across dark surfaces.
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.highContrast}
              onChange={(e) => onUpdatePreferences({ highContrast: e.target.checked })}
              className="accent-[#79D9ED] w-4 h-4 mt-1"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label htmlFor="acc-reading-depth" className="block text-xs text-[#B8C4DE] mb-1">
                Default Explanation Depth
              </label>
              <select
                id="acc-reading-depth"
                value={preferences.readingDepth}
                onChange={(e) =>
                  onUpdatePreferences({ readingDepth: e.target.value as ReadingDepth })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#030713] border border-white/20 text-xs text-[#F7FAFF]"
              >
                <option value="young">Young Explorers (7–12)</option>
                <option value="curious">Curious Minds</option>
                <option value="enthusiast">Enthusiasts</option>
              </select>
            </div>

            <div>
              <label htmlFor="acc-quality-tier" className="block text-xs text-[#B8C4DE] mb-1">
                3D Render Tier
              </label>
              <select
                id="acc-quality-tier"
                value={preferences.qualityTier}
                onChange={(e) =>
                  onUpdatePreferences({ qualityTier: e.target.value as QualityTier })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#030713] border border-white/20 text-xs text-[#F7FAFF]"
              >
                <option value="auto">Auto</option>
                <option value="high">High Detail</option>
                <option value="low">Low Bandwidth / Saver</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#79D9ED] text-[#030713] text-xs font-semibold hover:bg-[#9BE4F4]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
