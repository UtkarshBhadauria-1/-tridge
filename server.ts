/**
 * TRIDGE - Full-Stack Express Server
 *
 * Features:
 * - TinyFish live-web research
 * - Gemini-powered scheme extraction and multilingual explanations
 * - Citizen eligibility matching
 * - Saved scheme database and notice change detection
 * - Graceful fallback when AI services fail or reach quota limits
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import {
  executeTinyFishSearch,
  validateSearchQuery,
} from "./server/tinyfish.ts";

import {
  extractSchemesFromResearch,
  generateMultilingualExplanation,
} from "./server/gemini.ts";

import {
  getAllSavedSchemes,
  saveSchemeSnapshot,
  compareSchemeWithSaved,
} from "./server/db.ts";

import { evaluateEligibility } from "./src/utils/matching.ts";
import type { CitizenProfile, Scheme } from "./src/types/scheme.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "1mb" }));

/**
 * Check whether an API key is configured.
 * This checks configuration only, not whether the key has quota remaining.
 */
function isConfigured(key: string | undefined, placeholder: string): boolean {
  return Boolean(key && key.trim() && !key.includes(placeholder));
}

/**
 * Safely convert TinyFish sources into text for Gemini.
 */
function buildResearchContent(sources: unknown[]): string {
  return sources
    .map((source) => {
      if (typeof source === "string") {
        return source;
      }

      try {
        return JSON.stringify(source);
      } catch {
        return "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Validate the minimum required fields before accepting extracted records.
 *
 * IMPORTANT:
 * This checks only the fields used by the search and matching code.
 * Add further checks if your Scheme interface requires additional fields.
 */
function isValidScheme(value: unknown): value is Scheme {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const scheme = value as Record<string, unknown>;

  return (
    typeof scheme.id === "string" &&
    scheme.id.trim().length > 0 &&
    typeof scheme.name === "string" &&
    scheme.name.trim().length > 0 &&
    typeof scheme.department === "string" &&
    typeof scheme.description === "string"
  );
}

/**
 * Health / Status Endpoint
 */
app.get("/api/status", (_req, res) => {
  const hasGeminiKey = isConfigured(
    process.env.GEMINI_API_KEY,
    "MY_GEMINI_API_KEY",
  );

  const hasTinyFishKey = isConfigured(
    process.env.TINYFISH_API_KEY,
    "your_tinyfish_api_key_here",
  );

  res.json({
    appName: "TRIDGE",
    status: "online",
    services: {
      gemini: hasGeminiKey ? "configured" : "not_configured",
      tinyfish: hasTinyFishKey ? "configured" : "not_configured",
    },
    hasGeminiKey,
    hasTinyFishKey,
    note: "Configured does not necessarily mean that an API has available quota.",
    supportedLanguages: [
      { code: "en", name: "English", native: "English" },
      { code: "hi", name: "Hindi", native: "हिन्दी" },
      { code: "bn", name: "Bengali", native: "বাংলা" },
      { code: "mr", name: "Marathi", native: "मराठी" },
      { code: "te", name: "Telugu", native: "తెలుగు" },
      { code: "ta", name: "Tamil", native: "தமிழ்" },
      { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
      { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
      { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
      { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
    ],
  });
});

/**
 * Search Schemes Endpoint
 */
app.post("/api/schemes/search", async (req, res) => {
  const { query, citizenProfile } = req.body as {
    query?: unknown;
    citizenProfile?: CitizenProfile;
  };

  const validation = validateSearchQuery(query);

  if (!validation.valid) {
    return res.status(400).json({
      error: validation.error,
    });
  }

  const userQuery = validation.query;

  const hasTinyFish = isConfigured(
    process.env.TINYFISH_API_KEY,
    "your_tinyfish_api_key_here",
  );

  let schemes: Scheme[] = [];
  let searchMode: "tinyfish_live" | "verified_database" = "verified_database";

  let liveResearchSummary = "";
  let sourcesCount = 0;

  /**
   * STEP 1: Perform live research with TinyFish.
   */
  if (hasTinyFish) {
    try {
      const research = await executeTinyFishSearch(userQuery);

      sourcesCount = research.sourceCount;

      if (research.success && research.sources.length > 0) {
        searchMode = "tinyfish_live";

        liveResearchSummary = `TinyFish live research retrieved ${research.sourceCount} source(s).`;

        /**
         * STEP 2: Convert research results to text and extract schemes.
         *
         * The current extractSchemesFromResearch function accepts ONE
         * string argument, so we combine the sources and pass that string.
         */
        const researchContent = buildResearchContent(
          research.sources as unknown[],
        );

        if (researchContent.trim()) {
          try {
            const extracted: unknown[] =
              await extractSchemesFromResearch(researchContent);

            const validSchemes = extracted.filter(isValidScheme);

            if (validSchemes.length > 0) {
              schemes = validSchemes;

              liveResearchSummary += ` Gemini extracted ${validSchemes.length} valid scheme record(s).`;
            } else {
              liveResearchSummary +=
                " AI extraction returned no valid scheme records; using saved records where available.";
            }
          } catch (error: unknown) {
            console.error("Gemini scheme extraction failed:", error);

            liveResearchSummary +=
              " Gemini extraction is temporarily unavailable, possibly due to API quota limits. Using saved records where available.";
          }
        } else {
          liveResearchSummary +=
            " The live research did not contain readable source content.";
        }
      } else if (research.error) {
        liveResearchSummary = `TinyFish notice: ${research.error}. Using saved records where available.`;
      } else {
        liveResearchSummary =
          "TinyFish did not return usable research results. Using saved records where available.";
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";

      console.error("TinyFish execution failed:", message);

      liveResearchSummary = `Live research is temporarily unavailable. Using saved records where available.`;
    }
  } else {
    liveResearchSummary =
      "TinyFish is not configured. Add TINYFISH_API_KEY to your environment to enable live-web research.";
  }

  /**
   * STEP 3: If live extraction failed or returned no valid schemes,
   * search the saved database.
   */
  if (schemes.length === 0) {
    const allStored = getAllSavedSchemes();

    const qLower = userQuery.toLowerCase();

    const queryTokens = qLower.split(/\s+/).filter((token) => token.length > 2);

    schemes = allStored.filter((scheme) => {
      const searchableText = [
        scheme.name,
        scheme.department,
        scheme.description,
        ...(scheme.targetStates || []),
        ...(scheme.targetOccupations || []),
      ]
        .join(" ")
        .toLowerCase();

      if (searchableText.includes(qLower)) {
        return true;
      }

      const matchedTokens = queryTokens.filter((token) =>
        searchableText.includes(token),
      );

      return matchedTokens.length >= 1;
    });

    /**
     * If no keywords match, return saved schemes so the user
     * can still browse the available records.
     */
    if (schemes.length === 0) {
      schemes = allStored;
    }

    if (schemes.length > 0) {
      searchMode = "verified_database";

      if (!liveResearchSummary) {
        liveResearchSummary = "Displaying schemes from the saved database.";
      }
    }
  }

  /**
   * STEP 4: Evaluate eligibility and detect notice changes.
   */
  const processedSchemes = schemes.map((scheme) => {
    const changeRecord = compareSchemeWithSaved(scheme);

    const eligibilityMatch = evaluateEligibility(scheme, citizenProfile);

    return {
      ...scheme,
      eligibilityMatch,
      hasUpdatesNotice: changeRecord.hasChanges,
      lastComparedTimestamp: changeRecord.newTimestamp,
    };
  });

  /**
   * STEP 5: Return results.
   */
  return res.json({
    query: userQuery,
    searchMode,
    liveResearchSummary,
    sourcesCount,
    schemesCount: processedSchemes.length,
    schemes: processedSchemes,
    retrievalTimestamp: new Date().toISOString(),
  });
});

/**
 * Multilingual Explanation Endpoint
 */
app.post("/api/schemes/explain", async (req, res) => {
  const { scheme, language } = req.body as {
    scheme?: Scheme;
    language?: string;
  };

  if (!scheme || typeof scheme.name !== "string" || !scheme.name.trim()) {
    return res.status(400).json({
      error: "A valid scheme object is required.",
    });
  }

  const targetLanguage =
    typeof language === "string" && language.trim() ? language.trim() : "Hindi";

  try {
    const explanation = await generateMultilingualExplanation(
      scheme,
      targetLanguage,
    );

    return res.json(explanation);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error("Gemini explanation generation failed:", message);

    return res.status(503).json({
      error:
        "The AI explanation service is temporarily unavailable. Please try again later.",
      language: targetLanguage,
      retryable: true,
    });
  }
});

/**
 * Saved Schemes Endpoint
 */
app.get("/api/schemes/saved", (_req, res) => {
  try {
    const saved = getAllSavedSchemes();

    return res.json({
      schemes: saved,
      count: saved.length,
    });
  } catch (error: unknown) {
    console.error("Failed to retrieve saved schemes:", error);

    return res.status(500).json({
      error: "Failed to retrieve saved schemes.",
    });
  }
});

/**
 * Save Scheme Snapshot Endpoint
 */
app.post("/api/schemes/save-snapshot", (req, res) => {
  const { scheme } = req.body as {
    scheme?: Scheme;
  };

  if (!scheme || !scheme.id) {
    return res.status(400).json({
      error: "A valid scheme is required to save a snapshot.",
    });
  }

  try {
    const result = saveSchemeSnapshot(scheme);

    return res.json({
      success: true,
      scheme: result.scheme,
      changeRecord: result.changeRecord,
    });
  } catch (error: unknown) {
    console.error("Failed to save scheme snapshot:", error);

    return res.status(500).json({
      error: "Failed to save the scheme snapshot.",
    });
  }
});

/**
 * Check Scheme Changes Endpoint
 */
app.post("/api/schemes/check-changes", (req, res) => {
  const { scheme } = req.body as {
    scheme?: Scheme;
  };

  if (!scheme || !scheme.id) {
    return res.status(400).json({
      error: "A valid scheme is required for change inspection.",
    });
  }

  try {
    const changeRecord = compareSchemeWithSaved(scheme);

    return res.json({
      changeRecord,
    });
  } catch (error: unknown) {
    console.error("Failed to inspect scheme changes:", error);

    return res.status(500).json({
      error: "Failed to inspect scheme changes.",
    });
  }
});

/**
 * Start Server
 */
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");

    app.use(express.static(distPath));

    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TRIDGE server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Failed to start TRIDGE server:", error);
  process.exit(1);
});
