---
description: Standing rules for all code changes to the Traveller Architect project
---

## Standing Rules

These rules apply to EVERY implementation task going forward:

### 1. Structured Change Logs
- Whenever a rule or action modifies the character sheet (stats, skills, career, equipment, etc.), add a structured log entry via `CharacterService.log()`.
- The log message should describe **what** was changed and **why** (e.g. `"Rank Bonus (Rank 0 — Army): Gun Combat (slug) set to 1"`).
- Logs are displayed in the Debug Floater (`app-debug-floater`) under "Character Log" as structured markdown.

### 2. Automated Tests
- Every rule that modifies the character sheet or adds system behavior MUST have corresponding automated tests (Vitest).
- Tests should validate:
  - Correct data values (e.g. skill tables, rank bonuses)
  - Expected behavior (e.g. commission eligibility, benefit timing)
  - Edge cases (e.g. reset state, duplicate applications)
- If a rule is corrected (wrong value/behavior), the test must also be updated to expect the corrected value.
- Run `npx ng test --watch=false` to verify all tests pass after changes.
