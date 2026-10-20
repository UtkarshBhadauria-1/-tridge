/**
 * TRIDGE - Multilingual Rural Information and Assistance Platform
 * Frontend Application Root
 */

import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar.tsx";
import { CitizenProfileDrawer } from "./components/CitizenProfileDrawer.tsx";
import { SchemeSearchHero } from "./components/SchemeSearchHero.tsx";
import { SchemeCard } from "./components/SchemeCard.tsx";
import { MultilingualModal } from "./components/MultilingualModal.tsx";
import { ChangeDiffModal } from "./components/ChangeDiffModal.tsx";
import { TrackedSchemesDrawer } from "./components/TrackedSchemesDrawer.tsx";
import type { CitizenProfile, Scheme } from "./types/scheme.ts";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shield,
} from "lucide-react";

const PROFILE_STORAGE_KEY = "tridge-citizen-profile";
const TRACKED_SCHEMES_STORAGE_KEY = "tridge-tracked-schemes";

function readStoredProfile(): CitizenProfile | null {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!stored) return null;

    return JSON.parse(stored) as CitizenProfile;
  } catch {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    return null;
  }
}

function readTrackedSchemes(): Scheme[] {
  try {
    const stored = localStorage.getItem(TRACKED_SCHEMES_STORAGE_KEY);

    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);

    return Array.isArray(parsed) ? (parsed as Scheme[]) : [];
  } catch {
    localStorage.removeItem(TRACKED_SCHEMES_STORAGE_KEY);
    return [];
  }
}

export default function App() {
  // No demo profile: profile setup is optional.
  const [citizenProfile, setCitizenProfile] = useState<CitizenProfile | null>(
    readStoredProfile,
  );

  const [currentLanguage, setCurrentLanguage] = useState<string>("Hindi");

  // Start with a blank search field and do not search automatically.
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [schemes, setSchemes] = useState<Scheme[]>([]);

  // Personal tracked schemes are stored in this visitor's browser.
  const [savedSchemes, setSavedSchemes] =
    useState<Scheme[]>(readTrackedSchemes);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchProgressStep, setSearchProgressStep] = useState<number>(0);

  const [searchMode, setSearchMode] = useState<
    "tinyfish_live" | "verified_database"
  >("verified_database");

  const [liveResearchSummary, setLiveResearchSummary] = useState<string>("");

  // Modals and drawers
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isTrackedOpen, setIsTrackedOpen] = useState<boolean>(false);
  const [explainingScheme, setExplainingScheme] = useState<Scheme | null>(null);
  const [diffScheme, setDiffScheme] = useState<Scheme | null>(null);

  // System status
  const [hasTinyFishKey, setHasTinyFishKey] = useState<boolean>(false);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);

  // Eligibility filter
  const [verdictFilter, setVerdictFilter] = useState<
    "all" | "potentially_eligible" | "more_info_required" | "not_eligible"
  >("all");

  // Persist this browser's tracked list.
  useEffect(() => {
    try {
      localStorage.setItem(
        TRACKED_SCHEMES_STORAGE_KEY,
        JSON.stringify(savedSchemes),
      );
    } catch (error) {
      console.error("Could not persist tracked schemes:", error);
    }
  }, [savedSchemes]);

  // Load system status only. Do not load the shared snapshot collection
  // as a visitor's personal tracked list.
  useEffect(() => {
    fetch("/api/status")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setHasTinyFishKey(Boolean(data.hasTinyFishKey));
        setHasGeminiKey(Boolean(data.hasGeminiKey));
      })
      .catch((err) => console.error("Status fetch error:", err));
  }, []);

  const performSearch = async (
    query: string,
    profileToUse: CitizenProfile | null = citizenProfile,
  ) => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setLiveResearchSummary(
        "Enter a search query to discover government schemes.",
      );
      return;
    }

    setIsLoading(true);
    setSearchQuery(normalizedQuery);
    setSearchProgressStep(1);
    setLiveResearchSummary("");

    const stepInterval = setInterval(() => {
      setSearchProgressStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 400);

    try {
      const requestBody: {
        query: string;
        citizenProfile?: CitizenProfile;
      } = {
        query: normalizedQuery,
      };

      // Send a profile only when the visitor has configured one.
      if (profileToUse) {
        requestBody.citizenProfile = profileToUse;
      }

      const response = await fetch("/api/schemes/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      setSchemes(Array.isArray(data.schemes) ? data.schemes : []);
      setSearchMode(data.searchMode || "verified_database");
      setLiveResearchSummary(data.liveResearchSummary || "");

      // Reset the filter when a new search finishes.
      setVerdictFilter("all");
    } catch (err) {
      console.error("Search error:", err);
      setLiveResearchSummary(
        "Search encountered a network issue. Please check server connectivity.",
      );
    } finally {
      clearInterval(stepInterval);
      setSearchProgressStep(4);
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = (newProfile: CitizenProfile) => {
    setCitizenProfile(newProfile);

    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
    } catch (error) {
      console.error("Could not save citizen profile:", error);
    }

    setIsProfileOpen(false);

    // Re-run the existing search only if the visitor has searched before.
    if (searchQuery.trim()) {
      void performSearch(searchQuery, newProfile);
    }
  };

  // Remove the optional profile without requiring account registration.
  const handleClearProfile = () => {
    setCitizenProfile(null);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    setIsProfileOpen(false);

    if (searchQuery.trim()) {
      void performSearch(searchQuery, null);
    } else {
      setSchemes([]);
    }
  };

  /**
   * Track a scheme locally and save its latest snapshot to the backend.
   *
   * Personal tracking is browser-specific. Backend snapshots remain
   * available for the existing change-detection feature.
   */
  const handleSaveSnapshot = async (scheme: Scheme) => {
    // Update this visitor's tracked list.
    setSavedSchemes((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === scheme.id);

      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = scheme;
        return next;
      }

      return [...prev, scheme];
    });

    // Preserve the existing server-side snapshot functionality.
    try {
      const response = await fetch("/api/schemes/save-snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheme }),
      });

      if (!response.ok) {
        console.error(
          "The scheme was tracked locally, but snapshot saving failed.",
        );
      }
    } catch (error) {
      console.error("Error saving scheme snapshot:", error);
    }
  };

  const countEligible = schemes.filter(
    (scheme) => scheme.eligibilityMatch?.verdict === "potentially_eligible",
  ).length;

  const countUncertain = schemes.filter(
    (scheme) => scheme.eligibilityMatch?.verdict === "more_info_required",
  ).length;

  const countIneligible = schemes.filter(
    (scheme) => scheme.eligibilityMatch?.verdict === "not_eligible",
  ).length;

  const filteredSchemes = schemes.filter((scheme) => {
    if (verdictFilter === "all") return true;
    return scheme.eligibilityMatch?.verdict === verdictFilter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900">
      <Navbar
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        citizenProfile={citizenProfile}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenTracked={() => setIsTrackedOpen(true)}
        trackedCount={savedSchemes.length}
        hasTinyFishKey={hasTinyFishKey}
        hasGeminiKey={hasGeminiKey}
      />

      <SchemeSearchHero
        onSearch={(query) => void performSearch(query)}
        isLoading={isLoading}
        currentQuery={searchQuery}
        searchProgressStep={searchProgressStep}
        searchMode={searchMode}
        liveResearchSummary={liveResearchSummary}
        hasTinyFishKey={hasTinyFishKey}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Optional profile status */}
        <section
          aria-labelledby="profile-summary-heading"
          className="bg-white rounded-xl border border-stone-200 p-4 mb-6 shadow-2xs flex flex-wrap items-center justify-between gap-4"
        >
          {citizenProfile ? (
            <>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                  {citizenProfile.socialCategory}
                </div>

                <div>
                  <h2
                    id="profile-summary-heading"
                    className="text-sm font-bold text-stone-900 font-serif"
                  >
                    Assessment Profile: {citizenProfile.occupation} (
                    {citizenProfile.state})
                  </h2>

                  <p className="text-xs text-stone-500">
                    {citizenProfile.educationLevel} • Annual Income: ₹
                    {citizenProfile.annualIncome.toLocaleString("en-IN")} •{" "}
                    {citizenProfile.gender}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="text-xs font-semibold text-amber-800 hover:text-amber-900 underline"
                >
                  Modify Profile
                </button>

                <button
                  onClick={handleClearProfile}
                  className="text-xs font-semibold text-stone-500 hover:text-rose-700 underline"
                >
                  Clear Profile
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h2
                  id="profile-summary-heading"
                  className="text-sm font-bold text-stone-900 font-serif"
                >
                  Personalise your eligibility assessment (optional)
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Browse and search public schemes without a profile. Add your
                  details only when you want personalised eligibility results.
                </p>
              </div>

              <button
                onClick={() => setIsProfileOpen(true)}
                className="text-xs font-bold px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-stone-950"
              >
                Set Up Profile
              </button>
            </>
          )}
        </section>

        {/* Search results and filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-200">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-900">
              Discovered Schemes & Notices ({filteredSchemes.length})
            </h2>
            <p className="text-xs text-stone-500">
              {searchQuery
                ? "Results for your search"
                : "Search for a scheme to view relevant public notices and eligibility information."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setVerdictFilter("all")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                verdictFilter === "all"
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
              }`}
            >
              All Results ({schemes.length})
            </button>

            <button
              onClick={() => setVerdictFilter("potentially_eligible")}
              className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center space-x-1 ${
                verdictFilter === "potentially_eligible"
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Potentially Eligible ({countEligible})</span>
            </button>

            <button
              onClick={() => setVerdictFilter("more_info_required")}
              className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center space-x-1 ${
                verdictFilter === "more_info_required"
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-white text-amber-800 border-amber-300 hover:bg-amber-50"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>More Info Required ({countUncertain})</span>
            </button>

            <button
              onClick={() => setVerdictFilter("not_eligible")}
              className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center space-x-1 ${
                verdictFilter === "not_eligible"
                  ? "bg-rose-700 text-white border-rose-700"
                  : "bg-white text-rose-800 border-rose-300 hover:bg-rose-50"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Not Eligible ({countIneligible})</span>
            </button>
          </div>
        </div>

        {/* Scheme cards */}
        {filteredSchemes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSchemes.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                onExplainLanguage={(item) => setExplainingScheme(item)}
                onViewDiff={(item) => setDiffScheme(item)}
                onSaveSnapshot={handleSaveSnapshot}
                isSaved={savedSchemes.some((item) => item.id === scheme.id)}
                selectedLanguage={currentLanguage}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center max-w-lg mx-auto">
            <Search className="w-10 h-10 text-stone-400 mx-auto mb-3" />

            <h3 className="text-base font-bold text-stone-800">
              {searchQuery
                ? "No schemes match your filter"
                : "Discover Government Schemes"}
            </h3>

            <p className="text-xs text-stone-500 mt-1">
              {searchQuery
                ? "Try changing your filter or entering a different search query."
                : "Search for scholarships, farmer assistance, housing support, pensions, and other public schemes."}
            </p>

            {searchQuery && (
              <button
                onClick={() => setVerdictFilter("all")}
                className="mt-4 px-4 py-2 bg-amber-600 text-stone-950 font-bold text-xs rounded-lg hover:bg-amber-500 transition-colors"
              >
                View All Discovered Schemes
              </button>
            )}
          </div>
        )}

        {/* Public service disclaimer */}
        <section
          aria-labelledby="disclaimer-heading"
          className="mt-12 bg-white rounded-xl border border-stone-200 p-5 shadow-2xs"
        >
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />

            <div>
              <h3
                id="disclaimer-heading"
                className="text-xs font-bold uppercase tracking-wider text-stone-800"
              >
                Official Public Notice Verification Policy
              </h3>

              <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                TRIDGE queries official government portals using the TinyFish
                web infrastructure. Summaries and multilingual explanations may
                be generated using Gemini. Automated matches do not constitute
                an official government determination or sanction. Always verify
                eligibility and application details with the relevant government
                department or official portal.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs py-6 border-t border-stone-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-bold text-stone-200 font-serif text-sm">
              TRIDGE
            </span>
            <span className="mx-2">•</span>
            <span>
              Multilingual Rural Information & Public Schemes Platform
            </span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span>TinyFish Live Web Research</span>
            <span>•</span>
            <span>Gemini Multilingual Explanations</span>
            <span>•</span>
            <span>Notice Snapshot Diff Tracking</span>
          </div>
        </div>
      </footer>

      {/* Optional citizen profile drawer */}
      <CitizenProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={citizenProfile}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Personal tracked schemes */}
      <TrackedSchemesDrawer
        isOpen={isTrackedOpen}
        onClose={() => setIsTrackedOpen(false)}
        savedSchemes={savedSchemes}
        onSelectScheme={(scheme) => setExplainingScheme(scheme)}
        onViewDiff={(scheme) => setDiffScheme(scheme)}
      />

      {/* Multilingual explanation */}
      <MultilingualModal
        isOpen={Boolean(explainingScheme)}
        onClose={() => setExplainingScheme(null)}
        scheme={explainingScheme}
        initialLanguage={currentLanguage}
      />

      {/* Notice diff */}
      <ChangeDiffModal
        isOpen={Boolean(diffScheme)}
        onClose={() => setDiffScheme(null)}
        scheme={diffScheme}
      />
    </div>
  );
}
