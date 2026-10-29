import React, { useState } from 'react';
import { CheckCircle2, GraduationCap, Play, XCircle } from 'lucide-react';
import {
  ASTRONOMY_GLOSSARY,
  ASTRONOMY_QUIZZES,
  TEACHER_LESSONS,
} from '../data/showsAndLearning';
import { ReadingDepth, UserPreferences } from '../lib/voyageStore';
import { AppRoute } from './Header';

interface LearnAndTeachersViewProps {
  mode: 'learn' | 'teachers';
  preferences: UserPreferences;
  quizCorrectIds: string[];
  classroomPresentation: boolean;
  onUpdatePreferences: (patch: Partial<UserPreferences>) => void;
  onRecordQuizCorrect: (questionId: string, learnedFact: string) => void;
  onInspectObject: (slug: string) => void;
  onStartShow: (showSlug: string) => void;
  onToggleClassroomPresentation: (active: boolean) => void;
  onNavigate: (route: AppRoute) => void;
}

export const LearnAndTeachersView: React.FC<LearnAndTeachersViewProps> = ({
  mode,
  preferences,
  quizCorrectIds,
  classroomPresentation,
  onUpdatePreferences,
  onRecordQuizCorrect,
  onInspectObject,
  onStartShow,
  onToggleClassroomPresentation,
  onNavigate,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [glossaryFilter, setGlossaryFilter] = useState<string>('');

  const filteredGlossary = ASTRONOMY_GLOSSARY.filter((item) => {
    const q = glossaryFilter.trim().toLowerCase();
    if (!q) return true;
    return (
      item.term.toLowerCase().includes(q) || item.definition.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#030713] text-[#F7FAFF] py-10 pb-20">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
        {/* Top Mode Switcher: Learning Hub vs Educator Portal */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-medium text-[#79D9ED]">
              {mode === 'teachers'
                ? 'Educator Portal · Shareable Classroom Presentations'
                : 'Structured Discovery · Concepts, Quizzes & Vocabulary'}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F7FAFF] mt-1">
              {mode === 'teachers' ? 'For Teachers & Classrooms' : 'Learning Hub'}
            </h1>
            <p className="text-sm text-[#B8C4DE] mt-1.5 max-w-2xl">
              {mode === 'teachers'
                ? 'Launch projector-ready 3D demonstrations without student accounts, complete with misconception warnings and discussion prompts.'
                : 'Explore core astronomy concepts by age depth, test your intuition with untimed science challenges, and inspect every world hands-on.'}
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0D1526] border border-white/15 self-start md:self-auto">
            <button
              type="button"
              onClick={() => onNavigate('learn')}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                mode === 'learn'
                  ? 'bg-[#79D9ED] text-[#030713]'
                  : 'text-[#B8C4DE] hover:text-white'
              }`}
            >
              Learning Hub
            </button>
            <button
              type="button"
              onClick={() => onNavigate('teachers')}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                mode === 'teachers'
                  ? 'bg-[#9F95F0] text-[#030713]'
                  : 'text-[#B8C4DE] hover:text-white'
              }`}
            >
              For Teachers
            </button>
          </div>
        </div>

        {mode === 'teachers' ? (
          <div className="space-y-8">
            {/* Classroom Presenter Banner */}
            <div className="p-6 sm:p-7 rounded-2xl border border-white/15 bg-[#0D1526] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="text-xs font-medium text-[#9F95F0]">
                  Projector &amp; Smartboard Ready · Zero Student Accounts
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F7FAFF] mt-1">
                  Classroom Presentation Mode is {classroomPresentation ? 'Active' : 'Ready'}
                </h2>
                <p className="text-sm text-[#B8C4DE] mt-1 max-w-xl">
                  Streamlines top navigation chrome and expands educator misconception callouts automatically on every celestial object page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleClassroomPresentation(!classroomPresentation)}
                className={`px-5 py-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  classroomPresentation
                    ? 'border border-white/25 bg-white/10 text-[#F7FAFF]'
                    : 'bg-[#9F95F0] text-[#030713] hover:bg-[#b5adf5]'
                }`}
              >
                {classroomPresentation ? 'Exit Classroom Mode' : 'Enable Classroom View'}
              </button>
            </div>

            {/* Ready-to-Teach Lesson Plans */}
            <div className="grid grid-cols-1 gap-6">
              {TEACHER_LESSONS.map((lesson) => (
                <article
                  key={lesson.slug}
                  className="p-6 sm:p-7 rounded-2xl border border-white/15 bg-[#0D1526] space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-[#B8C4DE]">
                      <span className="text-[#9F95F0] font-semibold">{lesson.gradeBand}</span>
                      <span className="mx-2 text-white/30">·</span>
                      <span>{lesson.duration}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onToggleClassroomPresentation(true);
                        if (lesson.launchShowSlug) {
                          onStartShow(lesson.launchShowSlug);
                        } else if (lesson.launchObjectSlug) {
                          onInspectObject(lesson.launchObjectSlug);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#79D9ED] text-[#030713] text-xs font-semibold hover:bg-[#9BE4F4] transition-colors whitespace-nowrap shrink-0"
                    >
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Present This Lesson ↗</span>
                    </button>
                  </div>

                  <h3 className="font-display text-xl font-bold text-[#F7FAFF]">
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-[#B8C4DE] leading-relaxed">
                    <strong className="text-[#F7FAFF]">Learning Objective:</strong> {lesson.objective}
                  </p>
                  <div className="p-4 rounded-xl bg-[#070D1D] border border-white/10 text-xs text-[#B8C4DE]">
                    <strong className="text-[#D7B77B]">Target Misconception:</strong>{' '}
                    {lesson.misconceptionFocus}
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-[#F7FAFF] mb-2">
                      Guided Classroom Checkpoints
                    </div>
                    <ol className="space-y-1.5 text-xs text-[#B8C4DE] list-decimal list-inside">
                      {lesson.checkpoints.map((cp, i) => (
                        <li key={i} className="leading-relaxed">
                          {cp}
                        </li>
                      ))}
                    </ol>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Concept Pathways + Reading Level Selector */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <h2 className="font-display text-xl font-bold text-[#F7FAFF]">
                  01. Interactive Concept Pathways
                </h2>
                <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0D1526] border border-white/15">
                  {(
                    [
                      { id: 'young', label: 'Young Explorers (7–12)' },
                      { id: 'curious', label: 'Curious Minds' },
                      { id: 'enthusiast', label: 'Enthusiasts' },
                    ] as Array<{ id: ReadingDepth; label: string }>
                  ).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onUpdatePreferences({ readingDepth: r.id })}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        preferences.readingDepth === r.id
                          ? 'bg-[#79D9ED] text-[#030713] font-semibold'
                          : 'text-[#B8C4DE] hover:text-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    kicker: 'Earth & Axial Tilt',
                    title: 'Why does Earth have four seasons?',
                    desc: 'Inspect Earth’s 23.44° tilted rotational axis and discover why sunlight angle—not orbital distance—creates summer and winter.',
                    actionLabel: 'Inspect Earth’s Tilt ↗',
                    onClick: () => onInspectObject('earth'),
                  },
                  {
                    kicker: 'Gravity & Planetary Scale',
                    title: 'Why are gas giants so huge?',
                    desc: 'Compare Jupiter and Saturn against rocky inner worlds and examine how ice particles form razor-thin Keplerian rings.',
                    actionLabel: 'Compare Jupiter & Earth ↗',
                    onClick: () => onNavigate('compare'),
                  },
                  {
                    kicker: 'Stars & Light-Time',
                    title: 'What is an official constellation?',
                    desc: 'Open the live sky dome to separate 1930 IAU sky regions from human stick-figure asterisms like the Big Dipper.',
                    actionLabel: 'Open Sky Tonight ↗',
                    onClick: () => onNavigate('sky'),
                  },
                ].map((card) => (
                  <button
                    key={card.title}
                    type="button"
                    onClick={card.onClick}
                    className="group text-left p-6 rounded-2xl border border-white/15 bg-[#0D1526] hover:border-[#79D9ED] transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs text-[#79D9ED] font-medium">{card.kicker}</div>
                      <h3 className="font-display text-lg font-bold text-[#F7FAFF] mt-2 group-hover:text-[#79D9ED] transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-sm text-[#B8C4DE] mt-2 leading-relaxed">{card.desc}</p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-white/10 text-xs font-semibold text-[#79D9ED]">
                      {card.actionLabel}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Interactive Astronomy Concept Challenges (Untimed, Accessible) */}
            <section>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#F7FAFF]">
                    02. Astronomy Concept Challenges
                  </h2>
                  <p className="text-xs text-[#B8C4DE] mt-1">
                    No timers or trick traps—each question unlocks a verified scientific explanation for your Voyage Passport.
                  </p>
                </div>
                <div className="font-mono text-xs text-[#79D9ED]">
                  Completed: {quizCorrectIds.length} / {ASTRONOMY_QUIZZES.length}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ASTRONOMY_QUIZZES.map((q) => {
                  const chosen = selectedAnswers[q.id];
                  const answered = chosen !== undefined;
                  const isCorrect = chosen === q.correctIndex || quizCorrectIds.includes(q.id);

                  return (
                    <div
                      key={q.id}
                      className="p-6 rounded-2xl border border-white/15 bg-[#0D1526] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-[#B8C4DE]">
                          <span>{q.topic}</span>
                          {quizCorrectIds.includes(q.id) && (
                            <span className="inline-flex items-center gap-1 text-[#9FDFB6] font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Solved</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-base font-bold text-[#F7FAFF] mt-2">
                          {q.question}
                        </h3>

                        <div className="mt-4 space-y-2">
                          {q.options.map((opt, idx) => {
                            const selectedThis = chosen === idx;
                            const showCorrectHighlight =
                              (answered || quizCorrectIds.includes(q.id)) && idx === q.correctIndex;
                            const showWrongHighlight = selectedThis && idx !== q.correctIndex;

                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setSelectedAnswers((prev) => ({ ...prev, [q.id]: idx }));
                                  if (idx === q.correctIndex) {
                                    onRecordQuizCorrect(q.id, q.explanation.replace(/^Correct!\s*|^Spot on!\s*|^Exactly!\s*/, ''));
                                  }
                                }}
                                className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-colors ${
                                  showCorrectHighlight
                                    ? 'border-[#9FDFB6] bg-[#9FDFB6]/12 text-[#F7FAFF]'
                                    : showWrongHighlight
                                    ? 'border-amber-400/60 bg-amber-400/10 text-[#F7FAFF]'
                                    : 'border-white/10 bg-[#070D1D] text-[#B8C4DE] hover:border-[#79D9ED] hover:text-white'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {answered && (
                        <div
                          role="status"
                          aria-live="polite"
                          className="mt-4 pt-3.5 border-t border-white/10 text-xs leading-relaxed"
                        >
                          {chosen === q.correctIndex ? (
                            <p className="text-[#9FDFB6] flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                              <span>{q.explanation}</span>
                            </p>
                          ) : (
                            <p className="text-[#D7B77B] flex items-start gap-2">
                              <XCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                              <span>
                                Not quite—re-read the physical clue above and try another choice, or{' '}
                                <button
                                  type="button"
                                  onClick={() => onInspectObject(q.relatedSlug)}
                                  className="underline text-[#79D9ED]"
                                >
                                  inspect this entry
                                </button>
                                .
                              </span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Astronomy Glossary */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <h2 className="font-display text-xl font-bold text-[#F7FAFF]">
                  03. Scientific Vocabulary &amp; Units Glossary
                </h2>
                <input
                  type="search"
                  value={glossaryFilter}
                  onChange={(e) => setGlossaryFilter(e.target.value)}
                  placeholder="Filter glossary terms..."
                  aria-label="Filter glossary terms"
                  className="px-3.5 py-2 rounded-lg bg-[#0D1526] border border-white/15 text-xs text-[#F7FAFF]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGlossary.map((g) => (
                  <div
                    key={g.term}
                    className="p-5 rounded-xl border border-white/10 bg-[#0B1325] space-y-1.5"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-base font-bold text-[#F7FAFF]">{g.term}</h3>
                      {g.symbolOrUnit && (
                        <span className="font-mono text-xs text-[#79D9ED]">{g.symbolOrUnit}</span>
                      )}
                    </div>
                    <p className="text-xs text-[#B8C4DE] leading-relaxed">{g.definition}</p>
                    <p className="text-[11px] text-[#7F90B0]">Example: {g.example}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Educator Callout */}
            <div className="p-6 rounded-2xl border border-white/15 bg-[#0D1526] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-[#9F95F0] mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="font-display text-base font-bold text-[#F7FAFF]">
                    Teaching the Solar System or Night Sky?
                  </h3>
                  <p className="text-xs text-[#B8C4DE] mt-0.5">
                    Open our Educator Portal for structured 25-minute lesson plans and one-click Classroom Presentation mode.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('teachers')}
                className="px-4 py-2.5 rounded-lg bg-[#9F95F0] text-[#030713] text-xs font-semibold hover:bg-[#b5adf5] transition-colors whitespace-nowrap shrink-0"
              >
                Open Educator Portal →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
