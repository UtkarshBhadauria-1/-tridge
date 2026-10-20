/**
 * TRIDGE - Local Persistent Storage for Government Schemes & Notice Change Detection
 */

import fs from 'node:fs';
import path from 'node:path';
import type { Scheme, ChangeRecord } from '../src/types/scheme.ts';
import { detectSchemeChanges } from '../src/utils/matching.ts';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'schemes_db.json');

// Seed schemes based on official public government notices
const SEED_SCHEMES: Scheme[] = [
  {
    id: 'up-post-matric-scholarship',
    name: 'UP Post-Matric & Inter-College Scholarship Scheme',
    department: 'Social Welfare & Backward Class Welfare Department, Govt. of Uttar Pradesh',
    description: 'State financial assistance program for students belonging to General, OBC, SC, ST, and Minority categories enrolled in post-matriculation, polytechnic, degree, and postgraduate courses in Uttar Pradesh.',
    benefits: [
      '100% Non-refundable compulsory tuition fee reimbursement',
      'Monthly maintenance allowance ranging from ₹550 to ₹1,200 depending on course group',
      'Direct Benefit Transfer (DBT) directly into student Aadhaar-seeded bank account',
    ],
    eligibilityCriteria: [
      'Applicant must be a permanent resident (domicile) of Uttar Pradesh',
      'Enrolled in a recognized college, university, or institute in UP',
      'Annual family income ceiling: ₹2,00,000 for General/OBC/Minority; ₹2,50,000 for SC/ST',
      'Minimum 75% biometric attendance required in college',
      'Must have passed the qualifying previous examination',
    ],
    targetStates: ['Uttar Pradesh'],
    targetOccupations: ['Student', 'College Student'],
    targetEducation: ['Undergraduate/College', 'Postgraduate', '12th Pass'],
    incomeLimitINR: 200000,
    socialCategoriesAllowed: ['General', 'OBC', 'SC', 'ST', 'Minority'],
    genderTarget: 'All',
    deadline: {
      dateText: '31 December 2026',
      isUncertain: false,
      status: 'active',
    },
    requiredDocuments: [
      'Aadhaar Card linked with active mobile number',
      'UP Domicile Certificate (Niwas Praman Patra)',
      'Income Certificate issued by competent Revenue Authority (Tehsildar)',
      'Caste Certificate (for OBC/SC/ST categories)',
      'College Admission Fee Receipt & Student ID',
      'Previous Examination Marksheets',
      'Aadhaar-seeded Bank Account Passbook (NPCI mapped)',
    ],
    sourceUrl: 'https://scholarship.up.gov.in',
    retrievalTimestamp: '2026-10-15T09:30:00.000Z',
    verificationNotes: [
      'Verified via UP Scholarship Official Portal (scholarship.up.gov.in)',
      'Government order issued by Social Welfare Department UP',
    ],
    uncertaintyDisclaimers: [
      'Renewal candidates must verify current institution registration code before final submission.',
    ],
  },
  {
    id: 'up-kanya-sumangala-yojana',
    name: 'Mukhyamantri Kanya Sumangala Yojana (MKSY)',
    department: 'Department of Women & Child Development, Govt. of Uttar Pradesh',
    description: 'Conditional cash transfer scheme to empower the girl child and encourage education from birth through college graduation.',
    benefits: [
      'Total financial assistance of ₹25,000 released in 6 progressive installments',
      'Installment 6: ₹7,000 one-time grant upon admission into Undergraduate College Degree or Diploma course',
      'Installment 5: ₹5,000 upon admission into Class 11 and 12',
    ],
    eligibilityCriteria: [
      'Family must be resident of Uttar Pradesh with valid Domicile Certificate',
      'Maximum annual family income should not exceed ₹3,00,000 (3 Lakhs)',
      'Maximum two daughters per family eligible',
      'Enrolled in recognized school or college in Uttar Pradesh',
    ],
    targetStates: ['Uttar Pradesh'],
    targetOccupations: ['Student', 'College Student'],
    targetEducation: ['Undergraduate/College', '12th Pass', '10th Pass', 'Below 10th'],
    incomeLimitINR: 300000,
    socialCategoriesAllowed: ['General', 'OBC', 'SC', 'ST', 'Minority'],
    genderTarget: 'Female',
    deadline: {
      dateText: 'Open throughout financial year (Rolling admissions)',
      isUncertain: false,
      status: 'ongoing',
    },
    requiredDocuments: [
      'Aadhaar Card of Girl Child and Parents/Guardian',
      'UP Permanent Domicile Certificate',
      'Family Income Certificate (< ₹3 Lakh)',
      'Bank Passbook of Girl Child or Joint Account with Mother',
      'College/School Admission Verification Certificate',
      'Affidavit on Family Size & Number of Children',
    ],
    sourceUrl: 'https://mksy.up.gov.in',
    retrievalTimestamp: '2026-10-14T11:00:00.000Z',
    verificationNotes: [
      'Updated grant amount of ₹25,000 verified under revised UP Cabinet approval guidelines.',
    ],
  },
  {
    id: 'pm-kisan-samman-nidhi',
    name: 'PM Kisan Samman Nidhi Yojana',
    department: 'Ministry of Agriculture and Farmers Welfare, Govt. of India',
    description: 'Central sector scheme providing income support to all landholding farmer families across the country to supplement their financial needs for agricultural inputs and domestic requirements.',
    benefits: [
      'Direct income transfer of ₹6,000 per year paid in three equal 4-monthly installments of ₹2,000',
      'Transferred directly via DBT to Aadhaar-linked bank accounts',
    ],
    eligibilityCriteria: [
      'Small and marginal farmer families possessing cultivable landholding in their name',
      'Both husband, wife, and minor children considered one family unit',
      'Institutional landholders and serving/retired govt employees paying income tax are excluded',
      'Mandatory e-KYC completed on PM-Kisan portal',
    ],
    targetStates: ['All India', 'Uttar Pradesh'],
    targetOccupations: ['Small/Marginal Farmer', 'Farmer'],
    targetEducation: ['Below 10th', '10th Pass', '12th Pass', 'Undergraduate/College'],
    incomeLimitINR: null,
    socialCategoriesAllowed: ['General', 'OBC', 'SC', 'ST'],
    genderTarget: 'All',
    deadline: {
      dateText: 'Ongoing scheme with triannual installment distribution',
      isUncertain: false,
      status: 'ongoing',
    },
    requiredDocuments: [
      'Landholding Records (Khatauni / Land Ownership Record)',
      'Aadhaar Card with e-KYC completed',
      'Aadhaar-seeded Bank Account details',
      'Active Mobile number for OTP verification',
    ],
    sourceUrl: 'https://pmkisan.gov.in',
    retrievalTimestamp: '2026-10-10T14:00:00.000Z',
  },
  {
    id: 'pmay-gramin-housing',
    name: 'Pradhan Mantri Awaas Yojana - Gramin (PMAY-G)',
    department: 'Ministry of Rural Development, Govt. of India',
    description: 'Flagship rural housing scheme aiming to provide a pucca house with basic amenities to all houseless households and those living in kutcha and dilapidated houses in rural areas.',
    benefits: [
      'Unit financial assistance of ₹1,20,000 in plains and ₹1,30,000 in hilly/difficult areas',
      'Additional 90-95 person-days of unskilled labor under MGNREGS (approx ₹20,000+)',
      'Assistance for construction of dedicated toilet under Swachh Bharat Mission (₹12,000)',
      'Electricity (Saubhagya) and LPG (Ujjwala) scheme linkages',
    ],
    eligibilityCriteria: [
      'Rural households identified via SECC 2011 Deprivation score and Awaas+ verified survey',
      'Houseless or living in zero, one, or two-room houses with kutcha wall and kutcha roof',
      'Must not own motorized vehicle, mechanized farm equipment, or kisan credit card >= ₹50,000',
      'No member should be a government employee or income tax payer',
    ],
    targetStates: ['All India', 'Uttar Pradesh'],
    targetOccupations: ['Agricultural Laborer', 'Small/Marginal Farmer', 'Artisan', 'Unemployed Youth'],
    targetEducation: ['Below 10th', '10th Pass'],
    incomeLimitINR: 120000,
    socialCategoriesAllowed: ['General', 'OBC', 'SC', 'ST', 'Minority'],
    genderTarget: 'All',
    deadline: {
      dateText: 'Gram Panchayat Awaas+ Survey Verification Windows',
      isUncertain: true,
      uncertaintyMessage: 'Target quotas and survey sanction dates are scheduled annually per Gram Panchayat.',
      status: 'uncertain',
    },
    requiredDocuments: [
      'Aadhaar Card of all family members',
      'MGNREGA Job Card',
      'Bank Account passbook linked with Aadhaar and mobile',
      'Land allotment certificate or existing kutcha house photo',
      'Consent letter for Awaas+ survey',
    ],
    sourceUrl: 'https://pmayg.nic.in',
    retrievalTimestamp: '2026-10-08T16:00:00.000Z',
    uncertaintyDisclaimers: [
      'Selection is strictly based on Gram Sabha priority listing; individual direct application is not accepted without survey registration.',
    ],
  },
];

interface DatabaseSchema {
  schemes: Scheme[];
  snapshots: Array<{
    schemeId: string;
    scheme: Scheme;
    savedAt: string;
    version: number;
  }>;
}

function ensureDb(): DatabaseSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      schemes: SEED_SCHEMES,
      snapshots: SEED_SCHEMES.map((scheme, index) => ({
        schemeId: scheme.id,
        scheme: scheme,
        savedAt: scheme.retrievalTimestamp,
        version: 1,
      })),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content) as DatabaseSchema;
  } catch (err) {
    console.error('Error reading schemes database, re-initializing:', err);
    const initialData: DatabaseSchema = {
      schemes: SEED_SCHEMES,
      snapshots: SEED_SCHEMES.map((scheme) => ({
        schemeId: scheme.id,
        scheme: scheme,
        savedAt: scheme.retrievalTimestamp,
        version: 1,
      })),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function writeDb(data: DatabaseSchema): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function getAllSavedSchemes(): Scheme[] {
  const db = ensureDb();
  return db.schemes;
}

export function getSchemeById(id: string): Scheme | undefined {
  const db = ensureDb();
  return db.schemes.find((s) => s.id === id);
}

export function saveSchemeSnapshot(scheme: Scheme): {
  scheme: Scheme;
  changeRecord?: ChangeRecord;
} {
  const db = ensureDb();
  const existingIndex = db.schemes.findIndex(
    (s) => s.id === scheme.id || s.name.toLowerCase() === scheme.name.toLowerCase()
  );

  let changeRecord: ChangeRecord | undefined;

  if (existingIndex >= 0) {
    const previous = db.schemes[existingIndex];
    changeRecord = detectSchemeChanges(previous, scheme);
    db.schemes[existingIndex] = {
      ...scheme,
      lastComparedTimestamp: new Date().toISOString(),
      hasUpdatesNotice: changeRecord.hasChanges,
    };
  } else {
    db.schemes.push(scheme);
  }

  // Record history snapshot
  const existingSnapshots = db.snapshots.filter((snap) => snap.schemeId === scheme.id);
  const version = existingSnapshots.length + 1;
  db.snapshots.push({
    schemeId: scheme.id,
    scheme: { ...scheme },
    savedAt: new Date().toISOString(),
    version,
  });

  writeDb(db);
  return { scheme, changeRecord };
}

export function compareSchemeWithSaved(incoming: Scheme): ChangeRecord {
  const db = ensureDb();
  const existing = db.schemes.find(
    (s) => s.id === incoming.id || s.name.toLowerCase() === incoming.name.toLowerCase()
  );

  if (!existing) {
    return {
      schemeId: incoming.id,
      schemeName: incoming.name,
      previousTimestamp: 'No previous snapshot on record',
      newTimestamp: incoming.retrievalTimestamp,
      hasChanges: false,
      differences: [],
      summary: 'This is the first time this official notice has been tracked in TRIDGE. No previous version exists for comparison.',
    };
  }

  return detectSchemeChanges(existing, incoming);
}
