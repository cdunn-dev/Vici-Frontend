# Build Issues Tracker

This document tracks the current build issues in the Vici app and their status. Use this as a reference for ongoing work.

## Current Status

- **Build Status**: ⚠️ Failing
- **Last Attempt**: [Date]
- **Primary Issues**: Duplicate implementations, import conflicts, missing files

## Critical Issues

| Issue | Status | Solution | Owner |
|-------|--------|----------|-------|
| Duplicate AuthViewModel implementations | In Progress | Consolidate into single implementation | |
| TrainingPlanView import conflicts | In Progress | Simplify view and update imports | |
| Missing referenced files in project.pbxproj | In Progress | Update project file or restore files | |
| Circular dependencies between ViewModels | Identified | Refactor to use protocols or dependency injection | |
| Multiple declarations of core models | In Progress | Implement single source of truth with proper access control | |

## Temporary Fixes

| Fix | Status | Located At | Permanent Solution | Priority |
|-----|--------|------------|-------------------|----------|
| AuthViewModel_Fixed | Implemented | FixedFiles/AuthViewModel_Fixed.swift | Proper AuthViewModel implementation | High |
| ImportFix.swift | Implemented | FixedFiles/ImportFix.swift | Proper import structure across app | High |
| Simplified AuthenticationView | Implemented | AuthenticationView.swift | Full implementation with proper imports | Medium |
| Simplified MainTabView | Implemented | MainTabView.swift | Restore functionality with proper imports | High |
| build_exclude.rb script | Implemented | scripts/build_exclude.rb | Remove once proper fixes are in place | Low |

## Next Steps

1. **Immediate:**
   - [ ] Fix AuthViewModel references across the app
   - [ ] Resolve TrainingPlanView compile errors
   - [ ] Clean up duplicate model implementations
   
2. **Short-term:**
   - [ ] Implement proper import structure
   - [ ] Fix project.pbxproj file references
   - [ ] Document architecture decisions
   
3. **Medium-term:**
   - [ ] Create unit tests for critical components
   - [ ] Remove all temporary fixes
   - [ ] Implement clean architecture patterns

## Resource Links

- [LESSONS_LEARNED.md](./LESSONS_LEARNED.md) - Detailed learnings from build issues
- [MOCK_TO_REAL_MIGRATION.md](./MOCK_TO_REAL_MIGRATION.md) - Guide for mock to real data migration

## Build Commands

```bash
# Clean build
cd packages/vici-native/ViciMVP_New
xcodebuild clean -project ViciMVP.xcodeproj -scheme ViciMVP -configuration Debug

# Build for simulator
xcodebuild build -project ViciMVP.xcodeproj -scheme ViciMVP -configuration Debug -destination 'platform=iOS Simulator,id=F6D36FFB-9AB5-45C5-9200-7F18C13E9C1C'

# Exclude problematic files during build
ruby scripts/build_exclude.rb
```

Update this document as issues are resolved or new ones are discovered. 