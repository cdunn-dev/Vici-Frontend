# BUILD_FIX_PLAN.md - ViciMVP Project Clean-up Tracker

## Overview

This document tracks our systematic approach to resolve build errors in the ViciMVP project, specifically focusing on duplicate file declarations causing "invalid redeclaration" errors. This plan will serve as a reference throughout the clean-up process.

## Root Cause Analysis

The primary issue appears to be duplicate files and symbols scattered across different directories:

- **ViewModels**: Multiple versions of AuthViewModel.swift, TrainingPlanViewModel.swift in:
  - ViciMVP/ViewModels/
  - temp-backup/FixedImports/
  - backup_20250414161447/
  - packages/vici-native/ViciMVP_New/ViciMVP/ViewModels/

- **Services**: Duplicate KeychainService.swift and APIClientProtocol.swift files

- **Views**: Multiple ProfileView.swift and TrainingPlanView.swift files in ViciMVP/Views/ and backup folders

- **Application Structure**: The Sources/ directory contains an older structure (Sources/Mocks/, Sources/Views/) with potentially conflicting models and an alternative entry point

When Xcode compiles, it encounters these duplicate definitions leading to "invalid redeclaration" and "ambiguous use of" errors.

## Clean-up Plan

### Phase 1: Preparation and Safety Measures ⬜️

- [ ] **Version Control Setup**:
  - [ ] Ensure entire project is committed to Git
  - [ ] Create dedicated branch: `git checkout -b cleanup/duplicate-files`

- [ ] **Backup (Optional)**:
  - [ ] Create full manual backup of project folder if not using Git

- [ ] **Document Current State**:
  - [ ] Run file audit using terminal commands:
    ```bash
    cd packages/vici-native/ViciMVP_New/
    find . -name "APIClientProtocol.swift" -type f > duplicate_files_audit.txt
    find . -name "AuthViewModel.swift" -type f >> duplicate_files_audit.txt
    find . -name "KeychainService.swift" -type f >> duplicate_files_audit.txt
    # Add more key files as needed
    ```
  - [ ] Review and document which files will be kept (in ViciMVP/ directory)

- [ ] **Compare Duplicates (Optional but Recommended)**:
  - [ ] Review differences between duplicate files
  - [ ] Merge any essential modifications from duplicates into main ViciMVP/ versions

### Phase 2: Clean Xcode Project References ⬜️

- [ ] **Remove Redundant Groups/References**:
  - [ ] Sources/
  - [ ] temp-backup/
  - [ ] backup_20250414161447/ (and any other backup_* folders)
  - [ ] FixedFiles_Backup/
  - [ ] packages/ (references only, not actual Swift Packages)
  - [ ] IMPORTANT: Select "Remove References" not "Move to Trash"

- [ ] **Clean Compile Sources in Build Phases**:
  - [ ] Project Settings → ViciMVP Target → Build Phases
  - [ ] Expand "Compile Sources" section
  - [ ] Remove entries pointing outside ViciMVP/ directory
  - [ ] Verify only files within ViciMVP/ remain

- [ ] **Clean Other Build Phases**:
  - [ ] Check "Copy Bundle Resources" for duplicate entries
  - [ ] Verify "Headers" phase has no duplicates
  - [ ] Check for custom build scripts referencing deleted paths

- [ ] **Clean Build Settings**:
  - [ ] Check "Info.plist File" setting points to correct location
  - [ ] Verify "Swift Compiler - Search Paths" doesn't reference removed locations
  - [ ] Review custom build settings for path references

- [ ] **Clean Build Folder**:
  - [ ] Product → Clean Build Folder (Shift+Cmd+K)
  - [ ] Close Xcode after cleaning

### Phase 3: Clean Filesystem ⬜️

- [ ] **Delete Redundant Folders**:
  - [ ] temp-backup/
  - [ ] backup_20250414161447/ (and any other backup_* folders)
  - [ ] FixedFiles_Backup/
  - [ ] packages/ (if not a legitimate Swift Package)
  - [ ] Sources/
  - [ ] CAUTION: Double-check you're deleting correct folders

- [ ] **Clean DerivedData**:
  - [ ] Delete project's DerivedData:
    ```bash
    rm -rf ~/Library/Developer/Xcode/DerivedData/ViciMVP-*
    ```

### Phase 4: Verification and Refinement ⬜️

- [ ] **Project Reopening**:
  - [ ] Reopen ViciMVP.xcodeproj
  - [ ] Address any missing files (red references)

- [ ] **Verification of Key Files**:
  - [ ] Verify all key files (Models, ViewModels, Services, Views) exist in proper locations
  - [ ] Check target membership for all essential files

- [ ] **SwiftPM Dependency Verification** (if applicable):
  - [ ] Verify Swift Package dependencies are still properly configured
  - [ ] Update Package.resolved if needed

- [ ] **Initial Build Attempt**:
  - [ ] Attempt to build (Cmd+B)
  - [ ] Document any new errors (should be genuine code issues, not duplications)

- [ ] **Error Resolution**:
  - [ ] Address genuine code errors
  - [ ] Fix any missing references or imports

- [ ] **Full Clean Build Test**:
  - [ ] Clean build folder again
  - [ ] Build from scratch
  - [ ] Verify no "redeclaration" errors occur

### Phase 5: Final Steps ⬜️

- [ ] **Documentation Update**:
  - [ ] Document the cleanup process in HANDOVER_APRIL_16.md
  - [ ] Note any significant changes made to resolve specific errors

- [ ] **Test Functional App**:
  - [ ] Run app in simulator to verify basic functionality
  - [ ] Test critical workflows

- [ ] **Commit Changes**:
  - [ ] Commit all changes to cleanup branch
  - [ ] Create pull request or merge to main development branch

## Progress Tracking

| Phase | Status | Date | Notes |
|-------|--------|------|-------|
| 1: Preparation | Not Started | | |
| 2: Clean Xcode Project | Not Started | | |
| 3: Clean Filesystem | Not Started | | |
| 4: Verification | Not Started | | |
| 5: Final Steps | Not Started | | |

## Specific File Tracker

| File | Original Location | Duplicates Found | Resolution |
|------|-------------------|------------------|------------|
| APIClientProtocol.swift | ViciMVP/Services/ | | |
| AuthViewModel.swift | ViciMVP/ViewModels/ | | |
| KeychainService.swift | ViciMVP/Services/ | | |
| ViciMVPApp.swift | ViciMVP/ | | |

## Lessons Learned

This section will be completed after the cleanup process to document insights and prevent similar issues in the future.

## References

- HANDOVER_APRIL_16.md - Documents previous troubleshooting efforts
- LESSONS_LEARNED.md - Contains architectural best practices
- BUILD_GUIDE.md - General build documentation 