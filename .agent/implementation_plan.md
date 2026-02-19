# Implementation Plan: Refactoring Event Structure

## Objective

Refactor the event directory structure to improve maintainability and scalability by organizing event files by career/domain and updating `careers.ts` to use these new definitions.

## Changes Completed

### 1. Directory Structure Organization

- Created domain-specific folders under `src/app/data/events/`:
  - `agent`, `army`, `citizen`, `drifter`, `entertainer`, `life`, `marine`, `merchant`, `navy`, `noble`, `prisoner`, `rogue`, `scholar`, `scout`, `spaceborne`.
- Moved `standard-life-events.ts` to `src/app/data/events/life/` and updated imports.

### 2. Event Definition Files

- Created `*-events.ts` and `*-mishap-events.ts` files for each career.
- Added explicit type definitions (`CareerEvent[]`, `CareerMishap[]`) to all event files for better type safety.
- Migrated all event data from the monolithic `careers.ts` file to these modular files.

### 3. Updated `careers.ts`

- Removed inline event/mishap tables.
- Imported and assigned the modular event constants to career definitions.

### 4. Code Cleanup and Fixes

- **`CareerComponent.ts`**:
  - Removed orphaned code block causing syntax errors.
  - Removed duplicate method implementations (`proceedToAdvancement`, `selectInjuryStat`, `resolveInjury`).
  - Handled `applyEventEffect` method restoration to bridge legacy HTML calls to the `EventEngineService`.
  - Fixed `selectInjuryStat` logic to correctly handle the 1d6 roll for injury severity 1 or 2.
- **`EventEngineService.ts`**:
  - Updated imports for `standard-life-events.ts`.

### 5. Education & Mustering Out Refactoring

- **`MusteringOutComponent.ts`**:
  - Injected `EventEngineService` and refactored benefit rolling logic.
  - Replaced legacy if-else blocks with data-driven effects.
  - Registered custom handlers for special benefits (Weapons, Armor, NPCs, Neural Jacks).
- **`EducationComponent.ts`**:
  - Refactored `runEvent` to use the `EventEngine`.
  - Migrated education events to a shared `education-events.ts` file in `src/app/data/events/shared/`.
- **`EventEngineService.ts`**:
  - Improved `ROLL_CHECK` and `ROLL_TABLE` to correctly handle Dice Modifiers (DMs).
  - Fixed a bug where DM was added multiple times or ignored during table lookups.
- **Shared Event Data**:
  - Centralized path-dependent effects (Hard/Soft path modifiers for 2300AD) in `src/app/data/events/shared/`.

### 6. Event System Refinement & Robustness

- **Core Engine Upgrades**:
  - Added `PROMOTION` effect type to `EventEngineService` for direct rank increases.
  - Enhanced `ADD_NPC` to support dice-driven counts (e.g., `count: '1d3'`) using a new `rollValue` regex helper.
  - Updated `EventEffect` model with `career` field for targeted effects.
- **Career Table Standardization**:
  - Revised all career event tables (`Agent`, `Army`, `Navy`, `Scholar`, `Merchant`, `Rogue`).
  - Standardized "Heroism" and "Renowned Discovery" events to use the new `PROMOTION` effect.
  - Standardized NPC gain events to use improved `ADD_NPC` logic.
- **Character Service Integration**:
  - Added `promote()` method to `CharacterService` to handle state-consistent rank advancement.
- **UI/UX Handlers**:
  - Implemented `ANY_SKILL_UP` custom handler in both `EducationComponent` and `CareerComponent`, allowing users to choose from their known skills for advanced training.

## Verification

- Verified directory structure using `list_dir`.
- Verified removal of syntax errors and duplicates in `CareerComponent.ts`.
- **Automated Tests**: Ran `npx vitest run src/app/data/events/shared/shared-events.spec.ts` - 16/16 tests passed.
- **Service Verification**: Manual path analysis of `EventEngineService` for the new `PROMOTION` and `rollValue` logic.

## Next Steps

- **Species & Attributes Migration**: Refactor these components to use data-driven patterns similar to Careers.
- **Consolidation**: Finalize removal of any remaining legacy switch-case event handlers in the UI.
- **NPC Detail Prompt**: Implement a more interactive UI for NPC naming and details when multiple NPCs are gained at once.
- **End-to-End Testing**: Perform a full character creation run to verify the refined event chains.
