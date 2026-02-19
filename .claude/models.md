# Modelos e Interfaces - TravellerArchitect

## Character (`character.model.ts`)

```typescript
Character {
  // Identidade
  name, nickname, gender, age, playerName, species
  nationality: string        // code (FR, US, UK...)
  originType: 'core'|'frontier'|'spacer'
  homeworld: World

  // 6 Características
  characteristics: {
    STR, DEX, END, INT, EDU, SOC: Characteristic
  }

  // Skills
  skills: Skill[]
  backgroundSkillsSelected: boolean

  // Educação
  education: {
    university?, academy?, honors?, graduated?, fail?
    offworld?, major?, minor?, branch?
  }

  // Carreira
  careerHistory: CareerTerm[]
  currentStep: number  // 1-9
  isFinished: boolean

  // Finanças
  cash, pension, debt, medicalDebt, shipShares: number
  benefitRollMod, benefitRollDebt: number
  benefitRollsSpent, cashRollsSpent: number
  benefitRollsAllocated: Record<string, number>  // careerName → count
  isGambler, deferredCost: number

  // NPCs
  npcs: NPC[]
  connectionsUsed: number

  // 2300AD específico
  hasNeuralJack, isNeuralJackInstalled: boolean
  isSoftPath: boolean
  hasLeftHome: boolean
  ejectedCareers: string[]
  psionicPotential: boolean

  // DMs persistentes (limpos após uso)
  qualificationDm, survivalDm, advancementDm, benefitDm: number

  // Outros
  traits: string[]
  items: string[]
  history: string[]  // log de mudanças
  injuries: Injury[]
  augments: Augment[]
}

Characteristic {
  value: number
  modifier: number           // calculado
  originalValue: number      // valor inicial rolado
  gravityMod, geneticMod, augmentsMod: number
}

Skill {
  name: string
  level: number
  specialization?: string
}

CareerTerm {
  termNumber: number
  careerName: string
  assignment: string
  rank: number
  rankTitle: string
  ageStart, ageEnd: number
  survived, commissioned, advanced: boolean
  events: string[]
  benefits: string[]
  leavingHome?: boolean
  loseCashBenefits?: boolean
  benefitRollsGained: number
}

NPC {
  id: string
  name: string
  type: 'contact'|'ally'|'rival'|'enemy'|'friend'|'romantic'|'other'
  origin: string        // de que evento/carreira
  notes?: string
  quirk?: string
  role?: string
  nature?: string
}
```

## CareerDefinition (`career.model.ts`)

```typescript
CareerDefinition {
  id, name, description: string

  qualification: {
    stat: string     // 'INT', 'STR', etc.
    target: number
    minAttributes?: Record<string, number>
  }

  skills: {
    personal: string[]
    service: string[]
    advanced: string[]
    officerSkills?: string[]
  }

  assignments: Assignment[]

  eventTable: CareerEvent[]
  mishapTable: CareerMishap[]

  musteringOut: {
    cash: number[]
    benefits: string[]
  }
}

Assignment {
  name: string
  survivalStat: string
  survivalTarget: number
  advancementStat: string
  advancementTarget: number
  skillTable: string[]
  ranks: Rank[]
}

Rank {
  level: number
  title: string
  bonus?: string
  bonusSkill?: string
  bonusValue?: number
}

// Tipos de efeitos em eventos de carreira
CareerEventEffect.type:
  'life-event' | 'mishap' | 'skill-choice' | 'skill-gain' | 'stat-bonus' |
  'benefit-dm' | 'advancement-dm' | 'auto-promotion' | 'npc' | 'injury' |
  'skill-check' | 'lose-benefit' | 'extra-roll' | 'choice' | 'sub-roll' |
  'career-force' | 'forced-out' | 'lose-cash-benefits' | 'stat-reduction-choice' |
  'bet-benefit-rolls' | 'parole-mod' | 'trait-gain' | 'npc-note' |
  'narrative' | 'neural-jack'
```

## GameEvent / EventEffect (`game-event.model.ts`)

```typescript
GameEvent {
  id: string
  type: 'CHOICE'|'CHECK'|'REWARD'|'DISASTER'|'INFO'|'MISHAP'|'ROLL_TABLE'|'LIFE_EVENT'
  trigger: 'DURING_CAREER_TERM'|'MUSTERING_OUT'|'LIFE_EVENT'|'MISHAP'|'MANUAL'|'AGING'|'GRADUATION'

  conditions?: EventCondition {
    career?: string[]
    minAge?: number
    stats?: Record<string, number>
    traits?: string[]
    nationTier?: number
    term?: number
    customCheck?: (char) => boolean
  }

  ui: EventUI {
    title: string
    description: string
    imageUrl?: string
    options: EventOption[]
  }

  nextEventId?: string        // encadeamento automático
  parentEventId?: string
}

EventOption {
  label: string
  nextEventId?: string
  replaceNext?: boolean       // substitui próximo evento
  effects: EventEffect[]
}

EventEffect {
  type: 'STAT_MOD'|'SKILL_MOD'|'ADD_ITEM'|'ADD_NPC'|'RESOURCE_MOD'|
        'LOG_ENTRY'|'LOSE_BENEFIT'|'FORCE_CAREER'|'EJECT_CAREER'|
        'ROLL_CHECK'|'ROLL_TABLE'|'CUSTOM'|'TRIGGER_EVENT'|
        'TRAIT_GAIN'|'PROMOTION'|'AUTO_PROMOTION'|'SUPPRESS_EJECTION'

  target: string        // stat, recurso, etc.
  value: any
  duration?: 'permanent'|'term'

  // Para ROLL_CHECK
  stat?: string
  checkTarget?: number
  dm?: number
  onPass?: string|EventEffect[]
  onFail?: string|EventEffect[]
  isSurvivalCheck?: boolean   // regra 245: sucesso exato → prótese
  rollType?: 'qualification'|'survival'|'advancement'|'benefit'|'check'

  // Para ROLL_TABLE
  table?: any[]
  dice?: '1d6'|'2d6'|'d66'
}

EventStackItem {
  event: GameEvent
  context: EventContext { characterId, careerId, currentTerm, metadata }
  status: 'PENDING'|'ACTIVE'|'RESOLVED'|'CANCELLED'
  result?: any
  resolve?: () => void
  resumeNextEventId?: string
}
```

## Nationality (`nationality.model.ts`)

```typescript
Nationality {
  code: string          // 'FR', 'US', 'UK'...
  name: string
  tier: 1|2|3|4
  description: string
  languages: string[]
  adjectives: string[]
  effects?: EventEffect[]
}
```

## INITIAL_CHARACTER
- Definido em `character.model.ts`
- Fornece estado vazio padrão para reset
- Todas propriedades com valores default/zero

## Targets para RESOURCE_MOD
```
'benefit_rolls'         → addBenefitRoll / spendBenefitRoll
'next_qualification_dm' → updateDm('qualification')
'next_advancement_dm'   → updateDm('advancement')
'next_benefit_dm'       → updateDm('benefit')
'next_survival_dm'      → updateDm('survival')
'parole_dm'             → modifyParoleThreshold
'shipShares'            → updateFinances({shipShares: +value})
```
