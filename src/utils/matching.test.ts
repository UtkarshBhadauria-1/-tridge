import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateEligibility, detectSchemeChanges } from './matching.ts';
import type { Scheme, CitizenProfile } from '../types/scheme.ts';

const mockScheme: Scheme = {
  id: 'up-post-matric-scholarship',
  name: 'UP Post-Matric Scholarship Scheme',
  department: 'Social Welfare Department, Government of Uttar Pradesh',
  description: 'Financial assistance for college and university students studying in UP.',
  benefits: ['100% Tuition fee reimbursement', 'Monthly maintenance allowance of ₹1,200'],
  eligibilityCriteria: [
    'Must be a domicile of Uttar Pradesh',
    'Enrolled in post-matric/college degree or diploma program',
    'Annual family income must not exceed ₹2,00,000 for General/OBC, or ₹2,50,000 for SC/ST',
  ],
  targetStates: ['Uttar Pradesh'],
  targetOccupations: ['Student', 'College Student'],
  targetEducation: ['Undergraduate/College', 'Postgraduate'],
  incomeLimitINR: 200000,
  socialCategoriesAllowed: ['General', 'OBC', 'SC', 'ST'],
  genderTarget: 'All',
  deadline: {
    dateText: '31 December 2026',
    isUncertain: false,
    status: 'active',
  },
  requiredDocuments: [
    'Aadhaar Card',
    'Income Certificate from Tehsildar',
    'UP Domicile Certificate',
    'College Fee Receipt',
    'Previous Year Marksheet',
  ],
  sourceUrl: 'https://scholarship.up.gov.in',
  retrievalTimestamp: '2026-10-15T10:00:00.000Z',
};

test('evaluateEligibility identifies potentially eligible citizen', () => {
  const eligibleStudent: CitizenProfile = {
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    educationLevel: 'Undergraduate/College',
    occupation: 'College Student',
    annualIncome: 140000,
    socialCategory: 'OBC',
    gender: 'Female',
    landholding: 'Landless',
    isDifferentlyAbled: false,
  };

  const result = evaluateEligibility(mockScheme, eligibleStudent);
  assert.equal(result.verdict, 'potentially_eligible');
  assert.equal(result.unmetCriteria.length, 0);
  assert.ok(result.matchedCriteria.length >= 3);
  assert.ok(result.explanation.includes('matches the stated requirements'));
});

test('evaluateEligibility catches state mismatch correctly', () => {
  const outOfStateStudent: CitizenProfile = {
    state: 'Maharashtra',
    district: 'Pune',
    educationLevel: 'Undergraduate/College',
    occupation: 'College Student',
    annualIncome: 140000,
    socialCategory: 'OBC',
    gender: 'Male',
    landholding: 'Landless',
    isDifferentlyAbled: false,
  };

  const result = evaluateEligibility(mockScheme, outOfStateStudent);
  assert.equal(result.verdict, 'not_eligible');
  assert.ok(result.unmetCriteria.some((u) => u.includes('State Mismatch')));
});

test('evaluateEligibility catches income limit violation', () => {
  const highIncomeStudent: CitizenProfile = {
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    educationLevel: 'Undergraduate/College',
    occupation: 'College Student',
    annualIncome: 450000,
    socialCategory: 'General',
    gender: 'Male',
    landholding: 'Small (1-2 ha)',
    isDifferentlyAbled: false,
  };

  const result = evaluateEligibility(mockScheme, highIncomeStudent);
  assert.equal(result.verdict, 'not_eligible');
  assert.ok(result.unmetCriteria.some((u) => u.includes('Income Exceeds Ceiling')));
});

test('evaluateEligibility requests profile when profile is missing', () => {
  const result = evaluateEligibility(mockScheme, undefined);
  assert.equal(result.verdict, 'more_info_required');
});

test('detectSchemeChanges detects deadline changes and benefit modifications', () => {
  const updatedScheme: Scheme = {
    ...mockScheme,
    retrievalTimestamp: '2026-10-20T08:00:00.000Z',
    deadline: {
      dateText: '15 January 2027 (Extended)',
      isUncertain: false,
      status: 'active',
    },
    benefits: [
      '100% Tuition fee reimbursement',
      'Monthly maintenance allowance of ₹1,500 (revised upward)',
    ],
  };

  const diffResult = detectSchemeChanges(mockScheme, updatedScheme);
  assert.equal(diffResult.hasChanges, true);
  assert.equal(diffResult.differences.length, 2);

  const deadlineDiff = diffResult.differences.find((d) => d.field === 'deadline');
  assert.ok(deadlineDiff);
  assert.equal(deadlineDiff?.previousValue, '31 December 2026');
  assert.equal(deadlineDiff?.newValue, '15 January 2027 (Extended)');

  const benefitDiff = diffResult.differences.find((d) => d.field === 'benefits');
  assert.ok(benefitDiff);
});
