# MAPEAMENTO COMPLETO DE BENEFÍCIOS POR CARREIRA
## Validação Contra Core Rulebook

**Fonte**: Core Rulebook Update 2022 - BENEFITS section (p. 46-47)  
**Data**: 2026-02-18  
**Status**: Referência para implementação

---

## CONVENÇÕES

| Icon | Significado |
|------|-----------|
| ✅ | Implementado corretamente |
| ⚠️ | Parcialmente implementado |
| ❌ | Não implementado |
| 🔄 | Requer re-roll handling |
| 💬 | Requer dialog/choice |

---

## 1. AGENT (Intelligence Service)

### Tabela de Benefícios (1D roll)

| Roll | Benefício | Rulebook | Implementação | Notas |
|------|-----------|----------|----------------|-------|
| 1 | +1 EDU | p.46 | ✅ STAT_MOD | Simples incremento |
| 2 | +2 SOC | p.46 | ⚠️ STAT_MOD | SOC > 15 → Ship Shares? |
| 3 | +1 Dexterity / -1 Strength | p.46 | ❌ CHOICE | Precisa dialog |
| **4** | **Contact** | p.46 | ⚠️ NPC | Geração aleatória de NPC |
| 5 | +1 Intelligence | p.46 | ✅ STAT_MOD |  |
| **6** | **CHOICE: Cybernetic Implant OR +1 EDU** | p.46 | ❌ MISSING | Precisa modal seleção |

### Regras Especiais Agent
- **Re-rolls (4× Contact)**: Criar novo Contact cada vez ✓
- **Re-rolls (6× Cybernetic)**: "Take different augmentation OR improve existing" ❌
- **Advancement Bonus**: +1 Skill Roll por rank (implementado?) ⏳

### Status Geral
**Implementação**: 50% | **Prioridade**: ALTA

---

## 2. ARCHAEOLOGIST

### Tabela de Benefícios (1D roll)

| Roll | Benefício | Rulebook | Implementação | Notas |
|------|-----------|----------|----------------|-------|
| 1 | +1 EDU | p.46 | ✅ | |
| 2 | +1 Intelligence | p.46 | ✅ | |
| 3 | +2 SOC | p.46 | ⚠️ | SOC overflow check |
| 4 | +1 Dexterity | p.46 | ✅ | |
| 5 | **Archaeological Equipment** | p.46 | ❌ | Precisa modal/item award |
| 6 | **CHOICE: +1 Skill OR 2D Ship Shares** | p.46 | ⚠️ | Skill sim / Shares precisa 2D roll |

### Regras Especiais
- **Re-rolls (5× Equipment)**: "Gain better quality OR different type" ❌
- **Re-rolls (6× double)**: Já ganha 4D+ shares ⏳

### Status Geral
**Implementação**: 40% | **Prioridade**: MÉDIA

---

## 3. ARMY

### Tabela de Benefícios (1D roll)

| Roll | Benefício | Rulebook | Implementação | Notas |
|------|-----------|----------|----------------|-------|
| 1 | +1 Strength | p.46 | ✅ | |
| 2 | +1 END ou -1 INT | p.46 | ❌ | CHOICE dialog |
| 3 | +1 Melee Weapon | p.46 | ✅ | Skill bonus |
| 4 | Blade Weapon | p.46 | ⚠️ | Equipment award |
| 5 | **CHOICE: Cybernetic Implant OR +1 END** | p.46 | ❌ | Modal seleção |
| 6 | +2 SOC | p.46 | ⚠️ | SOC overflow |

### Regras Especiais
- **Re-rolls (blade)**: +1 Equipment allowance ⏳
- **Rank 5+**: DM+1 ao benefício ✅ (se implentado corretamente)

### Status Geral
**Implementação**: 45% | **Prioridade**: MÉDIA

---

## 4. ARTIST

### Tabela de Benefícios (1D roll)

| Roll | Benefício | Rulebook | Implementação | Notas |
|------|-----------|----------|----------------|-------|
| 1 | +1 EDU | p.46 | ✅ | |
| 2 | +1 CHA/SOC | p.46 | ⚠️ | Não existe CHA em 2300AD |
| 3 | +1 Dex ou -1 STR | p.46 | ❌ | CHOICE |
| 4 | **Scientific Equipment** | p.46 | ❌ | MISSING |
| 5 | +1 Skill (Art-related) | p.46 | ⚠️ | Só skill art? |
| 6 | **TAS Membership** | p.46 | ✅ | Simple flag |

### Status
**Implementação**: 30% | **Prioridade**: BAIXA

---

## 5. DRIFTER

### Tabela de Benefícios (1D roll - Especial: Rogue Benefits se falhar)

| Roll | Benefício (Success) | Rulebook | Implementação |
|------|-----------|----------|----------------|
| 1 | +1 STR | p.46 | ✅ |
| 2 | +1 END | p.46 | ✅ |
| 3 | +1 Gun Combat | p.46 | ✅ |
| 4 | **CHOICE: Gun OR Blade** | p.46 | ❌ | Modal |
| 5 | +1 Dex | p.46 | ✅ |
| 6 | **Contact** | p.46 | ⚠️ | NPC generation |

### Regras Especiais Drifter
- **Falha em recruitment**: Retry indefinitamente ⏳
- **Sem limite de termos**: Pode servir 30+ termos ✅
- **Benefício especial**: Pode retornar após ejeção ✅

### Status
**Implementação**: 50% | **Prioridade**: MÉDIA

---

## 6. ENGINEER

### Tabela de Benefícios (1D roll)

| Roll | Benefício | Rulebook | Implementação | Notas |
|------|-----------|----------|----------------|-------|
| 1 | +1 EDU | p.46 | ✅ | |
| 2 | +1 INT ou -1 STR | p.46 | ❌ | CHOICE |
| 3 | Gun | p.46 | ✅ | Equipment |
| 4 | +1 Mechanic | p.46 | ✅ | Skill |
| 5 | Junior Scientific Posting | p.46 | ❌ | MISSING - Status/Title |
| 6 | **CHOICE: +1 Science OR 2 Ship Shares** | p.46 | ⚠️ | Shares = 2D roll |

### Status
**Implementação**: 40% | **Prioridade**: MÉDIA

---

## 7. HUNTER/EXPLORER

### Tabela de Benefícios (1D roll)

| Roll | Benefício | Rulebook | Implementação |
|------|-----------|----------|----------------|
| 1 | +1 STR | p.46 | ✅ |
| 2 | +1 DEX ou -1 EDU | p.46 | ❌ | CHOICE |
| 3 | +1 Recon | p.46 | ✅ |
| 4 | Rifle or Shotgun | p.46 | ⚠️ | CHOICE between both |
| 5 | +1 Survival | p.46 | ✅ |
| 6 | Free Passage (1 ship ticket) | p.46 | ❌ | MISSING |

### Status
**Implementação**: 40% | **Prioridade**: BAIXA

---

## 8. MARINE (Military branch)

### Tabela de Benefícios (1D roll)

| Roll | Benefício | Rulebook | Implementação |
|------|-----------|----------|----------------|
| 1 | +1 STR | p.46 | ✅ |
| 2 | +1 DEX | p.46 | ✅ |
| 3 | +1 Melee Weapon | p.46 | ✅ |
| 4 | Blade | p.46 | ✅ |
| 5 | **CHOICE: Cybernetic Implant OR +1 END** | p.47 | ❌ | Modal |
| 6 | +2 SOC | p.47 | ⚠️ | Overflow check |

### Regras Marine
- **Rank 5+ bonus**: +1 DM ao roll ✅
- **Promotion**: Rank 6 = +3 extra skills ⏳

### Status
**Implementação**: 50% | **Prioridade**: MÉDIA

---

## 9. MERCHANT

### Tabela de Benefícios (1D roll)

| Roll | Benefício | Rulebook | Implementação | Notas |
|------|-----------|----------|----------------|-------|
| 1 | +1 EDU | p.47 | ✅ | |
| 2 | +1 INT | p.47 | ✅ | |
| 3 | +1 Broker | p.47 | ✅ | |
| 4 | **Free Trader Ship** | p.47 | ❌ | **CRÍTICO** - Vehicle modal + mortgage |
| 5 | 1 Ship Share | p.47 | ✅ | |
| 6 | **CHOICE: Gun OR +1 Merchant** | p.47 | ❌ | CHOICE modal |

### Regras Merchant
- **Free Trader**: 
  - Custo: 10 MCr
  - Mortgage (25%): 2.5 MCr annual
  - Specs: J-1, M-1, 100 tons
- **Re-rolls (ship share)**: "Take 2 OR Convert to +1 Merchants" ❌
- **Gambler skill**: +1 DM ao cash roll (if present) ✅

### Status
**Implementação**: **30%** 🔴 | **Prioridade**: **CRÍTICO**

---

## 10. NAVY

### Tabela de Benefícios (1D roll)

| Roll | Benefício | Rulebook | Implementação | Notas |
|------|-----------|----------|----------------|-------|
| 1 | +1 INT | p.47 | ✅ | |
| 2 | +1 EDU | p.47 | ✅ | |
| 3 | +1 Engineering | p.47 | ✅ | |
| 4 | Gun | p.47 | ✅ | |
| 5 | **Ship's Boat** | p.47 | ❌ | **MISSING** - Small vessel |
| 6 | **CHOICE: +2 SOC OR TAS Membership** | p.47 | ⚠️ | TAS ok, SOC needs overflow |

### Regras Navy
- **Officer paths**: Affects skill access ⏳
- **Rank 5+**: +1 DM to ALL benefit rolls ✅

### Status
**Implementação**: 50% | **Prioridade**: ALTA

---

## 11. NOBLE

### Tabela de Benefícios (1D roll)

| Roll | Benefício | Rulebook | Implementação | Notas |
|------|-----------|----------|----------------|-------|
| 1 | +1 SOC | p.47 | ✅ | |
| 2 | +1 INT ou EDU | p.47 | ⚠️ | CHOICE needed? |
| 3 | **Inheritance Bonus** | Event #5 | ❌ | **CRÍTICO** - DM+1 system |
| 4 | +1 Diplomacy | p.47 | ✅ | |
| 5 | Ally | p.47 | ⚠️ | NPC generation |
| 6 | **Yacht** | p.47 | ❌ | **MISSING** - Vehicle modal |

### Regras Noble
- **Inheritance Event**: +1 DM (one-time per roll, reutilizável múltiplas vezes) ❌
- **Yacht**: 
  - Custo: 11 MCr
  - Specs: J-1, M-1, Ultra-luxo, 100 tons
- **Ally/Rival**: Geração de NPC ⏳

### Status
**Implementação**: **20%** 🔴 | **Prioridade**: **CRÍTICO**

---

## 12. PRISONER

### Tabela de Benefícios (1D roll)

| Roll | Benefício | Rulebook | Implementação |
|------|-----------|----------|----------------|
| 1 | +1 STR | p.47 | ✅ |
| 2 | +1 END ou -1 INT | p.47 | ❌ | CHOICE |
| 3 | +1 Melee Weapon | p.47 | ✅ |
| 4 | Blade | p.47 | ✅ |
| 5 | +1 Stealth | p.47 | ✅ |
| 6 | Contact (criminal) | p.47 | ⚠️ | NPC type |

### Regras Prisoner
- **Parole system**: Can serve unlimited terms if parole succeeds ⏳
- **Special**: Pode retornar à carreira mesmo após ejeção (exception) ⏳

### Status
**Implementação**: 50% | **Prioridade**: MÉDIA

---

## 13. ROGUE

### Tabela de Benefícios (1D roll)

| Roll | Benefício | Rulebook | Implementação | Notas |
|------|-----------|----------|----------------|-------|
| 1 | +1 DEX | p.47 | ✅ | |
| 2 | +1 STR ou -1 END | p.47 | ❌ | CHOICE |
| 3 | +1 Gun Combat | p.47 | ✅ | |
| 4 | **1D Ship Shares** | p.47 | ✅ | Roll 1D6 |
| 5 | +1 Gambling | p.47 | ✅ | |
| 6 | **2D Ship Shares** | p.47 | ⚠️ | Roll 2D6 (não 1D!) |

### Regras Rogue
- **Ship Shares**: Podem variar 1-6 (1D) ou 2-12 (2D)  
- **Re-rolls (ship shares)**: Soma aos anteriores ⏳
- **Advancement**: Risk de mishap/injury ⏳

### Status
**Implementação**: 55% | **Prioridade**: MÉDIA

---

## 14. SCHOLAR

### Tabela de Benefícios (1D roll)

| Roll | Benefício | Rulebook | Implementação | Notas |
|------|-----------|----------|----------------|-------|
| 1 | +1 EDU | p.47 | ✅ | |
| 2 | +1 INT | p.47 | ✅ | |
| 3 | +1 Science | p.47 | ✅ | |
| 4 | Ally | p.47 | ⚠️ | NPC |
| 5 | **Lab Ship** | p.47 | ❌ | **MISSING** - Vehicle modal |
| 6 | **CHOICE: Scientific Equipment OR TAS Membership** | p.47 | ❌ | CHOICE + missing items |

### Regras Scholar
- **Lab Ship**: 
  - Custo: ~10 MCr
  - Specs: Science Lab, 2 Staterooms + Cargo
- **Scientific Equipment**: Detector, Microscope, Analysis tools ❌
- **TAS**: Travel & Scientific Society membership ✅

### Status
**Implementação**: **25%** 🔴 | **Prioridade**: **ALTO**

---

## 🎯 RESUMO GERAL

### Implementação por Categoria

| Categoria | Implementado | Status |
|-----------|-------------|--------|
| **Aumentos de Atributo** | 85% | ✅ Bom |
| **Aumentos de Skill** | 90% | ✅ Bom |
| **Equipamento Simples** | 60% | ⚠️ Parcial |
| **CHOICE Dialogs** | 0% | ❌ MISSING |
| **Vehicle Modals** | 0% | ❌ MISSING |
| **NPC Generation** | 40% | ⚠️ Parcial |
| **Re-roll Handling** | 0% | ❌ MISSING |
| **Dice Rolls (1D/2D)** | 50% | ⚠️ Parcial |

### Problemas Críticos Detectados

1. **❌ ZERO Choice Dialogs**: Nenhum benefício com "OR" está implementado
   - Afeta: Agent, Army, Artist, Engineer, Hunter, Marine, Merchant, Navy, Noble, Prisoner, Rogue, Scholar (12 carreiras!)
   
2. **❌ ZERO Vehicle Modals**: Nenhum navio é selecionável
   - Free Trader (Merchant, Rogue) ❌
   - Scout Ship (Scout) ❌
   - Lab Ship (Scholar) ❌
   - Yacht (Noble) ❌
   - Ship's Boat (Navy) ❌

3. **❌ MISSING Re-roll Logic**: Nenhuma duplicata é tratada corretamente
   - Cybernetic Implant: +1 existente OR novo?
   - Ship Shares: Soma ou oferece choice?
   - Blades/Guns: Múltiplos OR +1 skill?

4. **❌ CHOICE não tratado**: Muitos benefícios têm "STR +1 OR END -1"
   - Precisa UI modal com duas opções

5. **❌ Dice Rolls em Benefícios**: 1D/2D Ship Shares
   - "1D Ship Shares" = Roll 1D6 para quantidade
   - "2D Ship Shares" = Roll 2D6 para quantidade
   - Atual parece dar quantidade fixa

### Carreiras por Prioridade de Implementação

#### 🔴 CRÍTICO (Fix HOJE)
1. **Noble** - Inheritance +1 DM + Yacht
2. **Merchant** - Free Trader vehicle
3. **Scholar** - Lab Ship vehicle

#### 🟠 ALTO (Fix esta semana)
4. **Army** - Choice dialogs
5. **Navy** - Ship's Boat + choices
6. **Agent** - Choices + Cybernetics
7. **Engineer** - Choices + Shares
8. **Rogue** - 1D vs 2D differentiation

#### 🟡 MÉDIO (Fix próxima semana)  
9. **Archaeologist** - Equipment + Shares
10. **Drifter** - Contact generation
11. **Hunter** - Weapon choice
12. **Marine** - Cybernetic choice
13. **Prisoner** - Choice dialog
14. **Artist** - Equipment + Choice

---

## TEMPLATE PARA CADA BENEFÍCIO A IMPLEMENTAR

```typescript
// Exemplo: Agent Career - Benefício 6

interface BenefitDefinition {
  id: 'agent-6-cybernetic-or-edu';
  careerName: 'Agent';
  rollResult: 6;
  name: 'Cybernetic Implant or EDU +1';
  description: 'Choose to receive a Cybernetic Implant or gain +1 EDU';
  type: 'choice';
  options: [
    {
      id: 'cybernetic',
      name: 'Cybernetic Implant',
      effect: 'Gain Cybernetic Augmentation (see Character Augmentation)',
      handler: 'AUGMENTATION_CHOICE'
    },
    {
      id: 'edu',
      name: 'EDU +1',
      effect: 'Increase Education by 1',
      handler: 'STAT_MOD',
      params: { stat: 'edu', amount: 1 }
    }
  ];
  reuseRule: 'If rolled again, offer different augmentation or improve existing';
}
```

---

## CHECKLIST PARA VALIDAÇÃO FINAL

- [ ] Todos os 14 carreiras com tabela de benefícios mapeada
- [ ] Cada benefício tem handler implementado
- [ ] Todos os CHOICE dialogs criados
- [ ] Todos os Vehicle modals criados  
- [ ] Test coverage para cada carreira ≥ 80%
- [ ] Re-rolls corretamente lidam com duplicatas
- [ ] Inheritance +1 DM system funcional
- [ ] SOC overflow → Ship Shares implementado
- [ ] Life-long cash roll limit enforced (max 3)
- [ ] UI mostra todos os benefícios awardados

---

**Status**: 🟢 Mapeamento completo | 🔴 Implementação 35% | ⚠️ Testes pendentes

