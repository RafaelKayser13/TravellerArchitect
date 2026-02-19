# Claude Code Configuration - TravellerArchitect

> This file helps Claude automatically load project context and memory files

## 📚 Project Memory Files

All technical documentation is stored in `.claude/` folder and automatically loaded:

- **[.claude/MEMORY.md](.claude/MEMORY.md)** - Quick reference summary (loaded first)
- **[.claude/architecture.md](.claude/architecture.md)** - Folder structure, stack, patterns
- **[.claude/services.md](.claude/services.md)** - All 8 services with complete method signatures
- **[.claude/models.md](.claude/models.md)** - TypeScript interfaces (Character, Career, GameEvent)
- **[.claude/components.md](.claude/components.md)** - Component hierarchy, 9-step wizard
- **[.claude/data.md](.claude/data.md)** - Career JSONs, tables.json, static data
- **[.claude/event-engine.md](.claude/event-engine.md)** - Event engine, 5 handlers, special rules
- **[.claude/books-index.md](.claude/books-index.md)** - Index of 3 Traveller 2300AD rulebooks

## 🎯 Quick Commands for Common Tasks

### Adding a New Feature
1. Consult [.claude/architecture.md](.claude/architecture.md) for folder patterns
2. Check [.claude/services.md](.claude/services.md) for available services
3. Check [.claude/models.md](.claude/models.md) for data structures
4. Reference [.claude/components.md](.claude/components.md) for component patterns

### Understanding Career/Event System
1. Start with [.claude/event-engine.md](.claude/event-engine.md) for event flow
2. Check [.claude/data.md](.claude/data.md) for career JSON structure
3. Review [.claude/services.md](.claude/services.md) for EventEngineService methods

### Adding 2300AD Rules
1. Reference [.claude/books-index.md](.claude/books-index.md) for rule context
2. Check [.claude/models.md](.claude/models.md) for Character model fields
3. Review [.claude/data.md](.claude/data.md) for relevant game tables

## 🔑 Key Architectural Decisions

### State Management
- **Central Hub:** `CharacterService` using Angular Signals
- **All mutations go through service methods** (never direct object mutation)
- **Auto-saves to localStorage** on every mutation (key: `traveller-architect-autosave`)

### Event Processing
- **Stack-based (LIFO):** EventEngineService manages event queue
- **Handler Chain (Strategy Pattern):** 5 handlers process effects in order
- **Sub-events supported:** Can pause parent, process children, resume parent

### Component Architecture
- **Standalone Angular 18+:** No NgModules, only imports
- **Signal-based reactivity:** Direct access to service.character signal
- **9-step Wizard:** CharacterWizardComponent coordinates multi-step flow

## 📋 Common File Locations

| Purpose | Path |
|---------|------|
| Character state | `src/app/core/services/character.service.ts` |
| Event engine | `src/app/core/services/event-engine.service.ts` |
| Effect handlers | `src/app/core/services/handlers/*.ts` |
| Career definitions | `src/assets/data/careers/*.json` (14 files) |
| Lookup tables | `src/assets/data/tables.json` |
| Career step | `src/app/features/character/steps/career/` |
| Wizard controller | `src/app/features/character/character-wizard/` |
| Models/interfaces | `src/app/core/models/*.ts` |
| Static data (TS) | `src/app/data/` |

## 💾 Database of Decisions

### Why Signals instead of RxJS?
- More performant for frequent updates
- Better TypeScript typing
- Simpler for component integration
- EventEngine still uses RxJS BehaviorSubject for observer pattern

### Why Strategy Pattern for handlers?
- Clean separation of effect types
- Easy to add new effect handlers
- Order matters (CharacterEffect before CareerEffect, etc)
- Type-safe dispatch

### Why 14 separate Career JSONs?
- Each career has unique event tables and mishaps
- Easier to balance individual careers
- Can swap/replace career files without code changes
- Matches Traveller rulebook organization

### Why no NgModules?
- Angular 18+ standalone is simpler
- Smaller bundle size
- Cleaner dependency injection
- Easier component composition

## 🧪 Testing Structure

Tests located in `src/tests/`:
- `core/services/` - Service logic tests
- `data/` - Data integrity tests
- `features/character/` - Component tests

Key test files:
- `event-chaining.spec.ts` - Event stack processing
- `persistent-dm.spec.ts` - DM tracking across rolls
- `career.spec.ts` - Career term simulation
- `skills-logic.spec.ts` - Skill award logic

## 🚀 Development Workflow

### When modifying CharacterService:
1. Check all places that call `updateCharacter()` or related methods
2. Tests in `src/tests/core/services/` will validate
3. All mutations should use `signal.update()` pattern
4. localStorage auto-saves every mutation

### When adding Career events:
1. Edit career JSON in `src/assets/data/careers/`
2. Add GameEvent to eventTable/mishapTable
3. Effects are processed by handler chain
4. Test with character creation flow

### When adding new Wizard step:
1. Create component in `src/app/features/character/steps/newstep/`
2. Implement `finish()` and `canProceed()` methods
3. Add to CharacterWizardComponent (imports, ViewChild, ngSwitch)
4. Update step count (currently 9)

## 📖 Rule Implementation Notes

### Regra 245 (Survival Exact Success)
- Implemented in RollEffectHandler
- Triggers PROSTHETIC_CHOICE_EVENT when roll == target (exact match)
- Prosthetic choice chains back to onPass event with replaceNext=true

### 2300AD Features
- Hard Path vs. Soft Path implemented in character creation
- DNAM (DNA Modifications) stored in character.genes array
- Neural Jack system with cost options (cash/rolls/deferred)
- Prisoner parole system with threshold mechanics
- Merchant gambling (bet benefit rolls)
- Medical debt calculations by career type

### Aging & Injury
- Aging checks every 10 years starting at age 50
- Injuries permanently reduce characteristics
- Medical bills vary by military vs. independent service
- Injury recovery via specific career events

## 🔗 Links to Official Resources

- Traveller 2300AD Core Rulebook - [See .claude/books-index.md](.claude/books-index.md)
- Character Creation Rules - Chapter 1-3 of Core Rulebook
- Career Rules - Chapter 4-5 of Core Rulebook
- Event Tables - Throughout all rulebooks

---

**Last Updated:** 2026-02-18
**Claude Code Version:** Compatible with Claude Code CLI
**Auto-loaded:** Yes (.claude folder)
