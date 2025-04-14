# Vici Backend Integration - Hand-off Summary

**Date:** 2025-07-26 
**Current Branch:** `fix/shared-package-build` (Created from `feat/backend-integrations` to isolate shared package fixes)
**Context:** This document summarizes the state of the backend development, focusing on the implementation of Strava and LLM integrations for the MVP, following extensive troubleshooting of build and environment issues.

## I. Recent Accomplishments (Backend Features Implemented):

Despite significant build challenges, considerable progress was made on implementing core backend features:

*   **Strava Integration (`StravaService`, Controllers, Routes):**
    *   **OAuth 2.0 Flow:** Implemented the complete user authorization flow (`/connect`, `/callback`).
    *   **CSRF Protection:** Implemented `state` parameter validation using a dedicated `StravaAuthState` Prisma model (added to schema via `db push`).
    *   **Token Management:** Implemented secure token exchange (`code` for access/refresh tokens), storage (using `UserConnection` model via Prisma `upsert`), and automatic token refresh logic (`getValidAccessToken`, `refreshAccessToken`).
    *   **Initial Athlete Data Fetch:** Implemented logic to fetch basic athlete data upon successful connection.
    *   **User Profile Update:** Created `UserService` and added logic (`updateProfileFromStrava`) to update Vici `User` profiles (name, picture, gender) based on fetched Strava athlete data.
    *   **Initial Activity Sync (Background Job):**
        *   Set up an asynchronous flow using a dedicated job endpoint (`/api/jobs/strava-initial-sync`).
        *   Implemented the core service logic (`fetchAndStoreStravaActivities`) to fetch activity history using pagination, filter for Runs, map data to the Prisma `Activity` model, and store using `upsert`. Refined with basic error handling and rate limit delay.
        *   Implemented the trigger mechanism (`triggerInitialActivitySync`) called from the OAuth callback.
    *   **Ongoing Activity Sync (Webhooks):**
        *   Set up webhook endpoints (`GET /api/webhooks/strava` for verification, `POST` for events).
        *   Implemented the verification handshake logic.
        *   Implemented event handling logic (`handleEvent`) to receive activity create/update/delete events and athlete deauthorization events.
        *   Added service methods (`findViciUserIdByStravaId`, `fetchAndStoreSingleActivity`, `deleteActivity`, `handleDeauthorization`) to process these events asynchronously.
    *   **Basic Integration Tests:** Added initial integration tests (`strava.integration.test.ts`) using Jest and Supertest for the `/connect` and `/callback` endpoints, mocking the service layer.

*   **LLM Integration (`LLMService`, `TrainingService`, Controllers, Routes):**
    *   **Setup:** Installed Google AI SDK (`@google/generative-ai`), added API key to `.env`.
    *   **`LLMService`:** Created service, initialized Gemini client, added placeholder methods (`generateTrainingPlan`, `handleAskVici`) with detailed prompt building (`buildTrainingPlanPrompt`, `buildAskViciPrompt`) and response parsing (`parsePlanFromResponse`, `parseAskViciResponse`) logic. Refined prompts to use enhanced context.
    *   **Response Validation:** Integrated `zod` to define a schema (`llmPlanResponseSchema`) and validate the JSON structure returned by the LLM for plan generation.
    *   **`TrainingService`:** Created service. Implemented `createTrainingPlanPreview` method to:
        *   Gather user profile and refined activity history (16 weeks of summaries + key recent runs).
        *   Call `LLMService.generateTrainingPlan`.
        *   Perform detailed mapping of the validated LLM JSON response to Prisma `create` operations for `TrainingPlan`, `PlanWeek`, and `Workout` (including nested creates and enum handling).
        *   Save the generated plan with `Preview` status.
    *   **Plan Approval Flow:** Implemented `approveTrainingPlan` service method and corresponding API endpoint (`POST /api/training/plans/:planId/approve`) and controller logic to change plan status from `Preview` to `Active`.
    *   **Ask Vici Flow:** Implemented `handleAskViciRequest` service method to gather context (plan, profile, current week data) and call `LLMService.handleAskVici`. Implemented corresponding API endpoint (`POST /api/training/plans/:planId/ask-vici`) and controller logic. Refined prompt/parsing for MVP (text-based response).

*   **Database:**
    *   Successfully used `prisma db push --accept-data-loss` to synchronize the database schema (including `StravaAuthState` table and unique constraint on `UserConnection`) with the `schema.prisma` file, resolving persistent migration history conflicts.
    *   Regenerated Prisma Client successfully after schema sync.

*   **Build Environment:**
    *   Fixed various `dotenv` loading issues.
    *   Fixed numerous TypeScript import/type errors in `api`, `services`, and `database` packages.
    *   Identified and fixed configuration issue in `turbo.json` (`pipeline` -> `tasks`).
    *   Configured `tsconfig.json` in `shared` package to include `jsx: "react-native"`.
    *   Added missing dependencies (`react-native` peer dep, `date-fns`) to `shared` package.
    *   Successfully built `@vici/database` and `@vici/services` packages individually *after* temporarily excluding/fixing build errors in dependency/seed files.
    *   Corrected inter-package imports (e.g., `@vici/services/backend` -> `@vici/services`).
    *   Performed aggressive cleaning of build artifacts (`dist`, `node_modules`, `.turbo`, `.tsbuildinfo`) and reinstalled dependencies.

*   **Git:**
    *   Configured SSH key authentication.
    *   Renamed development branch to `feat/backend-integrations`.
    *   Created and switched to `fix/shared-package-build` branch to isolate build fixes.
    *   Committed all recent changes (features and troubleshooting steps) to `fix/shared-package-build`.

## II. Current Blocking Issue:

*   **The primary blocker is that the `@vici/shared` package fails to build.**
*   Running `npx turbo run build` from the root fails because the `@vici/shared#build` task exits with errors.
*   **Error Details:** The build output shows ~101 TypeScript errors within `packages/shared/src`, primarily:
    *   `TS2307: Cannot find module '...'`: Errors resolving internal relative imports (e.g., `../../../hooks/useTheme`). This strongly suggests the TypeScript path alias configuration (`@/*`) is not working correctly during compilation, despite appearing correct in `tsconfig.json`.
    *   Type Errors (e.g., `TS2322`, `TS2339`): Mismatches between component props, hook usage, and expected types.
    *   `TS2308: Module already exported...`: Ambiguous re-exports from index files.
    *   `TS2306: File ... is not a module`: Issues likely related to syntax errors or incorrect exports preventing files from being recognized as modules.
*   **Impact:** Because other packages (`api`, `services`, potentially `mobile`) depend on `@vici/shared`, the monorepo build fails. The API server cannot start because it cannot resolve modules imported from `@vici/shared`.

## III. Troubleshooting Steps Attempted (Summary):

*   Fixed numerous individual TypeScript errors across `api`, `services`, `database` packages.
*   Attempted to resolve Prisma migration history desync using `migrate resolve --applied` and `--rolled-back` (failed due to inconsistent state reporting).
*   Successfully used `prisma db push --accept-data-loss` (twice) to force the database schema to match the `schema.prisma` file.
*   Attempted various `dotenv.config()` path configurations before settling on preloading via `-r dotenv/config` in the API dev script.
*   Performed aggressive cleaning (`rm -rf node_modules`, `dist`, `.turbo`, `.tsbuildinfo`) and reinstalled dependencies from root (`yarn install`).
*   Added missing dependencies (`react-native`, `date-fns`) to `shared` package.
*   Added `"jsx": "react-native"` to `shared` package's `tsconfig.json`.
*   Added TypeScript project `references` to `services` package's `tsconfig.json`.
*   Temporarily excluded/fixed the database seed script to allow `@vici/database` to build.
*   Corrected inter-package imports (e.g., `@vici/services/backend` -> `@vici/services`).

## IV. Recommended Next Steps:

*   **You are currently on the `fix/shared-package-build` branch.**
*   **Primary Goal:** Resolve the 101 build errors in the `@vici/shared` package.
*   **Action 1 (Crucial - Manual Effort Needed): Fix Module Resolution Errors (`TS2307`)**
    1.  Run `npx turbo run build --filter=@vici/shared` from the root to get the fresh list of errors.
    2.  Focus on the `TS2307: Cannot find module '../../../hooks/...'` (and similar) errors.
    3.  **Manually edit** the affected `.tsx` files within `packages/shared/src`.
    4.  **Replace relative internal imports with the path alias**:
        *   Change `import { useTheme } from '../../../hooks/useTheme';` TO `import { useTheme } from '@/hooks/useTheme';`
        *   Change `import { Button } from '../../core/Button';` TO `import { Button } from '@/components/core/Button';`
        *   Apply this systematically for all internal hooks, components, utils, etc., reported in the errors.
    5.  Verify the `baseUrl` and `paths` in `packages/shared/tsconfig.json` are correct (`"baseUrl": ".", "paths": { "@/*": ["src/*"] }` looks standard).
*   **Action 2: Fix Export Ambiguities (`TS2308`)**
    1.  Examine the `index.ts` files mentioned in these errors (e.g., `packages/shared/src/components/index.ts`).
    2.  Identify the duplicate exports (e.g., both `core` and `form` export `CheckboxGroup`).
    3.  Resolve the ambiguity by either removing one `export * from ...` line or using explicit named exports (`export { CheckboxGroup } from './core';` or `export { CheckboxGroup as FormCheckboxGroup } from './form';`).
*   **Action 3: Fix Remaining Type Errors (`TS2322`, `TS2339`, etc.)**
    1.  Address the errors related to incorrect component props, hook usage, implicit 'any' types, etc., within the shared components and hooks. This requires understanding the intended logic of the shared code.
*   **Action 4: Verify `@vici/shared` Build**
    1.  Run `npx turbo run build --filter=@vici/shared` frequently while fixing errors until it completes successfully.
*   **Action 5: Verify Full Monorepo Build**
    1.  Run `npx turbo run build` from the root. Ensure all packages build without errors.
*   **Action 6: Test API Server**
    1.  Navigate to `packages/api`.
    2.  Run `npm run dev`. Verify the server starts successfully and listens on the port.
*   **Action 7: Proceed with Testing**
    1.  Generate a JWT for a test user.
    2.  Use `curl` (or Postman/Insomnia) to test the `POST /api/training/plans` endpoint with sample data.
    3.  Analyze logs, LLM output, and database state.
    4.  Iteratively refine LLM prompts (`llm.service.ts`) and data mapping (`training.service.ts`) based on test results.
    5.  Test the Ask Vici endpoint (`POST /api/training/plans/:planId/ask-vici`).
*   **Action 8 (Optional but Recommended):**
    1.  Address the peer dependency warnings noted during `yarn install`.
    2.  Fix and re-enable the database seed script (`packages/database/src/seeders/seed.ts`).
    3.  Add more comprehensive automated tests (integration, unit) for the new features.
    4.  Commit the fixes for `@vici/shared` to the `fix/shared-package-build` branch. Consider merging this fix branch back into `feat/backend-integrations` once the build is clean.

---

This document provides a snapshot of the current state and a clear path forward for resolving the build blockers. 