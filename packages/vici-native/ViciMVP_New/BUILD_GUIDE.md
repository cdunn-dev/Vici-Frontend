# Vici App Build Guide

This guide provides steps for building the Vici app successfully and troubleshooting common build issues.

## Standard Build Process

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/Vici-App.git
   cd Vici-App
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Navigate to the iOS project
   ```bash
   cd packages/vici-native/ViciMVP_New
   ```

4. Open in Xcode
   ```bash
   open ViciMVP.xcodeproj
   ```

5. Select your target device and build (⌘+B)

## Troubleshooting Build Issues

### Clean Build First

Always start with a clean build:

1. In Xcode: Product > Clean Build Folder (⇧⌘K)
2. Delete derived data:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/ViciMVP-*
   ```

### Common Build Errors and Solutions

#### 1. "Cannot find type 'X' in scope"

**Possible causes:**
- Missing import
- Multiple definitions of the same type
- Circular dependencies

**Solutions:**
- Add the necessary import statement
- Ensure the type is defined only once
- Check for circular dependencies and break them

#### 2. "File 'X.swift' not found"

**Possible causes:**
- File was moved or deleted but still referenced in project
- Git issue where file is not properly tracked

**Solutions:**
- Check if file exists in expected location
- Run `git status` to verify file is tracked
- Update project file references in project.pbxproj

#### 3. "Ambiguous use of 'X'"

**Possible causes:**
- Multiple definitions with the same name
- Type name conflicts between modules

**Solutions:**
- Use fully qualified names (e.g., `Module.TypeName`)
- Rename one of the conflicting definitions
- Use typealias to disambiguate

### Using The Temporary Fix Script

If you encounter persistent build issues, we've created a script to temporarily exclude problematic files:

```bash
./exclude_files_from_build.rb --exclude "ProblemFile1.swift,ProblemFile2.swift"
```

To restore files:
```bash
./exclude_files_from_build.rb --restore
```

**Note**: This is a temporary solution. The root cause should be addressed as soon as possible.

### Advanced Troubleshooting

#### Build with Verbose Output

```bash
xcodebuild -project ViciMVP.xcodeproj -scheme ViciMVP -configuration Debug -destination "platform=iOS Simulator,name=iPhone 14" build -verbose
```

#### Analyze Specific Files

```bash
swiftc -parse {filename}.swift -dump-ast
```

#### Check for Circular Dependencies

Look for patterns where File A imports File B and File B imports File A.

#### Check for Duplicate Symbols

Review the linker output for duplicate symbol errors:

```bash
xcodebuild -project ViciMVP.xcodeproj -scheme ViciMVP 2>&1 | grep duplicate
```

## Recommended Development Workflow

1. **Pull latest changes and build first**
   - Verify the app builds successfully before making changes

2. **Make small, focused changes**
   - Build after each significant change
   - Commit working code frequently

3. **Use feature branches**
   - Create a new branch for each feature or fix
   - Request code reviews before merging

4. **Test thoroughly**
   - Run the app on multiple simulator configurations
   - Test on physical devices when possible

5. **Document architecture decisions**
   - Update LESSONS_LEARNED.md with new insights
   - Document any workarounds you implement

## Need Help?

If you've tried the steps above and still encounter build issues:

1. Document the specific error message
2. Note which files are involved
3. List the troubleshooting steps you've already taken
4. Contact the lead developer or create a detailed issue in GitHub 