# Vici App Handover Document

## 8. Recent Build Troubleshooting (April 16th onwards)

### Goal
- Resolve persistent build errors to enable integration and testing of the real authentication flow (`AuthViewModel`, `AuthService`) and subsequent MVP features.

### Summary of Issues Encountered
- Initial build failures after resolving duplicates (Handover Doc Section 1).
- Persistent "Invalid redeclaration" and "Ambiguous type lookup" errors for core protocols, classes, and extensions (`APIClientProtocol`, `KeychainService`, `AppDelegate`, `Notification.Name` extensions) even after standard troubleshooting.
- Various code-level errors masked by the initial build/linking failures (e.g., incorrect method calls, type mismatches, concurrency issues in ViewModels).

### Troubleshooting Steps Taken
- **Code Refactoring:** Corrected numerous errors in `AuthView`, `LLMService`, `TrainingPlanViewModel`, `StravaService`, `APIClient`, etc., related to state management, async/await usage, protocol conformance, type mismatches, and concurrency.
- **Protocol/Extension Isolation:** Moved key protocols (`APIClientProtocol`, `KeychainServiceProtocol`) and extensions (`Notification.Name`) into dedicated files to improve clarity and resolve potential conflicts.
- **Filesystem Cleanup:** Identified and removed duplicate Swift source files and folders located outside the primary source directory (`ViciMVP/`). Organized files within the source directory.
- **Build System Checks:**
    - Repeatedly cleaned build folder and DerivedData.
    - Deleted `.xcworkspace` file.
    - Performed system reboots.
    - Meticulously verified and corrected "Compile Sources" list in build phases, ensuring no duplicates for essential files.
    - Verified target membership for key files.
    - Investigated and likely ruled out interference from `Package.swift` files and `turbo.json`.
- **Project Reconstruction:** Backed up and deleted the original `ViciMVP.xcodeproj`; created a new, clean project file; carefully added back source files and resources from the cleaned source directory (`ViciMVP/`).
- **Diagnostics:** Confirmed core code compiles in a minimal test project; used commenting-out techniques to isolate redeclaration issues to file processing/linking rather than code content.

### Current Status & Remaining Issue
- After project reconstruction and extensive troubleshooting, the build *still* fails with one persistent error: **`Invalid redeclaration of 'APIClientProtocol'`**.
- All standard troubleshooting steps for code errors, cache issues, and visible project settings have been exhausted.
- The root cause is strongly suspected to be either:
    1.  A deep, hidden inconsistency or corruption within the `ViciMVP.xcodeproj/project.pbxproj` file itself that survived reconstruction.
    2.  An unidentified subtle conflict with the external build environment (e.g., monorepo tools, Xcode environment bug).

### Next Steps
- Further investigation into the `.pbxproj` file or attempting a more granular project reconstruction seem necessary to resolve the final blocking error. 

### Update (April 17th, 2024) - Resolution Found ✅
- **Root Cause Identified:** We found the source of the "Invalid redeclaration of 'APIClientProtocol'" error after conducting an in-depth file audit.
- **Main Issue:** The protocol was declared in two locations:
    1. Primary definition in `ViciMVP/Services/APIClientProtocol.swift` (correct)
    2. Duplicate definition at the bottom of `ViciMVP/Services/APIClient.swift` (incorrect)
- **Details:** The duplicate declaration in `APIClient.swift` was commented with "// Add protocol conformance back", suggesting it was a temporary fix that inadvertently became permanent.
- **Fix Applied:** Removed the duplicate declaration in `APIClient.swift` while keeping the main declaration in `APIClientProtocol.swift`.
- **Additional Find:** Also discovered and fixed a third declaration in `ViciMVPTests/StravaServiceTests.swift` that could cause issues during test builds.
- **Current Status:** The build now completes successfully with the declaration errors resolved.

### Lessons Learned
1. **Check for Duplicates Thoroughly:** Even clean-looking code can have duplicates buried deep in files.
2. **Commented Code is Tricky:** Be particularly careful with commented "add back" code that can be accidentally uncommented.
3. **Test Files Matter:** Don't forget to check test files for duplicate declarations that can conflict with main code.
4. **Systematic Approach Works:** A file-by-file audit was ultimately necessary to find the issue. 