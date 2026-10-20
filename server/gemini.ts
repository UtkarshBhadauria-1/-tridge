import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import type { Scheme, MultilingualExplanation } from "../src/types/scheme.ts";

/**
 * TRIDGE supports English and Hindi.
 */
const SUPPORTED_LANGUAGES = ["English", "Hindi"] as const;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Create a Gemini client using the server-side API key.
 */
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;

  if (
    !apiKey?.trim() ||
    apiKey.includes("MY_GEMINI_API_KEY") ||
    apiKey.includes("your_gemini_api_key_here")
  ) {
    return null;
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "TRIDGE",
      },
    },
  });
}

/**
 * Normalize the requested language.
 */
function normalizeLanguage(language: string): SupportedLanguage {
  const normalized = language.trim().toLowerCase();

  if (["hi", "hindi", "हिंदी", "हिन्दी"].includes(normalized)) {
    return "Hindi";
  }

  if (["en", "english"].includes(normalized)) {
    return "English";
  }

  throw new Error(
    "Unsupported language. TRIDGE currently supports English and Hindi.",
  );
}

/**
 * Convert a value to readable text.
 */
function readable(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value) && value.length > 0) {
    return value.map(String).join(", ");
  }

  return fallback;
}

/**
 * Build a structured fallback without calling an external AI API.
 *
 * IMPORTANT:
 * This fallback does not translate arbitrary scheme descriptions.
 * It preserves source information and clearly identifies when users
 * need to consult the official government portal.
 */
function buildFallbackExplanation(
  scheme: Scheme,
  language: SupportedLanguage,
): MultilingualExplanation {
  const isHindi = language === "Hindi";

  const description = readable(
    scheme.description,
    isHindi
      ? "इस योजना का विस्तृत विवरण उपलब्ध नहीं है। कृपया आधिकारिक वेबसाइट देखें।"
      : "A detailed scheme description is unavailable. Please consult the official website.",
  );

  const benefits = scheme.benefits?.length
    ? scheme.benefits.join("; ")
    : isHindi
      ? "लाभों की पुष्टि आधिकारिक वेबसाइट से करें।"
      : "Please verify the benefits on the official website.";

  const eligibility = scheme.eligibilityCriteria?.length
    ? scheme.eligibilityCriteria.join("; ")
    : isHindi
      ? "पात्रता की शर्तों की पुष्टि आधिकारिक वेबसाइट से करें।"
      : "Please verify the eligibility criteria on the official website.";

  const documents = scheme.requiredDocuments?.length
    ? scheme.requiredDocuments.join("; ")
    : isHindi
      ? "आवश्यक दस्तावेजों की सूची उपलब्ध नहीं है।"
      : "Required documents have not been specified.";

  const deadline = readable(
    scheme.deadline?.dateText,
    isHindi ? "तिथि उपलब्ध नहीं है।" : "No deadline information is available.",
  );

  const uncertainty = readable(scheme.deadline?.uncertaintyMessage, "");

  const warning = isHindi
    ? [
        "यह जानकारी उपलब्ध योजना रिकॉर्ड से तैयार की गई है।",
        "आवेदन करने से पहले आधिकारिक वेबसाइट पर पात्रता, लाभ, दस्तावेज और अंतिम तिथि की पुष्टि करें।",
        uncertainty ? `तिथि संबंधी सूचना: ${uncertainty}` : "",
      ]
        .filter(Boolean)
        .join(" ")
    : [
        "This explanation was prepared from the available scheme record.",
        "Before applying, verify eligibility, benefits, documents, and deadlines on the official website.",
        uncertainty ? `Deadline note: ${uncertainty}` : "",
      ]
        .filter(Boolean)
        .join(" ");

  return {
    language: isHindi ? "hi" : "en",
    languageName: language,

    whatIsIt: isHindi
      ? `योजना का नाम: ${scheme.name}। विभाग: ${scheme.department}। उपलब्ध विवरण: ${description}`
      : `Scheme: ${scheme.name}. Department: ${scheme.department}. Available description: ${description}`,

    whoIsEligible: isHindi
      ? `उपलब्ध पात्रता शर्तें: ${eligibility}`
      : `Available eligibility criteria: ${eligibility}`,

    whatYouReceive: isHindi
      ? `उपलब्ध लाभों की जानकारी: ${benefits}`
      : `Available benefits: ${benefits}`,

    importantDatesAndDeadlines: isHindi
      ? `अंतिम तिथि: ${deadline} ${scheme.deadline?.isUncertain ? "इस तिथि की पुष्टि आधिकारिक पोर्टल पर करें।" : ""}`
      : `Deadline: ${deadline} ${scheme.deadline?.isUncertain ? "Verify this date on the official portal." : ""}`,

    documentsNeeded: isHindi
      ? `उपलब्ध दस्तावेजों की सूची: ${documents}`
      : `Available document requirements: ${documents}`,

    criticalConditionsAndWarnings: warning,

    sourceUrl: scheme.sourceUrl ?? "",

    disclaimer: isHindi
      ? "यह जानकारी केवल मार्गदर्शन के लिए है। आवेदन करने से पहले संबंधित सरकारी विभाग के आधिकारिक पोर्टल पर सभी शर्तों की पुष्टि करें।"
      : "This information is for guidance only. Verify all requirements on the relevant government department's official portal before applying.",
  };
}

/**
 * Generate an AI explanation.
 *
 * If Gemini fails, return a structured fallback instead of failing
 * the entire explanation endpoint.
 */
export async function generateMultilingualExplanation(
  scheme: Scheme,
  languageName: string,
): Promise<MultilingualExplanation> {
  const targetLanguage = normalizeLanguage(languageName);

  const ai = getGeminiClient();

  // If no API key is configured, use the fallback immediately.
  if (!ai) {
    console.warn("Gemini unavailable. Using the scheme-data fallback.");

    return buildFallbackExplanation(scheme, targetLanguage);
  }

  const prompt = `
You are TRIDGE, a government scheme information assistant.

Write a clear, simple explanation of the scheme in ${targetLanguage}.

Rules:
1. Write all explanatory fields in ${targetLanguage}.
2. For Hindi, use Devanagari script.
3. Do not invent benefits, eligibility rules, deadlines, or documents.
4. Preserve official names, URLs, amounts, and dates.
5. State clearly when information is missing or uncertain.
6. Do not claim that an application has been approved or submitted.
7. Return JSON only.

Scheme name: ${scheme.name}
Department: ${scheme.department}
Description: ${scheme.description}
Benefits: ${JSON.stringify(scheme.benefits ?? [])}
Eligibility: ${JSON.stringify(scheme.eligibilityCriteria ?? [])}
Deadline: ${scheme.deadline?.dateText ?? "Not provided"}
Deadline uncertain: ${Boolean(scheme.deadline?.isUncertain)}
Required documents: ${JSON.stringify(scheme.requiredDocuments ?? [])}
Official source: ${scheme.sourceUrl ?? "Not provided"}
Uncertainty notes: ${JSON.stringify(scheme.uncertaintyDisclaimers ?? [])}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            whatIsIt: { type: Type.STRING },
            whoIsEligible: { type: Type.STRING },
            whatYouReceive: { type: Type.STRING },
            importantDatesAndDeadlines: { type: Type.STRING },
            documentsNeeded: { type: Type.STRING },
            criticalConditionsAndWarnings: { type: Type.STRING },
            disclaimer: { type: Type.STRING },
          },
          required: [
            "whatIsIt",
            "whoIsEligible",
            "whatYouReceive",
            "importantDatesAndDeadlines",
            "documentsNeeded",
            "criticalConditionsAndWarnings",
          ],
        },
      },
    });

    const responseText = response.text?.trim();

    if (!responseText) {
      throw new Error("Gemini returned an empty response.");
    }

    const parsed = JSON.parse(responseText) as Record<string, unknown>;

    const requiredFields = [
      "whatIsIt",
      "whoIsEligible",
      "whatYouReceive",
      "importantDatesAndDeadlines",
      "documentsNeeded",
      "criticalConditionsAndWarnings",
    ] as const;

    for (const field of requiredFields) {
      if (
        typeof parsed[field] !== "string" ||
        !(parsed[field] as string).trim()
      ) {
        throw new Error(`Missing explanation field: ${field}`);
      }
    }

    return {
      language: targetLanguage === "Hindi" ? "hi" : "en",
      languageName: targetLanguage,
      whatIsIt: parsed.whatIsIt as string,
      whoIsEligible: parsed.whoIsEligible as string,
      whatYouReceive: parsed.whatYouReceive as string,
      importantDatesAndDeadlines: parsed.importantDatesAndDeadlines as string,
      documentsNeeded: parsed.documentsNeeded as string,
      criticalConditionsAndWarnings:
        parsed.criticalConditionsAndWarnings as string,
      sourceUrl: scheme.sourceUrl ?? "",
      disclaimer:
        typeof parsed.disclaimer === "string"
          ? parsed.disclaimer
          : buildFallbackExplanation(scheme, targetLanguage).disclaimer,
    };
  } catch (error) {
    // Avoid repeated API calls when the daily quota is exhausted.
    console.error(
      `Gemini explanation failed for ${targetLanguage}:`,
      error instanceof Error ? error.message : "Unknown error",
    );

    console.warn("Returning the structured scheme-data fallback.");

    return buildFallbackExplanation(scheme, targetLanguage);
  }
}

/**
 * Extract structured scheme information from research content.
 *
 * Returns an empty array if extraction fails.
 */
export async function extractSchemesFromResearch(
  researchContent: string,
): Promise<unknown[]> {
  const ai = getGeminiClient();

  if (!ai || !researchContent.trim()) {
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `
Extract government scheme records from the supplied research.

Rules:
- Use only information present in the source.
- Do not invent benefits, eligibility, deadlines, or documents.
- Preserve official URLs.
- Return a JSON array only.

Research:
${researchContent}
`,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim();

    if (!text) {
      return [];
    }

    const parsed: unknown = JSON.parse(text);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(
      "Gemini extraction failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return [];
  }
}
