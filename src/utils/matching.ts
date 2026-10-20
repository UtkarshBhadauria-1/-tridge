/**
 * TRIDGE - Pure Logic Module for Eligibility Assessment and Change Detection
 */

import type {
  CitizenProfile,
  Scheme,
  EligibilityMatchResult,
  EligibilityVerdict,
  ChangeRecord,
  SchemeChangeDiff,
} from '../types/scheme.ts';

export const OFFICIAL_DISCLAIMER =
  'Important Notice: TRIDGE provides automated informational analysis based solely on publicly extracted official scheme notices. This does NOT constitute an official government determination or guarantee of benefit. Always verify your eligibility and apply directly on the official department portal.';

/**
 * Evaluates citizen profile against scheme criteria with transparent reasoning.
 * Never invents eligibility determinations.
 */
export function evaluateEligibility(
  scheme: Scheme,
  profile?: CitizenProfile
): EligibilityMatchResult {
  if (!profile) {
    return {
      verdict: 'more_info_required',
      verdictLabel: 'Citizen Profile Required',
      matchedCriteria: [],
      unmetCriteria: [],
      uncertainCriteria: [
        'Please complete or update your citizen profile (state, occupation, income, category) to evaluate eligibility.',
      ],
      explanation:
        'No citizen profile was provided. Please configure your profile to assess eligibility against this scheme.',
      disclaimer: OFFICIAL_DISCLAIMER,
    };
  }

  const matched: string[] = [];
  const unmet: string[] = [];
  const uncertain: string[] = [];

  // 1. Geographic / State Check
  if (scheme.targetStates && scheme.targetStates.length > 0) {
    const isAllIndia = scheme.targetStates.some((s) =>
      /all india|pan india|national|central/i.test(s)
    );
    const matchesState = scheme.targetStates.some(
      (s) =>
        s.toLowerCase().includes(profile.state.toLowerCase()) ||
        profile.state.toLowerCase().includes(s.toLowerCase())
    );

    if (isAllIndia || matchesState) {
      matched.push(
        `Resident State (${profile.state}): Matches scheme geographic scope (${scheme.targetStates.join(', ')}).`
      );
    } else {
      unmet.push(
        `State Mismatch: Scheme is targeted for ${scheme.targetStates.join(', ')}, but profile state is ${profile.state}.`
      );
    }
  } else {
    uncertain.push(
      'Geographic scope was not explicitly restricted in the official notice text; state eligibility requires local verification.'
    );
  }

  // 2. Occupation Check
  if (scheme.targetOccupations && scheme.targetOccupations.length > 0) {
    const profOcc = profile.occupation.toLowerCase();
    const matchesOcc = scheme.targetOccupations.some((occ) => {
      const o = occ.toLowerCase();
      if (o.includes('student') && profOcc.includes('student')) return true;
      if (o.includes('farmer') && profOcc.includes('farmer')) return true;
      if (o.includes('labor') && profOcc.includes('labor')) return true;
      if (o.includes('artisan') && profOcc.includes('artisan')) return true;
      if (o.includes('youth') && (profOcc.includes('student') || profOcc.includes('youth') || profOcc.includes('unemployed'))) return true;
      if (o.includes('all') || o.includes('citizen')) return true;
      return o.includes(profOcc) || profOcc.includes(o);
    });

    if (matchesOcc) {
      matched.push(
        `Occupation (${profile.occupation}): Fits beneficiary criteria (${scheme.targetOccupations.join(', ')}).`
      );
    } else {
      unmet.push(
        `Occupation Mismatch: Scheme requires target occupation [${scheme.targetOccupations.join(', ')}], while profile lists ${profile.occupation}.`
      );
    }
  }

  // 3. Education Check
  if (scheme.targetEducation && scheme.targetEducation.length > 0) {
    const profEdu = profile.educationLevel.toLowerCase();
    const matchesEdu = scheme.targetEducation.some((edu) => {
      const e = edu.toLowerCase();
      if (e.includes('college') || e.includes('undergraduate') || e.includes('higher')) {
        return profEdu.includes('college') || profEdu.includes('undergraduate') || profEdu.includes('postgraduate');
      }
      if (e.includes('10th') || e.includes('matric')) {
        return profEdu.includes('10th') || profEdu.includes('12th') || profEdu.includes('college') || profEdu.includes('postgraduate');
      }
      if (e.includes('12th') || e.includes('inter')) {
        return profEdu.includes('12th') || profEdu.includes('college') || profEdu.includes('postgraduate');
      }
      return e.includes(profEdu) || profEdu.includes(e);
    });

    if (matchesEdu) {
      matched.push(
        `Education Level (${profile.educationLevel}): Meets educational prerequisites.`
      );
    } else {
      unmet.push(
        `Education Prerequisite: Scheme specifies [${scheme.targetEducation.join(', ')}], which differs from ${profile.educationLevel}.`
      );
    }
  }

  // 4. Annual Income Limit Check
  if (scheme.incomeLimitINR !== undefined && scheme.incomeLimitINR !== null) {
    if (profile.annualIncome <= scheme.incomeLimitINR) {
      matched.push(
        `Family Income (₹${profile.annualIncome.toLocaleString('en-IN')}/year): Within the stated limit of ₹${scheme.incomeLimitINR.toLocaleString('en-IN')}/year.`
      );
    } else {
      unmet.push(
        `Income Exceeds Ceiling: Profile annual income (₹${profile.annualIncome.toLocaleString('en-IN')}) exceeds the ceiling of ₹${scheme.incomeLimitINR.toLocaleString('en-IN')}/year.`
      );
    }
  } else {
    // If scheme criteria mentions income in text but limit is not strictly parsed
    const mentionsIncome = scheme.eligibilityCriteria.some((c) =>
      /income|annual ceiling|lakh|bpl/i.test(c)
    );
    if (mentionsIncome) {
      uncertain.push(
        'Specific numerical income threshold is not clearly specified in extracted text; verify with your Tehsil / Income Certificate.'
      );
    }
  }

  // 5. Social Category Check
  if (scheme.socialCategoriesAllowed && scheme.socialCategoriesAllowed.length > 0) {
    const isAll = scheme.socialCategoriesAllowed.some((c) => /all|any|general/i.test(c));
    const matchesCat = scheme.socialCategoriesAllowed.some((c) =>
      c.toLowerCase().includes(profile.socialCategory.toLowerCase()) ||
      profile.socialCategory.toLowerCase().includes(c.toLowerCase())
    );

    if (isAll || matchesCat) {
      matched.push(
        `Social Category (${profile.socialCategory}): Eligible under targeted group (${scheme.socialCategoriesAllowed.join(', ')}).`
      );
    } else {
      unmet.push(
        `Category Scope: Scheme is earmarked specifically for ${scheme.socialCategoriesAllowed.join(', ')}, but profile category is ${profile.socialCategory}.`
      );
    }
  }

  // 6. Gender Check
  if (scheme.genderTarget && scheme.genderTarget !== 'All') {
    if (scheme.genderTarget.toLowerCase() === profile.gender.toLowerCase()) {
      matched.push(`Gender (${profile.gender}): Meets specified target gender (${scheme.genderTarget}).`);
    } else {
      unmet.push(
        `Target Gender: Scheme is specifically reserved for ${scheme.genderTarget} applicants, while profile is ${profile.gender}.`
      );
    }
  }

  // 7. Deadline verification status
  if (scheme.deadline.status === 'expired') {
    unmet.push(
      `Application Deadline Expired: The stated official deadline (${scheme.deadline.dateText}) has passed.`
    );
  } else if (scheme.deadline.isUncertain) {
    uncertain.push(
      `Application Window: ${scheme.deadline.uncertaintyMessage || 'Deadline could not be conclusively verified from portal text.'}`
    );
  }

  // Determine overall verdict
  let verdict: EligibilityVerdict;
  let verdictLabel: string;

  if (unmet.length > 0) {
    verdict = 'not_eligible';
    verdictLabel = 'Not eligible under known criteria';
  } else if (uncertain.length > 0 && matched.length < 2) {
    verdict = 'more_info_required';
    verdictLabel = 'More information required';
  } else {
    verdict = 'potentially_eligible';
    verdictLabel = 'Potentially eligible';
  }

  // Generate detailed rationale explanation
  let explanation = '';
  if (verdict === 'potentially_eligible') {
    explanation = `Based on known official criteria, your profile matches the stated requirements (${matched.length} verified conditions). No disqualifying conditions were identified from the source notice.`;
  } else if (verdict === 'not_eligible') {
    explanation = `The profile does not satisfy ${unmet.length} explicitly specified criterion/criteria: ${unmet.join('; ')}`;
  } else {
    explanation = `The official notice does not contain enough verified parameters to determine eligibility with certainty. Local or portal verification is recommended.`;
  }

  return {
    verdict,
    verdictLabel,
    matchedCriteria: matched,
    unmetCriteria: unmet,
    uncertainCriteria: uncertain,
    explanation,
    disclaimer: OFFICIAL_DISCLAIMER,
  };
}

/**
 * Compares two versions of a scheme and extracts granular differences.
 */
export function detectSchemeChanges(
  previous: Scheme,
  current: Scheme
): ChangeRecord {
  const differences: SchemeChangeDiff[] = [];

  // Compare Deadline
  if (previous.deadline.dateText !== current.deadline.dateText) {
    differences.push({
      field: 'deadline',
      fieldName: 'Application Deadline',
      previousValue: previous.deadline.dateText,
      newValue: current.deadline.dateText,
      changeType:
        current.deadline.status === 'expired'
          ? 'expired'
          : 'modified',
      supportingSourceUrl: current.sourceUrl,
      notes: current.deadline.isUncertain
        ? 'Note: Updated deadline has uncertainty flag.'
        : 'Official deadline text has been updated in latest retrieval.',
    });
  }

  // Compare Benefits
  const prevBenefits = previous.benefits.join(' | ');
  const currBenefits = current.benefits.join(' | ');
  if (prevBenefits !== currBenefits) {
    differences.push({
      field: 'benefits',
      fieldName: 'Scheme Benefits & Assistance',
      previousValue: prevBenefits || 'Not listed previously',
      newValue: currBenefits || 'Not listed',
      changeType: 'modified',
      supportingSourceUrl: current.sourceUrl,
      notes: 'Benefit details or assistance amounts differ from previous snapshot.',
    });
  }

  // Compare Eligibility Criteria
  const prevCriteria = previous.eligibilityCriteria.join(' | ');
  const currCriteria = current.eligibilityCriteria.join(' | ');
  if (prevCriteria !== currCriteria) {
    differences.push({
      field: 'eligibility',
      fieldName: 'Eligibility Conditions',
      previousValue: prevCriteria,
      newValue: currCriteria,
      changeType: 'modified',
      supportingSourceUrl: current.sourceUrl,
      notes: 'Eligibility rules, qualifications, or income conditions were revised.',
    });
  }

  // Compare Required Documents
  const prevDocs = (previous.requiredDocuments || []).sort().join(', ');
  const currDocs = (current.requiredDocuments || []).sort().join(', ');
  if (prevDocs !== currDocs) {
    differences.push({
      field: 'documents',
      fieldName: 'Required Documents',
      previousValue: prevDocs || 'None specified',
      newValue: currDocs || 'None specified',
      changeType: 'modified',
      supportingSourceUrl: current.sourceUrl,
      notes: 'Required documentation checklist has changed in official instructions.',
    });
  }

  const hasChanges = differences.length > 0;
  const summary = hasChanges
    ? `Detected ${differences.length} change(s) between previous snapshot (${new Date(
        previous.retrievalTimestamp
      ).toLocaleDateString()}) and latest retrieval (${new Date(
        current.retrievalTimestamp
      ).toLocaleDateString()}).`
    : 'No changes detected compared to the previous verified snapshot.';

  return {
    schemeId: current.id,
    schemeName: current.name,
    previousTimestamp: previous.retrievalTimestamp,
    newTimestamp: current.retrievalTimestamp,
    hasChanges,
    differences,
    summary,
  };
}
