# VALIDAÇÃO DO SISTEMA DE BENEFÍCIOS DE SAÍDA - TravellerArchitect

**Data**: Fevereiro 2026  
**Status**: Análise Completa + Recomendações

---

## 1. EVENTO "HERANÇA DE PARENTE RICO" (+1 DM A BENEFÍCIO)

### 📋 Regra (Core Rulebook, Noble Career, Event 5)
```
"You inherit a gift from a rich relative. Gain DM+1 to any one Benefit roll."
```

### ✅ Estado Atual
- **Implementado em**: `src/assets/data/careers/noble.json` (Event #5)
- **Tipo**: GameEvent com descrição correta
- **Problema Identificado**: 
  - ❌ O sistema NÃO está armazenando esse bonus de forma reutilizável
  - ❌ Não há checkbox na tela de mustering out para aplicar o bonus
  - ❌ Não há suporte para múltiplos bonuses de herança
  - ❌ O bonus não é career-locked (deve ser válido SÓ para Noble)

### ⚠️ Requisitos Não Atendidos
1. **Armazenamento de Bonus**: Precisa de um array `inheritanceBonuses` no modelo Character
   - Cada bonus deve ter: `{ careerName: "Noble", usedInRoll: boolean }`
2. **UI no Mustering Out**: Checkbox/toggle para "Use Inheritance Bonus +1?"
3. **Limite de Uso**: Apenas 1 bonus por rolagem (independente da quantidade)
4. **Career Lock**: Válido APENAS na carreira onde foi recebido

### 🔧 Solução Recomendada
```typescript
// Character.model.ts - Adicionar:
inheritanceBonuses: Array<{
  careerName: string;      // "Noble" apenas
  termReceived: number;
  usedInRoll: boolean;
  appliedToRoll?: number; // timestamp ou roll ID
}>;

// Career.component.ts - No rollBenefit():
if (type === 'Material' && careerName === 'Noble') {
  const availableBonus = char.inheritanceBonuses?.find(b => !b.usedInRoll);
  if (availableBonus) showInheritanceCheckbox = true;
}
```

---

## 2. ROLAGEM DE SAÍDA DO HOMEWORLD (SEM BÔNUS ADEQUADO)

### 📋 Regra (Core Rulebook, "Leaving Home")
- **Teste**: 2D6 + (Homeworld DM se aplicável) ≥ 8
- **Hard Path**: +1 DM GERAL às rolagens
- **Soft Path**: -1 DM GERAL às rolagens
- **Homeworld Survival DM**: Bônus específico do mundo natal (ex: Hard Path worlds = +1)

### ✅ Estado Atual
- **Implementado em**: `src/app/core/services/career-term.service.ts` → `rollLeavingHome()`
- **Status**: ⚠️ PARCIALMENTE IMPLEMENTADO

### 🔴 Problemas Encontrados
1. ❌ Homeworld DM não está sendo aplicado corretamente
   - `homeworld?.survivalDm` não está sendo usado em rollLeavingHome
   - Apenas Hard/Soft Path está sendo aplicado (correto)
2. ❌ Falta integração com a WorldData (tabela de homebases)

### 🔧 Solução Recomendada
```typescript
// Em CareerTermService.rollLeavingHome():
let dm = 0;
if (char.isSoftPath) dm = -1;
else dm = +1; // Hard Path default

// ADICIONAR: Homeworld Bonus (se ainda em casa)
if (!char.hasLeftHome && char.homeworld) {
  const worldBonus = getHomeworldDM(char.homeworld);
  dm += worldBonus;
  labels.push(`Homeworld (${worldBonus > 0 ? '+' : ''}${worldBonus})`);
}
```

---

## 3. FALHA EM ADVANCEMENT = GANHA BENEFÍCIO?

### 📋 Regra (Core Rulebook, p. 47)
**Advancement Roll**: "If you make a successful advancement roll, move to the next higher rank and gain an extra roll on any of the skill tables available for your career."

**Se FALHAR**: "If your advancement roll is equal to or less than the number of terms you have spent in this career, then you cannot continue in this career after this term."

### ❓ RESPOSTA OFFICIAL
- ✅ **SIM - Mas com CONDIÇÃO**:
  - Falha em Advancement = **FORÇA A SAÍDA** (não termina da carreira)
  - Mas você **AINDA ganha benefícios de saída** (mustering out)
  - Você **não ganha** a Skill Roll de bônus (que é exclusiva de promoção)

### 🔴 Problemas Encontrados
1. ❌ Sistema atual não está claro sobre quando ocorre Muster Out
   - Precisa verificar se falha em advancement está acionando muster out

### 🔧 Validação Necessária
```typescript
// Confirmar: Em rollAdvancement(), se falhar:
if (total < target) {
  // Advancement falhou
  if (total <= termServed) {
    forcedOut = true; // Sai da carreira
    // ✅ AINDA DEVERÁ: Chamar muster out para benefícios
  }
}
```

---

## 4. CONTABILIZAÇÃO DE ROLAGENS DE BENEFÍCIOS

### 📋 Regra (Core Rulebook, p. 46-47)
**Tabela de Benefícios por Rank**:
```
Rank 1–2: +1 Benefit Roll
Rank 3–4: +2 Benefit Rolls
Rank 5–6: +3 Benefit Rolls (+ DM+1 a todos)
```

**Limite de Cash Rolls**: Máximo 3 rolls de dinheiro em TODA A VIDA do personagem

### ✅ Estado Atual
- `benefitRollsAllocated`: `Record<careerName, count>`
- `cashRollsSpent`: contador da vida

### 🔴 Problemas Encontrados
1. ❌ **Confusão na Contabilização**:
   - Roll alocado ≠ Roll gasto
   - A UI mostra "Cash 0/3" mas não deixa claro que é global LIFE-LONG
   - Falta visual de quanto já foi usado de outros períodos

2. ❌ **Dificuldade em Rastrear**:
   - `spendBenefitRoll(career, count, isCash)` chama `update` no array
   - Mas qual é o fluxo entre "allocated" → "spent"?

### 🔧 Solução Recomendada
```typescript
// Character.ts - Melhorar rastreamento:
benefitRollsSpentCash: number; // Life-long total CASH rolls
benefitRollsSpentMaterial: number; // Total MATERIAL rolls (sem limite formal)
benefitRollsAllocated: Record<string, { cash: number, material: number }>;

// UI Improvement:
<p>Cash Rolls (Life-Long): {{cashRollsSpent}}/3 ✓</p>
<p>Material Rolls: {{materialRollsSpent}} (unlimited)</p>
```

---

##5. EXIBIÇÃO DE ROLAGENS DE DINHEIRO E MATERIAIS

### 🔴 Problema (SCREENSHOT ANEXADO)
- ❌ Lista de CASH BENEFITS está **vazia**
- ❌ Lista de MATERIAL BENEFITS está **vazia**
- ❌ Apenas cabeçalho aparece sem dados

### 🔧 Causa Provável
```typescript
// Verificar em career.component.html:
// Possível que o loop esteja mal referenciado:
 @for (benefit of...)  // precisa verificar o array correto
```

### ✅ Recomendação
- Verificar: `musterOutBenefitsLog` vs `musterOutCashLog`
- Ambas devem ser populadas em `rollBenefit()`

---

## 6. RETORNO À TELA DE CARREIRAS APÓS EJEÇÃO

### 📋 Regra Atual
Quando forçado a sair de uma carreira (mishap, falha em advancement):
- ❌ Sistema **não está retornando** à seleção de carreira
- ❌ Fluxo fica preso em MUSTER_OUT_ROLLING

### 🔧 Solução
```typescript
// Em finishTerm():
if (this.forcedOut || isMishap) {
  // Após mustering out completo:
  this.currentState.set('CHOOSE_CAREER'); // VOLTAR aqui
  this.selectedCareer = null;
}
```

---

## 7. CARREIRAS IMPEDIDAS APÓS SAÍDA/EJEÇÃO

### 📋 Regra (Core Rulebook, "Recruitment & Retention")
- ❌ Não pode retornar para mesma carreira imediatamente ("barred for 1 term")
- ⚠️ Prisoner é especial: pode retornar (exceto certos cenários)

### ✅ Estado Atual
- `ejectedCareers: string[]` existe
- `clearEjectedCareers()` limpa após um termo

### 🔴 Problemas
1. ❌ Ejeção **não está sendo registrada** quando mishap ocorre
2. ❌ Lógica de "barred por 1 termo" pode estar incorreta

### 🔧 Verificação
```typescript
// Em generateMishap():
if (!(isDrifter || isSpaceborne)) {
  this.characterService.ejectCareer(careerName); // CHAMAR isto
}
```

---

## 8. MÁXIMOS DE CARACTERÍSTICAS

### 📋 Regra (Core Rulebook, p. 9)
```
Maximum Score for a Characteristic: 15 (for unaugmented Traveller)

Exceptions:
- SOC points above 15 convert to Ship Shares
- Racial maxima may differ (Vargr, Aslan, etc.)
```

### ✅ Estado Atual
- Aparentemente limitado a 15 em `updateCharacteristics()`

### ⚠️ Validação Necessária
- Confirmação: Características NÃO podem ultrapassar 15
- EXCETO: SOC pode ter overflow → Ship Shares

### 🔧 Recomendação
```typescript
// No Character Service:
MAX_CHARACTERISTIC = 15;
// Exception: SOC overflow handling
```

---

## 9. RE-ROLLS NA MESMA TABELA DE BENEFÍCIOS

### 📋 Regra (Core Rulebook, p. 47)
**"If a Benefit is rolled for a second time, the benefit is taken at twice the normal value."**

### Exemplos:
| Resultado | 1ª vez | 2ª vez |
|-----------|--------|--------|
| Gun | 1x Common Weapon | 2x Common Weapons OU +1 Gun Combat |
| Blade | 1x Blade | 2x Blades OU +1 Melee (Blade) |
| INT +1 | INT +1 | INT +2 |
| Ship Share | 1 Share | 2 Shares |

### ❌ Status
- ❌ **NÃO IMPLEMENTADO**
- Sistema faz re-roll automaticamente sem verificar duplicatas
- Nenhuma lógica de doubling/stacking

### 🔧 Solução Necessária
```typescript
// Tracking: Manter registro de what was rolled
const alreadyRolled = new Set<string>();

// Em rollBenefit():
const benefit = tableIndex === 5 ? 'INT +1' : ...;
if (alreadyRolled.has(benefit)) {
  applyDoubledBenefit(benefit); // Implementar lógica
} else {
  applySingleBenefit(benefit);
  alreadyRolled.add(benefit);
}
```

---

## 10. INTERPRETAÇÃO DE TODAS AS DESCRIÇÕES DE BENEFÍCIOS

### 📋 Mapeamento Requerido (todas as 14 carreiras)

Cada descrição de benefício precisa de handler específico:

| Benefício | Regra | Implementação | Status |
|-----------|-------|----------------|--------|
| Cash (Cr1000-100000) | Direct addition | ✅ Implemented |  |
| INT/DEX/END/EDU/SOC +1 | Stat increase | ✅ Implemented | |
| STR/END +1 | Stat increase | ✅ Implemented | |
| Gun/Blade/Weapon | Equipment award | ⚠️ Partial | Precisa escolha |
| Armour | Equipment choice | ⚠️ Partial | Precisa seleção |
| Ship Share / 2D Ship Shares | Resource | ⚠️ Partial | Contagem OK |
| Free Trader / Scout Ship / Yacht | Vehicle | ❌ **Missing** | Requer modal |
| TAS Membership | Status | ✅ Simple |  |
| Contact/Ally/Rival/Enemy | NPC | ⚠️ Partial | Precisa geração |
| Cybernetic/Neural Jack | Augmentation | ❌ **Missing** | Precisa seleção |
| Scientific Equipment / Lab Ship | Special | ❌ **Missing** |  |

### 🔴 Problemas Por Career

#### AGENT
- `Scientific Equipment` - Não tratado
- Cybernetic Implant - Precisa modal de seleção

#### NAVY
- `Ship's Boat` - Não tratado
- TAS Membership - Simples ✅
- SOC +2 - Precisa tratamento especial

#### MERCHANT  
- `Free Trader` - ❌ MISSING (valor MCr2, paga 25% mortgage)
- Gun/Blade - Simples ✅

#### SCOUT
- `Scout Ship` - ❌ MISSING
- Weapon/Ship Shares - Simples ✅

#### SCHOLAR
- `Lab Ship` - ❌ MISSING
- Scientific Equipment - ❌ MISSING
- Ship Shares - Simples ✅

### 🔧 Ações Necessárias
1. Implementar Vehicle Selection Modal
2. Implementar Augmentation Choice Dialog
3. Implementar Equipment Selection para items opcionais
4. Adicionar tratadores para cada tipo especial

---

## 11. RESUMO DE PRIORIDADES

### 🔴 CRÍTICO (Impede Gameplay)
- [ ] Sistema de re-rolls (duplicatas em benefícios)
- [ ] Exibição de cash/material benefits (UI vazia)
- [ ] Vehicles e Special Equipment choosers
- [ ] Retorno à carreira após ejeção

### ⚠️ ALTO (Regras Incorretas)
- [ ] Homeworld DM em leaving home roll
- [ ] Inheritance Bonus system (storage + UI)
- [ ] Eject career tracking em mishaps
- [ ] Career bans após ejeção

### 🟡 MÉDIO (Melhorias)  
- [ ] Melhorar UI de contabilização de benefits
- [ ] Visual life-long cash roll counter
- [ ] Confirmação de falha em advancement → muster out

### 🟢 BAIXO (Validação)
- [ ] Confirmar máximos de características
- [ ] Revisar cada descrição de benefício
- [ ] Testes de re-rolls

---

## 12. ARQUIVOS ENVOLVIDOS

### Modelos
- `src/app/core/models/character.model.ts` - Adicionar inheritanceBonuses
- `src/app/core/models/career.model.ts` - Estender BenefitDefinition

### Serviços
- `src/app/core/services/character.service.ts` - Nova lógica de bonus
- `src/app/core/services/career-term.service.ts` - rollLeavingHome fix
- `src/app/features/character/steps/career/career.component.ts` - rollBenefit logic

### UI/Components
- `src/app/features/character/steps/career/career.component.html` - Benefit display
- `src/app/features/shared/benefit-choice-dialog/` - Expandir diálogos
- `src/app/features/character/components/equipment-selector-modal/` - Novo modal

### Dados
- `src/assets/data/careers/*.json` - Verificar cada descrição
- `src/app/data/benefit-choices.ts` - Expandir opções

---

**Próximas Ações:**
1. Priorizar implementação de re-rolls (crítico)
2. Fixar UI de benefícios (crítico)
3. Implementar vehicle selection (crítico)
4. Adicionar inheritance bonus system (médio)
5. Testar todas as 14 carreiras para integridade

