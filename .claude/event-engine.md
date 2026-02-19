# Event Engine - TravellerArchitect

## Visão Geral

Stack LIFO de eventos com handler chain (Strategy Pattern).
Suporta encadeamento, sub-eventos e escolhas do jogador.

## Fluxo Completo

```
triggerEvent(id)
  ├─ Verifica condições
  ├─ Cria EventStackItem { PENDING }
  ├─ Push no stack
  └─ processNextEvent()

processNextEvent()
  ├─ Stack vazio? → resolve promise, done
  ├─ Pop topo
  ├─ resumeNextEventId? → triggerEvent(resumeId)
  ├─ RESOLVED? → recurse
  └─ PENDING:
     ├─ status = ACTIVE
     └─ currentEvent signal atualizado (UI reage)

selectOption(index)
  ├─ Pega opção do evento atual
  ├─ applyEffects(option.effects)
  │  └─ Handlers processam efeitos (podem disparar sub-eventos)
  ├─ Sub-eventos adicionados?
  │  ├─ item.status = RESOLVED
  │  ├─ item.resumeNextEventId = option.nextEventId
  │  └─ processNextEvent() (sub-eventos processados primeiro)
  └─ Sem sub-eventos:
     ├─ resolve item
     ├─ option.nextEventId? → triggerEvent()
     └─ processNextEvent()
```

## Tipos de EventEffect e Handlers

### CharacterEffectHandler
| type | Ação |
|------|------|
| `STAT_MOD` | `characterService.modifyStat(target, value)` |
| `SKILL_MOD` | `characterService.addSkill(target, value)` |
| `TRAIT_GAIN` | `characterService.addTrait(value)` |
| `LOG_ENTRY` | `characterService.log(value)` |

### ResourceEffectHandler
| type | target | Ação |
|------|--------|------|
| `ADD_ITEM` | item name | `characterService.addItem()` |
| `RESOURCE_MOD` | `benefit_rolls` | add/spend rolls |
| `RESOURCE_MOD` | `next_qualification_dm` | `updateDm('qualification')` |
| `RESOURCE_MOD` | `next_advancement_dm` | `updateDm('advancement')` |
| `RESOURCE_MOD` | `next_benefit_dm` | `updateDm('benefit')` |
| `RESOURCE_MOD` | `next_survival_dm` | `updateDm('survival')` |
| `RESOURCE_MOD` | `parole_dm` | `modifyParoleThreshold()` |
| `RESOURCE_MOD` | `shipShares` | `updateFinances({shipShares: +value})` |
| `ADD_NPC` | npc type | async `npcService.promptForNpc()` |

### CareerEffectHandler
| type | Ação |
|------|------|
| `FORCE_CAREER` | `characterService.setNextCareer(value)` |
| `EJECT_CAREER` | verifica `suppressEjection` → `ejectCareer()` |
| `PROMOTION` / `AUTO_PROMOTION` | `characterService.promote()` → verifica rank bonuses |
| `SUPPRESS_EJECTION` | `suppressEjection.set(true)` |

### RollEffectHandler
```
ROLL_CHECK:
  1. Constrói modifiers (stat DM + skill DM + DM persistentes)
  2. diceDisplay.roll() → Promise<total>
  3. Limpa DM persistente após roll
  4. total >= checkTarget? → onPass | onFail
     - onPass/onFail: string (event ID) | EventEffect[]
  5. Regra 245 (isSurvivalCheck + sucesso exato):
     → Disparar PROSTHETIC_CHOICE_EVENT
     → replaceNext=true → chain para onPass

ROLL_TABLE:
  1. diceDisplay.roll(dice type)
  2. Lookup resultado na table[]
  3. Se GameEvent → register + triggerEvent
  4. Else → createDynamicEvent() dos legacy effects
```

### CustomEffectHandler
| type | Ação |
|------|------|
| `CUSTOM` | Executa callback registrado via `registerCustomHandler(id, fn)` |
| `TRIGGER_EVENT` | `eventEngine.triggerEvent(value)` |

## Criação Dinâmica de Eventos

```typescript
// Converte legacy effects (career JSON) → GameEvent em runtime
createDynamicEvent(title, desc, legacyEffects?)
  → id: 'dyn_..._timestamp'
  → options mapeadas dos legacy effects
  → skill-choice → CHOICE com opções por skill
  → outros → INFO com efeitos diretos
```

## Regras Especiais

### Regra 245 (Sobrevivência Exata)
```
Roll survival = alvo exato (não maior, exato)
  → triggerEvent('PROSTHETIC_CHOICE_EVENT')
  → Jogador escolhe tipo de prótese
  → Após escolha → chain para onPass original
  → replaceNext=true para evitar loop
```

### suppressEjection
```
Algumas career events: { type: 'SUPPRESS_EJECTION' }
  → Próximo EJECT_CAREER é ignorado (carreira continua)
  → Flag é limpa após verificação
```

## Encadeamento de Eventos

```typescript
// Sequência linear
eventA.nextEventId = 'eventB'    // A → B automático

// Opção com próximo
option.nextEventId = 'eventC'    // escolha leva para C

// Sub-eventos (paralelo, processar primeiro)
handler dispara triggerEvent()   // sub-evento no topo do stack
item atual fica em pausa com resumeNextEventId
Sub-evento resolve → item retoma → chain continua
```

## Registro de Eventos Customizados

```typescript
// Para adicionar novos eventos de forma dinâmica
eventEngine.registerEvent({
  id: 'my-event',
  type: 'CHOICE',
  trigger: 'MANUAL',
  ui: { title: '...', description: '...', options: [...] }
});

// Para callbacks custom
eventEngine.registerCustomHandler('my-callback', (payload, context) => {
  // Lógica customizada
});
```

## Debug

```typescript
eventEngine.outcomes.value    // Array de mensagens de resultado
eventEngine.currentEvent()    // Evento ativo atual
diceDisplay.debugMode.set(true)  // Ativa overlay de debug
```
