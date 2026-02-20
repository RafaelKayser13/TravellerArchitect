# Plano de Ação — Cobertura de Rolagens e Tabelas

> Auditoria completa de todas as situações de dado no sistema e diagnóstico de implementação vs. pendências.

---

## 1. Arquitetura Atual de Processamento

### Fluxo de efeitos (Strategy Pattern)

```
EventEngineService.applyEffects(effects[])
  └─ CharacterEffectHandler   → STAT_MOD, SKILL_MOD, TRAIT_GAIN, LOG_ENTRY
  └─ ResourceEffectHandler    → ADD_ITEM, RESOURCE_MOD, ADD_NPC
  └─ CareerEffectHandler      → FORCE_CAREER, EJECT_CAREER, PROMOTION
  └─ RollEffectHandler        → ROLL_CHECK, ROLL_TABLE
  └─ CustomEffectHandler      → CUSTOM, TRIGGER_EVENT
```

### Tipos de efeito reconhecidos pelo modelo (`EventEffect.type`)

| Tipo | Handler | Status |
|------|---------|--------|
| `STAT_MOD` | Character | ✅ Implementado |
| `SKILL_MOD` | Character | ✅ Implementado |
| `TRAIT_GAIN` | Character | ✅ Implementado |
| `LOG_ENTRY` | Character | ✅ Implementado |
| `ADD_ITEM` | Resource | ✅ Implementado |
| `RESOURCE_MOD` | Resource | ✅ Parce implementado (ver §4) |
| `ADD_NPC` | Resource | ✅ Implementado (com prompt ao jogador) |
| `FORCE_CAREER` | Career | ✅ Implementado |
| `EJECT_CAREER` | Career | ✅ Implementado |
| `PROMOTION` | Career | ✅ Implementado |
| `ROLL_CHECK` | Roll | ✅ Implementado (com briefing/feedback) |
| `ROLL_TABLE` | Roll | ✅ Implementado |
| `CUSTOM` | Custom | ✅ Implementado (via registry de callbacks) |
| `TRIGGER_EVENT` | Custom | ✅ Implementado |
| `LOSE_BENEFIT` | **Nenhum** | ❌ **Não tratado** |

---

## 2. Inventário Completo de Rolagens

### 2.1 Criação de Personagem (antes das carreiras)

| # | Situação | Dados | Como é feita a rolagem | Implementação atual |
|---|----------|-------|------------------------|---------------------|
| A | **Atributos (STR/DEX/END/INT/EDU/SOC)** | 2d6 × 6 | `AttributesComponent.rollSequence()` — animação sequencial | ✅ Completo. Debug mode disponível. |
| B | **Qualificação de Carreira** | 2d6 + mod stat | `CareerComponent.qualify()` — usa `diceDisplay.roll()` com briefing | ✅ Completo. Inclui DM de anteriores, idade, universidade, Legion, nação. |
| C | **Draft** (falha de qualificação no Termo 1) | 1d6 | `CareerComponent.runDraft()` | ⚠️ Rolagem existe, mas texto de briefing do draft não aparece ao jogador via diceDisplay |

### 2.2 Tabelas de Skills (por tabela de treinamento)

| # | Situação | Dados | Como é feita | Implementação atual |
|---|----------|-------|--------------|---------------------|
| D | **Basic Training** (Termo 1) | — (sem dados, todos skill 0) | `performBasicTraining()` → `grantBasicTrainingSkills()` | ✅ Completo |
| E | **Skill Training** (escolha de tabela + rolagem) | 1d6 | `rollSkillTable()` — seleciona linha da tabela personal/service/advanced/officer/assignment | ⚠️ A rolagem ocorre, mas o **briefing pré-rolagem** (instrução ao jogador de qual tabela está rolando e por que) não é mostrado de forma narrativa — só o título no diceDisplay. |
| F | **Post-Term Skill Training** (termos seguintes) | 1d6 | Mesmo método, chamado em estado `POST_TERM_SKILL_TRAINING` | ⚠️ Mesmo problema que E |
| G | **Bonus Skill Rolls** (de eventos/promoção) | 1d6 | Mesmo mecanismo, quantidade extra em `bonusSkillRolls` | ✅ Funcional, mas sem distinção visual de "esse bônus veio de X evento" |

### 2.3 Checagem de Survival (por termo)

| # | Situação | Dados | Como é feita | Implementação atual |
|---|----------|-------|--------------|---------------------|
| H | **Survival Check** | 2d6 + mod stat | `createSurvivalCheckEvent()` → `ROLL_CHECK` c/ `isSurvivalCheck: true` | ✅ Completo. Inclui briefing, announcement, successContext, failureContext. Regra 245 (exato = prosthetic choice) implementada. |
| I | **Survival falha → Mishap Table** | 2d6 | `createMishapRollEvent()` → `ROLL_TABLE` da carreira | ✅ Rolagem ocorre. Ver §2.5 para cobertura das entradas individuais. |

### 2.4 Eventos de Termo (Event Table por carreira — 2d6)

| # | Situação | Dados | Como é feita | Implementação atual |
|---|----------|-------|--------------|---------------------|
| J | **Event Roll** | 2d6 | `createEventRollEvent(career, table)` → `ROLL_TABLE` | ✅ Rolagem existe. Ver §2.4.1 para cobertura por carreira. |

#### 2.4.1 Cobertura das entradas das Event Tables (por tipo de efeito)

| Tipo de entrada | Implementação no JSON | Processamento | Status |
|---|---|---|---|
| **Skill Choice** (ex: "Gain one of X/Y/Z") | `gameEvent.type: CHOICE`, opções com `SKILL_MOD` | `selectOption()` aplica `SKILL_MOD` via CharacterHandler | ✅ Completo |
| **Disaster → Mishap sem ejeção** (roll=2) | `TRIGGER_EVENT → mishap_roll` | Dispara tabela de mishap | ✅ Completo |
| **Stat Modifier** (ex: "+1 STR") | `STAT_MOD` | CharacterHandler | ✅ Completo |
| **Skill up** (ex: "Advance a skill by 1") | `SKILL_MOD` | CharacterHandler | ✅ Completo |
| **ROLL_CHECK dentro de evento** (ex: "INT 8+ or lose benefit") | `ROLL_CHECK` com `onPass`/`onFail` | RollHandler c/ DiceDisplay | ✅ Completo |
| **NPC Gain** (contato/aliado/rival) | `ADD_NPC` | ResourceHandler + prompt | ✅ Completo |
| **Life Event Roll** | `ROLL_TABLE` → lifeEventTable | RollHandler | ✅ Completo |
| **Neural Jack Event** | `TRIGGER_EVENT → neural_jack_install` | CustomHandler → NEURAL_JACK_INSTALL_EVENT | ✅ Implementado |
| **Benefit Roll bonus** | `RESOURCE_MOD → benefit_rolls` | ResourceHandler | ✅ Implementado |
| **Qualification DM** | `RESOURCE_MOD → next_qualification_dm` | ResourceHandler | ✅ Implementado |
| **Advancement DM** | `RESOURCE_MOD → next_advancement_dm` | ResourceHandler | ✅ Implementado |
| **Ship Shares** | `RESOURCE_MOD → shipShares` | ResourceHandler | ✅ Implementado |
| **Promotion automática** | `PROMOTION` | CareerHandler | ✅ Implementado |
| **Psiônico** | `CUSTOM → SET_PSIONIC_POTENTIAL` | Callback custom | ✅ Implementado |
| **Traição (ally→rival)** | `CUSTOM → BETRAYAL_LOGIC` | Callback custom | ✅ Implementado |
| **next_benefit_dm** | `RESOURCE_MOD → next_benefit_dm` | ResourceHandler | ❌ **`next_benefit_dm` não está mapeado no ResourceHandler** |

### 2.5 Mishap Tables (por carreira)

| # | Situação | Dados | Como é feita | Status |
|---|----------|-------|--------------|--------|
| K | **Mishap Roll** | 2d6 | `createMishapRollEvent()` → `ROLL_TABLE` da carreira | ✅ Rolagem existe |
| K.1 | Entradas com `gameEvent` definido | — | Registra e dispara `gameEvent` | ✅ Funciona |
| K.2 | Entradas apenas com `effects[]` legado | — | `createDynamicEvent()` com `mapLegacyEffects()` | ⚠️ Funciona mas sem título/descrição narrativa ao jogador |
| K.3 | **Ejeção de carreira** | — | `EJECT_CAREER` | ✅ Implementado |
| K.4 | **`LOSE_BENEFIT`** (ex: "perde 1 benefit roll") | — | Nenhum handler reconhece este tipo | ❌ **Não tratado** |

### 2.6 Tabela de Injúrias (Injury Table — 1d6)

| Roll | Nome | Efeito | Implementação |
|------|------|--------|---------------|
| 1 | Nearly Killed | 1d6 de stat físico + 2 de outros dois | `CUSTOM → INJURY_PROCESS` (severity 1) | ⚠️ Custom handler `INJURY_PROCESS` está **registrado duas vezes** no career.component (duplicata em ngOnInit linhas ~215 e ~240). Funciona mas é inconsistente. |
| 2 | Severely Injured | 1d6 de stat físico | Idem severity 2 | ⚠️ Mesmo |
| 3 | Missing Eye/Limb | STR ou DEX -2 (escolha) | `gameEvent` com opções + `STAT_MOD` | ✅ Escolha implementada |
| 4 | Scarred | -2 em stat físico (escolha) | Idem | ✅ |
| 5 | Injured | -1 em stat físico | `STAT_MOD` | ✅ |
| 6 | Light Wound | -1 STR e -1 DEX | `STAT_MOD` x2 | ✅ |
| — | **Cobertura médica após injúria** | Rolagem 2d6+rank → % de cobertura | `CareerTermService.calculateMedicalCoverage()` | ✅ Implementado, com debt calculation |
| — | **Dívida médica** | Custo - cobertura | `calculateMedicalDebt()` | ✅ Implementado |
| — | **Escolha: Prótese vs Dívida** | Player choice | `createInjuryEvent()` com opções | ✅ Implementado |

### 2.7 Life Event Table (2d6)

| Roll | Nome | Efeito | Implementação |
|------|------|--------|---------------|
| 2 | Injury | → Injury Table | ✅ `TRIGGER_EVENT → injury_roll` |
| 3 | Birth/Death | LOG apenas | ⚠️ Só loga — **deveria gerar NPC** (familiar que morre) ou feature narrativa |
| 4 | Ending of Relationship | Rival ou Enemy (1d2) | ✅ `ROLL_TABLE 1d2 → ADD_NPC` |
| 5 | Improved Relationship | Ally | ✅ `ADD_NPC` |
| 6 | New Relationship | Ally | ⚠️ Tem `effects[]` mas **não tem `gameEvent`** — usa caminho legacy sem popup ao jogador |
| 7 | New Contact | Contact | ⚠️ Mesmo — sem `gameEvent` |
| 8 | Betrayal | Contact→Rival | ✅ `CUSTOM → BETRAYAL_LOGIC` — mas lógica só cria Rival genérico; deveria verificar se há contact existente para converter |
| 9 | Travel | +2 Qualification DM | ✅ `RESOURCE_MOD → next_qualification_dm +2` |
| 10 | Good Fortune | +2 benefit DM | ❌ **`next_benefit_dm` não está no ResourceHandler** |
| 11 | Crime | Perde Benefit OU → Prisoner | ⚠️ `ROLL_TABLE 1d2` existe; opção "Forced Prisoner" usa `FORCE_CAREER` ✅ mas a opção "perde benefit" usa `RESOURCE_MOD → benefit_rolls, -1` ✅ |
| 12 | Unusual Event | → Unusual Event Table | ✅ `ROLL_TABLE → unusualEventTable` |

### 2.8 Unusual Event Table (1d6)

| Roll | Descrição | Implementação |
|------|-----------|---------------|
| 1 | Psiónico — roll Psionic Potential | `CUSTOM → SET_PSIONIC_POTENTIAL` | ✅ |
| 2 | Alien — Contact of unusual species | `ADD_NPC` | ✅ |
| 3 | Find Ancient Technology | `ADD_ITEM` | ✅ (provável) |
| 4 | Amnesia | `LOG_ENTRY` | ⚠️ Apenas log, sem efeito de ficha |
| 5 | Contact criminal cartel | `ADD_NPC (enemy/contact)` | ✅ |
| 6 | Gain ancient artifact | `ADD_ITEM` | ✅ |

### 2.9 Advancement Check

| # | Situação | Dados | Como é feita | Status |
|---|----------|-------|--------------|--------|
| L | **Advancement Roll** | 2d6 + mod stat | `CareerComponent.advance()` — usa `diceDisplay.roll()` com briefing | ✅ Completo, inclui DMs persistidos |
| L.1 | Sucesso → Rank Up + Rank Bonus | — | `currentRank++`, `applyRankBonus()`, `checkRankBonuses()` | ✅ |
| L.2 | **Commission Roll** (militares) | 2d6 + mod SOC | `CareerComponent.attemptCommission()` | ✅ Implementado |
| L.3 | Máximo de ranks → forçado a sair na próxima | — | `mandatoryContinue` flag | ✅ |

### 2.10 Benefit Tables / Mustering Out

| # | Situação | Dados | Como é feita | Status |
|---|----------|-------|--------------|--------|
| M | **Cálculo de benefit rolls** | — | `finishTerm()` — ranks + termos | ✅ |
| M.1 | **Cash Table Roll** | 1d6 | `rollBenefit('cash')` | ✅ |
| M.2 | **Material Benefit Table Roll** | 1d6 | `rollBenefit('material')` | ✅ |
| M.3 | **Ship Shares** | 1d6 | Resultado de material table | ✅ |
| M.4 | **Gambling mecânica Merchant** | — | Bet benefit rolls antecipados | ✅ Implementado |
| M.5 | **DM Rank no Cash/Material** | +1/+2 por rank ≥3/5 | `benefitDm` | ✅ |

### 2.11 Aging Checks

| # | Situação | Dados | Como é feita | Status |
|---|----------|-------|--------------|--------|
| N | **Aging Roll** (a partir de idade 50, a cada 4 anos) | 2d6 + mod END | `CareerTermService.checkAging()` | ✅ Completo, com statDeltas retornados |
| N.1 | Resultado: redução de stats | — | `statDeltas` aplicados via `modifyStat()` | ✅ |
| N.2 | Resultado: fim de carreira | — | `endCareer: true` | ✅ |

### 2.12 Leaving Home (2300AD)

| # | Situação | Dados | Como é feita | Status |
|---|----------|-------|--------------|--------|
| O | **Leaving Home Roll** | 2d6 | `CareerTermService.rollLeavingHome()` | ✅ Implementado |

### 2.13 Education (Universidade / Academia)

| # | Situação | Dados | Como é feita | Status |
|---|----------|-------|--------------|--------|
| P | **Entry Roll** para Universidade | 2d6 + EDU | `EducationComponent` | ⚠️ Verificar cobertura de DMs (honor, pré-requisitos) |
| Q | **Event Table Universidade** | 2d6 | Tabela própria de eventos acadêmicos | ⚠️ A ser auditado separadamente |
| R | **Graduation Roll** | 2d6 | Pass/Fail + Honors | ⚠️ Verificar |

---

## 3. Bugs e Lacunas Identificadas

### CRÍTICO

| ID | Problema | Arquivo | Impacto |
|----|----------|---------|---------|
| **BUG-01** | `LOSE_BENEFIT` não tem handler — efeitos que usam este type são ignorados silenciosamente | `effect-handler.interface.ts`, todos os handlers | Jogador não perde benefit rolls quando deveria |
| **BUG-02** | `next_benefit_dm` não está mapeado no `ResourceEffectHandler` (life event roll=10 "Good Fortune", etc.) | `resource-effect.handler.ts` | DM de benefit roll não é aplicado |
| **BUG-03** | `INJURY_PROCESS` handler registrado duas vezes no `ngOnInit` do career.component (linha ~215 e ~240) | `career.component.ts` | Segunda chamada sobrescreve a primeira; comportamento imprevisível |

### ALTO

| ID | Problema | Impacto |
|----|----------|---------|
| **GAP-01** | Life events roll=6 ("New Relationship") e roll=7 ("New Contact") não têm `gameEvent` — caem no fallback legacy sem popup informativo ao jogador | Jogador não sabe o que aconteceu |
| **GAP-02** | Life event roll=3 ("Birth/Death") só loga — não cria NPC familiar nem oferece escolha | Regra não aplicada |
| **GAP-03** | Life event roll=8 ("Betrayal") cria Rival genérico em vez de converter um Contact/Ally existente para enemy/rival | Regra não aplicada corretamente |
| **GAP-04** | Skill Training (estados `SKILL_TRAINING` e `POST_TERM_SKILL_TRAINING`) não tem texto de briefing narrativo (announcement/successContext) — só mostra título no diceDisplay | Jogador não entende o que está rodando |
| **GAP-05** | Draft roll (quando qualificação falha no Termo 1) não tem `announcement`/`failureContext` narrativos | Jogador não é informado sobre o Draft |
| **GAP-06** | Entradas de Mishap Tables que só têm `effects[]` legado (sem `gameEvent`) caem em `createDynamicEvent()` que gera popup genérico "Event Result" sem título próprio | Experiência fraca; nenhum contexto ao jogador |

### MÉDIO

| ID | Problema | Impacto |
|----|----------|---------|
| **GAP-07** | Opções de choice events (CHOICE type) não têm mecanismo de "revelar antes de escolher" — jogador clica e imediatamente aplica | Pedido explícito do usuário: deve ser reveal-on-demand |
| **GAP-08** | Unusual Event 4 (Amnesia) só loga — sem efeito na ficha (sugestão: -1 EDU ou similar) | Regra incompleta |
| **GAP-09** | `bonusSkillRolls` não distingue visualmente a origem do bônus (veio de qual evento/promoção) | Falta rastreabilidade |
| **GAP-10** | Tabelas de Education (university event table, graduation) ainda não auditadas completamente | Cobertura desconhecida |

---

## 4. Plano de Ação Priorizado

### FASE 1 — Correções Críticas (bugs que causam comportamento errado)

#### AÇÃO 1.1 — Corrigir `LOSE_BENEFIT` sem handler

**Onde**: `resource-effect.handler.ts`
**O que fazer**: adicionar case `LOSE_BENEFIT` no `handledTypes` e no `handle()`:
```typescript
// Em ResourceEffectHandler.handledTypes:
private handledTypes = new Set(['ADD_ITEM', 'RESOURCE_MOD', 'ADD_NPC', 'LOSE_BENEFIT']);

case 'LOSE_BENEFIT':
    const amount = effect.value ?? 1;
    ctx.characterService.spendBenefitRoll(undefined, amount);
    ctx.characterService.log(`**Penalty**: Lost ${amount} Benefit Roll(s).`);
    break;
```

#### AÇÃO 1.2 — Corrigir `next_benefit_dm` no ResourceHandler

**Onde**: `resource-effect.handler.ts`, dentro do case `RESOURCE_MOD`
**O que fazer**: adicionar `else if (effect.target === 'next_benefit_dm')`:
```typescript
} else if (effect.target === 'next_benefit_dm') {
    ctx.characterService.updateDm('benefit', effect.value);
    ctx.characterService.log(`**Bonus**: +${effect.value} DM to next Benefit Roll.`);
}
```
Verificar se `updateDm('benefit', ...)` existe no `CharacterService`; se não, adicionar.

#### AÇÃO 1.3 — Remover duplicata de `INJURY_PROCESS` no career.component

**Onde**: `career.component.ts`, método `ngOnInit()`
**O que fazer**: manter apenas o segundo registro (que chama `handleInjuryDamage`) e remover o primeiro (que chama `createInjuryEvent` e `triggerEvent`).

---

### FASE 2 — Completar Life Events sem `gameEvent`

#### AÇÃO 2.1 — Adicionar `gameEvent` para roll=6 e roll=7 em `lifeEventTable`

**Onde**: `tables.json`, entradas `roll: 6` e `roll: 7`
**Modelo a seguir**: `roll: 5` (Improved Relationship) — estrutura idêntica com `gameEvent` INFO type.

#### AÇÃO 2.2 — Life event roll=3 "Birth/Death" — criar NPC + narração

**Onde**: `tables.json`, entrada `roll: 3`
**Estrutura sugerida**:
```json
"gameEvent": {
  "type": "CHOICE",
  "ui": {
    "title": "Birth or Death",
    "description": "Someone close to you was born or died. Who was it?",
    "options": [
      { "label": "A family member died", "effects": [{ "type": "ADD_NPC", "value": { "role": "Enemy", "notes": "Grief from loss" } }, { "type": "LOG_ENTRY", "note": "A family member has passed." }] },
      { "label": "A child was born", "effects": [{ "type": "ADD_NPC", "value": { "role": "Ally", "notes": "Your child" } }, { "type": "LOG_ENTRY", "note": "A new life enters your world." }] }
    ]
  }
}
```

#### AÇÃO 2.3 — Life event roll=8 "Betrayal" — converter NPC existente

**Onde**: `career.component.ts`, custom handler `BETRAYAL_LOGIC`
**Lógica**:
1. Buscar NPCs do personagem com role `contact` ou `ally`
2. Se existir: apresentar `CHOICE` event listando os NPCs disponíveis para convertê-los em rival/enemy
3. Se não existir: criar Enemy genérico (comportamento atual)

---

### FASE 3 — Melhorar Informação ao Jogador (Briefing de Rolagem)

#### AÇÃO 3.1 — Adicionar `announcement` e `successContext`/`failureContext` às Skill Table Rolls

**Onde**: `career.component.ts`, método `rollSkillTable()`
**Exemplo de texto a adicionar**:
```typescript
const rollContext = {
  phase: `SKILL TRAINING · ${this.selectedCareer?.name?.toUpperCase()} · TERM ${this.currentTerm()}`,
  announcement: `You are consulting the **${tableLabel}** table for the ${this.selectedCareer?.name}. Roll 1D6 to determine which skill you develop this term. Higher rolls may yield more advanced skills.`,
  successContext: `You have developed **${resultSkill}** through practical experience this term.`,
  failureContext: undefined
};
```

#### AÇÃO 3.2 — Adicionar briefing ao Draft Roll

**Onde**: `career.component.ts`, método `runDraft()`
**Exemplo**:
```typescript
const rollContext = {
  phase: 'MILITARY DRAFT',
  announcement: `You failed to qualify for your chosen career. The government has selected you for military service. Roll 1D6 to determine which branch you are assigned to.`,
  successContext: `You have been drafted into the military.`,
};
```

#### AÇÃO 3.3 — Completar `gameEvent` para entradas de Mishap Tables sem definição

**Estratégia**: Para cada entrada de mishap que só tem `effects[]` legacy, adicionar um `gameEvent` com:
- `type`: conforme resultado (INFO, CHOICE, MISHAP)
- `ui.title`: nome descritivo da entrada
- `ui.description`: narração do que aconteceu e consequências
- `ui.options`: mapeados dos effects legados

**Prioridade por carreira**: Army, Navy, Marine (mais usadas) → depois as demais.

---

### FASE 4 — Mecanismo de "Reveal Before Choose" nas opções de CHOICE events

#### AÇÃO 4.1 — Adicionar campo `revealText` ao `EventOption`

**Onde**: `game-event.model.ts`
```typescript
export interface EventOption {
    label: string;
    revealText?: string;  // NOVO: texto ocultado que o jogador pode revelar antes de escolher
    nextEventId?: string;
    replaceNext?: boolean;
    effects?: EventEffect[];
    color?: 'cyan' | 'red' | 'yellow' | 'green' | 'orange';
}
```

#### AÇÃO 4.2 — Atualizar o componente de exibição de eventos

**Onde**: O componente que renderiza `currentEvent` (provavelmente `hud-window` ou dentro de `career.component.html`)
**Comportamento**:
- Cada opção mostra label + botão `[?]` ou `[Revelar Consequências]`
- Ao clicar no `[?]`: toggle do `revealText` com animação tipo "scan" ou "decrypt"
- O texto aparece em cor mais discreta (amarelo neon com opacity reduzida ou `--power-red` para riscos)
- O botão de confirmar a escolha permanece disponível mesmo sem revelar

#### AÇÃO 4.3 — Preencher `revealText` nos CHOICE events principais

**Prioridade**:
1. Injury severity choices (STR vs DEX, etc.)
2. Career event choices com consequências significativas (ex: "Join conspiracy vs. Report it")
3. Prosthetic choice event
4. Neural Jack install choices

---

### FASE 5 — Completar cobertura das 14 carreiras

#### Para cada carreira, auditar:

| # | O que verificar | Critério de completude |
|---|-----------------|----------------------|
| 5.1 | Todas entradas da `eventTable` (rolls 2-12) têm `gameEvent` | `gameEvent.ui.title` ≠ genérico |
| 5.2 | Todas entradas da `mishapTable` têm `gameEvent` narrativo | Idem |
| 5.3 | Entradas com `ROLL_CHECK` têm `announcement` + `successContext` + `failureContext` | Campos preenchidos |
| 5.4 | Entradas com benefícios únicos de carreira (ex: Merchant gambling, Scout ship) têm custom handler | Handler registrado e testado |
| 5.5 | Bonus skills de rank têm aplicação automática via `checkRankBonuses()` | Rank data no JSON completo |

**Status por carreira** (a ser preenchido ao executar a auditoria):

| Carreira | Event Table | Mishap Table | ROLL_CHECKs c/ briefing | Rank Bonuses | Notas |
|----------|-------------|--------------|------------------------|--------------|-------|
| Army | ⚠️ Parcial | ⚠️ Parcial | ✅ | ✅ | |
| Navy | ⚠️ Parcial | ⚠️ Parcial | ✅ | ✅ | |
| Marine | ⚠️ Parcial | ⚠️ Parcial | ✅ | ✅ | |
| Agent | ⚠️ Parcial | ⚠️ Parcial | ✅ | ✅ | |
| Citizen | ⚠️ Parcial | ⚠️ Parcial | ✅ | ✅ | |
| Drifter | ⚠️ Parcial | ⚠️ Parcial | ✅ | ✅ | |
| Entertainer | ⚠️ Parcial | ⚠️ Parcial | ✅ | ✅ | |
| Merchant | ⚠️ Parcial | ⚠️ Parcial | ✅ | ✅ | Gambling mecânica ✅ |
| Noble | ⚠️ Parcial | ⚠️ Parcial | ✅ | ✅ | |
| Prisoner | ⚠️ Parcial | ⚠️ Parcial | ✅ | ✅ | Parole system ✅ |
| Rogue | ⚠️ Parcial | ⚠️ Parcial | ✅ | ✅ | |
| Scholar | ⚠️ Parcial | ⚠️ Parcial | ✅ | ✅ | |
| Scout | ⚠️ Parcial | ⚠️ Parcial | ✅ | ✅ | |
| Spaceborne | ⚠️ Parcial | ⚠️ Parcial | ✅ | ✅ | |

---

## 5. Estrutura de UX para Rolagens (Standard)

### 5.1 Fluxo ideal para toda rolagem de dados

```
[1] PRÉ-ROLAGEM (announcement)
  → Painel mostra:
     - Qual teste está sendo feito (ex: "SURVIVAL CHECK — STR 8+")
     - Qual característica/perícia é usada como modificador
     - Lista de DMs aplicados (positivos e negativos com rótulo)
     - Texto narrativo do contexto (ex: "Você está em missão de reconhecimento...")

[2] ROLAGEM
  → Animação de dados
  → Resultado exibido com breakdown: 2D6 (X) + Mod (Y) + DMs = Total

[3] PÓS-ROLAGEM (successContext / failureContext)
  → Texto narrativo do resultado obtido
  → Efeito aplicado à ficha com log
  → Se for CHOICE: popup com opções

[4] CHOICE EVENT (quando aplicável)
  → Opções listadas com labels claros
  → Botão [?] em cada opção para revelar texto de `revealText`
  → Tekste revelado aparece gradualmente (animação de decrypt)
  → Jogador confirma escolha após ler (ou sem ler — suspen)
```

### 5.2 Template padrão de `revealText` por tipo de opção

| Tipo | Formato sugerido do revealText |
|------|-------------------------------|
| Skill gain | "Gain **{Skill} +1**. Your expertise in this area grows." |
| Stat loss | "Permanently reduce **{STAT}** by {N}. This cannot be undone." |
| NPC | "A new **{role}** will be added to your network." |
| Benefit | "Gain **{N}** additional Benefit Roll(s) during Mustering Out." |
| Career ejection | "You will be **ejected** from this career at the end of this term." |
| Forced career | "Your next career term **must** be as a {Career}." |
| Risk events | "This path carries **significant risk**. You may suffer further penalties." |

---

## 6. Tracking de Implementação

> Atualizar conforme as correções forem aplicadas.

### Fase 1 — Bugs Críticos
- [ ] BUG-01: LOSE_BENEFIT handler
- [ ] BUG-02: next_benefit_dm no ResourceHandler
- [ ] BUG-03: Duplicata INJURY_PROCESS

### Fase 2 — Life Events
- [ ] GAP-01: gameEvent para roll=6 e roll=7
- [ ] GAP-02: Birth/Death com NPC
- [ ] GAP-03: Betrayal com conversão de NPC existente

### Fase 3 — Briefings
- [ ] GAP-04: Skill Table Roll briefings
- [ ] GAP-05: Draft Roll briefing
- [ ] GAP-06: Mishap entries sem gameEvent

### Fase 4 — Reveal Before Choose
- [ ] GAP-07: campo revealText no modelo
- [ ] GAP-07: componente com toggle reveal
- [ ] GAP-07: preencher revealText nos events principais

### Fase 5 — Auditoria das 14 carreiras
- [ ] Army: events + mishaps
- [ ] Navy: events + mishaps
- [ ] Marine: events + mishaps
- [ ] Agent: events + mishaps
- [ ] Citizen: events + mishaps
- [ ] Drifter: events + mishaps
- [ ] Entertainer: events + mishaps
- [ ] Merchant: events + mishaps
- [ ] Noble: events + mishaps
- [ ] Prisoner: events + mishaps
- [ ] Rogue: events + mishaps
- [ ] Scholar: events + mishaps
- [ ] Scout: events + mishaps
- [ ] Spaceborne: events + mishaps
