# Code Review Checklist

## General
- [ ] Code follows project style guide
- [ ] No commented-out code
- [ ] No console.log statements (use logger instead)
- [ ] No sensitive data in code
- [ ] Proper error handling
- [ ] Proper logging
- [ ] Documentation updated

## Security
- [ ] No hardcoded credentials
- [ ] Input validation
- [ ] Output encoding
- [ ] Proper authentication checks
- [ ] Proper authorization checks
- [ ] Secure storage usage
- [ ] No sensitive data in logs

## Performance
- [ ] No unnecessary re-renders
- [ ] Proper memoization
- [ ] Efficient data structures
- [ ] Optimized API calls
- [ ] Proper caching
- [ ] Memory leaks addressed
- [ ] Large files handled properly

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Test coverage maintained
- [ ] Edge cases covered
- [ ] Error cases tested
- [ ] Performance tests added if needed

## Documentation
- [ ] Code comments clear and helpful
- [ ] JSDoc comments for functions
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Type definitions complete
- [ ] Changelog updated

## Accessibility
- [ ] Screen reader support
- [ ] Keyboard navigation
- [ ] Color contrast
- [ ] Focus management
- [ ] ARIA attributes
- [ ] Semantic HTML

## Mobile Considerations
- [ ] Responsive design
- [ ] Touch targets appropriate
- [ ] Offline support
- [ ] Network conditions handled
- [ ] Memory usage optimized
- [ ] Battery impact considered

## Error Handling
- [ ] Graceful degradation
- [ ] User-friendly error messages
- [ ] Error recovery flows
- [ ] Error logging
- [ ] Error tracking
- [ ] Error boundaries

## Code Structure
- [ ] Single responsibility principle
- [ ] DRY (Don't Repeat Yourself)
- [ ] KISS (Keep It Simple, Stupid)
- [ ] Proper file organization
- [ ] Clear naming conventions
- [ ] Consistent code style

## Dependencies
- [ ] Dependencies up to date
- [ ] No unused dependencies
- [ ] No duplicate dependencies
- [ ] Security vulnerabilities addressed
- [ ] License compliance
- [ ] Bundle size impact considered

## Git
- [ ] Meaningful commit messages
- [ ] Atomic commits
- [ ] No large files
- [ ] Proper branch naming
- [ ] No merge conflicts
- [ ] Clean git history 