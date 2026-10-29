import React, { useCallback, useEffect, useState } from 'react';
import { getObjectBySlug } from './data/catalog';
import { PLANETARIUM_SHOWS } from './data/showsAndLearning';
import {
  DEFAULT_PREFERENCES,
  INITIAL_VOYAGE_STATE,
  ShowBookmark,
  UserPreferences,
  VoyagePassportState,
  recordChapterCompletion,
  recordObjectVisit,
  recordQuizSuccess,
} from './lib/voyageStore';
import { CompareView } from './components/CompareView';
import { ExploreView } from './components/ExploreView';
import { AppRoute, Header } from './components/Header';
import { LandingView } from './components/LandingView';
import { LearnAndTeachersView } from './components/LearnAndTeachersView';
import { LobbyView } from './components/LobbyView';
import { ObjectDetailView } from './components/ObjectDetailView';
import { AccessibilityModal, SearchModal } from './components/Overlays';
import { ShowPlayerView } from './components/ShowPlayerView';
import { SkyTonightView } from './components/SkyTonightView';
import { VoyageAndSourcesView } from './components/VoyageAndSourcesView';

const PREFS_STORAGE_KEY = 'manicksgalaxy.preferences.v1';
const VOYAGE_STORAGE_KEY = 'manicksgalaxy.voyage.v1';

function loadInitialPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserPreferences>;
      return {
        ...DEFAULT_PREFERENCES,
        ...parsed,
        reducedMotion: false, // Ensure interactive 3D rotation & orbital motion always spin by default
      };
    }
  } catch {
    // Ignore storage access errors
  }
  return {
    ...DEFAULT_PREFERENCES,
    reducedMotion: false,
  };
}

function loadInitialVoyage(): VoyagePassportState {
  try {
    const raw = localStorage.getItem(VOYAGE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<VoyagePassportState>;
      return {
        ...INITIAL_VOYAGE_STATE,
        ...parsed,
      };
    }
  } catch {
    // Ignore storage access errors
  }
  return INITIAL_VOYAGE_STATE;
}

function parseInitialRoute(): { route: AppRoute; objectSlug?: string } {
  if (typeof window === 'undefined') return { route: 'home' };
  const params = new URLSearchParams(window.location.search);
  if (params.get('autostart') === '1') {
    return { route: 'object', objectSlug: 'saturn' };
  }
  const hash = window.location.hash.replace(/^#/, '');
  if (hash.startsWith('object/')) {
    const slug = hash.slice('object/'.length);
    if (getObjectBySlug(slug)) {
      return { route: 'object', objectSlug: slug };
    }
  }
  const validRoutes: AppRoute[] = [
    'home',
    'lobby',
    'show',
    'explore',
    'object',
    'compare',
    'sky',
    'learn',
    'teachers',
    'voyage',
    'sources',
  ];
  if (validRoutes.includes(hash as AppRoute)) {
    return { route: hash as AppRoute };
  }
  return { route: 'home' };
}

export default function App() {
  const initialNav = parseInitialRoute();
  const [route, setRoute] = useState<AppRoute>(initialNav.route);
  const [activeObjectSlug, setActiveObjectSlug] = useState<string>(
    initialNav.objectSlug || 'saturn'
  );
  const [compareTargetSlug, setCompareTargetSlug] = useState<string>('jupiter');
  const [activeShowSlug, setActiveShowSlug] = useState<string>('first-flight');
  const [activeChapterIdx, setActiveChapterIdx] = useState<number>(0);
  const [showBookmark, setShowBookmark] = useState<ShowBookmark | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string>('greenwich');
  const [classroomPresentation, setClassroomPresentation] = useState<boolean>(false);

  const [preferences, setPreferences] = useState<UserPreferences>(loadInitialPreferences);
  const [voyage, setVoyage] = useState<VoyagePassportState>(loadInitialVoyage);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState<boolean>(false);

  // Sync HTML classes & body state attribute for accessibility & browser verification
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('reduced-motion', preferences.reducedMotion);
    root.classList.toggle('text-scale-large', preferences.largeText);
    root.classList.toggle('high-contrast', preferences.highContrast);
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Ignore storage quota issues
    }
  }, [preferences]);

  useEffect(() => {
    try {
      localStorage.setItem(VOYAGE_STORAGE_KEY, JSON.stringify(voyage));
    } catch {
      // Ignore storage quota issues
    }
  }, [voyage]);

  useEffect(() => {
    document.body.dataset.route = route;
    document.body.dataset.activeObject = activeObjectSlug;
    const desiredHash = `#${route === 'object' ? `object/${activeObjectSlug}` : route}`;
    if (window.location.hash !== desiredHash) {
      window.history.pushState(null, '', desiredHash);
    }
  }, [route, activeObjectSlug]);

  useEffect(() => {
    const syncFromHash = () => {
      const parsed = parseInitialRoute();
      setRoute(parsed.route);
      if (parsed.objectSlug) {
        setActiveObjectSlug(parsed.objectSlug);
      }
    };
    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
    };
  }, []);

  // Global keyboard shortcuts: '/' or Ctrl+K for Search, Escape to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false);
        else if (accessibilityOpen) setAccessibilityOpen(false);
        return;
      }
      const tag = (document.activeElement?.tagName || '').toUpperCase();
      const inInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);
      if ((e.key === '/' && !inInput) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, accessibilityOpen]);

  const navigate = useCallback(
    (nextRoute: AppRoute) => {
      setRoute(nextRoute);
      window.scrollTo({
        top: 0,
        behavior: preferences.reducedMotion ? 'auto' : 'smooth',
      });
    },
    [preferences.reducedMotion]
  );

  const updatePreferences = useCallback((patch: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...patch }));
  }, []);

  const inspectObject = useCallback(
    (slug: string, preserveShowBookmark = false) => {
      const obj = getObjectBySlug(slug);
      if (!obj) return;
      if (!preserveShowBookmark) {
        setShowBookmark(null);
      }
      setActiveObjectSlug(slug);
      setVoyage((prev) => recordObjectVisit(prev, slug, obj.signatureFact));
      setRoute('object');
      window.scrollTo({
        top: 0,
        behavior: preferences.reducedMotion ? 'auto' : 'smooth',
      });
    },
    [preferences.reducedMotion]
  );

  const startShow = useCallback(
    (showSlug: string, chapterIndex = 0) => {
      const show = PLANETARIUM_SHOWS.find((s) => s.slug === showSlug) || PLANETARIUM_SHOWS[0];
      const safeIdx = Math.max(0, Math.min(show.chapters.length - 1, chapterIndex));
      const ch = show.chapters[safeIdx];
      setActiveShowSlug(show.slug);
      setActiveChapterIdx(safeIdx);
      setShowBookmark(null);
      setVoyage((prev) => {
        const afterVisit = recordObjectVisit(prev, ch.objectSlug);
        return recordChapterCompletion(
          afterVisit,
          show.slug,
          safeIdx,
          show.chapters.length,
          ch.keyFact
        );
      });
      navigate('show');
    },
    [navigate]
  );

  const handleChangeShowChapter = useCallback(
    (nextIdx: number) => {
      const show =
        PLANETARIUM_SHOWS.find((s) => s.slug === activeShowSlug) || PLANETARIUM_SHOWS[0];
      const safeIdx = Math.max(0, Math.min(show.chapters.length - 1, nextIdx));
      const ch = show.chapters[safeIdx];
      setActiveChapterIdx(safeIdx);
      setVoyage((prev) => {
        const afterVisit = recordObjectVisit(prev, ch.objectSlug);
        return recordChapterCompletion(
          afterVisit,
          show.slug,
          safeIdx,
          show.chapters.length,
          ch.keyFact
        );
      });
    },
    [activeShowSlug]
  );

  const handleExploreFromShow = useCallback(
    (objectSlug: string, showSlug: string, chapterIndex: number) => {
      setShowBookmark({ showSlug, chapterIndex, returnObjectSlug: objectSlug });
      inspectObject(objectSlug, true);
    },
    [inspectObject]
  );

  const handleReturnToShow = useCallback(() => {
    if (!showBookmark) {
      navigate('show');
      return;
    }
    startShow(showBookmark.showSlug, showBookmark.chapterIndex);
  }, [showBookmark, navigate, startShow]);

  const handleCompareWithEarth = useCallback(
    (slug: string) => {
      setCompareTargetSlug(slug);
      navigate('compare');
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-[#030713] text-[#F7FAFF] flex flex-col">
      {/* Skip to Main Content Link for Keyboard Users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#79D9ED] focus:text-[#030713] focus:font-semibold"
      >
        Skip to main content
      </a>

      <Header
        currentRoute={route}
        classroomPresentation={classroomPresentation}
        onNavigate={navigate}
        onOpenSearch={() => setSearchOpen(true)}
        onExitPresentation={() => setClassroomPresentation(false)}
      />

      <main id="main-content" className="flex-1">
        {route === 'home' && (
          <LandingView
            preferences={preferences}
            selectedCityId={selectedCityId}
            onSelectCity={setSelectedCityId}
            onUpdatePreferences={updatePreferences}
            onNavigate={navigate}
            onInspectObject={(slug) => inspectObject(slug)}
            onStartShow={(slug) => startShow(slug, 0)}
            onOpenAccessibility={() => setAccessibilityOpen(true)}
          />
        )}

        {route === 'lobby' && (
          <LobbyView
            preferences={preferences}
            onUpdatePreferences={updatePreferences}
            onStartShow={(slug) => startShow(slug, 0)}
            onNavigate={navigate}
            onLaunchClassroom={() => {
              setClassroomPresentation(true);
              navigate('teachers');
            }}
          />
        )}

        {route === 'show' && (
          <ShowPlayerView
            showSlug={activeShowSlug}
            chapterIndex={activeChapterIdx}
            preferences={preferences}
            onChangeShow={(newSlug) => startShow(newSlug, 0)}
            onChangeChapter={handleChangeShowChapter}
            onUpdatePreferences={updatePreferences}
            onExploreStop={handleExploreFromShow}
            onFinishShow={() => navigate('voyage')}
            onNavigate={navigate}
          />
        )}

        {route === 'explore' && (
          <ExploreView
            preferences={preferences}
            onInspectObject={(slug) => inspectObject(slug)}
            onNavigate={navigate}
          />
        )}

        {route === 'object' && (
          <ObjectDetailView
            objectSlug={activeObjectSlug}
            preferences={preferences}
            showBookmark={showBookmark}
            classroomPresentation={classroomPresentation}
            onUpdatePreferences={updatePreferences}
            onSelectObject={(slug) => inspectObject(slug, Boolean(showBookmark))}
            onCompareWithEarth={handleCompareWithEarth}
            onReturnToShow={handleReturnToShow}
            onStartRelatedShow={(slug) => startShow(slug, 0)}
            onNavigate={navigate}
          />
        )}

        {route === 'compare' && (
          <CompareView
            initialSlugA={compareTargetSlug}
            initialSlugB="earth"
            onInspectObject={(slug) => inspectObject(slug)}
          />
        )}

        {route === 'sky' && (
          <SkyTonightView
            selectedCityId={selectedCityId}
            onSelectCity={setSelectedCityId}
            onInspectObject={(slug) => inspectObject(slug)}
          />
        )}

        {(route === 'learn' || route === 'teachers') && (
          <LearnAndTeachersView
            mode={route === 'teachers' ? 'teachers' : 'learn'}
            preferences={preferences}
            quizCorrectIds={voyage.quizCorrectIds}
            classroomPresentation={classroomPresentation}
            onUpdatePreferences={updatePreferences}
            onRecordQuizCorrect={(id, fact) =>
              setVoyage((prev) => recordQuizSuccess(prev, id, fact))
            }
            onInspectObject={(slug) => inspectObject(slug)}
            onStartShow={(slug) => startShow(slug, 0)}
            onToggleClassroomPresentation={setClassroomPresentation}
            onNavigate={navigate}
          />
        )}

        {(route === 'voyage' || route === 'sources') && (
          <VoyageAndSourcesView
            mode={route === 'sources' ? 'sources' : 'voyage'}
            voyage={voyage}
            onInspectObject={(slug) => inspectObject(slug)}
            onStartShow={(slug) => startShow(slug, 0)}
            onClearVoyage={() => {
              setVoyage(INITIAL_VOYAGE_STATE);
              try {
                localStorage.removeItem(VOYAGE_STORAGE_KEY);
              } catch {
                // Ignore
              }
            }}
            onNavigate={navigate}
          />
        )}
      </main>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectObject={(slug) => inspectObject(slug)}
        onStartShow={(slug) => startShow(slug, 0)}
        onNavigate={navigate}
      />

      <AccessibilityModal
        open={accessibilityOpen}
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
        onClose={() => setAccessibilityOpen(false)}
      />
    </div>
  );
}
