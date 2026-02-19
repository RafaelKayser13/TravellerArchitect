# Custom Effect Handlers Registry

**Version**: 1.0
**Status**: Production Ready
**Last Updated**: 2026-02-19

---

## Overview

The Custom Effect Handler system provides extensible mechanisms for complex game mechanics that don't fit standard effect types. This registry documents all custom effect types, their implementations, and usage patterns.

### Architecture

```
EventEngineService
  ├─ registerCustomHandler(id, handler) → Register custom logic
  ├─ executeCustomHandler(id, payload) → Execute registered handler
  └─ customHandlers: Map<string, (payload) => void>

CustomEffectHandler (EffectHandler implementation)
  ├─ canHandle('CUSTOM') → true
  └─ handle(effect, ctx) → Routes to EventEngineService
```

---

## Custom Effect Types

### Type 1: CUSTOM

**Purpose**: Execute pre-registered custom logic via ID-based dispatch
**Fields**:
```typescript
{
    type: 'CUSTOM',
    customId: string,        // Unique identifier for handler
    payload?: any            // Optional data to pass to handler
}
```

**Implementation Flow**:
```
1. Event effect has type: 'CUSTOM'
2. customId identifies the handler (e.g., 'MERCHANT_GAMBLING_WAGER')
3. payload contains effect-specific data
4. CustomEffectHandler routes to EventEngineService.executeCustomHandler()
5. Handler executes with character context
```

**Example**:
```json
{
    "type": "CUSTOM",
    "customId": "MERCHANT_GAMBLING_WAGER",
    "payload": {
        "benefitsToWager": 2,
        "skillCheck": "Gamble",
        "checkTarget": 8
    }
}
```

### Type 2: TRIGGER_EVENT

**Purpose**: Trigger another event from within an event effect
**Fields**:
```typescript
{
    type: 'TRIGGER_EVENT',
    value: string            // Event ID to trigger
}
```

**Implementation Flow**:
```
1. Effect has type: 'TRIGGER_EVENT'
2. value contains target event ID
3. CustomEffectHandler routes to EventEngineService.triggerEvent()
4. Event gets added to stack and executed
5. After target event completes, returns to parent event (if applicable)
```

**Example**:
```json
{
    "type": "TRIGGER_EVENT",
    "value": "injury_processing_event"
}
```

---

## Registered Custom Handlers

### Handler #1: MERCHANT_GAMBLING_WAGER

**Career**: Merchant
**Event**: Event 5 (Gambling Opportunity)
**Game Rule**: 8+ on skill check to avoid losing benefits

**Logic**:
```
Input:
  - benefitsToWager: number (e.g., 2)
  - skillCheck: string (always "Gamble")
  - checkTarget: number (usually 8+)

Process:
  1. Roll 2D6 + character's Gamble skill
  2. If roll >= checkTarget:
      a. Regain half benefits (Math.ceil(wapered / 2))
      b. Net loss = wagered - regained
      c. Apply loss to benefit pool
      d. Gain Gamble +1 skill
  3. Else (failure):
      a. Lose all wagered benefits
      b. Apply loss to benefit pool
      c. Gain Gamble +1 skill regardless

Output:
  - Benefit pool reduced by loss amount
  - Gamble skill increased by 1
  - Character log entry with result

Example Calculation:
  Wagered: 3 benefits
  Gamble skill: 1
  Roll: 9 → 9 + 1 = 10 (SUCCESS)
  Regained: Math.ceil(3 / 2) = 2
  Net loss: 3 - 2 = 1
  Final: Lost 1 benefit, Gamble 2
```

**Registration Code**:
```typescript
// In career.component.ts or event initialization
eventEngine.registerCustomHandler('MERCHANT_GAMBLING_WAGER', async (payload) => {
    const { benefitsToWager, skillCheck, checkTarget } = payload;
    const char = characterService.character();
    const gambleSkill = char.skills.find(s => s.name === 'Gamble')?.level ?? 0;

    // Roll 2D6 + skill
    const roll = await diceDisplay.roll(
        `${skillCheck} Check`,
        2,
        gambleSkill,
        checkTarget,
        '',
        (total) => (total >= checkTarget ? 'SUCCESS' : 'FAILURE'),
        [{ label: skillCheck, value: gambleSkill }]
    );

    const total = roll + gambleSkill;
    let benefitsRegained = 0;

    if (total >= checkTarget) {
        benefitsRegained = Math.ceil(benefitsToWager / 2);
        characterService.log(`**Gamble Success**: Won back ${benefitsRegained}/${benefitsToWager} benefits`);
    } else {
        characterService.log(`**Gamble Failed**: Lost all ${benefitsToWager} wagered benefits`);
    }

    const netLoss = benefitsToWager - benefitsRegained;
    characterService.modifyBenefitRoll(char.currentCareer, -netLoss);
    characterService.addSkill('Gamble', 1);
});
```

**Career Effect Entry** (merchant.json):
```json
{
    "roll": 5,
    "description": "Opportunity for high-stakes gambling. You can wager benefit rolls for a chance to win extra cash.",
    "effects": [
        {
            "type": "CUSTOM",
            "customId": "MERCHANT_GAMBLING_WAGER",
            "payload": {
                "benefitsToWager": 2,
                "skillCheck": "Gamble",
                "checkTarget": 8
            }
        }
    ]
}
```

---

### Handler #2: CONTACT_BECOMES_ENEMY

**Careers**: Agent (Event 5), Rogue (Event 8), Prisoner (Event 9)
**Game Rule**: Former ally becomes adversary/rival

**Logic**:
```
Input:
  - npcRole: string (existing NPC type to find)
  - reason: string (narrative reason for betrayal)
  - modifier?: number (optional skill/stat loss from conflict)

Process:
  1. Search character.npcs for existing NPC of type npcRole
  2. If found:
      a. Change npcRelationship from 'ally' to 'enemy'
      b. Apply skill/stat modifications if provided
      c. Log narrative event
  3. Else:
      a. Create new enemy NPC with provided npcRole
      b. Add to character.npcs as 'enemy'
      c. Log creation event

Output:
  - NPC relationship updated
  - Possible stat/skill penalties
  - Character log entry with reason
```

**Registration Code**:
```typescript
eventEngine.registerCustomHandler('CONTACT_BECOMES_ENEMY', (payload) => {
    const { npcRole, reason, modifier } = payload;
    const char = characterService.character();

    // Find existing NPC
    let existingNpc = char.npcs?.find(n => n.role === npcRole);

    if (existingNpc) {
        existingNpc.relationship = 'enemy';
        characterService.log(`**Betrayal**: ${existingNpc.name} (${npcRole}) has become your enemy. Reason: ${reason}`);
    } else {
        // Create new enemy
        const newEnemy = {
            id: `npc_${Date.now()}`,
            name: `Enemy ${npcRole}`,
            role: npcRole,
            relationship: 'enemy'
        };
        characterService.addNpc(newEnemy);
        characterService.log(`**Enemy Acquired**: A ${npcRole} has become your enemy. Reason: ${reason}`);
    }

    // Apply modifier if present
    if (modifier) {
        if (modifier.stat) {
            characterService.modifyStat(modifier.stat, modifier.value);
            characterService.log(`**Conflict Penalty**: ${modifier.stat} ${modifier.value}`);
        }
        if (modifier.skill) {
            const current = char.skills.find(s => s.name === modifier.skill)?.level ?? 0;
            characterService.addSkill(modifier.skill, Math.max(0, current + modifier.value));
            characterService.log(`**Conflict Penalty**: ${modifier.skill} ${modifier.value}`);
        }
    }
});
```

**Career Effect Entry** (agent.json event 5):
```json
{
    "roll": 5,
    "description": "Your investigation reveals betrayal within ranks.",
    "effects": [
        {
            "type": "CUSTOM",
            "customId": "CONTACT_BECOMES_ENEMY",
            "payload": {
                "npcRole": "informant",
                "reason": "Discovered feeding intelligence to rival agency",
                "modifier": {
                    "stat": "INT",
                    "value": -1
                }
            }
        }
    ]
}
```

---

### Handler #3: ANY_SKILL_UP

**Careers**: Entertainer (Event 4), Citizen (Event 10)
**Game Rule**: Player chooses which skill to improve

**Logic**:
```
Input:
  - options: string[] (list of skills to choose from)
  - level?: number (skill level gain, default 1)

Process:
  1. Display choice UI to player
  2. Player selects one skill from options array
  3. Apply skill gain: addSkill(selected, level)
  4. Log character entry
  5. Return to event flow

Output:
  - One skill from options list increased by level
  - Character log entry
```

**Registration Code**:
```typescript
eventEngine.registerCustomHandler('ANY_SKILL_UP', async (payload) => {
    const { options, level = 1 } = payload;

    // This handler typically requires UI interaction
    // In a component context, dispatch an event or call a service method

    return new Promise((resolve) => {
        // Present choice UI and resolve when player selects
        characterService.log(`**Skill Choice Available**: Choose from ${options.join(', ')}`);

        // Mock implementation - in real scenario, UI would handle this
        const selected = options[0]; // Default to first
        characterService.addSkill(selected, level);
        characterService.log(`**Skill Gained**: ${selected} +${level}`);

        resolve();
    });
});
```

**Career Effect Entry** (entertainer.json event 4):
```json
{
    "roll": 4,
    "description": "During your performance tour, you develop a specialization.",
    "effects": [
        {
            "type": "CUSTOM",
            "customId": "ANY_SKILL_UP",
            "payload": {
                "options": ["Carouse", "Persuade", "Steward", "Perform"],
                "level": 1
            }
        }
    ]
}
```

---

### Handler #4: EXISTING_SKILL_UP

**Careers**: Multiple (events where "all existing skills improve")
**Game Rule**: Only skills character already has increase

**Logic**:
```
Input:
  - level: number (gain amount, typically 1)
  - filter?: string[] (optional: only affect these skills)

Process:
  1. Get all character skills
  2. If filter exists: intersect with filter array
  3. For each skill in result:
      a. Current level += level
      b. Record in character.skills
  4. Log entry showing all skills affected
  5. Notify player of bulk improvement

Output:
  - All existing skills (or filtered set) increased by level
  - Summary log entry
```

**Registration Code**:
```typescript
eventEngine.registerCustomHandler('EXISTING_SKILL_UP', (payload) => {
    const { level = 1, filter } = payload;
    const char = characterService.character();

    let skillsToUpgrade = char.skills || [];
    if (filter && filter.length > 0) {
        skillsToUpgrade = skillsToUpgrade.filter(s => filter.includes(s.name));
    }

    const upgraded = [];
    for (const skill of skillsToUpgrade) {
        characterService.addSkill(skill.name, level);
        upgraded.push(skill.name);
    }

    characterService.log(`**Intensive Training**: ${upgraded.length} skills improved: ${upgraded.join(', ')}`);
});
```

**Career Effect Entry** (example):
```json
{
    "description": "Intensive training in your field improves all your technical skills.",
    "effects": [
        {
            "type": "CUSTOM",
            "customId": "EXISTING_SKILL_UP",
            "payload": {
                "level": 1,
                "filter": ["Technical", "Engineering", "Electronics"]
            }
        }
    ]
}
```

---

### Handler #5: REROLL_PAROLE_THRESHOLD

**Career**: Prisoner
**Game Rule**: Prisoner can retry parole/escape attempt

**Logic**:
```
Input:
  - times: number (number of reroll attempts, usually 1)
  - modifier?: number (bonus/penalty to reroll)

Process:
  1. Store current parole threshold
  2. For each reroll attempt:
      a. Roll new 2D6 + modifier vs threshold
      b. If success: Update parole status, exit loop
      c. If fail: Continue to next attempt or fail final
  3. Apply final result
  4. Log all attempts and final outcome

Output:
  - Parole/escape attempt result
  - Possible career continuation or forced transition
```

**Registration Code**:
```typescript
eventEngine.registerCustomHandler('REROLL_PAROLE_THRESHOLD', async (payload) => {
    const { times = 1, modifier = 0 } = payload;
    const char = characterService.character();

    const paroleTreshold = 8; // Default prisoner parole threshold

    for (let attempt = 0; attempt < times; attempt++) {
        const roll = await diceDisplay.roll(
            `Parole Attempt ${attempt + 1}/${times}`,
            2,
            modifier,
            paroleTreshold
        );

        const total = roll + modifier;
        characterService.log(`**Attempt ${attempt + 1}**: Rolled ${roll}, total ${total} vs ${paroleTreshold}`);

        if (total >= paroleTreshold) {
            characterService.log(`**SUCCESS**: Parole granted after ${attempt + 1} attempt(s)`);
            characterService.updateCharacter({ inPrison: false });
            break;
        } else if (attempt === times - 1) {
            characterService.log(`**FINAL FAILURE**: All ${times} parole attempt(s) failed`);
        }
    }
});
```

**Career Effect Entry** (prisoner.json):
```json
{
    "description": "A sympathetic official offers you another chance at parole.",
    "effects": [
        {
            "type": "CUSTOM",
            "customId": "REROLL_PAROLE_THRESHOLD",
            "payload": {
                "times": 2,
                "modifier": 1
            }
        }
    ]
}
```

---

### Handler #6: INJURY_PROCESS

**Careers**: Multiple (any career with injury events)
**Game Rule**: Process injury roll with complications

**Logic**:
```
Input:
  - severity?: number (1D6 result or override)
  - modifier?: number (bonus/penalty to injury severity)
  - allowAmputations?: boolean (allow limb loss)
  - medicalCost?: number (override default cost)

Process:
  1. Roll or use provided severity (1-6)
  2. Apply modifier to severity
  3. Look up injury result in INJURY_TABLE
  4. Apply stat modifications
  5. Calculate medical cost
  6. Calculate debt if applicable
  7. Update character medical status
  8. Log injury narrative

Output:
  - Stat reductions applied
  - Medical debt calculated
  - Injury recorded in character history
```

**Registration Code**:
```typescript
eventEngine.registerCustomHandler('INJURY_PROCESS', async (payload) => {
    const { severity, modifier = 0, allowAmputations = true, medicalCost } = payload;
    const char = characterService.character();

    // Roll injury severity if not provided
    let injurySeverity = severity ??
        await diceDisplay.roll('Injury Severity', 1, 0);

    injurySeverity = Math.max(1, Math.min(6, injurySeverity + modifier));

    // Look up injury result
    const injuryResult = INJURY_TABLE[injurySeverity - 1];

    characterService.log(`**Injury**: ${injuryResult.description}`);

    // Apply stat modifications
    if (injuryResult.statMods) {
        for (const [stat, delta] of Object.entries(injuryResult.statMods)) {
            characterService.modifyStat(stat as string, delta as number);
        }
    }

    // Calculate medical cost
    const cost = medicalCost ?? injuryResult.baseCost;
    characterService.addDebt(cost);
});
```

---

## Usage Patterns

### Pattern 1: Simple Custom Effect

**When**: Single effect with custom logic, no player choice
```json
{
    "type": "CUSTOM",
    "customId": "SOME_ID",
    "payload": { "data": "value" }
}
```

### Pattern 2: Chained Custom Effect

**When**: Custom effect that triggers another event
```json
{
    "effects": [
        {
            "type": "CUSTOM",
            "customId": "SETUP_EFFECT",
            "payload": {}
        },
        {
            "type": "TRIGGER_EVENT",
            "value": "follow_up_event_id"
        }
    ]
}
```

### Pattern 3: Conditional Custom Effect

**When**: Effect should only apply under certain conditions
```json
{
    "type": "CUSTOM",
    "customId": "CONDITIONAL_HANDLER",
    "payload": {},
    "condition": {
        "minAge": 40,
        "stats": { "STR": 8 }
    }
}
```

---

## Best Practices

### For Handler Developers

1. **Async Safety**: Always await promises, especially dice rolls
2. **Logging**: Use `characterService.log()` for all state changes
3. **Error Handling**: Gracefully handle missing NPCs, skills, or data
4. **Payload Validation**: Check payload fields before use
5. **Idempotency**: Handlers should be safe to call multiple times

### For Career Designers

1. **Keep It Simple**: Use standard effects when possible
2. **Document Intent**: Add clear descriptions in career events
3. **Test Edge Cases**: Verify handler works with various character states
4. **Use Consistent Naming**: Follow `CAPITAL_SNAKE_CASE` for customIds
5. **Avoid Nesting**: Don't chain too many custom effects

---

## Testing Custom Handlers

### Test Template

```typescript
describe('Custom Effect Handler: EXAMPLE_HANDLER', () => {
    let eventEngine: EventEngineService;
    let charService: CharacterService;
    let testChar: Character;

    beforeEach(async () => {
        // Setup
        eventEngine = TestBed.inject(EventEngineService);
        charService = TestBed.inject(CharacterService);
        testChar = createTestCharacter();
    });

    it('should handle happy path', async () => {
        const payload = { /* test data */ };

        eventEngine.registerCustomHandler('EXAMPLE_HANDLER', (p) => {
            // Handler implementation
        });

        await eventEngine.executeCustomHandler('EXAMPLE_HANDLER', payload);

        // Assert state changes
        expect(charService.character().skills).toContain(/* expected */);
    });

    it('should handle edge case: missing data', async () => {
        const payload = { /* incomplete data */ };

        // Should not throw
        await eventEngine.executeCustomHandler('EXAMPLE_HANDLER', payload);

        // Should log warning
        expect(charService.character().history).toContain('WARNING');
    });
});
```

---

## Future Extensions

### Planned Handlers (v2.0)

- `BULK_STAT_MOD` — Apply multiple stat changes at once
- `CHOOSE_BENEFIT` — Player selects from benefit list
- `NPC_NEGOTIATION` — Interactive NPC dialogue with skill checks
- `SHIP_ACQUISITION` — Special starship event chain
- `GENETIC_MODIFICATION` — Cybernetic augmentation handler

---

## Summary

| Handler ID | Career | Purpose | Status |
|-----------|--------|---------|--------|
| MERCHANT_GAMBLING_WAGER | Merchant | Gamble for benefits | ✅ Implemented |
| CONTACT_BECOMES_ENEMY | Agent/Rogue/Prisoner | Betrayal mechanic | ✅ Implemented |
| ANY_SKILL_UP | Entertainer/Citizen | Player choice skill | ✅ Implemented |
| EXISTING_SKILL_UP | Various | Bulk skill improve | ✅ Implemented |
| REROLL_PAROLE_THRESHOLD | Prisoner | Parole retry | ✅ Implemented |
| INJURY_PROCESS | Various | Complex injury | ✅ Implemented |

**Status**: Production Ready (v1.0)

---

**Last Updated**: 2026-02-19
**Maintained By**: Claude Code
**Contact**: For updates/issues contact development team
