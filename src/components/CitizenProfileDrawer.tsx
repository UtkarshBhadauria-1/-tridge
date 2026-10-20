import React, { useEffect, useState } from "react";
import { X, User, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

import type { CitizenProfile } from "../types/scheme.ts";
import { OFFICIAL_DISCLAIMER } from "../utils/matching.ts";

interface CitizenProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CitizenProfile | null;
  onUpdateProfile: (newProfile: CitizenProfile) => void;
}

const EMPTY_PROFILE: CitizenProfile = {
  state: "",
  district: "",
  educationLevel: "",
  occupation: "",
  annualIncome: 0,
  socialCategory: "",
  gender: "",
  landholding: "",
  isDifferentlyAbled: false,
};

const SAMPLE_PRESETS: Array<{
  label: string;
  profile: CitizenProfile;
}> = [
  {
    label: "College Student (Uttar Pradesh)",
    profile: {
      state: "Uttar Pradesh",
      district: "Lucknow",
      educationLevel: "Undergraduate/College",
      occupation: "College Student",
      annualIncome: 140000,
      socialCategory: "OBC",
      gender: "Female",
      landholding: "Landless",
      isDifferentlyAbled: false,
    },
  },
  {
    label: "Small Farmer (Varanasi, UP)",
    profile: {
      state: "Uttar Pradesh",
      district: "Varanasi",
      educationLevel: "10th Pass",
      occupation: "Small/Marginal Farmer",
      annualIncome: 95000,
      socialCategory: "General",
      gender: "Male",
      landholding: "Marginal (< 1 hectare)",
      isDifferentlyAbled: false,
    },
  },
  {
    label: "Rural Woman Artisan (Gorakhpur, UP)",
    profile: {
      state: "Uttar Pradesh",
      district: "Gorakhpur",
      educationLevel: "Below 10th",
      occupation: "Artisan",
      annualIncome: 65000,
      socialCategory: "SC",
      gender: "Female",
      landholding: "Landless",
      isDifferentlyAbled: false,
    },
  },
  {
    label: "Graduate Job Seeker (Bihar)",
    profile: {
      state: "Bihar",
      district: "Patna",
      educationLevel: "Undergraduate/College",
      occupation: "Unemployed Youth",
      annualIncome: 180000,
      socialCategory: "EWS",
      gender: "Male",
      landholding: "Landless",
      isDifferentlyAbled: false,
    },
  },
];

const STATES = [
  "Uttar Pradesh",
  "Bihar",
  "Madhya Pradesh",
  "Rajasthan",
  "Maharashtra",
  "West Bengal",
  "Jharkhand",
  "Haryana",
  "Punjab",
  "Odisha",
  "Gujarat",
  "Karnataka",
  "Tamil Nadu",
  "Andhra Pradesh",
  "Telangana",
  "Assam",
];

const UP_DISTRICTS = [
  "Lucknow",
  "Varanasi",
  "Prayagraj",
  "Agra",
  "Gorakhpur",
  "Kanpur Nagar",
  "Meerut",
  "Ayodhya",
  "Jhansi",
  "Bareilly",
  "Aligarh",
  "Moradabad",
  "Saharanpur",
  "Mirzapur",
  "Azamgarh",
  "Basti",
  "Sultanpur",
  "Raebareli",
];

const EDUCATION_LEVELS = [
  "Below 10th",
  "10th Pass",
  "12th Pass",
  "Undergraduate/College",
  "Postgraduate",
  "Vocational/Diploma",
];

const OCCUPATIONS = [
  "College Student",
  "Small/Marginal Farmer",
  "Agricultural Laborer",
  "Artisan",
  "Unemployed Youth",
  "Self-Employed / Shopkeeper",
  "Senior Citizen",
  "Homemaker",
  "Other",
];

const SOCIAL_CATEGORIES = ["General", "OBC", "SC", "ST", "EWS", "Minority"];

const LANDHOLDINGS = [
  "Landless",
  "Marginal (< 1 hectare)",
  "Small (1-2 ha)",
  "Medium/Large (> 2 ha)",
];

const inputClass =
  "w-full text-sm border border-stone-300 rounded-lg p-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500";

const labelClass = "block text-xs font-semibold text-stone-700 mb-1";

export const CitizenProfileDrawer: React.FC<CitizenProfileDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [draftProfile, setDraftProfile] = useState<CitizenProfile>(
    profile ?? EMPTY_PROFILE,
  );

  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDraftProfile(profile ?? { ...EMPTY_PROFILE });
      setValidationError("");
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleChange = (
    field: keyof CitizenProfile,
    value: string | number | boolean,
  ) => {
    setDraftProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requiredFields = [
      draftProfile.state,
      draftProfile.district,
      draftProfile.educationLevel,
      draftProfile.occupation,
      draftProfile.socialCategory,
      draftProfile.gender,
      draftProfile.landholding,
    ];

    if (requiredFields.some((value) => !String(value).trim())) {
      setValidationError("Please complete all required fields before saving.");
      return;
    }

    if (
      !Number.isFinite(draftProfile.annualIncome) ||
      draftProfile.annualIncome < 0
    ) {
      setValidationError("Please enter a valid annual family income.");
      return;
    }

    setValidationError("");
    onUpdateProfile(draftProfile);
  };

  const handleClear = () => {
    setDraftProfile({ ...EMPTY_PROFILE });
    setValidationError("");
  };

  const selectField = (
    id: string,
    label: string,
    value: string,
    options: string[],
    field: keyof CitizenProfile,
  ) => (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label} *
      </label>

      <select
        id={id}
        required
        value={value}
        onChange={(event) => handleChange(field, event.target.value)}
        className={inputClass}
      >
        <option value="" disabled>
          Select {label.toLowerCase()}
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end"
    >
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
              <User className="w-5 h-5" />
            </div>

            <div>
              <h2
                id="profile-drawer-title"
                className="text-lg font-bold text-white font-serif"
              >
                Optional Eligibility Profile
              </h2>

              <p className="text-xs text-stone-400">
                No account or registration required
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            aria-label="Close profile drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />

          <p className="leading-relaxed font-medium">{OFFICIAL_DISCLAIMER}</p>
        </div>

        {/* Optional sample profiles */}
        <div className="p-4 border-b border-stone-200 bg-stone-50">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
            Optional Sample Profiles
          </span>

          <div className="grid grid-cols-2 gap-2">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setDraftProfile({ ...preset.profile });
                  setValidationError("");
                }}
                className="text-left text-xs p-2 bg-white rounded border border-stone-300 hover:border-amber-600 hover:bg-amber-50/50 transition-colors font-medium text-stone-800 focus:ring-1 focus:ring-amber-500"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-stone-500 mt-2">
            These are examples only. Select one only if you want to test the app
            with sample information.
          </p>
        </div>

        {/* Form */}
        <form
          id="citizen-profile-form"
          onSubmit={handleSave}
          className="p-4 sm:p-6 space-y-4 flex-1"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectField(
              "profile-state",
              "State of Residence",
              draftProfile.state,
              STATES,
              "state",
            )}

            <div>
              <label htmlFor="profile-district" className={labelClass}>
                District *
              </label>

              {draftProfile.state === "Uttar Pradesh" ? (
                <select
                  id="profile-district"
                  required
                  value={draftProfile.district}
                  onChange={(event) =>
                    handleChange("district", event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="" disabled>
                    Select district
                  </option>

                  {UP_DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="profile-district"
                  required
                  type="text"
                  value={draftProfile.district}
                  onChange={(event) =>
                    handleChange("district", event.target.value)
                  }
                  placeholder="Enter district name"
                  className={inputClass}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectField(
              "profile-education",
              "Education Level",
              draftProfile.educationLevel,
              EDUCATION_LEVELS,
              "educationLevel",
            )}

            {selectField(
              "profile-occupation",
              "Primary Occupation",
              draftProfile.occupation,
              OCCUPATIONS,
              "occupation",
            )}
          </div>

          {/* Income */}
          <div>
            <label htmlFor="profile-income" className={labelClass}>
              Annual Family Income (INR) *
            </label>

            <input
              id="profile-income"
              type="number"
              required
              min="0"
              max="5000000"
              step="1000"
              value={draftProfile.annualIncome}
              onChange={(event) =>
                handleChange(
                  "annualIncome",
                  Math.max(0, Number(event.target.value) || 0),
                )
              }
              className={inputClass}
            />

            <span className="text-[11px] text-stone-500 mt-1 block">
              Enter your approximate annual family income.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectField(
              "profile-category",
              "Social Category",
              draftProfile.socialCategory,
              SOCIAL_CATEGORIES,
              "socialCategory",
            )}

            {selectField(
              "profile-gender",
              "Gender",
              draftProfile.gender,
              ["Female", "Male", "Other"],
              "gender",
            )}
          </div>

          {selectField(
            "profile-landholding",
            "Agricultural Landholding",
            draftProfile.landholding,
            LANDHOLDINGS,
            "landholding",
          )}

          {/* Disability */}
          <div className="pt-2 flex items-center space-x-2">
            <input
              id="profile-pwd"
              type="checkbox"
              checked={draftProfile.isDifferentlyAbled}
              onChange={(event) =>
                handleChange("isDifferentlyAbled", event.target.checked)
              }
              className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
            />

            <label
              htmlFor="profile-pwd"
              className="text-xs text-stone-700 font-medium"
            >
              Differently-Abled (Divyangjan) / Disability Certificate Holder
            </label>
          </div>

          {validationError && (
            <p role="alert" className="text-sm text-rose-700">
              {validationError}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-stone-600 hover:text-stone-900 flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear Form</span>
          </button>

          <button
            type="submit"
            form="citizen-profile-form"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-stone-950 font-bold rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};
