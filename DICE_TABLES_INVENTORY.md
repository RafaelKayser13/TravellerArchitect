# Inventário Completo: Todas as Tabelas de Rolagem de Dados

**Propósito:** Mapeamento exaustivo de TODAS as tabelas de rolagem, seus valores, e como cada resultado deve ser tratado.

---

## 📊 TABELAS DE EDUCAÇÃO

### 1. ADMISSION DMs (Modificadores de Admissão)

#### 1.1 Local Education DMs (By Tech Level)
```
TL  | University DM | Academy DM
----|---------------|----------
<=7 | -6            | -6
8-9 | -4            | -4
10-11| -2            | -2
12+ | 0             | 0

Aplicar ANTES do roll 2D6
```

#### 1.2 Off-World Education DMs (By Nation Tier)
```
Tier | DM
-----|----
1    | +2
2    | 0
3    | -2
4    | -4
5    | -6
6+   | -8

Spacer origin: -2 adicional (ambos local e off-world)
```

#### 1.3 Term Penalty
```
Term | University | Academy
-----|------------|--------
1    | 0          | 0
2    | -1         | -2
3    | -2         | -4
4+   | BLOCKED    | BLOCKED
```

#### 1.4 Stat & Bonus DMs (Admission Roll)
```
University:
- Target: 6
- Stat: EDU
- SOC 9+: +1

Academy Army:
- Target: 7
- Stat: END
- END 8+: +1
- SOC 8+: +1

Academy Marines:
- Target: 8
- Stat: END
- END 8+: +1
- SOC 8+: +1

Academy Navy/Scout/Spaceborne:
- Target: 9
- Stat: INT
- INT 8+: +1
- SOC 8+: +1
```

---

### 2. GRADUATION ROLLS

#### 2.1 University Graduation
```
Roll: 2D6 + INT modifier
Target: 6

Success (6-10):
  - EDU +1
  - Major skill +1 level
  - Minor skill +1 level
  - 1x Education Skill Roll

Honors (11+):
  - Tudo acima +
  - SOC +1
  - DM+2 para próximo qualification roll

Failure (<6):
  - Skills do curso ganhas? (depender de Book 02)
  - Volta ao career selection (não ganhou EDU)
```

#### 2.2 Academy Graduation
```
Roll: 2D6 + INT modifier
Target: 7

Success (7-10):
  - EDU +1
  - 3x skills da academia para nível 1 (escolha do jogador)
  - Forced Career: [Army|Marine|Navy|Scout] (próximo termo automático)

Honors (11+):
  - Tudo acima +
  - Rank 1 commission (automático, não precisa roll no termo 1)

Failure (<7) - Rule 632:
  - Se raw roll > 2: Forced Career mantém (entrada automática)
  - Se raw roll = 2: Nenhum benefício (ejeção pura)
```

---

### 3. EDUCATION EVENTS TABLE (2D6)

**Fonte:** `education-events.ts`

```
Roll | Event              | Description & Rules
-----|-------------------|-------------------------------------
2    | Psiônico Contact   | TEST: 2D6 vs PSI potential
     |                   | Success: PSI 0 ganho, opção Psion
     |                   | Failure: Nada happens
     |
3    | Tragédia          | EDU +0, graduation status = FAILED
     |                   | Mas continua education? (ver Book 02)
     |
4    | Travessura        | TEST: SOC 2D6 vs 8
     | Prank             | Success 8+: 1x Contact (friend)
     |                   | Failure: 1x Enemy, pode ser expulso
     |                   | Critical (nat 2): Expelled to Prisoner
     |
5    | Amizade           | Roll 1D3: 1-2 = 1 ally, 3 = 2 allies
     | Party/Friends     | Gain that many Contact NPCs
     |
6    | Conflito Político | TEST: SOC 2D6 + SOC mod vs 8
     |                   | Success: 1x Contact (ally) + 1x Enemy
     |                   | Failure: Nenhum benefício
     |
7    | Life Event        | Rola na tabela universal Life Events
     |                   | (ver seção 2.4 abaixo)
     |
8    | Estudo Dedicado   | Ganhar 1x skill (do currículo) nível 1
     | Study             | Skill specific to major/minor
     |
9    | Hobby             | Ganhar 1x skill não-acadêmico nível 0
     | Hobby             | Qualquer skill disponível
     |
10   | Mentor/Tutor      | TEST: EDU 2D6 vs 9
     |                   | Success: Escolher 1 skill nível 1
     |                   |          + 1x Contact (Mentor)
     |                   |          + 1x Rival (Mentor pode virar rival)
     |                   | Failure: Nenhum benefício
     |
11   | Guerra/Draft      | TEST: SOC 2D6 vs 9 (pode evitar)
     | War Involvement   | Failure/Can't avoid: Drafted to career
     |                   |                     (roll 1D6 draft table)
     |
12   | Reconhecimento    | SOC +1 (Academy honra distinguida)
     | Distinction       | Nenhum teste necessário
```

---

## 📊 TABELAS DE CARREIRA

### 4. CAREER SELECTION & QUALIFICATION

#### 4.1 Career Data by Assignment
```
Career      | Qual Stat | Qual Target | Survival Stat | Surv Target | Adv Stat | Adv Target
------------|-----------|-------------|---------------|-------------|----------|----------
Agent       | INT       | 6           | END           | 6           | INT      | 6
Army        | END       | 5           | END           | 5           | EDU      | 6
Citizen     | EDU       | 5           | EDU           | 5           | INT      | 6
Drifter     | —         | —           | END           | 5           | INT      | 6
Entertainer | INT       | 5           | INT           | 5           | INT      | 6
Marine      | END       | 6           | END           | 6           | EDU      | 5
Merchant    | INT       | 4           | EDU           | 5           | INT      | 7
Navy        | INT       | 6           | INT           | 5           | EDU      | 6
Noble       | SOC       | 10          | SOC           | 3           | INT      | 6
Prisoner    | —         | —           | END           | 7           | INT      | 7 (parole)
Rogue       | DEX       | 6           | STR           | 6           | INT      | 6
Scholar     | EDU       | 6           | EDU           | 4           | INT      | 8
Scout       | INT       | 5           | END           | 5           | EDU      | 5
Spaceborne  | —         | —           | DEX           | 8           | END      | 6
```

#### 4.2 Draft Table (1D6, if Term 1 Qual Failure)
```
Roll | Career Assigned
-----|-------------------
1    | Navy
2    | Army
3    | Marine
4    | Merchant Marine
5    | Scout
6    | Agent

Cada carreira draft rola 2D6 vs seu stat, se failure = Drifter
```

---

### 5. SURVIVAL ROLLS (Per Term, 1-6 years)

**Structure:** 2D6 + Survival Stat DM vs Target

**Modifiers Applied:**
```
- Homeworld Gravity (até sair): +/- per world (até ±2)
- Soft Path: -1
- Hard Path homeworld: +1
- World DNAMs: aplicável até sair

Once left homeworld: Nenhum modificador de mundo
```

**Results:**
```
Success (total >= target):
  - Continue na carreira
  - Ganhar 1x Skill Roll (Table = Specialist/Assignment)
  - Avançar para próximo termo

Exact Match (Rule 245):
  - Continue na carreira
  - Ganhar prótese (arm, leg, eye, etc)
  - Escolha de qual prótese

Failure (total < target):
  - Mishap table (1D6)
  - Ejetar da carreira (exceto Drifter/Spaceborne)
  - Termina carreira agora
```

---

### 6. MISHAP TABLES (1D6, One Per Career)

**Structure:** Cada carreira tem exatamente 6 mishaps (rolls 1-6)

**Exemplos de Mishaps (verificar cada carreira JSON):**

```
Career: Army
Roll | Mishap
-----|-------------------------------------------
1    | Court-Martialed (SOC -1, dano à reputação)
2    | Injured Service (STR -1 ou END -1)
3    | Betrayed by Officer (Enemy NPC)
4    | Blackmailed (Contact becomes Enemy)
5    | Accident in Combat (END -2)
6    | Court of Honor (pode ganhar ou perder SOC)

Career: Navy
Roll | Mishap
-----|-------------------------------------------
1    | Mutiny (Expelled)
2    | Accident (Lost limb: STR -1 or END -1)
3    | Dismissed (Dishonorably)
4    | Rival Officer (Enemy NPC)
5    | Court-Martialed (SOC -1)
6    | Wrong Place, Wrong Time (Injury with complications)
```

**Estrutura Esperada para Cada Mishap:**
```typescript
{
  roll: 1,
  title: "Court-Martialed",
  description: "Narrative of what happened",
  effects: [
    { type: 'stat', stat: 'soc', value: -1 },
    { type: 'npc', role: 'enemy', name: 'Military Judge' },
    { type: 'event', text: 'Discharged dishonorably' }
  ],
  choices: [
    { text: 'Accept discharge', nextState: 'eject' },
    { text: 'Appeal (hard, SOC 10+)', test: { stat: 'soc', target: 10 } }
  ]
}
```

---

### 7. ADVANCEMENT ROLLS (Per Term if Survival Success, 1-6 years)

**Structure:** 2D6 + Advancement Stat DM vs Target

**Modifiers:**
```
- Neural Jack (if installed): +1
- Prisoner Parole DM: starts at 7, can be lowered
- Events DM (accumulated): nextAdvDm from prior events
- Natural 12: Mandatory continuation next term
```

**Results:**
```
Success (result <= termsServed):
  - Rank +1
  - Ganhar 1x Skill Roll (Table = Specialist/Assignment)
  - Continuar na carreira se quiser

Natural 12 on Dice:
  - OBRIGADO a continuar próximo termo
  - Não pode deixar a carreira
  - Ganhar 1x Skill Roll adicional

Failure (result > termsServed OR result < target):
  - Forced Out (mas rank ainda sobe!)
  - Mustering Out begins
  - Não pode continuar carreira
```

---

### 8. COMMISSION ROLLS (Military Only, Termo 1 OR SOC 9+)

**Structure:** 2D6 + Advancement Stat DM vs Target (8 padrão)

**Modifiers:**
```
- Academy Graduate (non-honors): +2
- Academy Honors: Rank 1 automatic (no roll!)
- Previous commission attempts in this career: -1 each

Total attempts tracked per career
```

**Results:**
```
Success (total >= 8):
  - Rank 1 commission (Officer)
  - Título rank official (Lieutenant, etc)
  - Ganhar 1x extra Skill Roll este termo
  - Acesso a Officer Skills table

Failure (total < 8):
  - Continua como alistado
  - Sem penalidade (pode tentar novamente próximo termo com -1)
  - Ganhar skill roll normal deste termo

Cannot attempt:
  - Se já comissionado
  - Se já tentou este termo
  - Se não é carreira militar (Army/Navy/Marine)
```

---

### 9. SKILL ROLL TABLES (1D6 per table)

**5 Tables per Career:**

| Table | Availability | Requirements | Entries |
|-------|--------------|--------------|---------|
| Personal | Always | None | 6 skills |
| Service | Term 1 only | None | 6 skills (basic training) |
| Specialist | Each term | Survival success | 6 skills |
| Advanced | Each term | EDU 8+ | 6 skills |
| Officer | Each term | Commissioned | 6 skills |

**Structure:** Roll 1D6 (1-6 as index 0-5), get skill name

**Special Rules:**
- Se skill tem especialidade (Engineer, Flyer, Science, Gun Combat, etc):
  - Offering: "Choose specialization: [Option A], [Option B], [Option C]..."
  - Player picks especialidade antes de confirmar
  - Skill granted with specialization

- Cap Rules:
  - Max level 4 per skill during creation
  - Total levels (all skills) <= INT + EDU

---

### 10. LEAVING HOME (2D6, per term in Term 1-6)

**Structure:** 2D6 + Bonus vs 8+

**Modifiers by Career:**
```
Spacer origin: +2 (always)
Navy: +1 per term served
Marine: +1 per term served
Merchant: +1 per term served
Scout: +2 per term served
Other: +0
```

**Result:**
```
Success (total >= 8):
  - Has Left Home (permanent flag)
  - World gravity mods no longer apply
  - Homeworld survival mods no longer apply
  - No more "Leaving Home" tests

Failure (total < 8):
  - Still home-bound
  - Test again next term (if applicable)
  - Still subject to homeworld mods
```

---

### 11. AGING CHECKS (2D6 - termsServed, if Age >= 50 and Terms >= 8)

**Structure:** 2D6 - termsServed, check result

**Results:**
```
<= 0 (Aging Crisis):
  - STR -2, DEX -2, END -2, INT -1
  - Must leave career (end of term)
  - Forced to Mustering Out

1: STR -2, DEX -2, END -2

2: STR -2, DEX -2

3: STR -2

4: STR -1, DEX -1

5: STR -1

6+: No effect
```

---

## 📊 TABELAS DE LIFE EVENTS

### 12. LIFE EVENTS TABLE (Universal, 2D6)

**Aplicável em:** Educação, Carreira, eventos que chamam Life Events

```
Roll | Event | Test | Success Effect | Failure Effect
-----|-------|------|----------------|----------------
2 | Lesão Grave | END 8+ | Injury minor (STR -1) | Injury serious (STR -2, END -1)
3 | Acidente | DEX 8+ | Escape (Nothing) | Injury (lose limb = STR -1)
4 | Política | SOC 8+ | Ally + Enemy | Enemy only
5 | Saudade | — | Retorna casa, EDU ? | Career pause?
6 | Treinamento | INT 8+ | Skill +1 | Nada
7 | Viagem | — | Contact + Travel Bonus | Nada
8 | Prêmio | — | Lv +5,000 | Lv +1,000
9 | Desespero | END 8+ | Ganha Toughness/Ally | Debt Lv 10,000
10 | Romance | SOC 8+ | Ally (Romantic) | Enemy (Jilted)
11 | Enriquecimento | INT 8+ | Lv +10,000 + Contact | Debt or Nothing
12 | Oportunidade | — | Career Advancement +1 DM | Nada
```

**Structure per Event:**
```typescript
{
  roll: 2,
  title: "Severe Injury",
  preamble: "A severe injury...narrative here",
  test: { stat: 'END', target: 8 },
  onSuccess: [
    { type: 'injury', severity: 'minor', stat: 'STR', value: -1 }
  ],
  onFailure: [
    { type: 'injury', severity: 'serious', stat: 'STR', value: -2 },
    { type: 'injury', severity: 'minor', stat: 'END', value: -1 }
  ]
}
```

---

## 📊 TABELAS DE MUSTERING OUT

### 13. CASH ROLLS (1D6 + DM, clamped 1-7)

**Availability:** Até 3 rolls cash total, independente de carreira

**DMs Aplicados (todos cumulativos):**
```
Hard Path: +1 (todos os rolls)
Soft Path: -1 (todos os rolls)
Off-World Education: -1
Rank 5+: +1
Gambler Skill 1+: +1 (CASH ONLY)

Result clamped: min 1, max 7
```

**Cash Benefit Table (7 entries, by roll 1-7):**
```
Roll | Amount (Livres)
-----|----------------
1    | Lv 0
2    | Lv 1,000
3    | Lv 5,000
4    | Lv 10,000
5    | Lv 20,000
6    | Lv 50,000
7    | Lv 100,000

Total capped at 3 rolls (e.g., max roll 3 = Lv 150,000 if all successful)
```

---

### 14. BENEFIT ROLLS (1D6 + DM, clamped 1-7)

**Structure:** Per career, 7 benefit tables (rolls 1-7)

**DMs Aplicados (mesmos como Cash, mas benefício varia por carreira):**
```
Hard Path: +1
Soft Path: -1
Off-World Education: -1
Rank 5+: +1
Gambler: Not applicable to benefits
```

**Types of Benefits (vary by career):**
- Cash Bonus (Lv X,000)
- Equipment (Weapon, Armor, Vehicle, Gear)
- Skill Bonus (Level 1, can choose specialization)
- Contact/Ally gained
- Title/Rank (rare)
- Ship Shares (for Merchant)

**Example Army Benefits Table (rolls 1-7):**
```
Roll | Benefit
-----|------------------------------------
1    | Low passage (ship berth)
2    | Weapon (field gun or rifle)
3    | Armor (military combat armor)
4    | Rank Insignia (cosmetic, no game effect)
5    | Skill: Gun Combat 1 (choose specialization)
6    | Contact: Senior Officer (ally)
7    | Lv 20,000 bonus cash OR Ship Share
```

---

### 15. NEURAL JACK INSTALLATION (Evento especial)

**Eligibility Check:**
```
- Career: Navy or Marine ONLY
- Nation Tier: 3 or better
- Not already installed
- Any term (if all conditions met)
```

**Choice:**
```
Option 1: Pay Lv 10,000 cash
  - If cash >= 10,000: deduct immediately
  - If cash < 10,000: mark as debt

Option 2: Spend 1 Benefit Roll
  - Deduct from available benefit rolls
  - No debt

Option 3: Refuse
  - No changes
```

**Installation Effect:**
```
If installed:
  - Neural Jack: equipment added
  - DM+1 to all Advancement rolls (persistent)
  - SOC -2 (integration penalty)
  - EDU -2 (integration penalty)
  - Cannot install again during creation
```

---

## 🎯 RESUMO: Quantas Tabelas Existem?

| Categoria | Tabela | Entries | Aplicações |
|-----------|--------|---------|------------|
| Admissão | Admissão DMs | Variable | University + Academy |
| Admissão | Bônus Stat | Variable | University + Academy |
| Admissão | Term Penalty | 4 | University + Academy |
| Graduação | University Grad | 1 (2D6) | University completion |
| Graduação | Academy Grad | 1 (2D6) | Academy completion |
| Educação | Education Events | 12 (2D6) | 1 per University/Academy |
| Carreira | Career Selection | 14 | Term 1+ qualification |
| Carreira | Draft | 6 (1D6) | Term 1 failure |
| Carreira | Survival | 14 | 1 per term per carreira |
| Carreira | Advancement | 14 | 1 per term per carreira |
| Carreira | Commission | 3 | Military careers |
| Carreira | Mishap | 84 (14 x 6) | 1 per survival failure |
| Carreira | Skill Personal | 14 | 1 per term (1D6) |
| Carreira | Skill Service | 14 | Term 1 only (1D6) |
| Carreira | Skill Specialist | 14 | 1 per term (1D6) |
| Carreira | Skill Advanced | 14 | 1 per term if EDU 8+ (1D6) |
| Carreira | Skill Officer | 3 | 1 per term if commissioned (1D6) |
| Carreira | Leaving Home | 14 | 1 per term until leave |
| Carreira | Aging Check | 1 | If age >= 50 & terms >= 8 |
| Life Events | Life Events | 12 (2D6) | Universal, referenced |
| Mustering Out | Cash Rolls | 7 | Up to 3 per character |
| Mustering Out | Benefit Rolls | 98 (14 x 7) | 1 per benefit |
| Special | Neural Jack | 1 | Military only |

**TOTAL UNIQUE TABLES: 22+ domains**
**TOTAL ENTRIES MANAGED: 300+**
**TOTAL ROLLS PERFORMED: 15-30 per character (variable)**

---

## 📝 Padrão de Estrutura para Cada Entry

Toda tabela deve ter esta estrutura em suas entradas:

```typescript
interface TableEntry {
  // Roll triggering
  roll: number;           // 1-6, 1-12, etc

  // Display
  title: string;
  description: string;    // O que o jogador vê
  narrative: string;      // Flavor text narrativo

  // Test (if applicable)
  test?: {
    stat: string;         // "INT", "SOC", "END", etc
    target: number;       // 6, 8, 10, etc
    vs: "target" | "modifier";  // Compare to fixed target or use as modifier
  };

  // Effects
  onSuccess?: Effect[];
  onFailure?: Effect[];
  always?: Effect[];      // Sempre aplicado

  // Follow-ups
  followUp?: {
    type: "skill_choice" | "npc_addition" | "event_trigger" | "choice";
    options?: string[];   // Opções se tipo choice
  };
}

interface Effect {
  type: "stat" | "skill" | "npc" | "cash" | "injury" | "dm" | "equipment" | "event";
  target?: string;        // Stat name, skill name, etc
  value: number | string;
  permanent: boolean;     // STR -1 vs temporary DM +1
}
```

---

**Documento de Referência Completo**
Para uso durante implementação de feedback do sistema.
