# Vici Project Board

## Columns

### Backlog
- Ideas and potential features
- Long-term goals
- Research items
- Low priority items

### To Do
- Prioritized tasks
- Ready for development
- Clear acceptance criteria
- Estimated effort

### In Progress
- Currently being worked on
- Assigned to team members
- Expected completion date
- Blockers (if any)

### Review
- Code review needed
- Documentation review
- Design review
- Testing verification

### Done
- Completed items
- Merged pull requests
- Closed issues
- Deployed features

## Workflow Rules

1. **Backlog to To Do**
   - Item has clear description
   - Acceptance criteria defined
   - Priority assigned
   - Effort estimated

2. **To Do to In Progress**
   - Assigned to team member
   - Branch created
   - Development started

3. **In Progress to Review**
   - Code completed
   - Tests written
   - Documentation updated
   - Pull request created

4. **Review to Done**
   - Code reviewed
   - Tests passing
   - Documentation approved
   - Pull request merged

## Automation Rules

- New issues automatically added to "To Do"
- Pull requests automatically moved to "In Progress"
- When review requested, moved to "Review"
- When merged/closed, moved to "Done"
- Label-based column assignment for specific types 