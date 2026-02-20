# Plano de Auditoria: Sistema de Rolagens de Dados e Feedback do Jogador

**Data:** 2026-02-20
**Versão:** 1.0
**Status:** Em Planejamento

---

## 📋 Objetivo

Auditar **todas as tabelas e situações** em que dados são rolados no sistema para garantir que:

1. **Cada rolagem apresenta informações claras:**
   - Qual teste está sendo realizado
   - Qual perícia ou stat é usado para calcular o modificador
   - Quais vantagens/desvantagens afetam a rolagem
   - Qual é o alvo (target) necessário

2. **Cada resultado é implementado corretamente:**
   - Descrição instruitiva do que aconteceu
   - Ações automáticas são executadas (alterando a ficha)
   - Novos testes são acionados se necessário
   - Informações são apresentadas ao jogador

3. **Diálogos de escolha fornecem informações:**
   - Botões/opções sem revelar automaticamente o que acontecerá
   - Usuário pode clicar para ler descrições antes de decidir
   - Mantém suspense mas oferece informação quando requisitado

---

## 📊 Mapeamento de Tabelas e Rolagens

### CATEGORIA 1: EDUCAÇÃO (Education Step)

#### 1.1 Admissão Universitária / Academia Militar
**Arquivo:** `education.component.ts` + `education-events.ts`

| Aspecto | Status | Implementação | Feedback |
|---------|--------|-----------------|-----------|
| **Pré-Rolagem** | ✓ | Apresenta requisitos e DMs | ✓ Mostra target e mods |
| **Rolagem** | ✓ | 2d6 + DM vs target | ✓ Mostra resultado |
| **Resultado Sucesso** | ✓ | Entra na instituição | ✓ EDU +1, skills ganhas |
| **Resultado Falha** | ✓ | Rejeitado | ? Precisa descrição |

**Tabelas Envolvidas:**
- Admission DMs (por Tech Level, Admission Method)
- Term Penalties (Term 2-4)
- Graduation Checks (INT vs target 6/7)
- Graduation Events (2D6)

**Ações Necessárias:**
```
[ ] Validar que TODOS os DMs são apresentados antes da rolagem
[ ] Cada resultado de admissão mostra descrição clara
[ ] Falha de admissão oferece opção de tentar novamente ou próximo termo
```

---

#### 1.2 Eventos Educacionais (2D6)
**Arquivo:** `education-events.ts` (tabela 12 eventos)

| Roll | Evento | Implementado? | Feedback? |
|------|--------|---------------|-----------|
| 2 | Psiônico | ? | ? |
| 3 | Tragédia | ? | ? |
| 4 | Travessura | ? | ? |
| 5 | Amizade | ? | ? |
| 6 | Conflito Político | ? | ? |
| 7 | Life Event | ✓ (referencia Life Events) | ✓ |
| 8 | Estudo | ? | ? |
| 9 | Hobby | ? | ? |
| 10 | Mentor | ? | ? |
| 11 | Guerra/Draft | ? | ? |
| 12 | Reconhecimento | ? | ? |

**Ações Necessárias:**
```
[ ] Verificar implementação de CADA evento
[ ] Cada evento mostra descrição completa do que aconteceu
[ ] Efeitos são aplicados corretamente à ficha
[ ] Testes secundários (SOC, EDU, INT) são apresentados com contexto
```

---

### CATEGORIA 2: CARREIRA (Career Step)

#### 2.1 Qualificação (Qualification Roll)
**Arquivo:** `career.component.ts` (linhas ~408-560)

**Estrutura Esperada:**
```typescript
Roll: 2D6 + Stat DM
Target: Por carreira (INT 6, END 5, SOC 10, etc)
Modificadores:
  - Universidade: +1 ou +2 (honras)
  - Idade (Militar): -2 se age >= 30
  - Carreira anterior: -1 por carreira
  - Bônus diversos: +1 ou +2
```

**Implementação Atual:**
- ✓ Rolagem executada
- ✓ DMs calculados
- ? Feedback ao jogador mostra TODOS os DMs?
- ? Descrição do que significa falha/sucesso?

**Ações Necessárias:**
```
[ ] Apresentar lista clara de TODOS os DMs antes da rolagem
[ ] Após rolagem: "Você obteve X vs Target Y (Sucesso/Falha)"
[ ] Sucesso: descrição de entrada na carreira + assignment
[ ] Falha: opção de Draft ou Drifter automático
```

---

#### 2.2 Survival Roll (Por Termo)
**Arquivo:** `career.component.ts` (linhas ~1030+)

**Estrutura Esperada:**
```typescript
Roll: 2D6 + Survival Stat DM
Target: Por assignment e carreira
Modificadores:
  - World Gravity: até ±2
  - Path (Hard/Soft): ±1
  - Homeworld (até deixar): DM próprio
```

**Ações Necessárias:**
```
[ ] Apresentar qual stat é usado (END/DEX/EDU por carreira)
[ ] Mostrar target específico do assignment
[ ] Listar todos os DMs ativos
[ ] Sucesso: continua, ganha skill roll
[ ] Falha: Mishap table rolada automaticamente
[ ] Exato match (Rule 245): Prótese oferecida como escolha
```

---

#### 2.3 Advancement Roll (Por Termo)
**Arquivo:** `career.component.ts` (linhas ~1500+)

**Estrutura Esperada:**
```typescript
Roll: 2D6 + Advancement Stat DM
Target: Por assignment
Modificadores:
  - Neural Jack: +1
  - Parole DM (Prisoner): variável
  - Eventos: DM acumulado
```

**Ações Necessárias:**
```
[ ] Mostrar stat usado para advancement (EDU, INT, etc)
[ ] Mostrar target específico
[ ] Sucesso: rank sobe, ganha skill roll adicional
[ ] Natural 12: extensão obrigatória anunciada
[ ] Falha + total <= termos: forced out (mas rank sobe antes)
[ ] Apresentar cada progresso de forma narrativa
```

---

#### 2.4 Commission Roll (Termo 1 ou SOC 9+)
**Arquivo:** `career.component.ts` (linhas ~702-760)

**Estrutura Esperada:**
```typescript
Roll: 2D6 + Advancement Stat DM
Target: 8 (padrão, pode variar)
Modificadores:
  - Academy: +2 ou Rank 1 automático (honras)
  - Previous attempts: -1 por tentativa anterior
```

**Ações Necessárias:**
```
[✓] Commission DM-1 per term implementado
[ ] Apresentar claramente: "Tentativa de Comissão #N (DM-1 por tentativa anterior)"
[ ] Mostrar stat e target
[ ] Sucesso: "Promovido a Officer Rank 1, ganha 1 extra skill roll"
[ ] Falha: "Comissão negada, continua como alistado"
```

---

#### 2.5 Skill Rolls (1D6 por tabela)
**Arquivo:** `career.component.ts` (rolagem de skills)

**Tabelas por Carreira:**
1. Personal Skills (1D6)
2. Service Skills (1D6)
3. Specialist/Assignment Skills (1D6)
4. Advanced Education (1D6, requer EDU 8+)
5. Officer Skills (1D6, requer comissão)

**Ações Necessárias:**
```
[ ] Cada roll mostra qual tabela está sendo usada
[ ] Resultado mostra skill exato ganho
[ ] Se skill tem especialidade (Engineer, Flyer, Science):
    - Apresenta opções de especialidade
    - Oferece descrição de cada opção
    - Jogador escolhe antes de confirmar
[ ] Skill cap verificado (máx 4 durante criação, INT+EDU total)
```

---

#### 2.6 Mishap Table (1D6)
**Arquivo:** Career JSON files (cada carreira tem mishap table com 6 entradas)

**Ações Necessárias:**
```
[ ] Cada carreira tem exatamente 6 mishaps (rolls 1-6)
[ ] Cada mishap tem:
    - Descrição do que aconteceu
    - Efeito na ficha (injury, dano a skill, ejeção, etc)
    - Opções se aplicável (voltar como alistado, Drifter, etc)
[ ] Injuries implementadas corretamente:
    - Se resultado de mishap: aplicar dano + medical bills
    - Apresentar costo de tratamento
```

---

### CATEGORIA 3: LIFE EVENTS (Tabela Universal - 2D6)

**Arquivo:** `life-events.ts` (tabela 12 eventos universais)

| Roll | Evento | Implementado? | Feedback? |
|------|--------|---------------|-----------|
| 2 | Lesão Grave | ? | ? |
| 3 | Acidente | ? | ? |
| 4 | Política | ? | ? |
| 5 | Saudade | ? | ? |
| 6 | Treinamento | ? | ? |
| 7 | Viagem | ? | ? |
| 8 | Prêmio | ? | ? |
| 9 | Desespero | ? | ? |
| 10 | Romance | ? | ? |
| 11 | Enriquecimento | ? | ? |
| 12 | Oportunidade | ? | ? |

**Ações Necessárias:**
```
[ ] Cada evento tem descrição narrativa completa
[ ] Testes secundários (SOC, INT, etc) oferecem contexto
[ ] Sucesso/Falha determina bifurcação do evento
[ ] Opções de decisão oferecem pré-visualização sem obrigar revelação
[ ] Effects aplicados: skills, NPCs, cash, DMs futuros
```

---

### CATEGORIA 4: MUSTERING OUT (Benefit & Cash Rolls - 1D6 + DM)

**Arquivo:** `mustering-out.component.ts`

#### 4.1 Cash Rolls (até 3 no total)
**Tabela:** 7 entradas (1-7 result após clamping DM)

**Implementação Esperada:**
```
Roll: 1D6 + DM (Hard Path +1, Soft Path -1, Off-World -1, Rank 5+ +1, Gambler +1)
Result: Clamped 1-7, lookup table
Cada resultado:
  - Mostra montante em Livres (Lv)
  - Aplicado automaticamente ao cash do personagem
  - Histórico registrado
```

**Ações Necessárias:**
```
[✓] Hard/Soft Path DMs aplicados
[✓] Off-World education DM-1 registrado
[ ] Cada cash roll mostra:
    - DMs calculados
    - Resultado final (1-7)
    - Descrição: "Você recebeu Lv X,XXX em [fonte]"
    - Limite de 3 rolls cash total respeitado
```

---

#### 4.2 Benefit Rolls (1D6 + DM)
**Tabelas:** 7 entradas cada carreira (1-7 result)

**Tipos de Benefícios:**
- Equipment (weapon, armor, vehicle, gear)
- Cash Bonus (adicional, conta como 1 roll)
- Skill Bonus
- Title/Rank (raro)
- Contact/Ally

**Ações Necessárias:**
```
[ ] Cada benefit roll mostra:
    - Lista de DMs aplicados
    - Resultado do dado (1-7)
    - Opção selecionada do resultado
[ ] Se escolha: "Você escolheu [weapon/armor/skill]"
[ ] Se weapon/armor: modal de seleção ou lista oferecida
[ ] Se skill: especialidade oferecida se aplicável
[ ] Histórico mostra "Benefit Roll #N: [resultado]"
```

---

### CATEGORIA 5: NEURAL JACK (Evento especial - 1D6)

**Arquivo:** `neural-jack-install.event.ts`

**Rolagem:** 1D6 para decisão de custo (Cash vs Benefit Roll)

**Ações Necessárias:**
```
[ ] Apresentação clara:
    - "Neural Jack disponível"
    - Custo: 1 Benefit Roll OU Lv 10,000 cash
    - Efeitos: DM+1 advancement, SOC -2, EDU -2
    - Carreira: Navy ou Marine apenas
    - Nação: Tier 3 ou melhor
[ ] Escolha oferece pré-visualização de consequências
[ ] Se custa Benefit Roll: desconta corretamente
[ ] Se custa Cash: desconta ou marca como dívida se insuficiente
[ ] Ficha reflete: neural jack instalado, penalidades aplicadas
```

---

## 🎮 Estrutura de Feedback ao Jogador

### Padrão 1: Rolagem Simples com Resultado

```
┌─────────────────────────────────────────┐
│ SURVIVAL CHECK · ARMY TERM 3            │
├─────────────────────────────────────────┤
│ You are serving your third term as an   │
│ Army soldier. Make a Survival check...  │
│                                         │
│ Stat: END (7+2 = 9)                     │
│ Target: 5                               │
│ Modifiers:                              │
│   - Soft Path: -1                       │
│   - Frontier World: +1                  │
│ Final Target: 5                         │
├─────────────────────────────────────────┤
│ [ROLL DICE] (mostra 2D6 visual)        │
├─────────────────────────────────────────┤
│ Result: 7 + 2 - 1 + 1 = 9 vs 5         │
│ ✓ SUCCESS!                              │
│                                         │
│ You survive another term. Your body     │
│ has adapted to the rigors of military   │
│ life. You earn 1 Skill Roll for this    │
│ term.                                   │
├─────────────────────────────────────────┤
│ [CONTINUE] [VIEW HISTORY]               │
└─────────────────────────────────────────┘
```

### Padrão 2: Evento com Opções (Info Oculta)

```
┌─────────────────────────────────────────┐
│ LIFE EVENT · TERM 4                     │
├─────────────────────────────────────────┤
│ Something extraordinary happens...      │
│                                         │
│ Choice 1: [?] Learn more about Option A
│ Choice 2: [?] Learn more about Option B
│ Choice 3: [?] Learn more about Option C
├─────────────────────────────────────────┤
│ [HELP] What will happen if I choose?    │
└─────────────────────────────────────────┘

Clicando em [?] ou [HELP]:

┌─────────────────────────────────────────┐
│ OPTION A: Meet a Mentor                 │
├─────────────────────────────────────────┤
│ Description:                            │
│ An experienced officer takes interest   │
│ in your career. They offer guidance     │
│ and sponsorship...                      │
│                                         │
│ Possible Outcomes:                      │
│ • Gain 1 Contact (NPC: Mentor)         │
│ • EDU +1 if INT 9+                     │
│ • Risk: May create a Rival if INT < 6  │
│                                         │
│ This will cost 1 Character Point if     │
│ you wish to refuse the mentorship.      │
├─────────────────────────────────────────┤
│ [ACCEPT] [REFUSE] [BACK]                │
└─────────────────────────────────────────┘
```

### Padrão 3: Testes Secundários com Contexto

```
┌─────────────────────────────────────────┐
│ PRANK GONE WRONG                        │
├─────────────────────────────────────────┤
│ You're caught in a prank at the academy │
│ that backfires badly. The administrators│
│ are not amused.                         │
│                                         │
│ Make a SOC check (8+) to talk your way  │
│ out of it...                            │
│                                         │
│ SOC: 8                                  │
│ Target: 8                               │
├─────────────────────────────────────────┤
│ [ROLL DICE]                             │
├─────────────────────────────────────────┤
│ Result: 6 + 2 = 8 vs 8 (MARGINAL)      │
│ ✓ You talk your way out                 │
│                                         │
│ With some smooth talking and apologies, │
│ you convince the administrators that    │
│ it was all a misunderstanding. You      │
│ gain: 1 Contact (Administrator Friend) │
├─────────────────────────────────────────┤
│ [CONTINUE]                              │
└─────────────────────────────────────────┘
```

---

## 📋 Checklist de Conformidade

### Por Categoria

#### Educação
- [ ] Admissão: Todos os DMs são apresentados
- [ ] Admissão: Resultado claro (aceito/rejeitado)
- [ ] Graduação: Teste INT mostrado e explicado
- [ ] Eventos: Cada um dos 12 implementado
- [ ] Eventos: Testes secundários com contexto
- [ ] Eventos: Bifurcações funcionam corretamente

#### Carreira
- [ ] Qualificação: DMs listados completamente
- [ ] Qualificação: Resultado claro (entrada/falha/draft)
- [ ] Survival: Stat e target claros
- [ ] Survival: Falha -> Mishap automático
- [ ] Survival: Exato (Rule 245) oferece prótese
- [ ] Advancement: Stat, target, DMs claros
- [ ] Advancement: Natural 12 força continuação
- [ ] Commission: DM-1 implementado corretamente
- [ ] Commission: Apresentação clara de tentativas
- [ ] Skill Rolls: Tabela e resultado identificados
- [ ] Skill Rolls: Especialidades oferecidas
- [ ] Mishap: Cada carreira tem 6 mishaps
- [ ] Mishap: Efeitos aplicados corretamente

#### Life Events
- [ ] Cada evento tem descrição narrativa
- [ ] Testes secundários oferecem contexto
- [ ] Bifurcações funcionam (sucesso/falha)
- [ ] Efeitos aplicados: skills, NPCs, cash

#### Mustering Out
- [ ] Cash: DMs apresentados
- [ ] Cash: Limite de 3 rolls respeitado
- [ ] Benefit: Choices oferecidas com opções
- [ ] Benefit: Especialidades para skills
- [ ] Benefit: Equipment com seleção modal
- [ ] Hard/Soft Path: DMs aplicados a TODOS rolls

#### Neural Jack
- [ ] Elegibilidade verificada (Navy/Marine, Tier 3+)
- [ ] Custos apresentados claramente
- [ ] Efeitos (DM+1, SOC-2, EDU-2) registrados
- [ ] Instalação registrada na ficha

---

## 🎯 Próximos Passos - Ordem de Execução

### Fase 1: Auditoria Detalhada (Semana 1)
```
1. Ler cada arquivo de evento completamente
2. Criar teste manual para cada tabela
3. Documentar feedback atual vs esperado
4. Listar gaps de implementação
```

### Fase 2: Implementação de Feedback (Semana 2-3)
```
1. Cada rolagem mostra pré-rolagem com DMs
2. Cada resultado mostra descrição narrativa
3. Testes secundários incluem contexto
4. Opções oferecem pré-visualização on-demand
```

### Fase 3: Testes Manuais (Semana 4)
```
1. Teste cada educação (University, Academy, 3x events)
2. Teste cada carreira (qual, surv, adv, comm, 3x skills, 1x mishap)
3. Teste Life Events (3 eventos aleatórios)
4. Teste Mustering Out (3x cash, 3x benefit)
5. Teste Neural Jack (instalação completa)
```

### Fase 4: Otimização UX (Semana 5)
```
1. Review todas as strings de feedback
2. Melhorar clareza e narrativa
3. Adicionar animações/visual polish
4. Testes de acessibilidade
```

---

## 📝 Notas de Implementação

### Padrão de Estrutura de Evento

```typescript
// ESTRUTURA ESPERADA DE TODO EVENTO
interface GameEvent {
  id: string;
  name: string;

  // ANTES DA ROLAGEM
  preamble: string;           // "Você está fazendo X, teste Y..."
  stat: string;               // "STR", "INT", "SOC", etc
  target: number;             // 6, 8, 10, etc
  modifiers: Modifier[];      // Lista de DMs

  // ROLAGEM
  roll: () => number;         // Calcula 2D6 + DMs

  // DEPOIS DA ROLAGEM
  onSuccess: (roll: number) => Effect[];
  onFailure: (roll: number) => Effect[];

  // FEEDBACK AO JOGADOR
  successNarrative: string;   // Descrição do sucesso
  failureNarrative: string;   // Descrição da falha
}

// ESTRUTURA DE EFFECT
interface Effect {
  type: 'skill' | 'cash' | 'npc' | 'injury' | 'stat' | 'event' | 'choice';
  value: any;
  display: string;            // Apresentado ao jogador
}
```

### Quando Usar Modal de Seleção

```
Weapon/Armor Selection:
- Modal com busca e filtro
- Mostra nome, descrição, custo, TL
- Jogador seleciona e confirma

Skill Selection (especialidade):
- Modal ou dropdown com opções
- Mostra descrição de cada especialidade
- Exemplo: "Engineer (M-Drive) - Expert in main drive systems"

Equipment (geral):
- Mesmo modal de weapon/armor
- Mas com categorias: tools, medical, comm, vehicles, etc
```

---

## 📞 Conclusão

Este plano estrutura a auditoria completa do sistema de rolagens e feedback. O objetivo é garantir que **cada rolagem de dados seja uma experiência completa** para o jogador:

1. ✓ Sabe o que está acontecendo
2. ✓ Vê todos os modificadores e regras
3. ✓ Entende o resultado obtido
4. ✓ Vê o efeito na sua ficha
5. ✓ Pode explorar opções sem perder suspense

**Próximo Passo:** Executar Fase 1 (Auditoria Detalhada) começando pela Educação.
