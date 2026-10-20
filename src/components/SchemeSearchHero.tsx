import React, { useState } from 'react';
import {
  Search,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Compass,
  FileCheck2,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface SchemeSearchHeroProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  currentQuery: string;
  searchProgressStep: number; // 0 to 4
  searchMode: 'tinyfish_live' | 'verified_database';
  liveResearchSummary?: string;
  hasTinyFishKey: boolean;
}

const SAMPLE_QUERIES = [
  'Find government scholarship schemes for college students in Uttar Pradesh',
  'Mukhyamantri Kanya Sumangala Yojana eligibility and documents',
  'PM-Kisan income support for small and marginal farmers',
  'PMAY-G rural housing assistance criteria and toilet subsidy',
];

export const SchemeSearchHero: React.FC<SchemeSearchHeroProps> = ({
  onSearch,
  isLoading,
  currentQuery,
  searchProgressStep,
  searchMode,
  liveResearchSummary,
  hasTinyFishKey,
}) => {
  const [inputVal, setInputVal] = useState(currentQuery || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim().length >= 3 && !isLoading) {
      onSearch(inputVal.trim());
    }
  };

  const handleChipClick = (q: string) => {
    setInputVal(q);
    onSearch(q);
  };

  return (
    <section className="bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 text-stone-100 pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-stone-700/60 shadow-inner">
      <div className="max-w-4xl mx-auto">
        {/* Mission Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Public Rural Information & Official Welfare Schemes</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-white tracking-tight">
            Discover Government Schemes That Truly Apply To You
          </h1>
          <p className="mt-2 text-stone-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Live official portal research via <strong className="text-amber-400 font-semibold">TinyFish</strong>,
            simplified into plain multilingual explanations by <strong className="text-amber-400 font-semibold">Gemini</strong> with transparent eligibility logic.
          </p>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <div className="relative flex items-center shadow-lg rounded-xl overflow-hidden bg-white text-stone-900 border-2 border-stone-300 focus-within:border-amber-500 focus-within:ring-3 focus-within:ring-amber-500/20 transition-all">
            <div className="pl-4 pr-2 text-stone-400 shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search scheme name, department, or e.g. 'Find government scholarship schemes for college students in Uttar Pradesh'"
              className="w-full py-3.5 px-2 text-sm sm:text-base text-stone-900 placeholder-stone-400 bg-transparent focus:outline-none"
              aria-label="Search government schemes query"
              disabled={isLoading}
            />
            {inputVal && (
              <button
                type="button"
                onClick={() => setInputVal('')}
                className="px-2 text-xs font-semibold text-stone-400 hover:text-stone-600 mr-1"
                aria-label="Clear search input"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || inputVal.trim().length < 3}
              className="bg-amber-600 hover:bg-amber-500 disabled:bg-stone-300 text-stone-950 font-bold px-5 py-3.5 text-sm sm:text-base transition-colors shrink-0 flex items-center space-x-1.5 focus:outline-none"
              aria-label="Submit search for government schemes"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                  <span className="hidden sm:inline">Researching...</span>
                </>
              ) : (
                <>
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Suggested Queries Chips */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto text-xs">
          <span className="text-stone-400 font-medium">Try asking:</span>
          {SAMPLE_QUERIES.map((sq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(sq)}
              disabled={isLoading}
              className="bg-stone-800/90 hover:bg-stone-700 text-amber-200/90 hover:text-amber-100 border border-stone-700/80 px-2.5 py-1 rounded-md transition-colors text-left"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Live Search Progress Indicator (When Searching) */}
        {isLoading && (
          <div className="mt-6 bg-stone-900/90 border border-amber-500/30 rounded-xl p-4 max-w-2xl mx-auto text-xs shadow-lg animate-fade-in">
            <div className="flex items-center space-x-2 text-amber-400 font-semibold mb-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Researching Official Government Sources...</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div
                className={`p-2 rounded border ${
                  searchProgressStep >= 1
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                    : 'bg-stone-800/50 border-stone-700 text-stone-400'
                }`}
              >
                <div className="font-semibold flex items-center space-x-1">
                  <span>1. TinyFish</span>
                  {searchProgressStep >= 1 && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                </div>
                <p className="text-[10px] mt-0.5">Live portal scan</p>
              </div>

              <div
                className={`p-2 rounded border ${
                  searchProgressStep >= 2
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                    : 'bg-stone-800/50 border-stone-700 text-stone-400'
                }`}
              >
                <div className="font-semibold flex items-center space-x-1">
                  <span>2. Extraction</span>
                  {searchProgressStep >= 2 && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                </div>
                <p className="text-[10px] mt-0.5">Rules & benefits</p>
              </div>

              <div
                className={`p-2 rounded border ${
                  searchProgressStep >= 3
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                    : 'bg-stone-800/50 border-stone-700 text-stone-400'
                }`}
              >
                <div className="font-semibold flex items-center space-x-1">
                  <span>3. Eligibility</span>
                  {searchProgressStep >= 3 && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                </div>
                <p className="text-[10px] mt-0.5">Citizen matching</p>
              </div>

              <div
                className={`p-2 rounded border ${
                  searchProgressStep >= 4
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                    : 'bg-stone-800/50 border-stone-700 text-stone-400'
                }`}
              >
                <div className="font-semibold flex items-center space-x-1">
                  <span>4. Notice Diff</span>
                  {searchProgressStep >= 4 && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                </div>
                <p className="text-[10px] mt-0.5">Change check</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Callout */}
        {!isLoading && liveResearchSummary && (
          <div className={`mt-4 p-3 rounded-lg text-xs max-w-3xl mx-auto flex items-center justify-between border ${
            hasTinyFishKey
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
              : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
          }`}>
            <div className="flex items-center space-x-2">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  hasTinyFishKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{liveResearchSummary}</span>
            </div>
            {hasTinyFishKey ? (
              <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700 shrink-0 ml-2">
                TinyFish Live Research Active
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700 shrink-0 ml-2">
                Key Missing: Portal Sync Mode
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
