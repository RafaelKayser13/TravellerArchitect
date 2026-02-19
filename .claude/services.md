# Serviços - TravellerArchitect

## CharacterService (Estado Central)
`src/app/core/services/character.service.ts`

### Signals Exportados
- `character` (readonly) - Character completo
- `currentCareer` - Carreira ativa (string|null)
- `pension` (computed) - Pensão calculada
- `totalRolls` (computed) - Total de rolls de benefício

### Métodos de Mutação

| Método | Assinatura | Descrição |
|--------|-----------|-----------|
| `updateCharacter` | `(partial: Partial<Character>)` | Merge no character |
| `updateCharacteristics` | `(chars)` | Atualiza stats com histórico |
| `modifyStat` | `(stat: string, amount: number)` | +/- em uma stat |
| `addSkill` | `(name, level?, isFirstTerm?) → boolean` | Concede skill (true=escolha necessária) |
| `getSkillLevel` | `(name) → number` | Nível atual ou -3 se não existe |
| `ensureSkillLevel` | `(name, minLevel)` | Define nível mínimo |
| `addNpc` | `(npc: NPC)` | Adiciona NPC |
| `convertNpc` | `(fromId, toType)` | Muda tipo de NPC |
| `convertNpcType` | `(fromType, toType)` | Bulk convert 1º NPC do tipo |
| `removeNpc` | `(id)` | Remove NPC |
| `updateDm` | `(type, value)` | DM persistente (qualification/survival/advancement/benefit) |
| `setPsionicPotential` | `(bool)` | Flag psiônica |
| `setEducationStatus` | `(success, graduated?)` | Status educação |
| `updateFinances` | `(partial: Partial<Finances>)` | Merge finanças |
| `setNextCareer` | `(name)` | Força próxima carreira |
| `setParoleThreshold` | `(1-12)` | Limiar de liberdade condicional |
| `modifyParoleThreshold` | `(delta)` | Ajusta limiar |
| `promote` | `(careerName?)` | Incrementa rank no termo atual |
| `ejectCareer` | `(careerName)` | Marca carreira como ejetada |
| `clearEjectedCareers` | `()` | Limpa lista de ejeções |
| `clearCareerCashHistory` | `(careerName)` | Perde benefícios em dinheiro (falência Merchant) |
| `setGambler` | `(bool)` | Flag apostador |
| `log` | `(message)` | Entrada em character.history[] |
| `addInjury` | `(name, stat?, reduction?, cost?)` | Lesão permanente |
| `addBenefitRoll` | `(careerName, count?)` | Incrementa rolls de benefício |
| `spendBenefitRoll` | `(careerName?, count?, isCash?) → boolean` | Gasta roll (max 3 cash) |
| `finalizeCharacter` | `()` | Calcula pensão final, isFinished=true |
| `setNeuralJackInstalled` | `(bool)` | Flag neural jack |
| `addItem` | `(item: string)` | Adiciona equipamento |
| `addTrait` | `(trait: string)` | Trait permanente |
| `setCurrentStep` | `(step: 1-9)` | Passo do wizard |
| `reset` | `()` | Limpa tudo + localStorage |

### Lógica-Chave
- Auto-save em toda mutação (key: `autosave`)
- Cap de skill durante criação: 4
- Cap global: INT + EDU (warning only)

---

## CareerService
`src/app/core/services/career.service.ts`

```typescript
careers: Signal<Map<string, CareerDefinition>>

loadAllCareers()   // APP_INITIALIZER - fetches 14 JSONs
getCareer(name)    // lookup por nome ou id
getAllCareers()     // array único deduplicado
```

**14 Carreiras:** agent, army, citizen, drifter, entertainer, marine, merchant, navy, noble, prisoner, rogue, scholar, scout, spaceborne

---

## EventEngineService
`src/app/core/services/event-engine.service.ts`

### Signals/Estado
```typescript
currentEvent$: BehaviorSubject<EventStackItem|null>
currentEvent: Signal<GameEvent|null>
outcomes: Signal<string[]>
suppressEjection: Signal<boolean>
```

### Métodos Principais
```typescript
registerEvent(event: GameEvent): void
getEvent(eventId: string): GameEvent|undefined
triggerEvent(id, replace?, clearOutcomes?): Promise<void>
selectOption(optionIndex: number): Promise<void>
applyEffects(effects: EventEffect[]): Promise<void>
checkRankBonuses(career, assignment, rank): void
logOutcome(message: string): void
createDynamicEvent(title, desc, legacyEffects?): GameEvent
registerCustomHandler(id, fn): void
executeCustomHandler(id, payload): any
rollValue(value: string|number): number  // parse "1d6", "2d6"
```

### Handlers (ordem na chain)
1. CharacterEffectHandler
2. ResourceEffectHandler
3. CareerEffectHandler
4. RollEffectHandler
5. CustomEffectHandler

---

## DiceService
`src/app/core/services/dice.service.ts`

```typescript
roll(count=2, sides=6): { total: number, rolls: number[] }
rollD66(): number   // D66: tens+units (11-66)
getModifier(score: number): number  // -3 a +3
```

---

## DiceDisplayService
`src/app/core/services/dice-display.service.ts`

```typescript
request: Signal<RollRequest|null>
debugMode: Signal<boolean>

roll(reason, diceCount?, dm?, target?, statName?, modifiers?, getResultDescription?, debugTableData?): Promise<number>
complete(total: number): void   // resolve Promise, next queue
```

**RollRequest:** `{ reason, diceCount, dm, target, statName?, modifiers?, getResultDescription?, debugTableData?, resolve }`

---

## SkillService
`src/app/core/services/skill.service.ts`

```typescript
processSkillAward(
  currentSkills: Skill[],
  awardName: string,
  awardLevel?: number,
  isFirstTermBasicTraining?: boolean
): { skills: Skill[], message: string, choiceRequired: boolean }
```

**Skills genéricas (requerem especialização):** Art, Drive, Electronics, Engineer, Flyer, Gun Combat, Gunner, Heavy Weapons, Language, Melee, Pilot, Profession, Science, Seafarer, Animals, Athletics, Tactics

**Especializações 2300AD para Engineer:** Life Support, M-Drive, Power, Stutterwarp
**Especializações 2300AD para Science:** 18 opções (Archaeology, Astronomy, Biology, Chemistry, etc.)

---

## StorageService
`src/app/core/services/storage.service.ts`

```typescript
save(key, data): void      // localStorage['traveller-architect-' + key]
load(key): any|null
remove(key): void
clearAll(): void
```

---

## NpcInteractionService
`src/app/core/services/npc-interaction.service.ts`

```typescript
request: Signal<NpcRequest|null>
promptForNpc(npcData): Promise<NPC>
complete(finalNpc: NPC): void
cancel(): void
```
