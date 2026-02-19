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
