# Vici Development Guide

## Build Process & TypeScript Error Handling

### Current Situation

The project currently has known TypeScript errors that prevent a standard build from completing successfully. These errors are primarily related to:

1. Schema field mismatches between code and Prisma models
2. Enum capitalization issues (`'completed'` vs `'Completed'`)
3. Incorrect relationship traversals in controllers
4. Missing/incorrect types, especially in API models

For the MVP phase, we've adopted a pragmatic approach that allows development to continue while deferring comprehensive type fixes until after the MVP launch.

### Using the build-force Script

We've created a script that bypasses TypeScript type checking during the build process:

```bash
# From the root directory
cd packages/api && bash ../shared/scripts/build-force.sh

# Or from packages/api directory
bash ../shared/scripts/build-force.sh
```

This script uses Babel to transpile the TypeScript code without performing type checking, allowing development to continue despite type errors.

### When to Fix Type Errors vs. Using the Workaround

- **Fix immediately:**
  - Errors that cause runtime failures
  - Simple fixes like obvious enum capitalization issues
  - Errors in critical new code needed for MVP features

- **Defer using build-force:**
  - Complex schema relationship mismatches
  - Field name discrepancies that would require extensive refactoring
  - Any fixes that would significantly delay the MVP timeline

### Documentation of Known Issues

All known TypeScript issues are documented in `docs/TYPE_ISSUES.md`. This file provides:

1. Categories of issues (enum capitalization, schema field mismatches, etc.)
2. Files affected and specific line numbers
3. Recommended fixes for each category
4. Strategy for post-MVP cleanup

### Post-MVP Clean-up Strategy

After the MVP launch, TypeScript issues should be addressed systematically:

1. Create comprehensive test coverage for existing functionality
2. Address one file/component at a time starting with core services
3. Verify both build and runtime functionality after each change
4. Make more extensive use of Prisma's generated types

This approach is tracked in the MVP Project Tracker under Phase 7 as "Comprehensive TypeScript Type Fixes."

## Development Workflow

1. **Adding new features:**
   - Write TypeScript code with proper types for new code
   - Use the build-force script to bypass checking for the entire codebase
   - Document any new TypeScript issues in `docs/TYPE_ISSUES.md`

2. **Fixing existing code:**
   - Focus only on critical runtime issues
   - Use the build-force script to verify functionality
   - Run both standard build and force build to see progress on type errors

3. **Testing:**
   - Focus on functional testing of API endpoints
   - Verify that data is correctly processed despite type issues
   - Document any discrepancies between schema and code models

## Common Issues & Solutions

### Schema Field Mismatches

Many controllers reference fields like `actualDistance` that don't exist in the Prisma schema (which uses `distanceMeters`). When encountering these issues:

1. For MVP: Continue using build-force
2. Post-MVP: Either rename fields in the controllers or add computed properties to the models

### Enum Capitalization

Many enum values are referenced with incorrect capitalization:

```typescript
// Incorrect
status: 'completed'

// Correct
status: 'Completed'
```

These can be fixed as encountered without major risk.

### Missing relationship traversals

TrainingPlan doesn't directly relate to Workouts, but must go through PlanWeek. When encountering these issues:

1. For MVP: Continue using build-force
2. Post-MVP: Update the queries to correctly traverse relationships 