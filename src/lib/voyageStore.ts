export type ReadingDepth = 'young' | 'curious' | 'enthusiast';
export type QualityTier = 'auto' | 'high' | 'low';

export interface UserPreferences {
  narration: boolean;
  captions: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  readingDepth: ReadingDepth;
  qualityTier: QualityTier;
}

export interface ShowBookmark {
  showSlug: string;
  chapterIndex: number;
  returnObjectSlug?: string;
}

export interface VoyagePassportState {
  visitedSlugs: string[];
  completedChapters: string[]; // format: `${showSlug}:${chapterIndex}`
  completedShows: string[];
  quizCorrectIds: string[];
  rememberedFacts: string[];
  lastDestinationSlug: string | null;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  narration: false, // Never force audio by default
  captions: true,
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  readingDepth: 'curious',
  qualityTier: 'auto',
};

export const INITIAL_VOYAGE_STATE: VoyagePassportState = {
  visitedSlugs: ['earth'],
  completedChapters: [],
  completedShows: [],
  quizCorrectIds: [],
  rememberedFacts: [
    'Earth is the only confirmed world in the universe known to harbor life, orbiting at 1 Astronomical Unit (8.3 light-minutes) from the Sun.',
  ],
  lastDestinationSlug: 'saturn',
};

export function recordObjectVisit(
  state: VoyagePassportState,
  slug: string,
  signatureFact?: string
): VoyagePassportState {
  const visitedSlugs = state.visitedSlugs.includes(slug)
    ? state.visitedSlugs
    : [...state.visitedSlugs, slug];

  let rememberedFacts = state.rememberedFacts;
  if (signatureFact && !rememberedFacts.includes(signatureFact)) {
    rememberedFacts = [signatureFact, ...rememberedFacts].slice(0, 6);
  }

  return {
    ...state,
    visitedSlugs,
    rememberedFacts,
    lastDestinationSlug: slug,
  };
}

export function recordChapterCompletion(
  state: VoyagePassportState,
  showSlug: string,
  chapterIndex: number,
  totalChapters: number,
  chapterFact?: string
): VoyagePassportState {
  const key = `${showSlug}:${chapterIndex}`;
  const completedChapters = state.completedChapters.includes(key)
    ? state.completedChapters
    : [...state.completedChapters, key];

  const showChapterCount = completedChapters.filter((k) =>
    k.startsWith(`${showSlug}:`)
  ).length;

  const completedShows =
    showChapterCount >= totalChapters && !state.completedShows.includes(showSlug)
      ? [...state.completedShows, showSlug]
      : state.completedShows;

  let rememberedFacts = state.rememberedFacts;
  if (chapterFact && !rememberedFacts.includes(chapterFact)) {
    rememberedFacts = [chapterFact, ...rememberedFacts].slice(0, 6);
  }

  return {
    ...state,
    completedChapters,
    completedShows,
    rememberedFacts,
  };
}

export function recordQuizSuccess(
  state: VoyagePassportState,
  questionId: string,
  learnedFact: string
): VoyagePassportState {
  const quizCorrectIds = state.quizCorrectIds.includes(questionId)
    ? state.quizCorrectIds
    : [...state.quizCorrectIds, questionId];

  const rememberedFacts = state.rememberedFacts.includes(learnedFact)
    ? state.rememberedFacts
    : [learnedFact, ...state.rememberedFacts].slice(0, 6);

  return {
    ...state,
    quizCorrectIds,
    rememberedFacts,
  };
}

export function computeEarnedBadges(state: VoyagePassportState): Array<{
  id: string;
  title: string;
  description: string;
  earned: boolean;
}> {
  return [
    {
      id: 'first-orbit',
      title: 'Planetary Navigator',
      description: 'Inspected 3 or more celestial worlds in 360°.',
      earned: state.visitedSlugs.length >= 3,
    },
    {
      id: 'ring-inspector',
      title: 'Cassini Observer',
      description: 'Visited Saturn and examined its icy ring system.',
      earned: state.visitedSlugs.includes('saturn'),
    },
    {
      id: 'dome-voyager',
      title: 'First Flight Graduate',
      description: 'Completed 3 or more planetarium show chapters.',
      earned: state.completedChapters.length >= 3,
    },
    {
      id: 'sky-scholar',
      title: 'Empirical Mind',
      description: 'Answered at least 2 astronomy concept challenges accurately.',
      earned: state.quizCorrectIds.length >= 2,
    },
  ];
}
