# TypeScript Type Issues - Post-MVP Cleanup

This document lists all known TypeScript issues that should be addressed after the MVP launch. These issues are currently being bypassed using the `build-force.sh` script.

## Common Issue Categories

1. **Enum Capitalization Mismatches**
   - Many instances of using lowercase enum values (e.g., `'completed'` instead of `'Completed'`)
   - Files affected: `analytics.controller.ts`, `training.controller.ts`, `user.controller.ts`

2. **Schema Field Mismatches**
   - Fields referenced that don't exist in the Prisma schema:
     - `actualDistance` (should use `distanceMeters`)
     - `actualDuration` (should use `durationSeconds`)
     - `completedDate` (unclear mapping in schema)
     - `title` (not in Workout model)
     - `trainingPlanId` in Workout (should be `planWeekId`)

3. **Relationship Field Mismatches**
   - TrainingPlan -> Workouts: TrainingPlan relates to PlanWeek, which relates to Workout
   - Plan "settings" (seems to be a mix of fields from Goal, PlanPreferences, etc.)

4. **Missing/Incorrect Types**
   - `WorkoutType.Run` doesn't exist (should be one of the defined enum values)
   - `userId` property in Workout model doesn't exist

5. **Authentication Issues**
   - JWT decoded payload type mismatch with `AuthenticatedUser`
   - Missing `role` property in `req.user`

6. **Import Issues**
   - Missing esModuleInterop flag for certain imports (express, bcrypt)

## Files Needing Fixes

1. **analytics.controller.ts**
   - Lines with errors: 24, 31, 39, 50, 56, 60, 66, 72, 76, 82, 85, 90, 166, 173, 177, 194, 202, 203, 261, 272, 273, 277, 278, 295, 322, 327, 328, 332, 333, 348, 395, 398, 426, 428, 433, 434, 459, 460, 475, 476

2. **training.controller.ts**
   - Lines with errors: 38, 70, 187, 236, 305, 343, 355, 404, 406, 473, 530, 541, 593, 604

3. **user.controller.ts**
   - Lines with errors: 3, 38, 83, 91, 204, 219, 258, 298, 306, 312, 320, 326, 331, 332, 335, 352, 442, 458

4. **middleware/auth.ts**
   - Lines with errors: 33, 64, 90

5. **routes/analytics.routes.ts**
   - Lines with errors: 1

6. **services/training.service.ts**
   - Lines with errors: 140, 141, 154, 180, 198, 357

## Key Fixes Required Post-MVP

1. **Update Field Names**
   - Create consistent mapping from schema fields to code variable names
   - Ensure relationship traversals are correctly implemented

2. **Correct Enum Usage**
   - Update all enum references to use proper capitalization
   - Review and correct any incorrect enum values

3. **Fix Types**
   - Create/update interfaces to match Prisma schema
   - Define proper types for authentication and API request/response objects

4. **Clean Up Configuration**
   - Update TypeScript configuration to enable esModuleInterop
   - Ensure consistent module resolution across the codebase

## Strategy for Post-MVP Cleanup

1. Create comprehensive test coverage for existing functionality
2. Address one file/component at a time to minimize risk
3. Verify both build and runtime functionality after each change
4. Consider using Prisma's generated types more explicitly

## Impact of These Issues

While these type issues prevent proper TypeScript compilation, they may or may not cause runtime errors. The `build-force.sh` script allows us to transpile the code without type checking, but this increases the risk of runtime errors if the actual schema fields don't match what the code expects. 