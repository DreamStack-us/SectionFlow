## Summary

<!-- 
This PR contains work for one or more Linear tickets.
Each ticket's testing steps are documented either below (for the first ticket)
or in subsequent comments using the OSCAR_TICKET_WORK format.
-->

**Tickets in this PR:**
<!-- Engineer: Update this list as you stack more tickets -->
- [ ] DRE-XXX (primary)
- [ ] DRE-YYY
- [ ] DRE-ZZZ

## Branch Strategy

<!-- How are commits organized? -->
- [ ] One commit per ticket (squash-ready)
- [ ] Multiple commits per ticket (needs squash)
- [ ] Mixed/WIP

---

## 🎫 DRE-XXX: [Ticket Title]

<!-- First ticket documented in PR description. Additional tickets go in comments. -->

### Changes
- [ ] UI/Frontend changes
- [ ] API/Backend changes
- [ ] Database/Schema changes
- [ ] Configuration changes

### Prerequisites
<!-- Any setup needed before testing -->
- [ ] Logged in as: `test@example.com`
- [ ] Test data: <!-- describe -->

### Testing Steps

1. Navigate to `http://localhost:3000/...`
2. ...
3. **Expected:** ...
4. **Verify API:** `POST /api/...` returns `200` with `{ "status": "..." }`

### Visual Checkpoints

- `[DRE-XXX-initial]` Before interaction
- `[DRE-XXX-complete]` After changes applied

### API Changes

| Method | Endpoint | Request | Response | Status |
|--------|----------|---------|----------|--------|
| POST | `/api/example` | `{ "field": "string" }` | `{ "id": "uuid" }` | 201 |

<details>
<summary>POST /api/example - Success</summary>

**Request:**
```json
{
  "field": "value"
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```
</details>

### Edge Cases

- [ ] Empty inputs handled
- [ ] Double-click protected
- [ ] Error states display correctly
- [ ] Loading states shown

---

## Deployment Notes

<!-- Applies to ALL tickets in this PR -->
- [ ] Environment variables added: <!-- list -->
- [ ] Database migration required
- [ ] Feature flags: <!-- list -->

---

## Checklist

### Engineer
- [ ] All tickets listed above are complete
- [ ] Each ticket has testing steps (in description or comments)
- [ ] Tested locally with `bun run dev`
- [ ] TypeScript compiles without errors

### QA Agent
<!-- QA Agent checks these after validating ALL tickets -->
- [ ] All ticket testing steps executed
- [ ] All API payloads validated
- [ ] All edge cases tested
- [ ] Screenshots captured for each ticket

### Human Reviewer
- [ ] Code quality acceptable
- [ ] Ready to merge

---

<!--
╔════════════════════════════════════════════════════════════════════════╗
║  🤖 OSCAR PR PROTOCOL - MULTI-TICKET STACKING 🤖                       ║
╠════════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  This PR supports stacking multiple tickets. The workflow:             ║
║                                                                        ║
║  1. Engineer opens PR with first ticket in description (above)         ║
║  2. For each additional ticket, Engineer adds a comment using          ║
║     the OSCAR_TICKET_WORK format (template below)                      ║
║  3. QA Agent parses description + ALL comments for testing steps       ║
║  4. QA Agent posts ONE summary comment with results for ALL tickets    ║
║                                                                        ║
║  PARSING MARKERS:                                                      ║
║  - PR Description: Look for "## 🎫 DRE-XXX:" sections                  ║
║  - Comments: Look for "<!-- OSCAR_TICKET_WORK: DRE-XXX -->" marker     ║
║  - Each ticket section contains its own testing steps                  ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
-->
