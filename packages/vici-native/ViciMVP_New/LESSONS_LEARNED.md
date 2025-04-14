# Lessons Learned: Build Issues & Architecture

This document captures key learnings from resolving build issues in the Vici app to prevent similar problems in the future.

## Root Causes Identified

### 1. Import and Module Visibility Issues

- **Problem**: Multiple files with the same class name but different implementations
- **Impact**: Compiler confusion about which implementation to use
- **Solution**: Ensure unique class names or use proper module organization

### 2. Duplicate Model Implementations

- **Problem**: The same models defined in multiple places (mock vs. real)
- **Impact**: Type ambiguity and conflicts during migration
- **Solution**: Single source of truth with proper namespacing/extensions

### 3. Circular Dependencies

- **Problem**: ViewModels referencing each other creating dependency cycles
- **Impact**: Compiler errors and runtime issues
- **Solution**: Use protocols, dependency injection, or event-based communication

### 4. Project Configuration Issues

- **Problem**: Project file references pointing to missing files
- **Impact**: Build failures despite code being correct
- **Solution**: Regular project file maintenance, clean builds

## Best Practices for Swift Project Architecture

### File Organization

```
AppName/
  ├── Models/            # Data models
  │   ├── Core/          # Main models
  │   └── Extensions/    # Model extensions (preview data, etc.)
  ├── Views/             # UI components
  │   ├── Core/          # Main views
  │   ├── Components/    # Reusable view components
  │   └── Screens/       # Main app screens
  ├── ViewModels/        # Business logic
  ├── Services/          # API and business services
  ├── Utilities/         # Helper functions
  └── Resources/         # Assets, configs, etc.
```

### Import Management

- Import only what's needed
- Avoid wildcard imports (`import *`)
- Use consistent import ordering
- Consider creating umbrella headers for related components

### Dependency Management

- Use dependency injection rather than direct instantiation
- Consider using a service locator pattern for shared services
- Prefer protocols over concrete types for dependencies

### Testing Considerations

- Design for testability from the start
- Mock dependencies for unit tests
- Use preview providers for SwiftUI components

## Swift-Specific Pitfalls

1. **Type Inference Limitations**: Be explicit with types when needed
2. **Access Control**: Use appropriate modifiers (`private`, `internal`, etc.)
3. **Memory Management**: Be aware of reference cycles with closures
4. **SwiftUI State Management**: Understand `@State`, `@ObservedObject`, `@EnvironmentObject`

## Code Review Checklist

- [ ] Are imports minimal and necessary?
- [ ] Are there any circular dependencies?
- [ ] Is the file in the correct location?
- [ ] Are naming conventions consistent?
- [ ] Is the code properly testable?
- [ ] Are there duplicate implementations?
- [ ] Does the code follow the architecture pattern?

## Recommended Tools

- SwiftLint for enforcing style guidelines
- Periphery for detecting unused code
- Regular Xcode clean builds
- Git hooks for pre-commit validation

## Recovery Strategies

When facing build issues:
1. Clean build and derived data
2. Check for duplicate implementations
3. Verify project.pbxproj for missing references
4. Create minimal reproducible cases for complex issues
5. Consider incremental builds of subcomponents

Update this document as new lessons are learned. 