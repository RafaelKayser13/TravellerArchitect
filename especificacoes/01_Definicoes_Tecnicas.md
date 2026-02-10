# Especificação Técnica - Sistema de Criação de Personagens Traveller Architect

## 1. VISÃO GERAL DO PROJETO

### 1.1 Objetivo
Desenvolver uma aplicação web para criação de personagens do sistema de RPG Traveller (Mongoose Publishing, 2022 Edition), incluindo as expansões 2300AD. A aplicação deve guiar o usuário através de um processo passo-a-passo (wizard) para criar personagens completos, prontos para jogo.

### 1.2 Universo do Jogo
**Traveller** é um RPG de ficção científica ambientado em um futuro distante onde a humanidade colonizou milhares de mundos. O sistema usa dados de 6 lados (2D6) e foca em personagens "comuns" em situações extraordinárias.

**2300AD** é um cenário alternativo ambientado no ano 2300, com uma abordagem mais "hard sci-fi" e tecnologia baseada em ciência real.

---

## 2. STACK TECNOLÓGICO

### 2.1 Stacks
- **Framework**: Angular (versão mais recente estável)
- **Linguagem**: TypeScript
- **Estilização**: CSS/SCSS com design system próprio
- **Banco de Dados**: 
  - local storage do navegador
  - JSON local para dados estáticos das regras

### 2.3 Arquitetura
- **Padrão**: Clean Architecture / Clean Code
- **Princípios**: SOLID, DRY, KISS
- **Estrutura de Pastas**: Feature-based modules

---



### 12.2 Dados Estáticos das Regras
Os dados das regras devem ser armazenados em arquivos JSON:
- `/assets/data/careers.json`
- `/assets/data/skills.json`
- `/assets/data/equipment.json`
- `/assets/data/weapons.json`
- `/assets/data/dnams.json` (2300AD)
- `/assets/data/symbionts.json` (2300AD)
- `/assets/data/cybernetics.json` (2300AD)
- `/assets/data/homeworlds.json` (2300AD)

---

---

## 14. INTERFACE DO USUÁRIO (UI/UX)

### 14.1 Princípios de Design
1. **Clareza**: Informações apresentadas de forma simples e direta
2. **Feedback Visual**: Indicadores claros de progresso e decisões
3. **Acessibilidade**: WCAG 2.1 AA compliance
4. **Responsividade**: Mobile-first design
5. **Tematização**: Suporte a tema claro/escuro

### 14.2 Componentes Principais

#### 14.2.1 Wizard Container
- Barra de progresso com passos
- Navegação (Anterior/Próxima/Pular)
- Indicador de passo atual
- Validação antes de avançar
- Botão de reiniciar criação do personagem

#### 14.2.2 Dice Roller Component
- Animação de rolagem de dados
- Exibição clara do resultado
- Histórico de rolls (expandível)
- Opção de re-roll (quando permitido)

#### 14.2.3 Character Sheet Preview
- Sidebar ou painel flutuante
- Atualização em tempo real
- Seções expansíveis
- Exportação rápida (PDF/JSON)

#### 14.2.4 Career Timeline
- Visualização cronológica dos termos
- Cards para cada carreira
- Eventos e habilidades por termo
- Indicadores de promoção/problemas

#### 14.2.5 Tables Display
- Tabelas de eventos/mishaps legíveis
- Hover para ver descrições completas
- Filtros e busca (quando apropriado)


### 14.4 Responsividade
- **Mobile** (< 768px): Layout vertical, wizard full-screen
- **Tablet** (768px - 1024px): Layout híbrido, sidebar opcional
- **Desktop** (> 1024px): Layout com sidebar de preview, tabelas expandidas

---


## 17. INTERNACIONALIZAÇÃO (i18n)

### 17.1 Idiomas Suportados
- **Português Brasileiro (pt-BR)**: Idioma secundário
- **Inglês Americano (en-US)**: Idioma primario

### 17.2 Estrutura de Tradução
```
/src/assets/i18n/
├── pt-BR/
│   ├── common.json
│   ├── careers.json
│   ├── skills.json
│   ├── equipment.json
│   └── validation.json
└── en-US/
    ├── common.json
    ├── careers.json
    ├── skills.json
    ├── equipment.json
    └── validation.json
```

### 17.3 Pontos de Tradução
- Labels e títulos de UI
- Descrições de carreiras, eventos, mishaps
- Nomes de habilidades e especializações
- Mensagens de validação e erro
- Tooltips e help text
- Nomes de equipamentos e armas

---

## 18. PERSISTÊNCIA DE DADOS

### 18.1 Local Storage (Progresso)
- Auto-save a cada passo do wizard
- Permite retomar criação interrompida
- Expiração: 7 dias de inatividade

### 18.2 Backend Database
**Coleções/Tabelas**:
- `characters`: Personagens finalizados
- `users`: Usuários registrados
- `campaigns`: Campanhas (agrupamento de personagens)
- `shared_characters`: Personagens compartilhados

**Relações**:
- User → Characters (1:N)
- Campaign → Characters (N:N)
- Character → SharedWith Users (N:N)

### 18.3 API Endpoints
```
POST   /api/characters              Criar novo personagem
GET    /api/characters              Listar personagens do usuário
GET    /api/characters/:id          Obter personagem específico
PUT    /api/characters/:id          Atualizar personagem
DELETE /api/characters/:id          Deletar personagem
POST   /api/characters/:id/share    Compartilhar com outro usuário
GET    /api/characters/:id/pdf      Gerar PDF da ficha
POST   /api/characters/:id/copy     Duplicar personagem

GET    /api/rules/careers           Obter dados de carreiras
GET    /api/rules/skills            Obter dados de habilidades
GET    /api/rules/equipment         Obter dados de equipamentos
(etc. para outros dados estáticos)
```

---

## 19. GERAÇÃO DE FICHA (Character Sheet)

### 19.1 Formato
- **PDF**: Para impressão e uso offline
- **Interativo HTML**: Para uso digital
- **JSON**: Para exportação/importação

### 19.2 Seções da Ficha
1. **Cabeçalho**: Nome, idade, espécie, foto (opcional)
2. **Características**: Valores atuais, máximos, DMs
3. **Habilidades**: Lista completa com níveis
4. **Histórico de Carreiras**: Timeline com eventos
5. **Equipamento**: Armas, armadura, outros itens
6. **Finanças**: Créditos, ship shares
7. **Relacionamentos**: Contatos, aliados, rivais, inimigos
8. **Augmentations** (2300AD): DNAMs, symbionts, cybernetics
9. **Ferimentos**: Atuais e histórico
10. **Notas**: Espaço livre para anotações

### 19.3 Bibliotecas para PDF
- **pdfmake** ou **jsPDF**: Geração client-side
- **Puppeteer**: Geração server-side (mais controle)

---

## 20. TEMATIZAÇÃO E DESIGN SYSTEM

### 20.1 Paleta de Cores (Tema Sci-Fi)

**Tema Claro (Light)**
**Tema Escuro (Dark)**

### 20.2 Tipografia
- **Headings**: 'Orbitron' ou 'Exo 2' (sci-fi)
- **Body**: 'Roboto' ou 'Inter' (legibilidade)
- **Monospace**: 'Roboto Mono' (códigos, stats)

### 20.3 Componentes de UI
- Cards com bordas sutis e sombras
- Botões com estados hover/active claros
- Inputs com foco destacado
- Animações suaves (200-300ms)
- Ícones de Font Awesome ou Material Icons

### 20.4 Animações
- Fade-in para elementos novos
- Slide para transições de wizard
- Pulse para indicadores de ação necessária
- Spin para dice rolls

---

## 21. ACESSIBILIDADE

### 21.1 Requisitos WCAG 2.1 AA
- Contraste mínimo 4.5:1 para texto normal
- Contraste mínimo 3:1 para texto grande
- Navegação por teclado completa
- Screen reader friendly
- ARIA labels apropriados
- Foco visível em elementos interativos

### 21.2 Considerações Específicas
- Dice rolls com texto alternativo (não apenas visual)
- Tabelas semanticamente corretas
- Formulários com labels e mensagens de erro claras
- Alternativas textuais para ícones
- Opção de alto contraste

---

## 22. TESTES

### 22.1 Testes Unitários
- Funções de cálculo (DM, rolls, validações)
- Services de regras de negócio
- Pipes e validators customizados

### 22.2 Testes de Integração
- Fluxo completo de criação de personagem
- API endpoints
- Persistência de dados

### 22.3 Testes E2E
- Cenários completos de wizard
- Criação de diferentes tipos de personagem
- Exportação de fichas

### 22.4 Ferramentas
- **Jest**: Testes unitários
- **Jasmine/Karma**: Testes Angular
- **Cypress** ou **Playwright**: Testes E2E

---

## 23. ARQUITETURA DE PASTAS (Sugerida)

```
src/
├── app/
│   ├── core/                    # Singleton services, guards, interceptors
│   │   ├── services/
│   │   │   ├── dice-roller.service.ts
│   │   │   ├── character.service.ts
│   │   │   └── rules-engine.service.ts
│   │   ├── guards/
│   │   └── interceptors/
│   │
│   ├── shared/                  # Componentes, pipes, directives compartilhados
│   │   ├── components/
│   │   │   ├── dice-roller/
│   │   │   ├── character-preview/
│   │   │   ├── skill-selector/
│   │   │   └── table-display/
│   │   ├── pipes/
│   │   │   ├── dice-modifier.pipe.ts
│   │   │   └── skill-level.pipe.ts
│   │   └── directives/
│   │
│   ├── features/                # Feature modules
│   │   ├── character-creation/
│   │   │   ├── components/
│   │   │   │   ├── wizard-container/
│   │   │   │   ├── step-characteristics/
│   │   │   │   ├── step-homeworld/     # 2300AD
│   │   │   │   ├── step-background/
│   │   │   │   ├── step-pre-career/
│   │   │   │   ├── step-career/
│   │   │   │   ├── step-mustering-out/
│   │   │   │   ├── step-augments/       # 2300AD
│   │   │   │   └── step-review/
│   │   │   ├── services/
│   │   │   │   ├── wizard-state.service.ts
│   │   │   │   ├── career-manager.service.ts
│   │   │   │   └── validation.service.ts
│   │   │   └── character-creation.module.ts
│   │   │
│   │   ├── character-list/
│   │   │   ├── components/
│   │   │   │   ├── character-card/
│   │   │   │   └── character-list/
│   │   │   └── character-list.module.ts
│   │   │
│   │   ├── character-sheet/
│   │   │   ├── components/
│   │   │   │   ├── sheet-header/
│   │   │   │   ├── sheet-characteristics/
│   │   │   │   ├── sheet-skills/
│   │   │   │   ├── sheet-equipment/
│   │   │   │   └── sheet-history/
│   │   │   ├── services/
│   │   │   │   └── pdf-generator.service.ts
│   │   │   └── character-sheet.module.ts
│   │   │
│   │   └── auth/                # Se necessário
│   │       ├── components/
│   │       ├── services/
│   │       └── auth.module.ts
│   │
│   ├── data/                    # Models e interfaces
│   │   ├── models/
│   │   │   ├── character.model.ts
│   │   │   ├── career.model.ts
│   │   │   ├── skill.model.ts
│   │   │   ├── dnam.model.ts      # 2300AD
│   │   │   └── equipment.model.ts
│   │   └── enums/
│   │       ├── career-type.enum.ts
│   │       ├── gravity-type.enum.ts # 2300AD
│   │       └── characteristic.enum.ts
│   │
│   ├── app-routing.module.ts
│   ├── app.component.ts
│   └── app.module.ts
│
├── assets/
│   ├── data/                    # JSON estático das regras
│   │   ├── careers.json
│   │   ├── skills.json
│   │   ├── equipment.json
│   │   ├── dnams.json           # 2300AD
│   │   ├── symbionts.json       # 2300AD
│   │   ├── cybernetics.json     # 2300AD
│   │   └── homeworlds.json      # 2300AD
│   │
│   ├── i18n/                    # Traduções
│   │   ├── pt-BR/
│   │   └── en-US/
│   │
│   ├── images/
│   ├── fonts/
│   └── styles/
│       ├── _variables.scss
│       ├── _themes.scss
│       └── _mixins.scss
│
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

---

## 24. CLEAN ARCHITECTURE - CAMADAS

### 24.1 Domain Layer (Entidades)
- Models puros (Character, Skill, Career, etc.)
- Business rules em forma de classes/interfaces
- Independente de frameworks

### 24.2 Use Cases Layer (Aplicação)
- Services que orquestram lógica de negócio
- Independente de UI e frameworks externos
- Exemplos:
  - CreateCharacterUseCase
  - AdvanceCareerUseCase
  - RollDiceUseCase
  - ValidateSkillIncreaseUseCase

### 24.3 Interface Adapters Layer
- Controllers (no caso Angular: Components)
- Presenters e ViewModels
- Repositories (interface para dados)

### 24.4 Infrastructure Layer
- Frameworks (Angular, RxJS)
- API calls (HttpClient)
- LocalStorage
- External libraries

### 24.5 Dependency Flow
```
Infrastructure → Interface Adapters → Use Cases → Domain
```
Dependências sempre apontam para dentro (para domínio), nunca para fora.

---

## 25. PADRÕES DE CÓDIGO (Clean Code)

### 25.1 Nomenclatura
- **Classes**: PascalCase (`CharacterService`, `DiceRoller`)
- **Métodos/Funções**: camelCase (`rollDice`, `calculateDM`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_SKILL_LEVEL`, `MIN_AGE`)
- **Interfaces**: PascalCase com 'I' opcional (`ICharacter` ou `Character`)

### 25.2 Princípios SOLID
- **Single Responsibility**: Cada classe/módulo faz uma coisa
- **Open/Closed**: Aberto para extensão, fechado para modificação
- **Liskov Substitution**: Subtipos devem ser substituíveis
- **Interface Segregation**: Muitas interfaces específicas > uma geral
- **Dependency Inversion**: Depender de abstrações, não concreções

### 25.3 Convenções
- Funções pequenas (< 20 linhas idealmente)
- Evitar comentários óbvios (código auto-explicativo)
- DRY: Não repetir código
- Testes para funções críticas
- Type safety forte (TypeScript strict mode)

---


## 28. GLOSSÁRIO DE TERMOS

**2D**: Rolar dois dados de seis lados e somar
**Advancement**: Sistema de promoção em carreiras
**Assignment**: Especialização dentro de uma carreira
**Basic Training**: Habilidades iniciais ao entrar numa carreira
**Benefit Roll**: Rolagem para ganhar benefícios ao sair de carreira
**Characteristic**: Atributo base do personagem (STR, DEX, END, INT, EDU, SOC)
**Commission**: Tornar-se oficial em carreira militar
**DM (Dice Modifier)**: Modificador aplicado a rolagens
**DNAM**: DNA Modification (modificação genética)
**Draft**: Sistema de entrada forçada em carreiras militares
**Homeworld**: Mundo natal (específico 2300AD)
**Mishap**: Acidente/problema que pode ejetar personagem de carreira
**Mustering Out**: Processo de ganhar benefícios ao finalizar carreiras
**PAS**: Planetary Adaptation Syndrome (específico 2300AD)
**Rank**: Patente ou nível hierárquico em carreira
**Ship Share**: Ação parcial de uma nave espacial
**Survival**: Rolagem para sobreviver a um termo de carreira
**Symbiont**: Microorganismo modificado que vive no corpo
**Term**: Período de 4 anos em uma carreira
**TL (Tech Level)**: Nível tecnológico (0-15+)
**UPP**: Universal Planetary Profile (perfil planetário)

---


### 29.4 Considerações de Segurança
- Input sanitization (especialmente em campos de texto livre)
- Rate limiting em APIs
- Validação server-side mesmo com validação client-side
- Proteção contra injection attacks
- HTTPS obrigatório em produção

---

## 30. RESUMO EXECUTIVO

Esta especificação técnica define um sistema completo para criação de personagens do RPG **Traveller** (edição Mongoose 2022), incluindo a expansão **2300AD**.


**Stack Tecnológico**:
- Angular + TypeScript
- Database: local storage
- Arquitetura: Clean Architecture

**Entregas Esperadas**:
1. Aplicação web funcional
2. Sistema completo de criação de personagens
3. Documentação de código
4. Suite de testes
5. Manual do usuário

---

## APÊNDICES

### A. Tabelas de Referência Rápida

#### A.1 Characteristic DM
| Score | DM  |
|-------|-----|
| 0     | -3  |
| 1-2   | -2  |
| 3-5   | -1  |
| 6-8   | +0  |
| 9-11  | +1  |
| 12-14 | +2  |
| 15+   | +3  |

#### A.2 Difficulty Ratings (Referência Futura)
| Task          | Target |
|---------------|--------|
| Simple        | 2+     |
| Easy          | 4+     |
| Routine       | 6+     |
| Average       | 8+     |
| Difficult     | 10+    |
| Very Difficult| 12+    |
| Formidable    | 14+    |

#### A.3 Gravity Modifiers (2300AD)
| Type         | STR | DEX | END |
|--------------|-----|-----|-----|
| Zero-gravity | -2  | +2  | -2  |
| Light        | -1  | +1  | -1  |
| Low          | 0   | 0   | 0   |
| Normal       | 0   | 0   | 0   |
| High         | 0   | 0   | 0   |
| Heavy        | +1  | -1  | +1  |
| Extreme      | +2  | -2  | +2  |

### B. Exemplo de JSON de Carreira

```json
{
  "name": "Scout",
  "qualification": {
    "characteristic": "INT",
    "target": 5,
    "dm": [
      { "condition": "per_previous_career", "value": -1 }
    ]
  },
  "assignments": [
    {
      "name": "Courier",
      "survival": {
        "characteristic": "END",
        "target": 5
      },
      "advancement": {
        "characteristic": "EDU",
        "target": 9
      }
    },
    {
      "name": "Surveyor",
      "survival": {
        "characteristic": "END",
        "target": 6
      },
      "advancement": {
        "characteristic": "INT",
        "target": 8
      }
    },
    {
      "name": "Explorer",
      "survival": {
        "characteristic": "END",
        "target": 7
      },
      "advancement": {
        "characteristic": "EDU",
        "target": 7
      }
    }
  ],
  "skillTables": {
    "personalDevelopment": [
      { "roll": 1, "skill": "STR", "increase": 1 },
      { "roll": 2, "skill": "DEX", "increase": 1 },
      { "roll": 3, "skill": "END", "increase": 1 },
      { "roll": 4, "skill": "INT", "increase": 1 },
      { "roll": 5, "skill": "EDU", "increase": 1 },
      { "roll": 6, "skill": "Jack-of-all-Trades", "level": null }
    ],
    "serviceSkills": [
      { "roll": 1, "skill": "Pilot", "specialty": "small craft or spacecraft", "level": null },
      { "roll": 2, "skill": "Survival", "level": null },
      { "roll": 3, "skill": "Mechanic", "level": null },
      { "roll": 4, "skill": "Astrogation", "level": null },
      { "roll": 5, "skill": "Vacc Suit", "level": null },
      { "roll": 6, "skill": "Gun Combat", "level": null }
    ],
    "advancedEducation": [
      { "roll": 1, "skill": "Medic", "level": null },
      { "roll": 2, "skill": "Language", "level": null },
      { "roll": 3, "skill": "Seafarer", "level": null },
      { "roll": 4, "skill": "Explosives", "level": null },
      { "roll": 5, "skill": "Science", "level": null },
      { "roll": 6, "skill": "Jack-of-all-Trades", "level": null }
    ],
    "assignments": {
      "Courier": [
        { "roll": 1, "skill": "Electronics", "level": null },
        { "roll": 2, "skill": "Flyer", "level": null },
        { "roll": 3, "skill": "Pilot", "specialty": "spacecraft", "level": null },
        { "roll": 4, "skill": "Engineer", "level": null },
        { "roll": 5, "skill": "Athletics", "level": null },
        { "roll": 6, "skill": "Astrogation", "level": null }
      ],
      "Surveyor": [
        { "roll": 1, "skill": "Electronics", "level": null },
        { "roll": 2, "skill": "Persuade", "level": null },
        { "roll": 3, "skill": "Pilot", "level": null },
        { "roll": 4, "skill": "Navigation", "level": null },
        { "roll": 5, "skill": "Diplomat", "level": null },
        { "roll": 6, "skill": "Streetwise", "level": null }
      ],
      "Explorer": [
        { "roll": 1, "skill": "Electronics", "level": null },
        { "roll": 2, "skill": "Pilot", "level": null },
        { "roll": 3, "skill": "Engineer", "level": null },
        { "roll": 4, "skill": "Science", "level": null },
        { "roll": 5, "skill": "Stealth", "level": null },
        { "roll": 6, "skill": "Recon", "level": null }
      ]
    }
  },
  "ranks": [
    { "level": 0, "title": null, "bonus": null },
    { "level": 1, "title": "Scout", "bonus": { "skill": "Vacc Suit", "level": 1 } },
    { "level": 2, "title": null, "bonus": null },
    { "level": 3, "title": "Senior Scout", "bonus": { "skill": "Pilot", "level": 1 } },
    { "level": 4, "title": null, "bonus": null },
    { "level": 5, "title": null, "bonus": null },
    { "level": 6, "title": null, "bonus": null }
  ],
  "musteringOut": {
    "cash": [
      { "roll": 1, "amount": 20000 },
      { "roll": 2, "amount": 20000 },
      { "roll": 3, "amount": 30000 },
      { "roll": 4, "amount": 30000 },
      { "roll": 5, "amount": 50000 },
      { "roll": 6, "amount": 50000 },
      { "roll": 7, "amount": 50000 }
    ],
    "benefits": [
      { "roll": 1, "benefit": "Ship Share" },
      { "roll": 2, "benefit": "INT", "increase": 1 },
      { "roll": 3, "benefit": "EDU", "increase": 1 },
      { "roll": 4, "benefit": "Weapon" },
      { "roll": 5, "benefit": "Weapon" },
      { "roll": 6, "benefit": "Scout Ship" },
      { "roll": 7, "benefit": "Scout Ship" }
    ]
  }
}
```