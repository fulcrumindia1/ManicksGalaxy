import React, { useState } from 'react';
import { Award, CheckCircle2, Printer, Trash2 } from 'lucide-react';
import { CELESTIAL_CATALOG, getObjectBySlug } from '../data/catalog';
import { VoyagePassportState, computeEarnedBadges } from '../lib/voyageStore';
import { AppRoute } from './Header';

interface VoyageAndSourcesViewProps {
  mode: 'voyage' | 'sources';
  voyage: VoyagePassportState;
  onInspectObject: (slug: string) => void;
  onStartShow: (showSlug: string) => void;
  onClearVoyage: () => void;
  onNavigate: (route: AppRoute) => void;
}

export const VoyageAndSourcesView: React.FC<VoyageAndSourcesViewProps> = ({
  mode,
  voyage,
  onInspectObject,
  onStartShow,
  onClearVoyage,
  onNavigate,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const badges = computeEarnedBadges(voyage);

  if (mode === 'sources') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#030713] text-[#F7FAFF] py-10 pb-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-xs font-medium text-[#79D9ED]">
              First-Class Scientific Provenance &amp; Licensing Register
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F7FAFF] mt-1">
              Scientific &amp; Media Sources
            </h1>
            <p className="text-sm text-[#B8C4DE] mt-2 max-w-3xl leading-relaxed">
              Every celestial entry in ManicksGalaxy declares its visual authenticity tier (OBSERVED, DATA-BASED, RECONSTRUCTED, or ARTISTIC), measurement epoch, and source license. Use of public NASA, ESA, IAU, or Caltech IPAC data does not imply institutional endorsement.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-[#0D1526] overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/15 text-xs text-[#7F90B0]">
                  <th className="py-3.5 px-4 font-medium">Asset ID</th>
                  <th className="py-3.5 px-4 font-medium">Destination</th>
                  <th className="py-3.5 px-4 font-medium">Authenticity</th>
                  <th className="py-3.5 px-4 font-medium">Primary Archive &amp; Credit</th>
                  <th className="py-3.5 px-4 font-medium">Epoch &amp; License</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs">
                {CELESTIAL_CATALOG.map((obj) =>
                  obj.sources.map((src) => (
                    <tr key={src.assetId} className="hover:bg-white/5">
                      <td className="py-3.5 px-4 font-mono text-[#79D9ED] whitespace-nowrap">
                        {src.assetId}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => onInspectObject(obj.slug)}
                          className="font-semibold text-[#F7FAFF] hover:text-[#79D9ED]"
                        >
                          {obj.name} ↗
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#D7B77B] whitespace-nowrap">
                        {src.authenticityTier}
                      </td>
                      <td className="py-3.5 px-4 text-[#B8C4DE] max-w-md">
                        <div className="font-medium text-[#F7FAFF]">{src.organization}</div>
                        <div className="text-[#7F90B0] mt-0.5">{src.creditLine}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#B8C4DE]">
                        <div className="font-mono">{src.dataEpoch}</div>
                        <div className="text-[#7F90B0] mt-0.5">{src.license}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#030713] text-[#F7FAFF] py-10 pb-20 print:bg-white print:text-slate-900 print:py-0 print:pb-0">
      <style>{`
        @media print {
          @page {
            margin: 1.2cm;
            size: portrait;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
          }
          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
      <div className="max-w-[1060px] mx-auto px-4 sm:px-6 space-y-8 print:max-w-full print:px-0 print:space-y-5">
        {/* Print-Only Official Certificate Header */}
        <div className="hidden print:flex flex-col border-b-2 border-slate-900 pb-3 mb-4 print-avoid-break">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-600 font-bold">
                Official Astronomy Field Record · Certified Explorer
              </span>
              <h1 className="text-2xl font-bold text-slate-900 font-display mt-0.5">
                ManicksGalaxy — Voyage Passport &amp; Classroom Recap
              </h1>
            </div>
            <div className="text-right text-xs text-slate-600 font-mono">
              <div>Date: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div className="text-sky-800 font-semibold mt-0.5">Verified Scientific Log</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-700 border-t border-slate-300 pt-2 font-medium">
            <div>Student / Stargazer: <span className="inline-block border-b border-slate-900 w-56 ml-1.5 font-normal"></span></div>
            <div>Educator / Facility: <span className="inline-block border-b border-slate-900 w-44 ml-1.5 font-normal"></span></div>
          </div>
        </div>

        {/* Screen Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
          <div>
            <p className="text-xs font-medium text-[#79D9ED]">
              Scene 08 · Guest-Only Local Exploration Souvenir
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F7FAFF] mt-1">
              My Voyage Passport
            </h1>
            <p className="text-sm text-[#B8C4DE] mt-1.5 max-w-2xl">
              Every world you inspect, show chapter you complete, and concept you master is saved privately in this browser—no account or personal data required.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/15 bg-[#0D1526] text-xs font-medium text-[#F7FAFF] hover:border-[#79D9ED] transition-colors whitespace-nowrap shrink-0 shadow-sm"
              title="Print classroom certificate and discovery recap"
            >
              <Printer className="w-3.5 h-3.5 text-[#79D9ED]" aria-hidden="true" />
              <span>Print Classroom Recap</span>
            </button>

            {!confirmClear ? (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/15 bg-[#0D1526] text-xs font-medium text-[#B8C4DE] hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Clear Local Data</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-[#1B1426] border border-amber-400/40 rounded-lg px-3 py-1.5 text-xs">
                <span className="text-amber-200">Reset passport?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearVoyage();
                    setConfirmClear(false);
                  }}
                  className="font-semibold text-amber-300 hover:underline"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="text-[#B8C4DE] hover:text-white ml-1"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Summary Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3 print-avoid-break">
          <div className="p-5 rounded-2xl border border-white/15 bg-[#0D1526] print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
            <div className="text-xs text-[#7F90B0] print:text-slate-600 font-medium">Worlds Visited</div>
            <div className="font-mono text-2xl font-bold text-[#79D9ED] print:text-sky-800 mt-1">
              {voyage.visitedSlugs.length} <span className="text-sm text-[#7F90B0] print:text-slate-500">/ {CELESTIAL_CATALOG.length}</span>
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-white/15 bg-[#0D1526] print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
            <div className="text-xs text-[#7F90B0] print:text-slate-600 font-medium">Show Chapters</div>
            <div className="font-mono text-2xl font-bold text-[#D7B77B] print:text-amber-800 mt-1">
              {voyage.completedChapters.length}
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-white/15 bg-[#0D1526] print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
            <div className="text-xs text-[#7F90B0] print:text-slate-600 font-medium">Quizzes Solved</div>
            <div className="font-mono text-2xl font-bold text-[#9FDFB6] print:text-emerald-800 mt-1">
              {voyage.quizCorrectIds.length}
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-white/15 bg-[#0D1526] print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
            <div className="text-xs text-[#7F90B0] print:text-slate-600 font-medium">Badges Earned</div>
            <div className="font-mono text-2xl font-bold text-[#9F95F0] print:text-purple-800 mt-1">
              {badges.filter((b) => b.earned).length} <span className="text-sm text-[#7F90B0] print:text-slate-500">/ {badges.length}</span>
            </div>
          </div>
        </div>

        {/* Visited Destinations Stamps */}
        <section className="p-6 sm:p-7 rounded-2xl border border-white/15 bg-[#0D1526] print:bg-slate-50 print:border-slate-300 print:p-4 print:rounded-lg print-avoid-break">
          <h2 className="font-display text-lg font-bold text-[#F7FAFF] print:text-slate-900 mb-4 print:mb-2.5">
            Visited Celestial Destinations ({voyage.visitedSlugs.length})
          </h2>
          {voyage.visitedSlugs.length === 0 ? (
            <p className="text-xs text-[#B8C4DE] print:text-slate-600 italic">No celestial bodies visited yet. Explore any planet or moon to collect stamps.</p>
          ) : (
            <div className="flex flex-wrap gap-3 print:grid print:grid-cols-3 print:gap-2">
              {voyage.visitedSlugs.map((slug) => {
                const obj = getObjectBySlug(slug);
                if (!obj) return null;
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => onInspectObject(slug)}
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/15 bg-[#070D1D] hover:border-[#79D9ED] transition-colors text-left print:bg-white print:border-slate-300 print:p-2 print:rounded-md print:pointer-events-none"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 print:border print:border-slate-400"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${obj.visual.primaryColor}, ${obj.visual.secondaryColor})`,
                      }}
                      aria-hidden="true"
                    />
                    <div>
                      <div className="text-xs font-semibold text-[#F7FAFF] print:text-slate-900">{obj.name}</div>
                      <div className="font-mono text-[10px] text-[#79D9ED] print:text-sky-800 font-bold">{obj.authenticityTier}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Remembered Scientific Facts & Earned Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:grid-cols-12 print:gap-4 print-avoid-break">
          <section className="lg:col-span-7 p-6 sm:p-7 rounded-2xl border border-white/15 bg-[#0D1526] print:bg-slate-50 print:border-slate-300 print:p-4 print:rounded-lg print:col-span-7 print-avoid-break">
            <h2 className="font-display text-lg font-bold text-[#F7FAFF] print:text-slate-900 mb-4 print:mb-2.5">
              Verified Facts Collected on Your Voyage
            </h2>
            {voyage.rememberedFacts.length === 0 ? (
              <p className="text-xs text-[#B8C4DE] print:text-slate-600 italic">Explore worlds and complete show chapters to record scientific discoveries in your log.</p>
            ) : (
              <ul className="space-y-3 print:space-y-2 text-sm text-[#B8C4DE] print:text-slate-800">
                {voyage.rememberedFacts.map((fact, idx) => (
                  <li
                    key={idx}
                    className="p-3.5 rounded-xl border border-white/10 bg-[#070D1D] flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed print:bg-white print:border-slate-200 print:p-2.5 print:rounded-md print:text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#79D9ED] print:text-sky-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="lg:col-span-5 p-6 sm:p-7 rounded-2xl border border-white/15 bg-[#0D1526] print:bg-slate-50 print:border-slate-300 print:p-4 print:rounded-lg print:col-span-5 print-avoid-break">
            <h2 className="font-display text-lg font-bold text-[#F7FAFF] print:text-slate-900 mb-4 print:mb-2.5">
              Discovery Milestones
            </h2>
            <div className="space-y-3 print:space-y-2">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 print:p-2.5 print:rounded-md ${b.earned
                      ? 'border-[#9FDFB6]/40 bg-[#9FDFB6]/8 print:bg-emerald-50 print:border-emerald-300'
                      : 'border-white/10 bg-[#070D1D] opacity-65 print:bg-white print:border-slate-200 print:opacity-100 print:border-dashed'
                    }`}
                >
                  <Award
                    className={`w-4 h-4 shrink-0 mt-0.5 ${b.earned ? 'text-[#9FDFB6] print:text-emerald-700' : 'text-[#7F90B0] print:text-slate-400'
                      }`}
                    aria-hidden="true"
                  />
                  <div>
                    <div className="text-xs font-semibold text-[#F7FAFF] print:text-slate-900">
                      {b.title} <span className="font-normal print:font-semibold text-[11px] text-[#79D9ED] print:text-emerald-800">{b.earned ? '· Unlocked' : '· In Progress'}</span>
                    </div>
                    <p className="text-xs text-[#B8C4DE] print:text-slate-600 mt-0.5">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Next Mission Actions (hidden in print) */}
        <div className="p-6 sm:p-7 rounded-2xl border border-white/15 bg-[#0D1526] flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div>
            <div className="text-xs text-[#D7B77B] font-medium">You’ve only seen the beginning</div>
            <h2 className="font-display text-xl font-bold text-[#F7FAFF] mt-0.5">
              Choose your next destination.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onInspectObject(voyage.lastDestinationSlug || 'saturn')}
              className="px-4 py-2.5 rounded-lg bg-[#79D9ED] text-[#030713] text-xs font-semibold hover:bg-[#9BE4F4] transition-colors whitespace-nowrap shrink-0"
            >
              Continue from {getObjectBySlug(voyage.lastDestinationSlug || 'saturn')?.name || 'Saturn'} ↗
            </button>
            <button
              type="button"
              onClick={() => onStartShow('first-flight')}
              className="px-4 py-2.5 rounded-lg border border-white/20 text-xs font-semibold text-[#F7FAFF] hover:border-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
            >
              Replay First Flight
            </button>
            <button
              type="button"
              onClick={() => onNavigate('sky')}
              className="px-4 py-2.5 rounded-lg border border-white/20 text-xs font-semibold text-[#F7FAFF] hover:border-[#79D9ED] transition-colors whitespace-nowrap shrink-0"
            >
              Sky Tonight
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
