# TRIDGE
### AI-Powered Government Scheme Discovery & Eligibility Platform

**Discover schemes. Understand eligibility. Stay informed.**

TRIDGE is an AI-powered platform designed to simplify the discovery and understanding of government welfare schemes. It combines scheme discovery, AI-assisted explanations, eligibility assessment, and personal scheme tracking in a single interface.

The platform helps users explore relevant schemes, understand eligibility requirements, evaluate their circumstances against available criteria, and save schemes for future reference.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Our Solution](#our-solution)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
  - [Deployment Architecture](#deployment-architecture)
  - [Step 1: Prepare the Repository](#step-1-prepare-the-repository)
  - [Step 2: Deploy the Backend on Render](#step-2-deploy-the-backend-on-render)
  - [Step 3: Configure the Backend API URL](#step-3-configure-the-backend-api-url)
  - [Step 4: Deploy the Frontend on Vercel](#step-4-deploy-the-frontend-on-vercel)
  - [Step 5: Configure CORS](#step-5-configure-cors)
  - [Step 6: Verify the Deployment](#step-6-verify-the-deployment)
- [Eligibility Assessment](#eligibility-assessment)
- [Privacy and Data Handling](#privacy-and-data-handling)
- [Limitations](#limitations)
- [Future Enhancements](#future-enhancements)
- [Team](#team)
- [Contributing](#contributing)
- [License](#license)
- [Disclaimer](#disclaimer)

---

## Overview

Government schemes can provide important financial assistance and other benefits, but finding relevant information and understanding eligibility requirements can be difficult.

TRIDGE aims to make this process easier by bringing scheme search, AI-assisted explanations, eligibility assessment, and scheme tracking into one accessible platform.

### Our Vision

Make government scheme information easier to discover, understand, and use.

### Our Mission

Help users explore potentially relevant government benefits through a simpler and more informative digital experience.

---

## Problem Statement

Citizens often face several challenges when trying to discover government schemes.

### 1. Fragmented Information

Scheme information is distributed across multiple government websites and portals.

### 2. Complex Eligibility Criteria

Eligibility conditions can depend on factors such as income, occupation, location, category, and other scheme-specific requirements.

### 3. Information Overload

Finding relevant schemes among numerous programs can be time-consuming.

### 4. Limited Awareness

Citizens may remain unaware of schemes that could be relevant to their circumstances.

### 5. Changing Information

Scheme guidelines, benefits, application requirements, and other details may change over time.

**The challenge:** Make scheme information easier to discover and understand without requiring users to navigate multiple sources manually.

---

## Our Solution

TRIDGE combines web research and AI-assisted processing to help users explore government schemes through a unified interface.

Users can:

- Search for government schemes.
- Review available scheme information.
- Understand scheme benefits and requirements.
- Evaluate eligibility using an optional citizen profile.
- Save schemes for future reference.
- Identify potential changes in saved scheme information.

TRIDGE is designed to provide an accessible starting point for scheme discovery while encouraging users to verify important details against official government sources.

---

## Key Features

### 1. Scheme Discovery

Search for government schemes using relevant queries and retrieve information from available online sources.

### 2. Eligibility Assessment

Evaluate available scheme criteria against an optional citizen profile.

The assessment distinguishes between matched, unmet, and uncertain criteria to help users understand the result.

Possible outcomes include:

- **Eligible:** Available criteria appear to be satisfied.
- **Not Eligible:** One or more applicable criteria are not satisfied.
- **More Information Required:** The available profile or scheme information is insufficient for a reliable assessment.

These outcomes are informational and are not official eligibility determinations.

### 3. AI-Assisted Explanations

Use AI-assisted explanations to make scheme benefits, requirements, and eligibility conditions easier to understand.

### 4. Personal Scheme Tracking

Save schemes for future reference.

Personal tracked schemes are stored in browser Local Storage, allowing them to persist across page refreshes in the same browser and website origin.

### 5. Scheme Change Detection

Compare saved scheme snapshots with subsequently retrieved information to identify potential changes that may require attention.

Detected changes should be verified against the relevant source.

### 6. Optional Citizen Profile

Users can create an optional profile to support personalized eligibility assessments.

Basic scheme discovery does not require mandatory registration.

### 7. Accessible User Interface

The interface brings search, scheme results, eligibility information, and personal tracking together in a single workflow.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| TypeScript | Type-safe application development |
| Vite | Frontend development and build tooling |
| Node.js | Backend JavaScript runtime |
| Express.js | Backend API and request handling |
| TinyFish | Live web research and information retrieval |
| Google Gemini | AI-assisted explanations |
| Browser Local Storage | Persistence of profile and personal tracked schemes |
| Git | Version control |
| GitHub | Source code hosting and collaboration |
| Vercel | Proposed frontend hosting |
| Render | Proposed backend hosting |

The hosting providers above are deployment recommendations. They are not required dependencies of the application.

---

## System Architecture

TRIDGE follows a frontend-backend architecture.

```text
                       USER
                         |
                         v
                +------------------+
                |  React Frontend  |
                |                  |
                | - Scheme Search  |
                | - Profile        |
                | - Eligibility    |
                | - Tracking       |
                +--------+---------+
                         |
                         | HTTP API Requests
                         v
                +------------------+
                | Node.js +        |
                | Express Backend |
                +--------+---------+
                         |
              +----------+----------+
              |                     |
              v                     v
       +--------------+     +----------------+
       |   TinyFish   |     | Google Gemini  |
       | Web Research |     | AI Explanations|
       +------+-------+     +--------+-------+
              |                      |
              +----------+-----------+
                         |
                         v
                +------------------+
                | Scheme Processing|
                | and Eligibility  |
                | Logic             |
                +--------+---------+
                         |
                         v
                  Search Results
                         |
                         v
                  React Frontend
```

### Browser Storage

The frontend uses browser Local Storage for:

- Optional citizen profile.
- Personal tracked schemes.

### Backend Scheme Snapshots

The backend maintains scheme snapshots to support comparison and potential change detection.

These snapshots are separate from the user's personal tracked-scheme list.

### Architecture Notes

- Private API credentials must remain on the backend.
- The frontend communicates with backend APIs using HTTP requests.
- Eligibility assessments depend on available scheme criteria and user-provided information.
- Actual request routing depends on the implementation in the application code.

---

## Project Structure

The repository contains the frontend, backend, configuration files, and supporting data.

```text
Tridge2.0/
├── src/
│   ├── components/
│   ├── utils/
│   └── App.tsx
│
├── server/
├── data/
├── index.html
├── server.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── metadata.json
├── .env.example
├── .gitignore
└── README.md
```

The tree above is illustrative. Update it if the actual directory structure differs.

---

# Getting Started

## Prerequisites

Install the following software:

- [Node.js](https://nodejs.org/)
- npm, included with Node.js
- [Git](https://git-scm.com/)
- A GitHub account for repository access

You will also need valid credentials for the external services used by your application.

---

## Environment Configuration

TRIDGE may require API credentials for external research and AI services.

### 1. Create the Environment File

From the project root:

```bash
cp .env.example .env
```

If the project does not contain an `.env.example` file, create `.env` manually.

### 2. Configure Required Variables

Add the variables required by your backend.

For example, the configuration may resemble:

```env
# Example only.
# Use the exact variable names expected by your application.

TINYFISH_API_KEY=your_tinyfish_api_key
GEMINI_API_KEY=your_gemini_api_key
```

**Important:** These variable names are examples, not a guarantee of the names used in your code. Check `server.ts` and the related configuration files before using them.

### Security Guidelines

- Never commit `.env` to GitHub.
- Never hardcode API credentials in source files.
- Never expose private API keys through frontend code.
- Do not use private API credentials in Vite variables prefixed with `VITE_`.
- Keep `.env.example` limited to variable names and safe placeholder values.
- If an API key is accidentally published, revoke or rotate it immediately.

The project `.gitignore` should include:

```gitignore
node_modules/
build/
dist/
coverage/
.DS_Store
*.log
.env*
!.env.example
```

---

# Running Locally

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd tridge
```

Replace the placeholder with the actual repository URL and use the correct directory name.

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create `.env` and add the required API credentials, as described in the [Environment Configuration](#environment-configuration) section.

## 4. Inspect Available Commands

```bash
npm run
```

This displays the scripts configured in `package.json`.

## 5. Start the Application

If `npm run dev` starts the frontend and backend as configured:

```bash
npm run dev
```

If the application requires separate frontend and backend processes, start each one using the corresponding scripts in `package.json`.

## 6. Open the Application

Vite commonly serves the frontend at:

```text
http://localhost:5173
```

Use the actual URL printed in the terminal if it differs.

---

# Deployment

The following setup separates the frontend and backend:

- **Frontend:** Vercel
- **Backend:** Render
- **Source code:** GitHub

Official documentation:

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Vite Deployment Guide](https://vite.dev/guide/static-deploy.html)

> **Before deployment:** Verify that your backend has a production start command, reads the assigned port, loads environment variables, and accepts requests from the deployed frontend. The commands below must match the actual application configuration.

## Deployment Architecture

```text
                 PUBLIC INTERNET
                        |
              +---------+---------+
              |                   |
              v                   v
      +---------------+   +----------------+
      | Vercel        |   | Render         |
      | React + Vite  |-->| Express API    |
      | Frontend      |   | Backend        |
      +---------------+   +-------+--------+
                                  |
                       +----------+----------+
                       |                     |
                       v                     v
                 +-----------+        +-------------+
                 | TinyFish  |        | Gemini      |
                 | API       |        | API         |
                 +-----------+        +-------------+
```

The frontend sends requests to the backend. The backend accesses external services using credentials configured in its environment.

---

## Step 1: Prepare the Repository

### A. Verify the Git Ignore Rules

From the project directory:

```bash
cd ~/Downloads/Tridge2.0
```

Check whether `.env` exists:

```bash
ls -la .env
```

Verify that Git ignores it:

```bash
git check-ignore .env
```

The expected output is:

```text
.env
```

If Git reports that the file is not ignored, correct `.gitignore` before committing.

### B. Initialize Git if Necessary

If the project is not already a Git repository:

```bash
git init
```

### C. Create a GitHub Repository

1. Open [GitHub New Repository](https://github.com/new).
2. Choose the repository name `tridge`.
3. Add a description.
4. Select the desired visibility.
5. If the local project already has a README, leave GitHub's README initialization unchecked.
6. Create the repository.

### D. Commit and Push the Project

Stage the files:

```bash
git add .
git status
```

Inspect the staged changes. Ensure `.env`, private credentials, and other secrets are not included.

Commit:

```bash
git commit -m "Initial commit: TRIDGE platform"
git branch -M main
```

Add the remote repository:

```bash
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
```

Push the code:

```bash
git push -u origin main
```

If a remote is already configured, inspect it first:

```bash
git remote -v
```

Do not add a duplicate remote.

---

## Step 2: Deploy the Backend on Render

### A. Create a Web Service

1. Open [Render](https://render.com/).
2. Sign in and connect your GitHub account.
3. Select **New → Web Service**.
4. Choose the TRIDGE repository.
5. Configure the service to use the backend entry point.

Example settings:

| Setting | Example |
|---|---|
| Runtime | Node.js |
| Root Directory | Repository root |
| Build Command | `npm install` |
| Start Command | Must match the production backend script |

The build and start commands must match your actual `package.json` and TypeScript configuration.

For example, if your project defines a production script named `start`, you might use:

```bash
npm run start
```

Do not use this command unless the script exists and correctly starts the production backend.

### B. Configure Backend Environment Variables

In Render, open your service's environment-variable settings.

Add the credentials required by the application, for example:

```text
TINYFISH_API_KEY = your_actual_tinyfish_api_key
GEMINI_API_KEY = your_actual_gemini_api_key
```

Use the exact variable names expected by your backend.

Do not add private API keys to frontend environment variables.

### C. Configure the Listening Port

The Express application should listen on the port assigned by the hosting provider.

A typical pattern is:

```typescript
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```

Adapt this to the existing backend entry point. Do not add a second server listener if one already exists.

### D. Deploy

Trigger the deployment in Render.

After a successful deployment, copy the public backend URL.

Example format:

```text
https://your-tridge-backend.onrender.com
```

Your actual hostname will be assigned by Render.

### E. Test the Backend

Open the backend URL in a browser.

If your application exposes a health endpoint, test that endpoint as well.

A dedicated health endpoint is useful for monitoring deployment status, but do not assume one exists unless it is implemented.

---

## Step 3: Configure the Backend API URL

The frontend must use the deployed backend URL in production.

If your frontend does not already support configurable API URLs, adapt its existing API configuration to use a Vite environment variable.

For example:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
```

Use this base URL consistently when constructing backend API requests.

The exact changes depend on how API calls are currently implemented in your application.

### Configure the Production Variable

In Vercel, you will configure:

```text
VITE_API_BASE_URL=https://your-tridge-backend.onrender.com
```

Replace the example hostname with the actual Render URL.

**Security:** Vite variables prefixed with `VITE_` are exposed to browser code. Never store TinyFish or Gemini private API keys in them.

---

## Step 4: Deploy the Frontend on Vercel

### A. Import the GitHub Repository

1. Open [Vercel](https://vercel.com/).
2. Sign in.
3. Select **Add New → Project**.
4. Import the TRIDGE GitHub repository.
5. Configure the project for Vite.

Example settings:

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | Repository root |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

These settings assume `package.json` and `vite.config.ts` are in the repository root.

### B. Configure Environment Variables

In the Vercel project settings, add:

```text
VITE_API_BASE_URL=https://your-tridge-backend.onrender.com
```

Replace the example URL with the actual backend URL.

Add the variable to the appropriate deployment environment and redeploy if you change it after deployment.

Do not add backend API keys to Vercel.

### C. Deploy

Click **Deploy**.

Vercel will install dependencies, build the frontend, and publish the resulting application.

After deployment, copy the public frontend URL.

Example:

```text
https://your-tridge-frontend.vercel.app
```

Your actual URL may differ.

---

## Step 5: Configure CORS

The backend must permit requests from the deployed frontend origin.

If your backend uses Express and the `cors` package, a configuration might resemble:

```typescript
import cors from 'cors';

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);
```

Adapt this example to your existing middleware configuration and ensure CORS middleware is applied before the API routes.

### Configure the Frontend Origin in Render

Set:

```text
FRONTEND_URL=https://your-tridge-frontend.vercel.app
```

Replace the example with your actual Vercel URL.

If local development also requires cross-origin requests, configure the allowed development and production origins appropriately.

Do not use unrestricted CORS as a substitute for production configuration.

Redeploy the backend after changing its environment variables or code.

---

## Step 6: Verify the Deployment

After both services are deployed, test the complete application.

### Frontend

- The landing page loads.
- The browser console contains no unexpected errors.
- The interface works on desktop and mobile screen sizes.

### Backend

- The backend starts successfully.
- API requests reach the backend.
- Environment variables are configured.
- External service calls work with valid credentials.

### Scheme Functionality

- Search returns relevant results.
- Scheme information is displayed correctly.
- AI-assisted explanations work.
- Eligibility assessment handles missing profile information correctly.
- Personal tracked schemes persist after refreshing the page.
- Scheme snapshots are saved as expected.
- Change detection works when comparable snapshot data is available.

### Security

- Private API keys are not exposed in browser code.
- `.env` is not committed to GitHub.
- CORS permits the intended frontend origin.
- Error responses do not reveal sensitive credentials.

---

## Updating the Deployed Application

When you make changes locally:

```bash
git add .
git commit -m "Describe the changes"
git push
```

If Vercel and Render are connected to GitHub for automatic deployments, a push to the configured branch can trigger a new deployment.

Check each provider's deployment dashboard to confirm that the build succeeds.

If automatic deployment is disabled, deploy manually through the provider's dashboard or CLI.

---

## Optional: Build the Frontend Locally

To verify that the frontend can be built:

```bash
npm run build
```

For a Vite application, the generated static assets are commonly written to:

```text
dist/
```

Preview the production build locally if the project has a preview script:

```bash
npm run preview
```

Use the URL printed by Vite.

A successful frontend build does not necessarily confirm that the backend will deploy successfully.

---

## Troubleshooting

### 1. Frontend Loads but Search Fails

Possible causes:

- Incorrect `VITE_API_BASE_URL`.
- Backend service is unavailable.
- CORS is misconfigured.
- Backend environment variables are missing.
- API requests still target `localhost`.

Check the browser's Network tab and the backend logs.

### 2. Backend Fails to Start

Possible causes:

- Incorrect production start command.
- TypeScript compilation errors.
- Missing dependencies.
- Incorrect entry-point path.
- Port configuration problems.

Check the deployment logs and verify the production scripts in `package.json`.

### 3. AI Explanations Fail

Possible causes:

- Missing or invalid API credentials.
- Incorrect environment variable names.
- External service quota or availability issues.
- Backend request errors.

Check the backend logs without printing private credentials.

### 4. Browser Storage Appears Empty

Personal tracked schemes and profile data are stored in the browser.

They may not appear when using a different browser, device, website origin, or private browsing session.

### 5. API Keys Appear in Git History

Removing a key from the current file does not remove it from previous commits.

Immediately revoke or rotate the exposed key. Then review the repository history and take appropriate remediation steps.

---

# Eligibility Assessment

TRIDGE compares available scheme eligibility criteria with relevant attributes from the optional citizen profile.

The assessment may consider attributes such as:

- State or location
- Occupation
- Income
- Category
- Other scheme-specific attributes

The platform distinguishes between matched, unmet, and uncertain criteria to make the assessment easier to understand.

**Important:** TRIDGE provides informational assessments, not official eligibility determinations. Final eligibility depends on the applicable scheme guidelines and verification by the responsible government authority.

---

# Privacy and Data Handling

TRIDGE supports basic use without mandatory registration.

- The citizen profile is optional.
- Profile information and personal tracked schemes are stored in browser Local Storage.
- Browser storage is associated with the browser and website origin.
- Clearing browser storage may remove locally persisted profile and tracking data.
- Data stored in one browser is not automatically synchronized to another device.
- Backend scheme snapshots are separate from the personal tracking list.
- API credentials should remain in backend environment variables.

Users should verify scheme information through official government sources before making decisions.

---

# Limitations

TRIDGE is an evolving project, and its results depend on the availability and quality of retrieved information.

- Source coverage may vary.
- Retrieved information may be incomplete or outdated.
- AI-generated explanations may contain errors.
- Eligibility assessments depend on available criteria and user-provided information.
- Detected changes may require manual verification.
- The platform does not replace official government eligibility decisions.

---

# Future Enhancements

Potential future improvements include:

- Expanded coverage of central and state government schemes.
- Improved source verification and attribution.
- Stronger eligibility-rule validation.
- Multilingual scheme explanations.
- Notifications for meaningful changes in tracked schemes.
- Better handling of incomplete or conflicting information.
- Automated testing, monitoring, and performance improvements.

These items are proposed enhancements and should not be interpreted as implemented features unless they are available in the current version.

---

# Team

TRIDGE is a collaborative project developed by a team of three.

| Team Member | Contribution |
|---|---|
| Member 1 | Add name and responsibilities |
| Member 2 | Add name and responsibilities |
| Member 3 | Add name and responsibilities |

Replace these placeholders with your team's actual names and contributions.

---

# Contributing

Contributions are welcome.

1. Fork or clone the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Commit using a descriptive message.
5. Open a pull request for review.

Example:

```bash
git checkout -b feature/your-feature
git add .
git commit -m "Describe your changes"
git push -u origin feature/your-feature
```

Never commit environment files, private API keys, or other sensitive information.

---

# License

No license has been specified yet.

Add an appropriate license if you intend to permit public reuse and redistribution of the project.

---

# Disclaimer

TRIDGE is an informational platform and is not affiliated with or endorsed by a government authority unless explicitly stated.

Scheme details and eligibility assessments should be verified against official scheme guidelines and the relevant government department.

---

**TRIDGE — Discover. Understand. Track.**