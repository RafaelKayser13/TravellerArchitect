# Componentes - TravellerArchitect

## Hierarquia do Wizard (9 Steps)

```
App
└── CharacterWizardComponent  (controller multi-step)
    ├── Step 1: IdentityComponent        - nome, gênero, idade, portrait
    ├── Step 2: AttributesComponent      - rolar 6 stats via 2d6
    ├── Step 3: OriginComponent          - nacionalidade, tipo origem, homeworld
    ├── Step 4: EducationComponent       - universidade/academia
    ├── Step 5: CareerComponent          - loop de termos de carreira (MAIS COMPLEXO)
    ├── Step 6: MusteringOutComponent    - gastar rolls de benefício
    ├── Step 7: NpcManagementComponent   - revisar/editar NPCs
    ├── Step 8: SkillPackageComponent    - selecionar pacote de skills
    └── Step 9: CharacterSheetComponent  - exibir e exportar

Componentes Compartilhados:
├── HudWindowComponent        - frame sci-fi
├── EventDisplayComponent     - renderiza eventos + botões de opção
├── DiceRollerComponent       - animação de dados + resultados
├── Die3DComponent            - dado 3D rotativo
├── NpcInteractionComponent   - dialog de detalhes de NPC
├── StepHeaderComponent       - título/subtítulo do passo
├── DebugFloaterComponent     - overlay de debug
└── ConfirmationDialogComponent - confirmação de reset
```

## CharacterWizardComponent
`src/app/features/character/character-wizard/`

### Métodos-Chave
```typescript
nextStep()           // currentStep++, scroll to top
goToStep(step)       // salta para passo específico
onActionClick()      // dispatch finish() para step ativo
initiateReset()      // mostra confirmação
confirmReset()       // characterService.reset() + step=1
```

### Getters
```typescript
actionLabel: string  // "PROCEED > CAREER", "FINALIZE", etc.
actionEnabled: boolean  // verifica canProceed/isValid do step
```

---

## AttributesComponent
`src/app/features/character/steps/attributes/`

**Recursos:**
- Reveal sequencial (800ms delay)
- Modo "Blessed" (distribuição garantida melhor):
  - 1 valor 11-12, 2 valores ≥10, max 2 valores <8, resto 8-10
- Modo edição: ajuste manual
- Efeito glitch no reveal

**Métodos:**
```typescript
rollSequence()       // inicia todas as rolagens
editValue(char)      // toggle edição de stat
save()               // push para characterService
isComplete: boolean  // true após salvar
```

---

## EducationComponent
`src/app/features/character/steps/education/`

**Fluxo:**
1. Escolher tipo (University / Academy / None)
2. **University:** major skill (50+ opções) → admissão (EDU/SOC) → evento → graduação
3. **Academy:** branch (Army/Navy/Marines/Scouts/Spaceborne) → admissão → evento → skills

---

## CareerComponent (MAIS COMPLEXO)
`src/app/features/character/steps/career/`

**Fluxo de um Termo:**
```
1. Seleção de carreira
2. Roll de qualificação (vs stat + DM)
3. Seleção de assignment
4. Basic training (skills nível 0 obrigatórias)
5. Treinamento (3 escolhas de skill table)
6. Leaving Home (2300AD) - survival check
7. Roll de sobrevivência (vs stat)
8. Roll de evento (2d6 → career event table → event engine)
9. Aging check (a cada 10 anos)
10. Roll de avanço (vs stat)
11. Cálculo de rolls de benefício
12. Decisão: continuar ou dispensar
```

**Mecânicas Especiais 2300AD:**
- Neural Jack events (opções de custo)
- Sistema de liberdade condicional (Prisoner)
- Apostas de rolls (Merchant gambling)
- Dívidas médicas (planos por carreira)
- Conversões de NPC (Merchant Foreign Legion)
- Carreiras forçadas (Prisoner → continua forçado)

**Estado Interno:**
```typescript
currentState: CareerState   // FSM
selectedCareer, selectedAssignment
bonusSkillRolls, currentRank, isCommissionedCurrent
rollLog[], lastRoll, lastTarget, lastDm, success
```

---

## MusteringOutComponent
`src/app/features/character/steps/mustering-out/`

**Lógica:**
- Por carreira, rolls alocados
- Escolher Cash ou Material
- Roll 1d6 (ou 2d6 com DM)
- Lookup no musteringOut do career
- Aplicar efeito (item, cash, stat bonus)
- **Limite:** máx 3 cash rolls em TODAS as carreiras

---

## CharacterSheetComponent
`src/app/features/character/components/character-sheet/`

```typescript
displayCharacter()   // formata dados para exibição
exportJson()         // download character.json
exportPdf()          // pdfMake library → PDF
```

---

## EventDisplayComponent
`src/app/features/character/shared/event-display/`

**Propósito:** Renderiza GameEvent com opções clicáveis
- Lê `eventEngine.currentEvent` signal
- Mostra título, descrição, outcomes
- Botões para cada EventOption
- Chama `eventEngine.selectOption(index)`

---

## DiceRollerComponent
`src/app/features/shared/dice-roller/`

**Fluxo:**
```
request signal muda → effect() → startRoll()
→ animação 1500ms → finalizeRoll()
→ mostra botão "continuar"
→ continue() → diceDisplay.complete(total)
```

**Recursos:**
- Breakdown de modificadores
- Override manual (debug)
- Destaque da tabela de resultado

---

## Pipe UPP
`src/app/shared/pipes/upp.pipe.ts`

```typescript
// Formata: STR/DEX/END/INT/EDU/SOC como hex
// Ex: "8A7C63" = STR:8 DEX:10 END:7 INT:12 EDU:6 SOC:3
```

---

## Padrões de Componente

### Injeção de Serviços
```typescript
@Component({ selector: '...', standalone: true, imports: [...] })
export class MyComponent {
  protected service = inject(MyService);
  protected character = this.service.character;  // Signal direto
}
```

### Adicionar Novo Step ao Wizard
1. Criar componente em `steps/newstep/`
2. Implementar `finish()` e `canProceed()`
3. Adicionar ao character-wizard: imports, ViewChild, ngSwitch
4. Atualizar `actionLabel`, `actionEnabled`, `onActionClick`
5. Total steps: atualmente 9
