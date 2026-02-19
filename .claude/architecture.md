# Arquitetura - TravellerArchitect

## Stack
- Angular 18+ (standalone components, sem NgModules)
- Signals para estado reativo
- RxJS (apenas EventEngine usa BehaviorSubject)
- localStorage para persistência (chave: `traveller-architect-autosave`)
- JSON assets para dados de carreira (HTTP no init)
- Jasmine/Karma para testes

## Estrutura de Pastas
```
src/app/
├── core/
│   ├── models/            # Interfaces TypeScript
│   │   ├── character.model.ts   # Character, Characteristic, Skill, CareerTerm
│   │   ├── career.model.ts      # CareerDefinition, Assignment, CareerEventEffect
│   │   ├── game-event.model.ts  # GameEvent, EventEffect, EventStackItem
│   │   └── nationality.model.ts # Nationality
│   └── services/
│       ├── character.service.ts     # Estado central (signal)
│       ├── career.service.ts        # Carrega JSON careers
│       ├── event-engine.service.ts  # Stack de eventos
│       ├── dice.service.ts          # Rolagem de dados
│       ├── dice-display.service.ts  # Fila UI de dados
│       ├── skill.service.ts         # Lógica de skills
│       ├── storage.service.ts       # localStorage
│       ├── npc-interaction.service.ts
│       └── handlers/               # Strategy Pattern
│           ├── character-effect.handler.ts  # STAT_MOD, SKILL_MOD, TRAIT_GAIN, LOG_ENTRY
│           ├── resource-effect.handler.ts   # ADD_ITEM, RESOURCE_MOD, ADD_NPC
│           ├── career-effect.handler.ts     # FORCE_CAREER, EJECT_CAREER, PROMOTION
│           ├── roll-effect.handler.ts       # ROLL_CHECK, ROLL_TABLE
│           └── custom-effect.handler.ts     # CUSTOM, TRIGGER_EVENT
├── data/                  # Dados estáticos TS
│   ├── nationalities.ts   # NATIONALITIES[]
│   ├── skill-packages.ts  # SKILL_PACKAGES[]
│   ├── npc-tables.ts
│   ├── random-names.ts
│   ├── worlds.ts
│   └── events/shared/
│       ├── life-events.ts
│       ├── career-events.ts
│       ├── education-events.ts
│       ├── mustering-out.ts
│       └── neural-jack-install.event.ts
├── features/character/
│   ├── character-wizard/  # Controller multi-step (9 steps)
│   ├── steps/             # identity, attributes, origin, education, career,
│   │                      # mustering-out, npc-management, skill-package, species
│   ├── components/character-sheet/
│   └── shared/event-display/
└── shared/pipes/upp.pipe.ts

src/assets/data/
├── careers/               # 14 JSONs: agent, army, citizen, drifter, entertainer,
│                          # marine, merchant, navy, noble, prisoner, rogue, scholar,
│                          # scout, spaceborne
└── tables.json            # injuryTable, lifeEventTable, unusualEventTable,
                           # medicalBills, educationEventTable, musteringOutBenefits
```

## Padrões Arquiteturais

### Estado Central
```typescript
// CharacterService é o hub - nunca mutate o objeto diretamente
this.characterSignal.update(c => ({ ...c, changes }));
```

### Strategy Pattern (Handlers)
```typescript
// EventEngineService.handlers[] (ordem importa)
for (const handler of this.handlers) {
  if (handler.canHandle(effect.type)) {
    await handler.handle(effect, context);
    break;
  }
}
```

### Event Processing (Stack LIFO)
```
triggerEvent() → push stack → processNextEvent() → show UI
selectOption() → apply effects → chain/resolve
Sub-events pushed ON TOP (resolvidos primeiro)
```

### APP_INITIALIZER
```typescript
// app.config.ts - careers carregados antes do render
careerService.loadAllCareers()  // fetches 14 JSONs
```

## Rota Única
```typescript
{ path: 'wizard', component: CharacterWizardComponent }
// Redirect '/' → '/wizard'
```
