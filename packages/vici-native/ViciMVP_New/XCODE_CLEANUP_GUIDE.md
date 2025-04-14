# Xcode Project Cleanup Guide

This guide outlines the steps to safely remove the `FixedFiles` directory and its references from the Vici project using Xcode.

## Background

Our automated testing confirmed that while we can safely remove the code references to most fixed files, the Xcode project file still has explicit references to these files that must be removed using Xcode's interface.

## Prerequisites

- Ensure you have the latest code from the repository
- Verify that the project currently builds successfully
- Make a backup of the project before proceeding

## Steps to Remove FixedFiles

### 1. Open Project in Xcode

```bash
cd /Users/chrisdunn/Documents/GitHub/Vici-App/packages/vici-native/ViciMVP_New
open ViciMVP.xcodeproj
```

### 2. Create a New Branch

Create a branch specifically for this cleanup:

```bash
git checkout -b cleanup/remove-fixed-files
```

### 3. Remove File References in Xcode

1. In Xcode, locate the "Project Navigator" in the left sidebar
2. Find the "FixedFiles" folder
3. For each file, right-click and select "Delete"
4. When prompted, choose "Remove Reference" (not "Move to Trash")
   - This only removes the reference in the project, not the actual file

Files to remove references for:
- `ImportFix.swift`
- `ViciResponseModel.swift`
- `TrainingPlanView_Fixed.swift`
- `AuthenticationView_Fixed.swift` (already safe to fully remove)
- `AuthViewModel_Fixed.swift`

### 4. Test the Build

After removing all references, build the project to verify it still compiles:

1. Select an iOS Simulator target
2. Press ⌘+B to build
3. Verify there are no build errors

### 5. Delete the FixedFiles Directory

If the build is successful:

```bash
# From repository root
rm -rf packages/vici-native/ViciMVP_New/ViciMVP/FixedFiles
```

### 6. Final Build Verification

Run a clean build to verify everything works correctly:

```bash
# From ViciMVP_New directory
xcodebuild -project ViciMVP.xcodeproj -scheme ViciMVP -configuration Debug -destination "platform=iOS Simulator,id=F6D36FFB-9AB5-45C5-9200-7F18C13E9C1C" clean build
```

### 7. Commit the Changes

```bash
git add .
git commit -m "cleanup: Remove FixedFiles directory and references"
```

### 8. Create a Pull Request

Create a pull request for review before merging to the main branch.

## Troubleshooting

If you encounter build errors after removing references:

1. Check the build log for specific errors
2. Look for any remaining code references to the FixedFiles directory
3. If necessary, restore the project from the backup and try again with a more targeted approach

## Post-Cleanup Actions

After successfully removing the FixedFiles directory:

1. Update `ViciImports.swift` to ensure all typealiases point to the correct implementations
2. Run the app on a simulator to verify functionality
3. Document any remaining technical debt or issues in `CLEAN_BUILD_PLAN.md` 