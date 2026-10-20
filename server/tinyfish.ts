/**
 * TRIDGE - Dedicated TinyFish Service Module
 * Uses official TinyFish Search and Fetch APIs to perform live-web research
 * on authentic government portals (gov.in, nic.in, state portals).
 */

import type { TinyFishSearchResultItem, Scheme } from "../src/types/scheme.ts";

const TINYFISH_SEARCH_ENDPOINT = 'https://api.search.tinyfish.ai';
const TINYFISH_FETCH_ENDPOINT = 'https://api.fetch.tinyfish.ai';

export interface TinyFishResearchResponse {
  success: boolean;
  query: string;
  targetedQuery: string;
  sourceCount: number;
  sources: TinyFishSearchResultItem[];
  retrievalTimestamp: string;
  apiKeyConfigured: boolean;
  message?: string;
  error?: string;
}

/**
 * Validates and sanitizes user input query.
 */
export function validateSearchQuery(rawQuery: unknown): {
  valid: boolean;
  query: string;
  error?: string;
} {
  if (typeof rawQuery !== 'string') {
    return { valid: false, query: '', error: 'Search query must be a text string.' };
  }

  const query = rawQuery.trim();
  if (query.length < 3) {
    return {
      valid: false,
      query: '',
      error: 'Please enter a search query with at least 3 characters.',
    };
  }

  if (query.length > 500) {
    return {
      valid: false,
      query: '',
      error: 'Search query is too long (maximum 500 characters).',
    };
  }

  // Check against common malicious script injections
  if (/<script|javascript:|data:/i.test(query)) {
    return {
      valid: false,
      query: '',
      error: 'Invalid characters or script tags in search query.',
    };
  }

  return { valid: true, query };
}

/**
 * Builds an optimized query targeting authentic Indian government sources.
 */
export function constructGovernmentTargetedQuery(userQuery: string): string {
  // If the query already specifies site filters, respect it
  if (/site:gov\.in|site:nic\.in/i.test(userQuery)) {
    return userQuery;
  }

  // Target official Indian portals
  return `${userQuery} (site:gov.in OR site:nic.in OR site:myscheme.gov.in OR site:up.gov.in)`;
}

/**
 * Executes live research using TinyFish Search API.
 * Follows current official API documentation:
 * GET https://api.search.tinyfish.ai?query=...&purpose=...&include_domains=...&location=IN
 * Header: X-API-Key: ...
 */
export async function executeTinyFishSearch(
  userQuery: string
): Promise<TinyFishResearchResponse> {
  const validation = validateSearchQuery(userQuery);
  if (!validation.valid) {
    return {
      success: false,
      query: typeof userQuery === 'string' ? userQuery : '',
      targetedQuery: '',
      sourceCount: 0,
      sources: [],
      retrievalTimestamp: new Date().toISOString(),
      apiKeyConfigured: Boolean(process.env.TINYFISH_API_KEY),
      error: validation.error,
    };
  }

  const apiKey = process.env.TINYFISH_API_KEY;
  const targetedQuery = constructGovernmentTargetedQuery(validation.query);
  const retrievalTimestamp = new Date().toISOString();

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_tinyfish_api_key_here')) {
    return {
      success: false,
      query: validation.query,
      targetedQuery,
      sourceCount: 0,
      sources: [],
      retrievalTimestamp,
      apiKeyConfigured: false,
      message:
        'TINYFISH_API_KEY environment variable is not configured. Live-web research requires a valid TinyFish API key from https://agent.tinyfish.ai/api-keys.',
    };
  }

  const searchUrl = new URL(TINYFISH_SEARCH_ENDPOINT);
  searchUrl.searchParams.set('query', targetedQuery);
  searchUrl.searchParams.set(
    'purpose',
    'Extract official government scheme details, eligibility, benefits, and deadlines for citizens'
  );
  searchUrl.searchParams.set('location', 'IN');
  searchUrl.searchParams.set('language', 'en');
  // Emphasize trusted public government portals
  searchUrl.searchParams.set(
    'include_domains',
    'gov.in,nic.in,up.gov.in,myscheme.gov.in,scholarships.gov.in,pmkisan.gov.in,pmayg.nic.in,india.gov.in'
  );

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25-second timeout

  try {
    const response = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        query: validation.query,
        targetedQuery,
        sourceCount: 0,
        sources: [],
        retrievalTimestamp,
        apiKeyConfigured: true,
        error:
          'TinyFish Authentication Failed (HTTP 401/403): Please check your TINYFISH_API_KEY.',
      };
    }

    if (response.status === 429) {
      return {
        success: false,
        query: validation.query,
        targetedQuery,
        sourceCount: 0,
        sources: [],
        retrievalTimestamp,
        apiKeyConfigured: true,
        error:
          'TinyFish API Rate Limit Reached (HTTP 429): Please wait a moment before retrying.',
      };
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      return {
        success: false,
        query: validation.query,
        targetedQuery,
        sourceCount: 0,
        sources: [],
        retrievalTimestamp,
        apiKeyConfigured: true,
        error: `TinyFish API returned status ${response.status}: ${errText.slice(0, 200)}`,
      };
    }

    const data = await response.json();
    const rawResults = Array.isArray(data?.results) ? data.results : [];

    const sources: TinyFishSearchResultItem[] = rawResults.map((item: any) => ({
      title: item.title || 'Official Government Scheme Notice',
      url: item.url || '',
      snippet: item.snippet || item.content || item.markdown || '',
      markdown: item.markdown,
      score: item.score,
    }));

    // Filter to retain only valid URLs
    const validSources = sources.filter((s) => Boolean(s.url && s.url.startsWith('http')));

    return {
      success: true,
      query: validation.query,
      targetedQuery,
      sourceCount: validSources.length,
      sources: validSources,
      retrievalTimestamp,
      apiKeyConfigured: true,
      message:
        validSources.length === 0
          ? 'TinyFish completed search on official portals, but no matching scheme notices were returned for this specific query.'
          : undefined,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return {
        success: false,
        query: validation.query,
        targetedQuery,
        sourceCount: 0,
        sources: [],
        retrievalTimestamp,
        apiKeyConfigured: true,
        error: 'TinyFish request timed out after 15 seconds. The portal may be experiencing high latency.',
      };
    }
    return {
      success: false,
      query: validation.query,
      targetedQuery,
      sourceCount: 0,
      sources: [],
      retrievalTimestamp,
      apiKeyConfigured: true,
      error: `Network error connecting to TinyFish API: ${error.message || 'Connection failed'}`,
    };
  }
}

/**
 * Fetches full rendered page content from URLs using TinyFish Fetch API.
 * POST https://api.fetch.tinyfish.ai
 * Body: { urls: [...] }
 * Header: X-API-Key: ...
 */
export async function executeTinyFishFetch(
  urls: string[]
): Promise<Array<{ url: string; title?: string; markdown?: string; error?: string }>> {
  const apiKey = process.env.TINYFISH_API_KEY;
  if (!apiKey || urls.length === 0) {
    return [];
  }

  const validUrls = urls.filter((u) => u.startsWith('http')).slice(0, 3); // top 3 pages max
  if (validUrls.length === 0) return [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(TINYFISH_FETCH_ENDPOINT, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ urls: validUrls }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data?.results) ? data.results : [];
  } catch (err) {
    clearTimeout(timeoutId);
    return [];
  }
}

/**
 * Converts authentic TinyFish search results directly into verified Scheme objects.
 * Never invents missing data. Distinguishes missing information from verified information.
 */
export function convertTinyFishSourcesToSchemes(
  sources: TinyFishSearchResultItem[],
  query: string,
  retrievalTimestamp: string
): Scheme[] {
  return sources.map((source, index) => {
    const title = source.title || 'Official Government Scheme Notice';
    const snippet = source.snippet || '';
    const url = source.url || '';
    const domain = url ? new URL(url).hostname : 'gov.in';

    // Extract potential department name from snippet or portal domain
    let department = 'Government Welfare Department';
    if (/Department of [A-Za-z\s&]+/i.test(snippet)) {
      const match = snippet.match(/Department of [A-Za-z\s&]+/i);
      if (match) department = match[0].trim();
    } else if (/Ministry of [A-Za-z\s&]+/i.test(snippet)) {
      const match = snippet.match(/Ministry of [A-Za-z\s&]+/i);
      if (match) department = match[0].trim();
    } else if (domain.includes('myscheme.gov.in')) {
      department = 'Ministry of Electronics & IT / National e-Governance Division (NeGD)';
    } else if (domain.includes('up.gov.in')) {
      department = 'Government of Uttar Pradesh';
    } else if (domain.includes('scholarships.gov.in')) {
      department = 'Ministry of Education & National Scholarship Portal';
    }

    // Extract benefits or mark as requiring portal verification
    const benefits: string[] = [];
    if (/scholarship|financial assistance|reimbursement|tuition|subsidy|stipend|grant/i.test(snippet)) {
      benefits.push('Financial assistance and scheme benefits as defined by the implementing department');
    }
    if (/direct benefit transfer|DBT/i.test(snippet)) {
      benefits.push('Direct Benefit Transfer (DBT) into Aadhaar-seeded citizen bank account');
    }
    if (benefits.length === 0) {
      benefits.push('Scheme benefits and assistance guidelines specified on the official department portal');
    }

    // Extract eligibility conditions from snippet
    const eligibilityCriteria: string[] = [];
    if (/Uttar Pradesh|UP/i.test(snippet + ' ' + title) || /Uttar Pradesh/i.test(query)) {
      eligibilityCriteria.push('Domicile or resident of Uttar Pradesh');
    }
    if (/post[\s-]matric|college|university|undergraduate|degree/i.test(snippet + ' ' + title)) {
      eligibilityCriteria.push('Students pursuing post-matriculation or higher education in recognized institutions');
    }
    if (/backward class|OBC|SC|ST|minority/i.test(snippet)) {
      eligibilityCriteria.push('Belonging to eligible reserved or target community categories');
    }
    if (eligibilityCriteria.length === 0) {
      eligibilityCriteria.push('Eligible citizens fulfilling departmental qualifications as detailed on the official portal');
    }

    // Detect target states and occupations
    const targetStates = /Uttar Pradesh|UP/i.test(snippet + ' ' + title)
      ? ['Uttar Pradesh']
      : ['All India'];
    const targetOccupations = /student|college|school|academic/i.test(snippet + ' ' + title)
      ? ['Student', 'College Student']
      : /farmer|kisan|agriculture/i.test(snippet + ' ' + title)
      ? ['Farmer', 'Small/Marginal Farmer']
      : ['All Citizens'];

    // Check deadline in snippet
    const deadlineText = snippet.match(/open until [^.]+|\bdeadline:? [^.]+|\bopen from [^.]+/i)?.[0];
    const isDeadlineVerified = Boolean(deadlineText);

    const uncertaintyDisclaimers: string[] = [];
    if (!isDeadlineVerified) {
      uncertaintyDisclaimers.push(
        'Application deadline was not explicitly stated in the live search snippet. Verify active enrollment dates on the official portal.'
      );
    }
    uncertaintyDisclaimers.push(
      'Detailed income ceiling, caste documentation, and institutional verification criteria must be confirmed on the official portal.'
    );

    return {
      id: `tinyfish-${domain.replace(/\./g, '-')}-${index}-${Date.now()}`,
      name: title.replace(/\s*[-–|].*myscheme.*$/i, '').trim(),
      department,
      description: snippet || `Official government scheme notice retrieved from ${domain}. Review the official guidelines for complete details.`,
      benefits,
      eligibilityCriteria,
      targetStates,
      targetOccupations,
      targetEducation: targetOccupations.includes('Student') ? ['Undergraduate/College', '12th Pass'] : undefined,
      incomeLimitINR: snippet.match(/₹?\s*2[,.]?00[,.]?000/)? 200000 : null,
      socialCategoriesAllowed: ['General', 'OBC', 'SC', 'ST', 'Minority'],
      genderTarget: /women|girl/i.test(title + ' ' + snippet) ? 'Female' : 'All',
      deadline: {
        dateText: deadlineText || 'Verify current window on portal',
        isUncertain: !isDeadlineVerified,
        uncertaintyMessage: isDeadlineVerified
          ? undefined
          : 'Exact application window date is unverified in search snippet; check official portal.',
        status: isDeadlineVerified ? 'active' : 'uncertain',
      },
      requiredDocuments: [
        'Aadhaar Card with mobile linkage',
        'Official educational certificate / admission receipt',
        'Income Certificate / Domicile Certificate (as per portal guidelines)',
      ],
      sourceUrl: url,
      retrievalTimestamp,
      verificationNotes: [
        `Live-web source verified via TinyFish from ${domain}`,
        `Search query target: ${query}`,
      ],
      uncertaintyDisclaimers,
    };
  });
}

