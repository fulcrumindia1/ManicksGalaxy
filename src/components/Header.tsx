import React, { useState } from 'react';
import { Menu, Search, X } from 'lucide-react';

export type AppRoute =
  | 'home'
  | 'lobby'
  | 'show'
  | 'explore'
  | 'object'
  | 'compare'
  | 'sky'
  | 'learn'
  | 'teachers'
  | 'voyage'
  | 'sources';

interface HeaderProps {
  currentRoute: AppRoute;
  classroomPresentation: boolean;
  onNavigate: (route: AppRoute) => void;
  onOpenSearch: () => void;
  onExitPresentation: () => void;
}

const NAV_ITEMS: Array<{ route: AppRoute; label: string }> = [
  { route: 'lobby', label: 'Planetarium' },
  { route: 'explore', label: 'Explore' },
  { route: 'sky', label: 'Sky Tonight' },
  { route: 'learn', label: 'Learn' },
  { route: 'voyage', label: 'My Voyage' },
];

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  classroomPresentation,
  onNavigate,
  onOpenSearch,
  onExitPresentation,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (classroomPresentation) {
    return (
      <header className="h-12 border-b border-white/10 bg-[#030713] px-6 flex items-center justify-between gap-8 z-40 print:hidden">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('home');
          }}
          className="font-display text-base font-semibold tracking-tight text-[#F7FAFF] whitespace-nowrap shrink-0"
        >
          ManicksGalaxy
        </a>
        <nav aria-label="Classroom navigation" className="hidden md:flex items-center gap-6 text-sm text-[#B8C4DE]">
          <button
            type="button"
            onClick={() => onNavigate('explore')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Solar System
          </button>
          <button
            type="button"
            onClick={() => onNavigate('compare')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Compare Worlds
          </button>
          <button
            type="button"
            onClick={() => onNavigate('sky')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Sky Tonight
          </button>
          <button
            type="button"
            onClick={() => onNavigate('teachers')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Lesson Checkpoints
          </button>
        </nav>
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onExitPresentation}
            className="px-4 py-1.5 text-xs font-medium rounded-lg border border-white/25 text-[#F7FAFF] hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
          >
            Exit Classroom View
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 h-14 md:h-16 border-b border-white/10 bg-[#030713]/95 print:hidden">
      <div className="max-w-[1280px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            setMobileMenuOpen(false);
            onNavigate('home');
          }}
          className="font-display text-lg font-bold tracking-tight text-[#F7FAFF] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#79D9ED] focus-visible:outline-offset-4"
        >
          ManicksGalaxy
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7 text-sm font-medium">
          {NAV_ITEMS.map((item) => {
            const isActive =
              currentRoute === item.route ||
              (item.route === 'explore' && (currentRoute === 'object' || currentRoute === 'compare')) ||
              (item.route === 'lobby' && currentRoute === 'show') ||
              (item.route === 'learn' && currentRoute === 'teachers');

            return (
              <a
                key={item.route}
                href={`#${item.route}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.route);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-[#79D9ED] text-[#F7FAFF]'
                    : 'border-transparent text-[#B8C4DE] hover:text-[#F7FAFF] hover:border-white/30'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action (Search Universe; plus mobile menu trigger on narrow viewports) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search Universe (Shortcut /)"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#79D9ED] text-[#030713] hover:bg-[#9BE4F4] transition-colors whitespace-nowrap shrink-0 min-h-[38px]"
          >
            <Search className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Search</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/15 text-[#F7FAFF] hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/15 bg-[#0A1122] px-4 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.route}
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate(item.route);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentRoute === item.route
                  ? 'bg-[#79D9ED]/15 text-[#79D9ED]'
                  : 'text-[#F7FAFF] hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 mt-2 border-t border-white/10 flex flex-wrap gap-3 px-3 text-xs text-[#B8C4DE]">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('teachers');
              }}
              className="hover:text-white py-1"
            >
              For Teachers
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('compare');
              }}
              className="hover:text-white py-1"
            >
              Compare Worlds
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('sources');
              }}
              className="hover:text-white py-1"
            >
              Sources &amp; Licenses
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
