# Guia de Implementação: Feedback e Narrativa do Jogador

**Propósito:** Exemplos concretos de como implementar feedback de rolagem para cada tipo de situação

---

## 🎬 PADRÃO 1: Rolagem Simples (Qualification, Survival, Advancement)

### Antes da Rolagem - Apresentação de Contexto

```typescript
// NO COMPONENTE: Apresentar Modal/Card com Pré-Rolagem
class QualificationPhase {
  async presentQualificationRoll() {
    const career = this.selectedCareer;
    const stat = career.qualificationStat; // "INT", "END", etc
    const target = career.qualificationTarget;

    // Construir descrição de contexto
    const context = `
      ## QUALIFICATION CHECK

      You are applying to join the **${career.name}**.

      ### Your Application
      Make a check using your **${stat}** characteristic.

      ### Requirements & Modifiers
      **Target:** ${target}+
      **Your ${stat}:** ${char.characteristics[stat].value} + ${char.characteristics[stat].modifier} = ${this.getTotalStat(stat)}

      ### Applicable Modifiers
      ${this.getQualModifiersDescription()}

      **Final Target:** ${target}

      Press ROLL DICE to proceed...
    `;

    // Apresentar em modal
    await this.diceDisplay.presentPreroll({
      title: `${career.name} - QUALIFICATION`,
      context,
      stat,
      target,
      modifiers: this.qualModifiers,
      onRoll: () => this.executeQualificationRoll()
    });
  }

  private getQualModifiersDescription(): string {
    let text = '';

    this.qualModifiers.forEach(mod => {
      const sign = mod.value > 0 ? '+' : '';
      text += `- **${mod.label}**: ${sign}${mod.value}\n`;
    });

    // Calculate total DM
    const totalDM = this.qualModifiers.reduce((sum, m) => sum + m.value, 0);
    const sign = totalDM > 0 ? '+' : '';
    text += `\n**Total DM:** ${sign}${totalDM}`;

    return text;
  }
}
```

### Durante a Rolagem - Animação e Resultado

```typescript
async executeQualificationRoll() {
  // Rolar dados (com animação visual)
  const diceRoll = await this.diceDisplay.roll(
    '2D6 QUALIFICATION CHECK',
    2,  // 2 dice
    this.getTotalDM(),  // modifiers
    this.target,
    this.stat,
    undefined,
    this.modifiers
  );

  // diceRoll agora contém { roll, total, success, dice1, dice2 }
  const { roll, total, success, dice1, dice2 } = diceRoll;

  // Apresentar resultado em tela
  const resultCard = `
    ## QUALIFICATION CHECK RESULT

    ### Dice Roll
    🎲 **First die:** ${dice1}
    🎲 **Second die:** ${dice2}
    **Sum:** ${roll}

    ### Calculation
    **Base Roll:** ${roll}
    **${this.stat} Modifier:** ${this.getTotalModifier()}
    **Other DMs:** ${this.getOtherDMs()}

    **Total:** ${roll} + ${this.getTotalModifier()} = **${total}**
    **Target:** ${this.target}

    ---

    ${success ? '✅ SUCCESS!' : '❌ FAILURE'}
  `;

  // Log para histórico do personagem
  this.characterService.log(
    `**Qualification Check [${this.selectedCareer.name}]**: ` +
    `${total} vs ${this.target} - ` +
    `${success ? 'SUCCESS' : 'FAILURE'}`
  );

  await this.presentQualificationResult(success, total);
}
```

### Depois da Rolagem - Narrativa e Ação

```typescript
async presentQualificationResult(success: boolean, total: number) {
  if (success) {
    // SUCESSO
    const resultNarrative = `
      ## QUALIFICATION APPROVED ✅

      ### Your Application
      Your credentials are exactly what they're looking for.
      With a total of **${total}** against a target of **${this.target}**,
      you have impressed the selection board.

      ### Welcome to the ${this.selectedCareer.name}
      You are accepted into the ${this.selectedCareer.name}.

      ### Your Assignment
      You receive your initial assignment: **${this.selectedAssignment.name}**

      **Description:** ${this.selectedAssignment.description}

      ### What Happens Next
      - You will begin **Term 1**
      - You start at **Rank 0**
      - You receive **basic training** in your service skills
      - You will make a **Survival check** at term end

      Ready to begin your first term?
    `;

    // Aplicar efeitos
    await this.characterService.recordCareerEntry({
      careerName: this.selectedCareer.name,
      assignment: this.selectedAssignment.name,
      termNumber: 1,
      rank: 0,
      ageStart: this.characterService.currentAge()
    });

    // Gerar basic training skills automaticamente
    await this.grantBasicTrainingSkills();

    // Apresentar narrativa + avançar
    await this.diceDisplay.presentNarrative(resultNarrative);
    this.wizardFlow.advance();

  } else {
    // FALHA
    const resultNarrative = `
      ## QUALIFICATION DENIED ❌

      ### The Decision
      Unfortunately, with a total of **${total}** against the
      required **${this.target}+**, your application has been rejected.

      The selection board feels you lack the necessary
      qualifications for the ${this.selectedCareer.name} at this time.

      ### Your Options
      You have two paths forward:

      #### Option A: Participate in Draft (Available Once)
      If chosen, the military will assign you to a career.
      - You have no control over which career
      - You will receive the same basic training
      - Roll 1D6 to determine your assigned career

      #### Option B: Become a Drifter
      You enter the workforce as an independent contractor.
      - No career benefits
      - No organization affiliation
      - Limited advancement options

      Which path do you choose?
    `;

    await this.diceDisplay.presentNarrative(resultNarrative);

    // Oferecer opções
    const choice = await this.diceDisplay.presentChoice([
      {
        label: '[?] What is Draft?',
        description: 'Learn about the Draft option before choosing',
        action: () => this.showDraftInfo()
      },
      {
        label: '[?] What is Drifter?',
        description: 'Learn about becoming a Drifter',
        action: () => this.showDrifterInfo()
      },
      {
        label: 'Use Draft (if available)',
        description: 'Participate in military draft',
        action: () => this.startDraft()
      },
      {
        label: 'Become Drifter',
        description: 'Enter as independent contractor',
        action: () => this.becomeDrifter()
      }
    ]);
  }
}
```

---

## 🎬 PADRÃO 2: Evento com Teste (Education Events, Life Events)

### Exemplo: Prank Gone Wrong

```typescript
async handlePrankEvent() {
  // ===== FASE 1: Apresentação =====
  const preamble = `
    ## PRANK GONE WRONG

    During your time at the academy, you and some fellow students
    decide to pull off an elaborate prank. However, things spiral
    out of control quickly, and the administrators discover your
    involvement.

    Now you must face the consequences...
  `;

  await this.diceDisplay.presentNarrative(preamble);

  // ===== FASE 2: Teste (SOC Check) =====
  const char = this.characterService.character();
  const soc = char.characteristics.soc.value + char.characteristics.soc.modifier;
  const socMod = this.diceService.getModifier(soc);
  const target = 8;

  const testPresentation = `
    ## FACING THE ADMINISTRATORS

    ### The Situation
    The Dean of Student Affairs calls you into their office.
    They have documentation of your involvement in the prank.

    You need to think quickly and talk your way out of this.

    ### The Test
    Make a **SOC Check (2D6 + SOC mod)** to convince the
    administrators this was all a misunderstanding.

    **Your SOC:** ${soc}
    **Modifier:** ${socMod > 0 ? '+' : ''}${socMod}
    **Target:** ${target}+

    Your ability to charm and persuade them is your best defense...
  `;

  const rollResult = await this.diceDisplay.roll(
    'SOC CHECK - PRANK DEFENSE',
    2,
    socMod,
    target,
    'SOC',
    undefined,
    [{ label: 'SOC', value: socMod }]
  );

  const { roll, total, success } = rollResult;

  // ===== FASE 3: Resultado Narrativo =====
  if (success) {
    if (total >= 10) {
      // GRANDE SUCESSO
      const narrative = `
        ## CRISIS AVERTED ✅

        ### Your Charm Works
        You pull out every trick in your book. You apologize profusely,
        explain how this was meant to be harmless fun, and emphasize
        your genuine respect for the academy.

        Your sincerity combined with your natural charm is irresistible.
        The Dean begins to smile. You can see they're considering letting
        this slide.

        "Look," they say finally, "I was young once too. But don't let
        me catch you pulling anything like this again. Understood?"

        ### The Outcome
        Not only do you escape punishment, but the Dean is impressed
        by your character. They become a mentor figure for you.

        **Effect:**
        - You gain 1 Contact: "Dean [Name]" (Ally)
        - No reputation damage
        - Positive mention in your file
      `;

      // Aplicar efeitos
      this.characterService.addNpc({
        name: 'Dean [Name]',
        type: 'ally',
        origin: 'Education Event (Prank - Success)',
        relationship: 'mentor'
      });

      this.characterService.log('**Prank Event - Success**: Gained Ally (Dean)');

    } else {
      // SUCESSO NORMAL
      const narrative = `
        ## CRISIS AVERTED ✅

        ### Quick Thinking Saves You
        You manage to talk your way through the situation. The Dean
        listens to your explanation and decides that your contrition
        is genuine enough to warrant a second chance.

        "This goes in your file," they warn, "but I won't expel you.
        Consider this your only warning."

        ### The Outcome
        You escape with just a warning. However, it's noted in your
        academic record, and the Dean is not impressed.

        **Effect:**
        - No punishment
        - Warning on record
        - Move forward
      `;

      this.characterService.log('**Prank Event - Success**: Escaped with warning');
    }

  } else {
    if (roll === 2) {
      // FALHA CRÍTICA (Natural 2)
      const narrative = `
        ## EXPELLED ❌ CRITICAL FAILURE

        ### Your Defense Falls Apart
        You open your mouth to explain, but your words come out all wrong.
        You sound defensive, your excuses are flimsy, and the Dean's
        patience runs out.

        "You're not taking this seriously," the Dean says coldly.
        "This kind of behavior has no place in our academy. Pack your bags."

        ### The Outcome
        You are expelled from the academy immediately.
        This is a major setback to your education.

        **Effect:**
        - Expelled to **Prisoner** career
        - Education: Failed status
        - Criminal record (minor)
      `;

      // Aplicar efeito de expulsão
      this.characterService.ejectEducation();
      this.characterService.forcedCareer = 'Prisoner';

      this.characterService.log('**Prank Event - Critical Failure**: Expelled to Prisoner');

    } else {
      // FALHA NORMAL
      const narrative = `
        ## CONSEQUENCES 😞

        ### Your Explanation Doesn't Work
        The Dean isn't convinced by your explanations. They see this
        as a serious breach of academy conduct.

        "I'm suspending you for one term," the Dean declares.
        "When you return - if you return - you better have your head
        on straight."

        ### The Outcome
        You are suspended from the academy.
        - Education is paused
        - You must serve in a military career for 1 term
        - Then you can return to finish your education

        **Effect:**
        - Education Suspended
        - Forced to military career next term
        - Can resume education after serving
      `;

      this.characterService.suspendEducation();
      this.characterService.nextForcedCareer = 'Army'; // or similar

      this.characterService.log('**Prank Event - Failure**: Education suspended');
    }
  }

  // Apresentar narrativa final
  await this.diceDisplay.presentNarrative(narrative);

  // Avançar para próximo evento ou fase
  this.continueEducation();
}
```

---

## 🎬 PADRÃO 3: Opções com Pré-visualização (Não-Obrigatória)

### Exemplo: Mentor Event

```typescript
async handleMentorEvent() {
  const preamble = `
    ## MENTOR APPEARS

    During your studies, an influential figure in your field
    takes notice of your potential. They approach you with
    an unusual offer...
  `;

  // ===== OPÇÃO 1: Ver Detalhes Antes de Escolher =====
  const choice = await this.diceDisplay.presentChoiceWithInfo([
    {
      id: 'accept-mentor',
      label: '🤝 Accept Mentorship',
      shortDesc: 'Learn from an expert in your field',
      detailsAvailable: true,
      details: `
        ### Accept Mentorship

        This mentor is a recognized expert in ${this.major_skill}.
        They offer to guide your studies and introduce you to their network.

        **What will happen:**
        - You make an EDU 9+ check
        - Success: Gain skill +1 in ${this.major_skill}, gain Contact (Mentor)
        - Failure: Contact is gained, but may become rival later

        **Time investment:** About 1 hour per week during studies

        **Benefits:** Accelerated learning, networking, potential job offers
      `,
      action: () => this.acceptMentor()
    },
    {
      id: 'decline-mentor',
      label: '❌ Politely Decline',
      shortDesc: 'Continue your studies independently',
      detailsAvailable: true,
      details: `
        ### Decline Mentorship

        You thank the mentor for the opportunity but explain that
        you prefer to navigate your education independently.

        **What will happen:**
        - No skill gains
        - No contacts gained
        - No consequences

        **Why decline?**
        - You value your independence
        - You're overwhelmed with coursework
        - You distrust the mentor's motives
      `,
      action: () => this.declineMentor()
    },
    {
      id: 'skeptical-mentor',
      label: '🤔 Question Their Motives',
      shortDesc: 'Learn more before committing',
      detailsAvailable: true,
      details: `
        ### Question Their Motives

        You ask the mentor directly about their reasons for
        approaching you. You want to understand what they stand to gain.

        **What will happen:**
        - INT 8+ check: They respect your caution, offer transparent mentorship
        - Failure: They take offense, relationship sours immediately

        **Best for:** Characters who value wisdom and caution
      `,
      action: () => this.questionMentor()
    }
  ]);
}

// Interface para Choice with Optional Details
interface ChoiceWithInfo {
  id: string;
  label: string;              // Visible immediately
  shortDesc: string;          // Subtitle visible immediately
  detailsAvailable: boolean;  // Shows [?] icon
  details: string;            // Shown when user clicks [?]
  action: () => void;         // Executed on selection
}

// Componente para apresentar
async presentChoiceWithInfo(choices: ChoiceWithInfo[]) {
  return new Promise(resolve => {
    this.choiceModal.open({
      title: 'MAKE YOUR CHOICE',
      choices: choices.map(c => ({
        label: c.label,
        subtitle: c.shortDesc,
        hasDetails: c.detailsAvailable,
        onDetails: () => this.showDetails(c),
        onSelect: () => {
          c.action();
          resolve(c.id);
        }
      }))
    });
  });
}
```

---

## 🎬 PADRÃO 4: Skill Roll com Especialização

```typescript
async grantSkillRoll(career: Career, termNumber: number) {
  // Rolar skill da tabela apropriada
  const skillTableName = this.selectSkillTable(career, termNumber);
  const skillResult = this.rollSkillTable(career, skillTableName);

  // Se skill tem especialidades, oferecer escolha
  if (this.skillHasSpecializations(skillResult.skill)) {
    await this.presentSpecializationChoice(skillResult);
  } else {
    // Skill simples, aplicar direto
    await this.applySkill(skillResult);
  }
}

async presentSpecializationChoice(skillResult: SkillRollResult) {
  const skill = skillResult.skill; // "Engineer", "Gun Combat", "Science", etc
  const specializations = this.getSpecializations(skill);

  const presentation = `
    ## SKILL ROLL: TERM ${this.currentTerm}

    You have earned a skill roll in: **${skill}**

    However, this skill has multiple specializations.
    Which area would you like to specialize in?

    ### Available Specializations
  `;

  // Build choice with details
  const choices = specializations.map(spec => ({
    id: spec.id,
    label: `${skill} (${spec.name})`,
    shortDesc: spec.description,
    hasDetails: true,
    details: `
      ### ${skill}: ${spec.name}

      ${spec.fullDescription}

      **Typical Uses:**
      ${spec.typicalUses.map(use => `- ${use}`).join('\n')}

      **Career Benefits:**
      ${spec.careerBenefits.map(benefit => `- ${benefit}`).join('\n')}
    `,
    action: () => this.applySkillWithSpecialization(skill, spec)
  }));

  await this.diceDisplay.presentChoiceWithInfo(choices);

  this.characterService.log(
    `**Skill Roll [Term ${this.currentTerm}]**: ` +
    `${skill} (${selectedSpec.name}) - Level 1`
  );
}

// Exemplo para Engineer specializations (2300AD específico)
const ENGINEER_SPECS = [
  {
    id: 'eng-lifesupport',
    name: 'Life Support',
    description: 'Oxygen, water, temperature control systems',
    fullDescription: `
      Specialists in life support systems maintain the air you breathe
      on space stations and submarines. They manage recycling systems,
      pressure controls, and environmental regulation.
    `,
    typicalUses: [
      'Repair failing life support during emergency',
      'Design efficient recycling systems',
      'Troubleshoot oxygen production failures',
      'Maintain planetary habitats'
    ],
    careerBenefits: [
      'Navy: Essential skill for any vessel',
      'Scout: Survival on alien worlds',
      'Merchant: Keep your cargo viable'
    ]
  },
  {
    id: 'eng-mdrive',
    name: 'M-Drive',
    description: 'Main thrusters and maneuver drives',
    fullDescription: `
      Main drive engineers are responsible for the engines that move
      starships through normal space. They are always in demand and
      highly respected among spacefaring folks.
    `,
    typicalUses: [
      'Optimize jump capacity and efficiency',
      'Repair battle-damaged drives',
      'Perform emergency maneuvers',
      'Maintain drive efficiency during long trips'
    ],
    careerBenefits: [
      'Navy: Command of your own vessel',
      'Merchant: Better profits through efficiency',
      'Scout: Faster exploration'
    ]
  },
  {
    id: 'eng-power',
    name: 'Power',
    description: 'Power generation and distribution systems',
    fullDescription: `
      Power engineers manage the reactor cores and electrical systems
      that keep everything running. They work in the most dangerous
      environments aboard any vessel.
    `,
    typicalUses: [
      'Manage reactor operations',
      'Restore power after catastrophic failure',
      'Optimize power distribution',
      'Prevent meltdowns'
    ],
    careerBenefits: [
      'Navy: Critical for combat readiness',
      'Any career: Power is always needed'
    ]
  },
  {
    id: 'eng-stutter',
    name: 'Stutterwarp',
    description: 'Experimental jump drive (2300AD Specific)',
    fullDescription: `
      The Stutterwarp is the experimental jump drive of the 2300AD era.
      It allows faster-than-light travel using a different approach than
      traditional Jump Drives. Masters of this technology are rare.
    `,
    typicalUses: [
      'Perform experimental jumps',
      'Troubleshoot stutter effects',
      'Optimize jump coordinates',
      'Research new jump patterns'
    ],
    careerBenefits: [
      'Navy: Leading edge technology',
      'Scout: Access to experimental ships',
      'Any career: Rare and valuable skill'
    ]
  }
];
```

---

## 🎯 ESTRUTURA RECOMENDADA PARA COMPONENTES

### DiceDisplayService - Métodos Necessários

```typescript
// PRÉ-ROLAGEM
presentPreroll(config: {
  title: string;
  context: string;        // HTML/Markdown
  stat: string;
  target: number;
  modifiers: Modifier[];
  onRoll: () => void;
}): Promise<void>

// ROLAGEM
roll(
  title: string,
  dice: number,
  dm: number,
  target: number,
  statName: string,
  description?: string,
  modifiers?: Modifier[],
  flavor?: string,
  meta?: { phase: string; announcement: string; ... }
): Promise<RollResult>

// RESULTADO
presentNarrative(narrative: string): Promise<void>

// ESCOLHAS
presentChoice(options: ChoiceOption[]): Promise<ChoiceOption>

presentChoiceWithInfo(options: ChoiceWithInfo[]): Promise<string>

// HISTÓRICO
presentHistory(): Promise<void>
```

### Estrutura de Resultado

```typescript
interface RollResult {
  dice: number[];         // [3, 4]
  roll: number;           // 7 (sum)
  dm: number;             // +2
  total: number;          // 9 (roll + dm)
  target: number;         // 8
  success: boolean;       // true
  margin: number;         // 1 (total - target, positive = success margin)
  critical: boolean;      // nat 2 or 12?
  stat: string;           // "INT"
  modifiers: Modifier[];  // Detail breakdown
}
```

---

## 📝 Checklist de Implementação por Tipo de Rolagem

### ✅ Rolagem Simples (Qualification, Survival, Advancement)
- [ ] Pré-rolagem mostra stat, target, todos os DMs
- [ ] Animação visual de dados
- [ ] Resultado mostra breakdown matemático
- [ ] Narrativa descreve o que aconteceu
- [ ] Efeitos automáticos aplicados
- [ ] Log do personagem atualizado

### ✅ Evento com Teste (Prank, Mentor, etc)
- [ ] Preamble narrativo apresenta situação
- [ ] Teste explicado com contexto
- [ ] Resultado narrativo (sucesso/falha diferente)
- [ ] Efeitos aplicados por resultado
- [ ] Opções de continuação se aplicável

### ✅ Evento com Opções (Life Event, etc)
- [ ] Situação apresentada sem opções visíveis
- [ ] Botões com [?] para pré-visualizar
- [ ] Pré-visualização mostra possibilidades
- [ ] Jogador pode escolher informado
- [ ] Suspense mantido se desejar não ler detalhes

### ✅ Skill Rolls com Especialização
- [ ] Skill ganho identificado
- [ ] Se tem especialização: opções oferecidas com detalhes
- [ ] Cada especialização explicada
- [ ] Skill + especialidade aplicada
- [ ] Log mostra resultado final

### ✅ Mustering Out
- [ ] Benefit roll mostra DMs aplicados
- [ ] Resultado apresentado (1-7)
- [ ] Benefício descrito
- [ ] Se choice (weapon/armor): modal/seleção
- [ ] Equipamento adicionado à ficha
- [ ] Histórico atualizado

---

**Fim do Guia de Implementação**
Para usar durante desenvolvimento de feedback de rolagens.
