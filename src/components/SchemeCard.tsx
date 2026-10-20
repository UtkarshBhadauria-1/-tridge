import React, { useState } from 'react';
import {
  ExternalLink,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  FileText,
  Gift,
  Building2,
  Bookmark,
  BookmarkCheck,
  Languages,
  Clock,
  History,
  Info,
} from 'lucide-react';
import type { Scheme } from '../types/scheme.ts';

interface SchemeCardProps {
  scheme: Scheme;
  onExplainLanguage: (scheme: Scheme) => void;
  onViewDiff: (scheme: Scheme) => void;
  onSaveSnapshot: (scheme: Scheme) => void;
  isSaved: boolean;
  selectedLanguage: string;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  onExplainLanguage,
  onViewDiff,
  onSaveSnapshot,
  isSaved,
  selectedLanguage,
}) => {
  const [activeTab, setActiveTab] = useState<'benefits' | 'eligibility' | 'documents'>(
    'benefits'
  );

  const match = scheme.eligibilityMatch;

  // Render verdict badge
  const renderVerdictBadge = () => {
    if (!match) return null;

    if (match.verdict === 'potentially_eligible') {
      return (
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Potentially eligible</span>
        </div>
      );
    }
    if (match.verdict === 'not_eligible') {
      return (
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Not eligible under known criteria</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
        <span>More information required</span>
      </div>
    );
  };

  return (
    <article className="bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-stone-100 bg-stone-50/60">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          {renderVerdictBadge()}

          <div className="flex items-center space-x-1.5">
            {scheme.hasUpdatesNotice && (
              <button
                onClick={() => onViewDiff(scheme)}
                className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200 transition-colors"
                title="Notice details differ from previous record"
              >
                <History className="w-3 h-3 text-blue-600" />
                <span>Notice Diff Alert</span>
              </button>
            )}

            <button
              onClick={() => onSaveSnapshot(scheme)}
              className={`p-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1 transition-colors ${
                isSaved
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-100'
              }`}
              title={isSaved ? 'Scheme is saved in watchlist' : 'Track notice updates'}
              aria-label={isSaved ? 'Scheme saved' : 'Save scheme to track changes'}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Tracked</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Track</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scheme Name & Department */}
        <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-900 leading-snug">
          {scheme.name}
        </h2>
        <div className="flex items-center space-x-1.5 mt-1 text-xs text-stone-600 font-medium">
          <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>{scheme.department}</span>
        </div>

        <p className="mt-2.5 text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
          {scheme.description}
        </p>

        {/* Eligibility Rationale Callout */}
        {match && (
          <div
            className={`mt-3 p-2.5 rounded-lg text-xs leading-relaxed border ${
              match.verdict === 'potentially_eligible'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : match.verdict === 'not_eligible'
                ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            <div className="font-semibold flex items-center space-x-1 mb-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Eligibility Evaluation Rationale:</span>
            </div>
            <p>{match.explanation}</p>

            {match.unmetCriteria.length > 0 && (
              <ul className="mt-1 space-y-0.5 list-disc list-inside font-medium text-[11px]">
                {match.unmetCriteria.map((un, idx) => (
                  <li key={idx}>{un}</li>
                ))}
              </ul>
            )}

            {match.uncertainCriteria.length > 0 && (
              <ul className="mt-1 space-y-0.5 list-disc list-inside text-amber-800 text-[11px]">
                {match.uncertainCriteria.map((uc, idx) => (
                  <li key={idx}>{uc}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Deadline & Key Metadata Bar */}
      <div className="px-4 py-2.5 bg-stone-100/70 border-b border-stone-200 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Calendar className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <span className="text-stone-500">Deadline:</span>
          <span
            className={`font-semibold ${
              scheme.deadline.isUncertain
                ? 'text-amber-800'
                : scheme.deadline.status === 'expired'
                ? 'text-rose-700'
                : 'text-stone-900'
            }`}
          >
            {scheme.deadline.dateText}
          </span>
        </div>

        {scheme.deadline.isUncertain && (
          <span className="inline-flex items-center space-x-1 text-[11px] text-amber-700 font-medium bg-amber-100/60 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Uncertain / Verify on portal</span>
          </span>
        )}

        <div className="flex items-center space-x-1 text-stone-500 text-[11px]">
          <Clock className="w-3 h-3 text-stone-400" />
          <span>Retrieved: {new Date(scheme.retrievalTimestamp).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-stone-200 text-xs font-semibold text-stone-600 bg-stone-50">
        <button
          onClick={() => setActiveTab('benefits')}
          className={`flex-1 py-2 px-3 text-center border-b-2 transition-colors flex items-center justify-center space-x-1 ${
            activeTab === 'benefits'
              ? 'border-amber-600 text-amber-900 bg-white'
              : 'border-transparent hover:text-stone-900'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Benefits ({scheme.benefits.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('eligibility')}
          className={`flex-1 py-2 px-3 text-center border-b-2 transition-colors flex items-center justify-center space-x-1 ${
            activeTab === 'eligibility'
              ? 'border-amber-600 text-amber-900 bg-white'
              : 'border-transparent hover:text-stone-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Criteria ({scheme.eligibilityCriteria.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex-1 py-2 px-3 text-center border-b-2 transition-colors flex items-center justify-center space-x-1 ${
            activeTab === 'documents'
              ? 'border-amber-600 text-amber-900 bg-white'
              : 'border-transparent hover:text-stone-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Documents ({scheme.requiredDocuments.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 flex-1 text-xs text-stone-700 min-h-[140px]">
        {activeTab === 'benefits' && (
          <div>
            <span className="font-semibold text-stone-900 block mb-1.5">
              Assistance & Entitlements:
            </span>
            <ul className="space-y-1.5 list-disc list-inside">
              {scheme.benefits.map((b, i) => (
                <li key={i} className="leading-relaxed">
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'eligibility' && (
          <div>
            <span className="font-semibold text-stone-900 block mb-1.5">
              Verified Eligibility Conditions:
            </span>
            <ul className="space-y-1.5 list-disc list-inside">
              {scheme.eligibilityCriteria.map((c, i) => (
                <li key={i} className="leading-relaxed">
                  {c}
                </li>
              ))}
            </ul>
            {scheme.uncertaintyDisclaimers && scheme.uncertaintyDisclaimers.length > 0 && (
              <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200 text-amber-800 text-[11px]">
                <strong className="block font-semibold">Verification Uncertainty:</strong>
                {scheme.uncertaintyDisclaimers.join(' ')}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <span className="font-semibold text-stone-900 block mb-1.5">
              Documents Checklist:
            </span>
            <ul className="space-y-1.5 list-disc list-inside">
              {scheme.requiredDocuments.map((doc, i) => (
                <li key={i} className="leading-relaxed">
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="p-3 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
        {/* Official Source Link (Mandatory Requirement) */}
        <a
          href={scheme.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-xs text-amber-700 hover:text-amber-800 font-semibold underline decoration-amber-400 hover:decoration-amber-700"
          title="Open official department portal in a new tab"
        >
          <span>Official Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <div className="flex items-center space-x-2">
          {/* Multilingual Explanation Button */}
          <button
            onClick={() => onExplainLanguage(scheme)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs transition-colors shadow-xs"
            aria-label={`Explain ${scheme.name} in ${selectedLanguage}`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Explain in {selectedLanguage}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
