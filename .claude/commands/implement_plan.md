# Implement Plan

You are tasked with implementing an approved technical plan from `thoughts/shared/plans/`. These plans contain phases with specific changes and success criteria.

## Getting Started

When given a plan path:
- Read the plan completely and check for any existing checkmarks (- [x])
- Read the original ticket and all files mentioned in the plan
- **Read files fully** - never use limit/offset parameters
- Think deeply about how the pieces fit together
- Create a todo list to track your progress
- Start implementing if you understand what needs to be done

If no plan path provided, ask for one.

## SectionFlow Implementation Guidelines

### Key Principles
1. **Performance First**: Every change must maintain 60fps scroll
2. **Memory Conscious**: Consider pool sizes and cache lifetimes
3. **Incremental Changes**: Make small, testable modifications
4. **Type Safety**: Leverage TypeScript for all new code

### Build & Test Commands
```bash
bun dev          # Watch mode for development
bun build        # Production build
bun test         # Run test suite
bun run typecheck # TypeScript validation
```

### Feature Rollout Order
For major features, implement in this order:
1. **Basic virtualization** - Core functionality
2. **Sticky headers** - Section header pinning
3. **Horizontal/grid layouts** - Extended layouts

### Performance Verification
After each phase:
- Test in example app with 1000+ items
- Check Flipper performance monitor for frame drops
- Verify memory usage doesn't grow unbounded
- Test fast scroll and direction changes

## Implementation Philosophy

Plans are carefully designed, but reality can be messy. Your job is to:
- Follow the plan's intent while adapting to what you find
- Implement each phase fully before moving to the next
- Verify your work makes sense in the broader codebase context
- Update checkboxes in the plan as you complete sections

When things don't match the plan exactly:
```
Issue in Phase [N]:
Expected: [what the plan says]
Found: [actual situation]
Why this matters: [explanation]

How should I proceed?
```

## Verification Approach

After implementing a phase:

1. **Run automated checks**:
   ```bash
   bun run typecheck && bun run build && bun test
   ```

2. **Fix any issues before proceeding**

3. **Update progress** in both the plan and your todos

4. **Pause for human verification**:
   ```
   Phase [N] Complete - Ready for Manual Verification

   Automated verification passed:
   - [List checks that passed]

   Please perform manual verification:
   - Test in example app
   - Check scroll performance in Flipper
   - Verify memory usage

   Let me know when testing is complete to proceed to Phase [N+1].
   ```

## Example App Testing

The example app at `example/` is the primary testing ground:

```bash
cd example
bun install
bun ios  # or bun android
```

Test scenarios:
- [ ] Scroll through 1000+ items smoothly
- [ ] Toggle section collapse/expand
- [ ] Verify sticky headers work correctly
- [ ] Check viewability callbacks fire appropriately

## If You Get Stuck

When something isn't working:
- Read and understand all relevant code
- Consider if the codebase evolved since the plan was written
- Present the mismatch clearly and ask for guidance

Use sub-tasks sparingly - mainly for targeted debugging.

## Resuming Work

If the plan has existing checkmarks:
- Trust that completed work is done
- Pick up from the first unchecked item
- Verify previous work only if something seems off

Remember: You're implementing a solution, not just checking boxes. Keep the end goal in mind and maintain forward momentum.
