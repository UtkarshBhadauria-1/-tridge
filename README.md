# TRIDGE — AI-Powered Government Scheme Discovery Platform

**Discover schemes. Understand eligibility. Stay informed.**

TRIDGE is an AI-powered platform designed to simplify the discovery and understanding of government welfare schemes.

It combines scheme discovery, AI-assisted explanations, eligibility assessment, and personal scheme tracking in a single interface.

The platform helps users explore relevant schemes, understand their requirements, assess eligibility using an optional citizen profile, and save schemes for future reference.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Our Solution](#our-solution)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Eligibility Assessment](#eligibility-assessment)
- [Privacy and Data Handling](#privacy-and-data-handling)
- [Limitations](#limitations)
- [Future Enhancements](#future-enhancements)
- [Team](#team)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)

---

## Problem Statement

Government schemes provide financial assistance and other benefits to eligible citizens. However, discovering and understanding these schemes can be challenging.

Common challenges include:

- **Fragmented Information:** Scheme details are distributed across multiple government websites.
- **Complex Eligibility Criteria:** Citizens may struggle to interpret eligibility requirements.
- **Information Overload:** Finding relevant schemes can be time-consuming.
- **Limited Awareness:** Citizens may remain unaware of benefits they could qualify for.
- **Changing Information:** Scheme guidelines and details may change over time.

TRIDGE aims to make government scheme information easier to discover, understand, and track.

---

## Our Solution

TRIDGE provides an AI-assisted platform that helps users explore government schemes through a unified interface.

Users can search for relevant schemes, understand their requirements, assess eligibility using an optional citizen profile, and save schemes for future reference.

The platform also supports comparing saved scheme snapshots with subsequently retrieved information to identify potential changes.

---

## Key Features

### 1. Scheme Discovery
Search for government schemes using relevant queries and retrieve information from available online sources.

### 2. Eligibility Assessment
Evaluate available scheme eligibility criteria against an optional citizen profile.

Possible assessment outcomes include:

- **Eligible:** Available criteria appear to be satisfied.
- **Not Eligible:** One or more applicable criteria are not satisfied.
- **More Information Required:** Available information is insufficient for a reliable assessment.

### 3. AI-Assisted Explanations
Make scheme benefits, requirements, and eligibility conditions easier to understand.

### 4. Personal Scheme Tracking
Save schemes for future reference using browser-based storage.

### 5. Scheme Change Detection
Compare saved scheme snapshots with subsequently retrieved information to identify potential changes.

### 6. Optional Citizen Profile
Create a profile to support personalized eligibility assessments without requiring mandatory registration.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| TypeScript | Type-safe frontend development |
| Vite | Frontend development server and build tooling |
| Node.js | Backend runtime |
| Express.js | Backend APIs |
| TinyFish | Live web research and information retrieval |
| Google Gemini | AI-assisted explanations |
| Browser Local Storage | Local persistence of profile and tracked schemes |
| Git | Version control |
| GitHub | Source code hosting and collaboration |

---

## System Architecture

```text
                    USER
                      |
                      v
               REACT FRONTEND
                      |
                      | API Requests
                      v
              NODE.JS + EXPRESS
                      |
             +--------+--------+
             |                 |
             v                 v
          TINYFISH         GOOGLE GEMINI
          Web Research     AI Explanations
             |                 |
             +--------+--------+
                      |
                      v
             SCHEME PROCESSING
             AND ELIGIBILITY LOGIC
                      |
                      v
                SEARCH RESULTS

       BROWSER LOCAL STORAGE
       - Optional Citizen Profile
       - Personal Tracked Schemes

       BACKEND SCHEME SNAPSHOTS
       - Saved Scheme Information
       - Change Comparison