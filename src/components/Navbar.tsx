import React from "react";
import { Globe, User, BookmarkCheck, Sparkles } from "lucide-react";
import type { CitizenProfile } from "../types/scheme.ts";

export interface LanguageOption {
  code: string;
  name: string;
  native: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
];

interface NavbarProps {
  currentLanguage: string;
  onLanguageChange: (langName: string) => void;
  citizenProfile: CitizenProfile | null;
  onOpenProfile: () => void;
  onOpenTracked: () => void;
  trackedCount: number;
  hasTinyFishKey: boolean;
  hasGeminiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  citizenProfile,
  onOpenProfile,
  onOpenTracked,
  trackedCount,
  hasTinyFishKey,
  hasGeminiKey,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl tracking-wider shadow-inner shrink-0">
              T
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-white font-serif">
                  TRIDGE
                </span>

                <span className="text-[10px] uppercase font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full hidden sm:inline-block">
                  Public Service
                </span>
              </div>

              <p className="text-xs text-stone-400 hidden sm:block">
                Multilingual Rural Information & Government Schemes
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Service status */}
            <div className="hidden lg:flex items-center space-x-2 text-xs border border-stone-800 bg-stone-950/60 px-2.5 py-1 rounded-md">
              <span
                className="flex items-center space-x-1"
                title="TinyFish live web search status"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    hasTinyFishKey ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span className="text-stone-300">TinyFish:</span>
                <span
                  className={
                    hasTinyFishKey ? "text-emerald-400" : "text-amber-400"
                  }
                >
                  {hasTinyFishKey ? "Live Web" : "Fallback Mode"}
                </span>
              </span>

              <span className="text-stone-600">|</span>

              <span
                className="flex items-center space-x-1"
                title="AI explanations with fallback support"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-stone-300">Explanation Engine:</span>
                <span className="text-stone-300 font-medium">
                  {hasGeminiKey ? "AI + Fallback" : "Fallback Mode"}
                </span>
              </span>
            </div>

            {/* Language */}
            <div className="flex items-center space-x-1 bg-stone-800/80 border border-stone-700 rounded-lg px-2 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />

              <label htmlFor="language-select" className="sr-only">
                Select display language
              </label>

              <select
                id="language-select"
                value={currentLanguage}
                onChange={(event) => onLanguageChange(event.target.value)}
                className="bg-transparent text-stone-200 focus:outline-none cursor-pointer text-xs max-w-[85px] sm:max-w-none"
                aria-label="Select display and explanation language"
              >
                {SUPPORTED_LANGUAGES.map((language) => (
                  <option
                    key={language.code}
                    value={language.name}
                    className="bg-stone-900 text-stone-100"
                  >
                    {language.native}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional profile */}
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center space-x-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-medium px-2.5 py-1 rounded-lg text-xs transition-colors shadow-xs focus:ring-2 focus:ring-amber-400"
              aria-label={
                citizenProfile
                  ? "Modify citizen eligibility profile"
                  : "Set up an optional citizen profile"
              }
            >
              <User className="w-3.5 h-3.5 shrink-0" />

              <span className="hidden lg:inline font-semibold">Profile:</span>

              <span className="hidden sm:inline max-w-[110px] truncate font-semibold">
                {citizenProfile?.state || "Set Up Profile"}
              </span>

              <span className="sm:hidden font-semibold">Profile</span>
            </button>

            {/* Personal tracked schemes */}
            <button
              type="button"
              onClick={onOpenTracked}
              className="flex items-center space-x-1 bg-stone-800 hover:bg-stone-700 text-stone-200 px-2 py-1 rounded-lg text-xs border border-stone-700 transition-colors"
              title="View your tracked schemes"
              aria-label={`View tracked schemes (${trackedCount})`}
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />

              <span className="hidden sm:inline">Tracked</span>

              <span className="bg-stone-700 text-amber-300 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {trackedCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
