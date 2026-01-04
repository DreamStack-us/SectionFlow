# Validate Plan

You are tasked with validating that an implementation plan was correctly executed, verifying all success criteria and identifying any deviations or issues.

## Initial Setup

When invoked:
1. **Determine context** - Are you in an existing conversation or starting fresh?
2. **Locate the plan** - If plan path provided, use it; otherwise search or ask
3. **Gather implementation evidence**:
   ```bash
   git log --oneline -n 20
   git diff HEAD~N..HEAD
   bun test
   bun run typecheck
   bun run build
   ```

## SectionFlow-Specific Validation

### Performance Benchmarks

Always verify these metrics:

#### FPS Benchmarks
- Target: 60fps during fast scroll
- Measure in Flipper Performance Monitor
- Test with 1000+ items in example app
- Verify no frame drops during direction changes

#### Memory Profiling
- Use Flipper Memory Profiler or Hermes sampling
- Check for memory leaks during scroll
- Verify cell pool doesn't grow unbounded
- Monitor JS heap size over time

#### Comparison vs SectionList
Run side-by-side comparison:
| Metric | SectionFlow | SectionList |
|--------|-------------|-------------|
| Initial render | ms | ms |
| Scroll FPS | fps | fps |
| Memory usage | MB | MB |
| JS thread | % | % |

### Cell Recycling Efficiency
- Verify pool sizes stay within DEFAULT_MAX_POOL_SIZE (10)
- Check that cells are being reused (not constantly created)
- Monitor recycling stats via CellRecycler.getStats()

### Layout Performance
- Verify binary search O(log n) for visible range
- Check that layout cache hits are high
- Monitor layout computation time for large datasets

## Validation Process

### Step 1: Context Discovery

1. **Read the implementation plan** completely
2. **Identify what should have changed**
3. **Spawn parallel research tasks** to discover implementation:
   - Verify code changes match plan
   - Check test coverage
   - Verify performance characteristics

### Step 2: Systematic Validation

For each phase:
1. **Check completion status**
2. **Run automated verification**:
   ```bash
   bun run typecheck
   bun run build
   bun test
   ```
3. **Assess manual criteria**
4. **Think deeply about edge cases**

### Step 3: Performance Validation

Run these specific tests:

```bash
# In example app
cd example

# iOS performance
bun ios
# Open Flipper, enable Performance Monitor
# Scroll through list, note FPS

# Android performance
bun android
# Use Flipper or systrace for profiling
```

#### Scroll Smoothness Checklist
- [ ] Fast scroll up/down maintains 60fps
- [ ] Direction changes are smooth
- [ ] Sticky header transitions don't cause jank
- [ ] Section collapse/expand is instant

#### Memory Checklist
- [ ] Memory stays stable during extended scroll
- [ ] No leaks when navigating away and back
- [ ] Cell pool size stays bounded

### Step 4: Generate Validation Report

```markdown
## Validation Report: [Plan Name]

### Implementation Status
✓ Phase 1: [Name] - Fully implemented
✓ Phase 2: [Name] - Fully implemented
⚠️ Phase 3: [Name] - Partially implemented (see issues)

### Automated Verification Results
✓ Build passes: bun run build
✓ Tests pass: bun test
✓ Types valid: bun run typecheck

### Performance Validation

#### FPS Benchmarks
| Scenario | Target | Actual | Status |
|----------|--------|--------|--------|
| Normal scroll | 60fps | fps | ✓/⚠️/✗ |
| Fast scroll | 60fps | fps | ✓/⚠️/✗ |
| Direction change | 60fps | fps | ✓/⚠️/✗ |

#### Memory Profile
- Initial: MB
- After 1min scroll: MB
- After 5min scroll: MB
- Pool sizes: within limits ✓/✗

#### vs SectionList Comparison
[Comparison table]

### Code Review Findings

#### Matches Plan
- [Changes that match]

#### Deviations from Plan
- [Any differences]

#### Potential Issues
- [Performance concerns]
- [Edge cases]

### Manual Testing Required
1. Example app testing:
   - [ ] Scroll smoothness verified
   - [ ] Sticky headers work correctly
   - [ ] Section collapse/expand works

2. Performance:
   - [ ] Flipper FPS monitoring done
   - [ ] Memory profiling done
   - [ ] Comparison benchmarks run

### Recommendations
- [Action items]
```

## Important Guidelines

1. **Be thorough but practical** - Focus on what matters for performance
2. **Run all automated checks** - Never skip verification commands
3. **Test with realistic data** - Use 1000+ items
4. **Profile in release mode** - Dev mode has overhead
5. **Document everything** - Both successes and issues

## Validation Checklist

Always verify:
- [ ] All phases marked complete are actually done
- [ ] Build succeeds: `bun run build`
- [ ] Tests pass: `bun test`
- [ ] Types valid: `bun run typecheck`
- [ ] 60fps scroll maintained
- [ ] Memory usage bounded
- [ ] Cell recycling efficient
- [ ] No regressions in existing features
