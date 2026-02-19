# Dados Estáticos - TravellerArchitect

## Career JSON (`src/assets/data/careers/*.json`)

### Estrutura do JSON
```json
{
  "id": "agent",
  "name": "Agent",
  "description": "...",
  "qualification": {
    "stat": "INT",
    "target": 6,
    "minAttributes": { "int": 6 }
  },
  "skills": {
    "personal": ["Gun Combat (any)", "DEX +1"],
    "service": ["Streetwise", "Drive (any)"],
    "advanced": ["Advocate", "Language (any)"]
  },
  "assignments": [{
    "name": "Law Enforcement",
    "survivalStat": "END",
    "survivalTarget": 6,
    "advancementStat": "INT",
    "advancementTarget": 6,
    "skillTable": ["Investigate", "Recon"],
    "ranks": [
      { "level": 0, "title": "Rookie" },
      { "level": 1, "title": "Corporal", "bonusSkill": "Streetwise", "bonusValue": 1 }
    ]
  }],
  "eventTable": [{
    "roll": 7,
    "description": "...",
    "effects": [{ "type": "skill-gain", "skill": "Recon", "value": 1 }],
    "gameEvent": { ... }
  }],
  "mishapTable": [{ "roll": 1, "description": "...", "effects": [...] }],
  "musteringOut": {
    "cash": [1000, 2000, 5000, 10000, 20000, 40000, 60000],
    "benefits": ["Low Passage", "Ship Share", "Weapon", "Combat Implant", "High Passage"]
  }
}
```

### 14 Carreiras Disponíveis

| Arquivo | Carreira | Qualificação |
|---------|---------|-------------|
| agent.json | Agent | INT 6 |
| army.json | Army | STR 8 |
| citizen.json | Citizen | Any 3 |
| drifter.json | Drifter | Any 3 (auto) |
| entertainer.json | Entertainer | CHA 7 |
| marine.json | Marine | END 8 |
| merchant.json | Merchant | INT 6 |
| navy.json | Navy | EDU 7 |
| noble.json | Noble | SOC 9 |
| prisoner.json | Prisoner | STR 7 |
| rogue.json | Rogue | DEX 7 |
| scholar.json | Scholar | EDU 8 |
| scout.json | Scout | END 8 |
| spaceborne.json | Spaceborne | INT 6 + traço 0-G |

---

## tables.json (`src/assets/data/tables.json`)

### Tabelas Incluídas

**injuryTable** (1d6)
- Rolls 1-6 → severidade da lesão
- Cada entrada tem GameEvent com efeitos
- Processos via CUSTOM handler

**lifeEventTable** (2d6)
- Rolls 2-12 → eventos de vida
- Mix: skill gains, stat mods, NPCs, lesões
- Roll 2 → sub-tabela de lesão
- Roll 12 → unusualEventTable

**unusualEventTable** (2d6)
- Sub-tabela de eventos extremos

**educationEventTable** (2d6)
- Eventos específicos de educação
- Alguns disparam life events

**medicalBills**
```
category: 'military' | 'independent' | 'other'
coverage%:
  below4: %    // rolagem < 4
  range4to7: % // rolagem 4-7
  range8to11: % // rolagem 8-11
  above12: %   // rolagem ≥ 12
```

**musteringOutBenefits**
- benefit name → EventEffect[]

---

## Dados TypeScript Estáticos

### nationalities.ts
```typescript
NATIONALITIES: Nationality[]
// 15+ nações com tier (1-4), idiomas, efeitos
// Tier 1: France | Tier 2: US, UK, Germany, Japan
// Tier 3: India, China, Russia, Brazil, Mexico
// Tier 4: Nações em desenvolvimento
```

### skill-packages.ts
```typescript
SKILL_PACKAGES: SkillPackage[]
// 7 pacotes, cada um com 8-10 skills
// Troubleshooter, Colonist, Urbanite, Corporate,
// Libertine Trader, Starship Skills, Mercenary
```

### worlds.ts
```typescript
// 32 mundos fronteiriços 2300AD
// Cada mundo com: gravity, atmosphere, survival DM, available DNAMs
```

### npc-tables.ts
```typescript
getRandomNpcRole(): string    // D66 (36 opções)
getRandomNpcQuirk(): string   // D66 (36 opções)
NPC_NATURES: Record<1-6, string>  // 1d6
```

---

## Dados de Eventos (`data/events/shared/`)

### life-events.ts
```typescript
// Tabela de life events (2d6) e funções geradoras
// Cada evento cria GameEvent com efeitos específicos
```

### career-events.ts
```typescript
// Funções para criar GameEvents de eventos de carreira
// Usadas pelos career JSONs como fallback ou override
```

### education-events.ts
```typescript
// Eventos específicos de educação universitária/académica
```

### mustering-out.ts
```typescript
// Mapeia benefit names → EventEffect[]
// Ex: 'Ship Share' → [{ type: 'RESOURCE_MOD', target: 'shipShares', value: 1 }]
```

### neural-jack-install.event.ts
```typescript
// Evento específico 2300AD de instalação de neural jack
// Custo: 50,000 Lv cash | 2 rolls de benefício | diferido
```

---

## Cálculo de Pensão

```
Carreiras elegíveis (excluídas: scout, rogue, drifter, spaceborne, prisoner)

Por carreira elegível com ≥5 termos:
  5 termos = 10,000 Lv/ano
  6 termos = 12,000 Lv/ano
  7 termos = 14,000 Lv/ano
  8+ = 16,000 + (terms-8) * 2,000 Lv/ano

Ship Shares: dividends = shipShares * 1,000 Lv/ano
```

## Sistema de Liberdade Condicional (Prisoner)

```
paroleThreshold inicial = 1d6 + 2 (range 1-8)
Por termo: roll advancement
  Se roll > threshold → liberado!
  Else: threshold ±delta

Modificadores:
  Bom comportamento → threshold -1
  Mau comportamento → threshold +1
```
