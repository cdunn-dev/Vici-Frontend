# Development Environment Setup Guide

## Prerequisites

### Required Software
- Node.js (v18.x or later)
- npm (v8.x or later)
- Git
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)
- VS Code (recommended IDE)

### VS Code Extensions
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- React Native Tools
- GitLens
- Jest Runner
- Error Lens

## Initial Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/Vici-V1.git
cd Vici-V1
```

2. Install dependencies:
```bash
npm install
```

3. Install iOS dependencies:
```bash
cd ios && pod install && cd ..
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Development Tools

### Debugging
- React Native Debugger: `npm run debug`
- Network Inspection: `npm run network-inspect`
- Performance Monitoring: `npm run perf-monitor`

### Testing
- Unit Tests: `npm test`
- Integration Tests: `npm run test:integration`
- E2E Tests: `npm run test:e2e`

### Linting and Formatting
- Lint: `npm run lint`
- Format: `npm run format`
- Type Check: `npm run type-check`

## Git Setup

1. Configure commit message template:
```bash
git config --global commit.template .gitmessage
```

2. Set up pre-commit hooks:
```bash
npm run setup:git-hooks
```

## IDE Configuration

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "jest.autoRun": {
    "watch": false,
    "onSave": false
  }
}
```

### Recommended VS Code Workspace Settings
```json
{
  "files.exclude": {
    "**/.git": true,
    "**/.svn": true,
    "**/.hg": true,
    "**/CVS": true,
    "**/.DS_Store": true,
    "**/node_modules": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/bower_components": true,
    "**/*.code-search": true
  }
}
```

## Troubleshooting

### Common Issues

1. **iOS Build Fails**
   - Clean build folder: `cd ios && xcodebuild clean && cd ..`
   - Reinstall pods: `cd ios && pod install && cd ..`
   - Reset simulator: `xcrun simctl erase all`

2. **Android Build Fails**
   - Clean project: `cd android && ./gradlew clean && cd ..`
   - Clear gradle cache: `rm -rf ~/.gradle/caches/`
   - Reset emulator: `adb emu kill`

3. **Metro Bundler Issues**
   - Clear cache: `npm start -- --reset-cache`
   - Kill process: `lsof -i :8081 | grep LISTEN | awk '{print $2}' | xargs kill -9`

4. **TypeScript Errors**
   - Clear cache: `rm -rf node_modules/.cache/typescript`
   - Rebuild: `npm run type-check`

## Support

- Documentation: [docs/](docs/)
- Testing Guide: [docs/testing/](docs/testing/)
- Code Review Checklist: [docs/code-review/checklist.md](docs/code-review/checklist.md)
- Branch Protection Rules: [.github/branch-protection.md](.github/branch-protection.md) 