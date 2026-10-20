import React, { useState, useEffect } from "react";
import {
  X,
  Languages,
  ExternalLink,
  Loader2,
  Sparkles,
  HelpCircle,
  FileText,
  Calendar,
  AlertTriangle,
  Gift,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import type { Scheme, MultilingualExplanation } from "../types/scheme.ts";

import { SUPPORTED_LANGUAGES } from "./Navbar.tsx";

interface MultilingualModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme: Scheme | null;
  initialLanguage: string;
}

const REQUIRED_EXPLANATION_FIELDS = [
  "whatIsIt",
  "whoIsEligible",
  "whatYouReceive",
  "importantDatesAndDeadlines",
  "documentsNeeded",
  "criticalConditionsAndWarnings",
] as const;

const SECTION_LABELS: Record<
  string,
  {
    translateTo: string;
    whatIsIt: string;
    eligibility: string;
    benefits: string;
    deadline: string;
    documents: string;
    conditions: string;
    generating: string;
  }
> = {
  English: {
    translateTo: "Translate to:",
    whatIsIt: "What is this scheme?",
    eligibility: "Who is eligible?",
    benefits: "Benefits received",
    deadline: "Application deadline",
    documents: "Required documents",
    conditions: "Important conditions",
    generating: "Preparing explanation in",
  },

  Hindi: {
    translateTo: "भाषा चुनें:",
    whatIsIt: "यह योजना क्या है?",
    eligibility: "कौन पात्र है?",
    benefits: "क्या लाभ मिलेगा?",
    deadline: "आवेदन की अंतिम तिथि",
    documents: "आवश्यक दस्तावेज",
    conditions: "महत्वपूर्ण शर्तें",
    generating: "इस भाषा में जानकारी तैयार हो रही है:",
  },
};

function getLabels(language: string) {
  return SECTION_LABELS[language] ?? SECTION_LABELS.English;
}

function isValidExplanation(data: unknown): data is MultilingualExplanation {
  if (!data || typeof data !== "object") {
    return false;
  }

  const record = data as Record<string, unknown>;

  return REQUIRED_EXPLANATION_FIELDS.every(
    (field) =>
      typeof record[field] === "string" && record[field].trim().length > 0,
  );
}

export const MultilingualModal: React.FC<MultilingualModalProps> = ({
  isOpen,
  onClose,
  scheme,
  initialLanguage,
}) => {
  const [selectedLang, setSelectedLang] = useState(initialLanguage || "Hindi");

  const [explanation, setExplanation] =
    useState<MultilingualExplanation | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const labels = getLabels(selectedLang);

  // Keep the selected language synchronized with the parent component.
  useEffect(() => {
    if (initialLanguage) {
      setSelectedLang(initialLanguage);
    }
  }, [initialLanguage]);

  // Validate the source URL before displaying external links.
  const safeSourceUrl = (() => {
    if (!scheme?.sourceUrl) {
      return undefined;
    }

    try {
      const url = new URL(scheme.sourceUrl);

      if (url.protocol === "https:" || url.protocol === "http:") {
        return url.href;
      }

      return undefined;
    } catch {
      return undefined;
    }
  })();

  const sourceHostname = (() => {
    if (!safeSourceUrl) {
      return "Official source";
    }

    try {
      return new URL(safeSourceUrl).hostname;
    } catch {
      return "Official source";
    }
  })();

  // Fetch the explanation whenever the scheme, language, or retry changes.
  useEffect(() => {
    if (!isOpen || !scheme) {
      setExplanation(null);
      setLoading(false);
      setError(null);
      setRetryCount(0);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    async function loadExplanation() {
      setLoading(true);
      setError(null);

      // Do not display an explanation from a previous language.
      setExplanation(null);

      try {
        const response = await fetch("/api/schemes/explain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scheme,
            language: selectedLang,
          }),
          signal: controller.signal,
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            typeof data?.error === "string"
              ? data.error
              : `Explanation request failed: HTTP ${response.status}`,
          );
        }

        if (!isValidExplanation(data)) {
          throw new Error(
            "The server returned an incomplete explanation. Please try again.",
          );
        }

        if (isMounted) {
          setExplanation(data);
        }
      } catch (err) {
        if (!isMounted || controller.signal.aborted) {
          return;
        }

        console.error("Multilingual explanation request failed:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to generate the explanation. Please try again.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadExplanation();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isOpen, scheme, selectedLang, retryCount]);

  if (!isOpen || !scheme) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="multilingual-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-300 overflow-hidden my-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-4 sm:p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
              <Languages className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold flex items-center space-x-1">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>AI-Powered Scheme Explanation</span>
              </span>

              <h2
                id="multilingual-modal-title"
                className="text-base sm:text-lg font-bold font-serif text-white line-clamp-1"
              >
                {scheme.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            aria-label="Close scheme explanation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language selector */}
        <div className="bg-stone-100 px-4 py-2.5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-stone-700">
              {labels.translateTo}
            </span>

            <select
              value={selectedLang}
              onChange={(event) => {
                setSelectedLang(event.target.value);
              }}
              className="text-xs font-semibold bg-white border border-stone-300 rounded-md px-2 py-1 text-stone-800 focus:ring-1 focus:ring-amber-500"
              aria-label="Choose explanation language"
            >
              {SUPPORTED_LANGUAGES.map((language) => (
                <option key={language.code} value={language.name}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>

          {safeSourceUrl && (
            <a
              href={safeSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber-700 font-semibold hover:underline flex items-center space-x-1"
            >
              <span>Original Source Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Body */}
        <div
          className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto space-y-4"
          aria-live="polite"
          aria-busy={loading}
        >
          {/* Loading state */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />

              <p className="text-sm font-semibold text-stone-700">
                {labels.generating} {selectedLang}...
              </p>

              <p className="text-xs text-stone-500 max-w-sm">
                Preparing scheme information while preserving available
                eligibility conditions, benefits, deadlines, and official source
                links.
              </p>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div
              className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800"
              role="alert"
            >
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />

                <div>
                  <p className="font-semibold">
                    Explanation temporarily unavailable
                  </p>

                  <p className="mt-1 break-words">{error}</p>

                  <p className="mt-2">
                    You can consult the original government source while we
                    retry the explanation.
                  </p>

                  <button
                    type="button"
                    onClick={() => setRetryCount((count) => count + 1)}
                    className="mt-3 inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-rose-800 text-white font-semibold hover:bg-rose-900"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try again</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Explanation content */}
          {!loading && !error && explanation && (
            <div className="space-y-4 text-xs sm:text-sm text-stone-800">
              {/* Scheme description */}
              <section className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5">
                <h3 className="font-bold text-amber-900 flex items-center space-x-1.5 mb-1 text-sm font-serif">
                  <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{labels.whatIsIt}</span>
                </h3>

                <p className="leading-relaxed font-medium whitespace-pre-line">
                  {explanation.whatIsIt}
                </p>
              </section>

              {/* Eligibility */}
              <section className="border border-stone-200 rounded-xl p-3.5 bg-white">
                <h3 className="font-bold text-stone-900 flex items-center space-x-1.5 mb-1 text-sm font-serif">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{labels.eligibility}</span>
                </h3>

                <p className="leading-relaxed text-stone-700 whitespace-pre-line">
                  {explanation.whoIsEligible}
                </p>
              </section>

              {/* Benefits */}
              <section className="border border-stone-200 rounded-xl p-3.5 bg-white">
                <h3 className="font-bold text-stone-900 flex items-center space-x-1.5 mb-1 text-sm font-serif">
                  <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{labels.benefits}</span>
                </h3>

                <p className="leading-relaxed text-stone-700 whitespace-pre-line">
                  {explanation.whatYouReceive}
                </p>
              </section>

              {/* Dates and documents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <section className="border border-stone-200 rounded-xl p-3 bg-stone-50">
                  <h3 className="font-bold text-stone-900 flex items-center space-x-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                    <span>{labels.deadline}</span>
                  </h3>

                  <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                    {explanation.importantDatesAndDeadlines}
                  </p>
                </section>

                <section className="border border-stone-200 rounded-xl p-3 bg-stone-50">
                  <h3 className="font-bold text-stone-900 flex items-center space-x-1 mb-1">
                    <FileText className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                    <span>{labels.documents}</span>
                  </h3>

                  <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                    {explanation.documentsNeeded}
                  </p>
                </section>
              </div>

              {/* Conditions */}
              <section className="bg-stone-100 border border-stone-300 rounded-xl p-3">
                <h3 className="font-bold text-stone-900 flex items-center space-x-1 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{labels.conditions}</span>
                </h3>

                <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                  {explanation.criticalConditionsAndWarnings}
                </p>
              </section>

              {/* Disclaimer */}
              {explanation.disclaimer && (
                <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-200">
                  <p className="italic whitespace-pre-line">
                    {explanation.disclaimer}
                  </p>
                </div>
              )}

              {/* Translation language indicator */}
              <div className="text-[11px] text-stone-500 flex items-center space-x-1.5">
                <Languages className="w-3.5 h-3.5" />

                <span>
                  Requested language: {selectedLang}
                  {explanation.languageName
                    ? ` · Response language: ${explanation.languageName}`
                    : ""}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-3">
          {safeSourceUrl ? (
            <a
              href={safeSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center space-x-1 min-w-0"
            >
              <span className="truncate">Visit {sourceHostname}</span>

              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          ) : (
            <span className="text-xs text-stone-500">
              Official source link unavailable
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
