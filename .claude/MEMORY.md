# TravellerArchitect - Memória de Projeto

## Arquivos de Referência
- [architecture.md](.claude/architecture.md) - Estrutura de pastas, stack, padrões
- [services.md](.claude/services.md) - Todos os serviços com métodos completos
- [models.md](.claude/models.md) - Interfaces TypeScript (Character, Career, GameEvent, etc.)
- [components.md](.claude/components.md) - Hierarquia do wizard, componentes, padrões
- [data.md](.claude/data.md) - Career JSONs, tables.json, dados estáticos
- [event-engine.md](.claude/event-engine.md) - Event Engine, handlers, fluxo completo
- [books-index.md](.claude/books-index.md) - Índice dos 3 livros Traveller 2300AD

## Resumo Executivo

**TravellerArchitect** = Sistema de criação de personagem Angular para o TTRPG 2300AD Traveller.

### Stack
- Angular 18+ standalone, Signals para estado, RxJS pontual
- localStorage persistência, HTTP para career JSONs no init

### Arquitetura Principal
- **CharacterService** = hub central de estado (Signal)
- **EventEngineService** = stack LIFO de eventos + Strategy Pattern handlers
- **CareerService** = carrega 14 carreiras de JSON assets
- **DiceDisplayService** = fila de rolls de dados para UI

### 9 Passos do Wizard
1. Identity → 2. Attributes → 3. Origin → 4. Education → 5. Career → 6. Mustering Out → 7. NPC Management → 8. Skill Package → 9. Character Sheet

### Mecânicas 2300AD Implementadas
- 6 stats (STR/DEX/END/INT/EDU/SOC), 14 carreiras
- Hard Path vs. Soft Path, 32 homeworlds, 6 espécies alienígenas
- DNAM, simbiontes, neural jack, sistema de liberdade condicional
- Strategy Pattern: 5 handlers de efeito
- Regra 245 (sucesso exato em sobrevivência → prótese)

## 🔴 PRECEDÊNCIA DE REGRAS (CRÍTICO)

**Quando há conflito ou ambiguidade de regras, SEMPRE aplicar esta hierarquia:**

1. **📖 Livro 02** (Characters & Equipment) - **MÁXIMA PRIORIDADE**
2. **📖 Livro 03** (Worlds of 2300AD) - **MÁXIMA PRIORIDADE** 
3. **📖 Livro 01** (Core Rulebook) - Base, mas sobreposta pelos 02 e 03

**Exemplo**: Se Core Rulebook diz skill X vale 2 pontos, mas Livro 02 diz vale 3, aplicar **3 pontos**.

**Aplicar em**: Testes E2E, validação de benefícios, regras de envelhecimento, custos de cybernética, períodos de carreiras.

### Arquivos-Chave
```
src/app/core/services/character.service.ts      # Estado central
src/app/core/services/event-engine.service.ts   # Motor de eventos
src/app/core/services/career.service.ts         # Carrega careers
src/app/core/services/handlers/                 # 5 handlers
src/app/features/character/steps/career/        # Step mais complexo
src/assets/data/careers/                        # 14 JSONs
src/assets/data/tables.json                     # Tabelas de referência
src/app/data/events/shared/                     # Geradores de eventos
```

## ✅ Sistemas Implementados em Fev/2026

**Inheritance Bonus System** (Noble career +1 DM)
- Rastreia bonuses em `Character.inheritanceBonuses`
- InheritanceBonusService controla disponibilidade e uso
- UI checkbox em MUSTER_OUT_ROLLING
- Aplica +1 DM automaticamente quando habilitado

**Vehicle Selection Modal** (5 ships)
- ShipSelectionDialogComponent com grid responsivo
- 5 navios: Free Trader, Scout Ship, Lab Ship, Yacht, Ship's Boat
- Especificações completas: tonnage, J-drive, M-drive, crew, cost, mortgage
- Chamado quando benefício de navio é ganho

**Benefit Re-Roll Detection** (Duplicate handling)
- BenefitRerollService rastreia rolls por carreira
- BenefitRerollDialogComponent oferece Double vs. Alternative
- 20+ regras mapeadas em benefit-reroll-rules.ts
- Respeta precedência de regras (Livro 02/03 sobre Livro 01)

## 🧪 Checklist de Testes (Respeitando Precedência)

| Teste | Validação | Priority |
|-------|-----------|----------|
| Noble + Inheritance | +1 DM aplicado, rastreado, removido após uso | 🔴 HIGH |
| Merchant + Free Trader | Modal abre, navio adicionado ao equipment | 🔴 HIGH |
| Duplicate Gun benefit | Dialog oferece Double/Alternative, aplica escolha | 🔴 HIGH |
| Aging rules (50+ anos) | Respeitando Book 02 custos médicos | 🟠 MED |
| Skill awards | Pontos seguem Livro 02, não Livro 01 | 🟠 MED |
| Cybernetic costs | Deferral vs. immediate, seguindo Livro 02 | 🟠 MED |
| Benefit descriptions | Interpretadas com precedência correta | 🟢 LOW |

**Nota**: Antes de cada merge, validar se alguma regra foi ajustada contra Book 02/03.

## ??? UI Navigation & Layout (Adicionado Feb 21, 2026)

**Sidebar Navigation Left Panel** (240px):
- Theme: Dark HUD com acentos lime green (#00ff41)
- Header: 'NAVEGA��O' com vers�o (v2.1.0)
- Main Section: **DOSSIER** (Cria��o de personagem)
- Items Section: 
  - **EQUIPAMENTOS** (??) - Placeholder, implementar depois
  - **VE�CULOS** (??) - Placeholder, implementar depois

**App Layout**:
- Header (45px) - Sticky, logo + system menu
- Container (flex): Sidebar (240px) + Main content (flex-1)

**Components Criados**:
- NavigationSidebarComponent
- EquipmentSectionComponent  
- VehiclesSectionComponent

**Routes Atualizadas**:
- /dossier ? Character Wizard (antes: /wizard)
- /equipment ? Equipment section (novo)
- /vehicles ? Vehicles section (novo)

**Build Status**: ? ng build successful (Feb 21, 2026)
