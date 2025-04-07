# Branch Protection Rules

## Protected Branches

### main (Production)
- Direct pushes are not allowed
- Pull requests require:
  - At least 1 approval
  - All status checks to pass
  - Up-to-date with base branch
  - No merge conflicts
  - Signed commits

### develop (Development)
- Direct pushes are not allowed
- Pull requests require:
  - At least 1 approval
  - All status checks to pass
  - Up-to-date with base branch
  - No merge conflicts
  - Signed commits

## Status Checks

### Required Checks
- Linting (ESLint)
- Type checking (TypeScript)
- Unit tests (Jest)
- Build verification
- Code coverage (minimum 80%)

### Optional Checks
- Integration tests
- E2E tests
- Performance tests
- Accessibility tests

## Pull Request Requirements

### Title Format
```
<type>(<scope>): <description>
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Adding or modifying tests
- chore: Maintenance tasks

### Description Template
```markdown
## Description
[Provide a detailed description of the changes]

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Code style update
- [ ] Refactoring
- [ ] Test update
- [ ] Other (please describe)

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

## Documentation
- [ ] README updated
- [ ] Code comments added/updated
- [ ] API documentation updated

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Changes are backward compatible
- [ ] Security considerations addressed
```

## Additional Settings

### Merge Options
- Allow squash merging
- Allow rebase merging
- Disallow merge commits

### Branch Deletion
- Allow branch deletion after merging
- Require branch deletion after merging

### Code Review
- Require review from code owners
- Dismiss stale approvals when new commits are pushed
- Require review from specific teams

## Notes
- All commits must be signed
- No force pushes allowed
- Protected branches cannot be deleted
- Branch protection rules apply to administrators