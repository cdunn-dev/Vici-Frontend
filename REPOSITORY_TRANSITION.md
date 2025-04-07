# Repository Transition Guide

## Project Tracker

### Phase 1: Repository Setup (Current Phase)
- [x] Create new repositories
  - [x] vici-frontend
  - [x] vici-backend
- [x] Set up monorepo structure
  - [x] Create package directories
  - [x] Configure root package.json
  - [x] Set up workspace configuration
  - [x] Configure TypeScript for all packages
  - [x] Create basic directory structure
- [x] Configure development environment
  - [x] Set up ESLint and Prettier
  - [x] Configure Jest for testing
  - [x] Set up Husky for pre-commit hooks
    - [x] Add commit message linting
    - [x] Configure pre-commit test runs
    - [x] Add type checking
  - [x] Configure VSCode settings
    - [x] Add recommended extensions
    - [x] Configure debugging
    - [x] Set up consistent formatting
  - [x] Add documentation generation
    - [x] Set up TypeDoc
    - [x] Configure automated documentation builds
- [x] Set up CI/CD pipeline
  - [x] Configure GitHub Actions
    - [x] Set up test workflow
    - [x] Add lint checks
    - [x] Configure TypeScript checks
  - [x] Set up automated testing
    - [x] Unit test automation
    - [ ] Integration test pipeline
    - [x] Coverage reporting
  - [x] Configure deployment workflows
    - [x] Documentation deployment
    - [x] Package publishing
    - [x] Staging deployment
  - [x] Set up environment variables
    - [x] Development environment
    - [x] Staging environment
    - [x] Production environment

### Phase 2: Code Migration
- [ ] Migrate shared code
  - [ ] Components
    - [ ] UI components
    - [ ] Form components
    - [ ] Layout components
  - [ ] Hooks
    - [ ] Data fetching hooks
    - [ ] UI hooks
    - [ ] Authentication hooks
  - [ ] Services
    - [ ] API services
    - [ ] Authentication services
    - [ ] Storage services
  - [ ] Types
    - [ ] Model types
    - [ ] API types
    - [ ] Utility types
  - [ ] Utils
    - [ ] Date utilities
    - [ ] Format utilities
    - [ ] Validation utilities
- [ ] Migrate web-specific code
  - [ ] Pages
  - [ ] Components
  - [ ] API integration
  - [ ] State management
- [ ] Migrate mobile-specific code
  - [ ] Screens
  - [ ] Components
  - [ ] Navigation
  - [ ] Native modules
- [ ] Migrate backend code
  - [ ] API endpoints
  - [ ] Services
  - [ ] Database models
  - [ ] Authentication

### Phase 3: Testing & Validation
- [ ] Set up testing infrastructure
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] E2E tests
  - [ ] Performance tests
- [ ] Validate migrated code
  - [ ] Test all components
  - [ ] Verify API integration
  - [ ] Check navigation flows
  - [ ] Validate state management
- [ ] Performance testing
  - [ ] Load testing
  - [ ] Memory usage
  - [ ] Battery impact
  - [ ] Network efficiency

### Phase 4: Documentation & Cleanup
- [ ] Update documentation
  - [ ] README files
  - [ ] API documentation
  - [ ] Component documentation
  - [ ] Setup guides
- [ ] Clean up old repositories
  - [ ] Archive Vici-V1
  - [ ] Archive Vici-Web
  - [ ] Archive Vici-Mobile
  - [ ] Archive Vici-API
- [ ] Update references
  - [ ] Update internal documentation
  - [ ] Update external references
  - [ ] Update deployment scripts
  - [ ] Update CI/CD configurations

### Phase 5: Team Transition
- [ ] Team training
  - [ ] New repository structure
  - [ ] Development workflow
  - [ ] Testing procedures
  - [ ] Deployment process
- [ ] Update development guidelines
  - [ ] Code style guide
  - [ ] Git workflow
  - [ ] Review process
  - [ ] Documentation standards
- [ ] Set up support channels
  - [ ] Issue tracking
  - [ ] Pull request templates
  - [ ] Code review guidelines
  - [ ] Support documentation

## Current Status

### Completed
- [x] Creation of new repositories
- [x] Basic monorepo structure setup
- [x] Initial package configurations
- [x] TypeScript setup for all packages
- [x] Basic directory structure
- [x] Jest configuration and testing setup
- [x] ESLint and Prettier configuration
- [x] Husky and commitlint setup
- [x] VSCode configuration and extensions
- [x] TypeDoc documentation setup
- [x] GitHub Actions workflows
  - [x] Test automation
  - [x] Documentation deployment
  - [x] Package publishing
- [x] Environment variables setup
  - [x] Development configuration
  - [x] Staging configuration
  - [x] Production configuration

### In Progress
- [ ] Testing Infrastructure
  - Status: 80% complete
  - Completed: Unit tests, Jest configuration, Coverage reporting
  - Pending: Integration tests, E2E setup
- [ ] GitHub Pages Setup
  - Status: Pending configuration
- [ ] CI/CD and Code Quality Setup
  - Status: Deferred to post-MVP
  - Blockers:
    - TypeScript configuration for test file organization
    - Branch protection rules setup
    - GitHub Actions workflow configuration
  - Required Tasks:
    - Configure Node.js matrix testing
    - Set up proper ESLint configuration
    - Configure TypeScript build settings
    - Set up automated code review process
    - Configure coverage reporting
  - Test Infrastructure Tasks:
    - Organize test files under `src/__tests__`
    - Set up proper test environment
    - Configure Jest for unit/integration tests
    - Add coverage thresholds
  - Documentation Tasks:
    - Add contributing guidelines
    - Document development workflow
    - Add PR/issue templates

### Next Steps (Prioritized)
1. Enable GitHub Pages
   - Configure GitHub Pages settings
   - Set up documentation deployment workflow
   - Verify documentation site accessibility

2. Set up Branch Protection Rules
   - Configure main branch protection
   - Set up review requirements
   - Configure status check requirements

3. Expand Testing Infrastructure
   - Add integration tests
   - Set up E2E testing framework
   - Configure test coverage thresholds

## Repository Structure

### Vici-Frontend Structure
```
vici-frontend/
├── packages/
│   ├── shared/              # Shared code
│   │   ├── components/      # Common components
│   │   ├── hooks/          # Shared hooks
│   │   ├── services/       # API integration
│   │   └── types/          # Common types
│   ├── web/                # Web-specific code
│   │   ├── pages/
│   │   └── components/
│   └── mobile/             # Mobile-specific code
│       ├── screens/
│       └── native-components/
├── package.json
└── turbo.json             # Monorepo configuration
```

### Vici-Backend Structure
```
vici-backend/
├── src/
│   ├── api/
│   ├── services/
│   ├── db/
│   └── types/
├── tests/
└── infrastructure/
```

## Development Guidelines

### Do's
- Always clone from the new repositories
- Use the monorepo structure for all frontend code
- Follow the new package organization
- Reference shared components from the shared package

### Don'ts
- Don't clone or reference deprecated repositories
- Don't copy code from old repositories
- Don't create new features in deprecated repositories
- Don't maintain multiple copies of shared code

## Getting Started

1. Clone the new repositories:
```bash
# Frontend
git clone https://github.com/cdunn-dev/vici-frontend.git

# Backend
git clone https://github.com/cdunn-dev/vici-backend.git
```

2. Install dependencies:
```bash
# Frontend
cd vici-frontend
yarn install

# Backend
cd vici-backend
yarn install
```

3. Start development:
```bash
# Frontend - Web
yarn web:dev

# Frontend - Mobile
yarn mobile:dev

# Backend
yarn dev
```

## Questions & Support

For questions about:
- Repository structure: Contact [Repository Owner]
- Development workflow: Contact [Tech Lead]
- CI/CD pipeline: Contact [DevOps Lead]

## Timeline

- **Phase 1** (Current): Repository setup and initial migration
- **Phase 2**: Code migration
- **Phase 3**: Testing and validation
- **Phase 4**: Documentation and cleanup
- **Phase 5**: Team transition

## Notes
- Focus on completing the repository transition before starting new initiatives
- Regular progress reviews required
- Daily standups for blockers
- Weekly progress reviews
- Bi-weekly stakeholder updates 