# **Especificação Funcional: Ferramenta de Criação de Personagens (Traveller 2300AD)**

## **Módulo 1: Configuração Global e Atributos**

### **0\. Definições Globais e Tratamento de Dados**

Antes de iniciar o fluxo de criação, a IA deve implementar as seguintes regras de tratamento de dados que serão usadas em todo o software.

#### **0.1. Notação Universal de Perfil (UPP \- Universal Personality Profile)**

O sistema deve ser capaz de converter valores numéricos em Notação Pseudo-Hexadecimal para exibição na ficha (UPP string).

* **Regra:** Números de 0 a 9 são exibidos como números. Números de 10 a 33 usam letras maiúsculas, omitindo 'I' e 'O' para evitar confusão com números, embora a implementação padrão do Mongoose muitas vezes simplifique apenas usando A-Z sequencialmente. Para *2300AD*, usaremos o padrão estrito do Traveller Core Rulebook.  
* **Tabela de Conversão de Exibição:**  
  * 0-9: "0"-"9"  
  * 10: "A", 11: "B", 12: "C", 13: "D", 14: "E", 15: "F"  
  * 16: "G", 17: "H", 18: "J", 19: "K", 20: "L", etc.

#### **0.2. Tabela de Modificadores de Dados (DMs)**

Sempre que um atributo (Characteristic) for referenciado, o sistema deve calcular e disponibilizar o seu **Dice Modifier (DM)**. Este valor deve ser recalculado dinamicamente sempre que o atributo mudar (por exemplo, devido a implantes cibernéticos ou modificações genéticas).

**Lógica de Cálculo (Tabela do Core Rulebook):**

* **Valor do Atributo 0:** DM \-3  
* **Valor do Atributo 1 a 2:** DM \-2  
* **Valor do Atributo 3 a 5:** DM \-1  
* **Valor do Atributo 6 a 8:** DM \+0  
* **Valor do Atributo 9 a 11:** DM \+1  
* **Valor do Atributo 12 a 14:** DM \+2  
* **Valor do Atributo 15+:** DM \+3

---

### **Passo 1: Geração de Características (Characteristics)**

**Descrição Lógica:** O usuário deve gerar os valores brutos para os seis atributos principais. Em *2300AD*, os humanos seguem o padrão genético do Traveller, mas estes valores servirão de base para modificações posteriores (Gravidade e DNAM).

**Variáveis de Armazenamento (Backend):** Crie um objeto ou estrutura de dados para o personagem contendo:

* `STR` (Strength/Força): Inteiro  
* `DEX` (Dexterity/Destreza): Inteiro  
* `END` (Endurance/Vigor): Inteiro  
* `INT` (Intellect/Inteligência): Inteiro  
* `EDU` (Education/Educação): Inteiro  
* `SOC` (Social Standing/Status Social): Inteiro  
* `PSI` (Psionic Strength): Inteiro (Inicializa como 0 ou null. Em 2300AD, psionismo é raro e tratado separadamente, mas a estrutura deve existir).

**Regras de Negócio:**

1. Gerar 6 números aleatórios, onde cada número é o resultado de **2D6** (soma de dois dados de 6 faces, intervalo 2-12).  
2. O sistema deve permitir ao usuário atribuir esses 6 valores a qualquer um dos 6 atributos (Método de Atribuição Livre) OU atribuí-los na ordem gerada (Método Iron Man).  
3. **Nota Importante para 2300AD:** Diferente de cenários de fantasia, não há "raças" iniciais que modifiquem isso agora. A modificação genética (DNAM) ocorre *após* a seleção do Mundo Natal (Passo 4). Portanto, armazene estes valores como "Base".

**Interface do Usuário (UI):**

* **Ação Principal:** Botão `[Rolar Características]`  
* **Exibição (Área de Draft):** Mostrar os 6 valores gerados (ex: 7, 9, 4, 10, 6, 8).  
* **Entrada:** 6 Slots rotulados (Força, Destreza, Vigor, Inteligência, Educação, Social). os valores devem ser apresentados em cards estilizados. Deve haver um botão "Rolar características" que irá rolar e atribuir os valores em sequencia. Após calcular os valores, o usuário poderá trocar valores de posição ou ajustar o valor manualmente.
* **Validação:** O botão `[Próximo Passo]` só fica ativo quando todos os 6 valores foram atribuídos e nenhum atributo está vazio.

**Texto de Apoio (Tooltip/Help):**

"As características definem as capacidades inatas do seu personagem.

* **STR (Força):** Uso de força física, dano corpo-a-corpo e capacidade de carga.  
* **DEX (Destreza):** Agilidade, coordenação e pontaria.  
* **END (Vigor):** Resistência física, determinação e tolerância a danos.  
* **INT (Inteligência):** Raciocínio, memória e compreensão científica.  
* **EDU (Educação):** Nível de escolaridade e conhecimento geral acumulado.  
* **SOC (Social):** Sua posição na sociedade, classe e reputação."

---

### **Passo 1.5 (Opcional): Ajustes de Background Precoces**

*Opcional para a ferramenta, mas recomendado para flexibilidade.*

**Descrição Lógica:** Permitir a definição manual de idade inicial (padrão é 18 anos).

**Regras de Negócio:** Em *Traveller* padrão e *2300AD*, o personagem inicia sua carreira aos 18 anos.

* **Variável:** `CurrentAge` \= 18\.

**Interface do Usuário:**

* Exibir "Idade Inicial: 18 anos". (Campo bloqueado ou editável apenas por modo "Referee/GM").

---

**Validação do Passo 1:** A IA deve verificar:

1. Existem 6 valores inteiros entre 2 e 12?  
2. Cada um dos atributos (STR, DEX, END, INT, EDU, SOC) recebeu exatamente um valor?  
3. Os DMs (Modificadores) foram calculados e estão visíveis na UI (ex: "STR 9 (+1)")?

---

Compreendido. Você precisa que a "caixa preta" das regras seja aberta. Como a IA de programação não terá acesso aos livros, este documento deve conter **todos** os dados brutos (tabelas, listas, modificadores) necessários para o funcionamento do sistema, extraídos diretamente das fontes fornecidas (*Book 1* e *Book 2*).

Abaixo está a reescrita completa e expandida do **Módulo 2**, contendo os dados hardcoded necessários.

---

## **Módulo 2: A Origem e Dados Planetários (Completo)**

Este módulo substitui o processo de escolha de mundo simples do Traveller padrão. Ele define a biologia, a cultura e as perícias iniciais.

### **Passo 2: Nacionalidade e Tipo de Origem**

**Descrição Lógica:** O usuário define a afiliação nacional e se nasceu em um planeta (Frontier) ou no espaço (Spacer).

**Variáveis de Entrada:**

* `OriginType`: Seleção ("Frontier" ou "Spacer").  
* `Nationality`: Seleção de uma lista fixa.

**Regras de Negócio & Dados:**

1. **Lista de Nacionalidades Disponíveis:** A interface deve popular cards com as seguintes strings (baseadas no *Book 2*):

   * America, Arabia, Argentina, Australia, Azania, Brazil, Britain, Canada, France, Germany, Inca Republic, Indonesia, Japan, Manchuria, Mexico, Nigeria, Russia, Texas, Ukraine, UAR (United Arab Republic), Independent, Trilon Corp, Life Foundation.  
2. **Definição de Idioma (Language):** Ao selecionar a nacionalidade, o sistema deve atribuir automaticamente o idioma nativo (Nível 2).

   * *Regra Geral:* O idioma corresponde à nação (Ex: France \= French, America \= English).  
   * *Exceções:* Inca (Spanish/Quechua), Azania (Afrikaans/Zulu/English), Manchuria (Mandarin), UAR (Arabic).  
   * **Adicional:** Se `OriginType == Spacer`, adicionar automaticamente a perícia `Language (Zhargon) 1`.

---

### **Passo 3: Seleção do Mundo Natal (Homeworld)**

**Descrição Lógica:** Este passo carrega os dados ambientais críticos. Se `OriginType == Spacer`, o mundo é "Space Habitat". Se `OriginType == Frontier`, o usuário deve escolher um mundo filtrado pela nacionalidade.

**Banco de Dados de Mundos (Hardcoded Data):** A IA de programação deve implementar a seguinte estrutura de dados (JSON/Array). Estes dados foram extraídos das tabelas de Colônias do *Book 2* (págs. 23-25 do PDF original, fontes).

*Estrutura:* `{ Nome, Nacionalidade, Gravidade (G), CódigoGravidade, SurvivalDM, Path (Hard/Soft) }`

**Dados para Popular os cards (Exemplos Principais e Completos das Fontes):**

* **America:**  
  * "Ellis" (0.92 G, Normal, Soft, DM \-1)  
  * "King (New Columbia)" (3.08 G, Extreme, Soft, DM \-3)  
  * "Hermes" (0.73 G, Low, Soft, DM \-2)  
* **Argentina:**  
  * "Estación Escobar" (0.97 G, Normal, Soft, DM 0\)  
  * "Montana" (0.99 G, Normal, Soft, DM \-1)  
* **Australia:**  
  * "Botany Bay" (0.87 G, Normal, Soft, DM \-1)  
  * "Huntsland" (3.08 G, Extreme, Soft, DM \-3)  
  * "Kingsland" (1.07 G, Normal, Soft, DM \-1)  
* **Azania:**  
  * "Naragema" (1.02 G, Normal, Soft, DM 0\)  
  * "Lubumbashi" (1.02 G, Normal, Soft, DM \-1)  
  * "Okavango" (0.94 G, Normal, Soft, DM \-1)  
* **Brazil:**  
  * "Eshari Station" (0.69 G, Low, Hard, DM 0\)  
  * "Paulo" (0.99 G, Normal, Hard, DM \-1)  
* **Britain:**  
  * "Alicia" (1.05 G, Normal, Hard, DM \-1)  
  * "New Africa" (0.94 G, Normal, Hard, DM \-1)  
* **Canada:**  
  * "Eriksson" (0.93 G, Normal, Hard, DM \-1)  
  * "Kanata" (0.87 G, Normal, Hard, DM \-1)  
* **France:**  
  * "Aurore" (0.47 G, Low, Hard, DM \-2)  
  * "Beta Canum" (0.94 G, Normal, Hard, DM \-1)  
  * "Europe Neuve" (1.05 G, Normal, Soft, DM \-2)  
  * "Nous Voilà" (1.05 G, Normal, Hard, 0\)  
  * "Serurier" (0.21 G, Low, Hard, 0\)  
  * "Ville de Glace" (0.76 G, Low, Hard, 0\)  
* **Germany:**  
  * "Adlerhorst" (1.05 G, Normal, Soft, 0\)  
  * "Geroellblock" (0.25 G, Low, Hard, 0\)  
  * "Hunsrück" (0.47 G, Low, Hard, 0\)  
  * "Freihafen" (0.94 G, Normal, Hard, \-1)  
* **Inca Republic:**  
  * "Pachamama" (0.44 G, Low, Hard, \-1)  
  * "Sechura" (1.25 G, High, Hard, \-1)  
* **Japan:**  
  * "Daikoku" (0.66 G, Low, Soft, \-1)  
  * "Shungen" (0.76 G, Low, Hard, 0\)  
  * "Tosashimizu" (1.02 G, Normal, Soft, \-1)  
* **Manchuria:**  
  * "Chengdu" (0.93 G, Normal, Hard, \-1)  
  * "Cold Mountain" (0.83 G, Normal, Hard, \-3)  
  * "Dukou" (1.57 G, High, Hard, \-2)  
  * "Fuyuan" (0.71 G, Low, Hard, 0\)  
  * "Han" (0.92 G, Normal, Hard, \-1)  
  * "Kwantung" (0.93 G, Normal, Hard, 0\)  
* **Mexico:**  
  * "Azteca" (0.93 G, Normal, Hard, \-1)  
* **Texas:**  
  * "Alamo" (0.44 G, Low, Hard, 0\)  
  * "New Austin" (1.25 G, High, Hard, \-2)  
* **Ukraine:**  
  * "Teliha" (0.33 G, Low, Hard, 0\)  
* **Independent / Corporate:**  
  * "Tanstaafl" (0.47 G, Low, Hard, \-2)  
  * "Elysia" (1.02 G, Normal, Soft, 0\)  
  * "Kie-Yuma" (Trilon) (1.21 G, High, Hard, \-1)  
  * "Cousteau" (Life Foundation) (1.25 G, High, Soft, \-1)

**Regras de Negócio \- Spacer (Espacial):** Se `OriginType == Spacer`:

* `Homeworld` \= "Space/Station"  
* `GravityCode` \= "Low" (Spacers vivem em gravidade baixa ou spin habitats, *Book 1* pg 9).  
* `SurvivalDM` \= \-1.  
* `Path` \= N/A (Geralmente Hard Path tecnologicamente, mas biologicamente adaptados).  
* `LeavingHomeMod` \= \+2 (Bônus exclusivo para Spacers).

A IA deve consultar esta tabela sempre que uma regra solicitar o `NationTier`. Estes valores afetam a dificuldade de entrada na Universidade Off-World e a disponibilidade de implantes cibernéticos (Neural Jacks).

**Definição de Tiers (Baseado no Book 2, pg. 9-11):**

* **Tier 1 (Superpotência):** Domínio total.  
* **Tier 2 (Grandes Potências):** Grandes frotas e muitas colônias.  
* **Tier 3 (Potências Secundárias):** Possuem colônias, mas frotas menores.  
* **Tier 4+:** Geralmente nações apenas terrestres ou com presença mínima.

**Tabela de Lookup (NationTier):**

| Nacionalidade (String) | Tier (Int) | Notas de Implementação |
| ----- | ----- | ----- |
| **France** | 1 | A única Tier 1\. |
| **America** (USA) | 2 |  |
| **Britain** (UK) | 2 |  |
| **Germany** | 2 |  |
| **Manchuria** | 2 |  |
| **Argentina** | 3 |  |
| **Australia** | 3 |  |
| **Azania** | 3 |  |
| **Brazil** | 3 |  |
| **Canada** | 3 |  |
| **Inca Republic** | 3 |  |
| **Japan** | 3 |  |
| **Mexico** | 3 |  |
| **Russia** | 3 | (Frequentemente instável, mas tech alta) |
| **Texas** | 3 |  |
| **Ukraine** | 3 |  |
| **Arabia** | 4 |  |
| **Indonesia** | 4 |  |
| **Nigeria** | 4 |  |
| **UAR** | 4 |  |
| **Trilon Corp** | 1 | (Tratar como Tier 1 para fins de Tech) |
| **Life Foundation** | 2 | (Tratar como Tier 2 para fins de Tech) |
| **Independent** | 6 | (Considerar Tier baixo/sem suporte oficial) |

*Regra de Validação:* Se a Nação for Tier 5 ou 6 (ex: nações personalizadas ou "Independent" falida), o personagem **não pode** escolher as carreiras *Scout*, *Merchant* ou *Navy* no Termo 1\.

---

### **Passo 4: Modificadores Físicos e Ambientais**

**Descrição Lógica:** Aplicação automática de modificadores de atributos baseados na gravidade e seleção de modificações genéticas (DNAMs).

#### **4.1. Tabela de Gravidade (Ruleset)**

A IA deve aplicar os seguintes modificadores aos atributos atuais (`STR`, `DEX`, `END`) baseados no `GravityCode` do mundo selecionado (ou da gravidade numérica `G`).

| Gravidade (G) | Código | Modificadores (STR / DEX / END) |
| ----- | ----- | ----- |
| 0.00 – 0.09 | **Zero-G** | STR \-2, DEX \+2, END \-2 |
| 0.10 – 0.20 | **Light** | STR \-1, DEX \+1, END \-1 |
| 0.21 – 0.80 | **Low** | 0 / 0 / 0 |
| 0.81 – 1.20 | **Normal** | 0 / 0 / 0 |
| 1.21 – 2.00 | **High** | 0 / 0 / 0 |
| 2.01 – 2.90 | **Heavy** | STR \+1, DEX \-1, END \+1 |
| 3.00+ | **Extreme** | STR \+2, DEX \-2, END \+2 |

*Nota:* Se `OriginType == Spacer`, usar a linha **Low** (0/0/0) como base, mas ver regra de DNAM abaixo.

#### **4.2. Modificações de DNA (DNAMs)**

O usuário deve escolher se aceita modificações genéticas (Soft Path) ou usa tecnologia (Hard Path).

**Opções Obrigatórias e Condicionais:**

1. **Spacer (Automático):**

   * Adicionar `DNAM: Zero-G`.  
   * *Efeito:* Altera a gravidade natal efetiva de Zero-G para **Light**. (Spacers recebem bônus \+4 em testes de atrofia muscular).  
   * *Variação:* Permitir upgrade para `DNAM: Free Fall (More Hands)`. (Pés preênseis, deslocamento \-1m em gravidade).  
2. **Mundos Específicos (Obrigatório se Soft Path):**

   * Se Mundo \== "King", "Huntsland" ou "New Columbia": Oferecer `DNAM: King Ultra`.  
     * *Efeito:* STR \+1D (rolar 1d6 e somar), END \+1D. Requer respirador em atmosfera \< Dense. Dano recebido aumenta \+1 por dado.  
   * Se Mundo \== "Dukou" ou "Hermes": Oferecer `DNAM: Cold Adaptation`.  
     * *Efeito:* Bônus em testes de frio, penalidade no calor.  
   * Se Mundo \== "Ellis" ou "Dunkelheim": Oferecer `DNAM: Dry World`.  
     * *Efeito:* Retenção de água extrema.  
3. **Genérico (Soft Path):**

   * Se o usuário escolher "Soft Path" e não houver DNAM específico, adicionar `DNAM: PEA (Planetary Environmental Adaptation)`.  
   * *Efeito:* DM+4 em testes de adaptação planetária (PAS).  
   * *Flag de Sistema:* Definir `IsSoftPath = True`. Isso aplicará **DM \-1** na rolagem de Dinheiro/Benefícios no final da criação.  
4. **Hard Path:**

   * Se o usuário recusar DNAMs.  
   * *Flag de Sistema:* Definir `IsSoftPath = False` (ou Hard Path). Isso aplicará **DM \+1** na rolagem de Dinheiro/Benefícios no final.

---

### **Passo 5: Perícias de Antecedente (Background Skills)**

**Descrição Lógica:** O usuário seleciona perícias de uma lista fixa. A quantidade e a lista dependem do `OriginType`.

**Cálculo de Quantidade (`N`):**

* **Frontier:** `N = 3 + EDU DM`  
* **Spacer:** `N = 4 + EDU DM`

**Listas de Dados (Skill Lists):**

**Lista A: Frontier (Se OriginType \== Frontier)**

* Admin 0  
* Animals 0  
* Art 0  
* Athletics 0  
* Carouse 0  
* Drive 0  
* Mechanics 0  
* Medic 0  
* Seafarer 0  
* Steward 0  
* Survival 0  
* Vacc Suit 0  
* **Condicional:** `Gun Combat 0` (Apenas se `Nationality` \== "Manchuria", "Inca Republic" ou "Argentina" **E** `SOC >= 9`).

**Lista B: Spacer (Se OriginType \== Spacer)**

* Admin 0  
* Art 0  
* Athletics 0  
* Carouse 0  
* Electronics 0  
* Engineer 0  
* Mechanics 0  
* Medic 0  
* Pilot 0  
* Steward 0  
* Survival 0  
* Vacc Suit 0 (**Obrigatório:** O sistema deve forçar a seleção de pelo menos 1 nível de Vacc Suit ou atribuí-lo automaticamente como uma das escolhas).

**Interface do Usuário:**

* Exibir: "Você tem \[N\] escolhas de perícias baseadas na sua Educação (\[EDU\]) e Origem (\[OriginType\])."  
* Se `EDU DM` for negativo (ex: EDU \< 6), garantir que o número de perícias não seja menor que 0 (embora a regra diga 3+DM, assumimos mínimo 1 para jogabilidade, ou siga estritamente a matemática onde EDU 0 dá 0 perícias).

---

### **Passo 5.5: Validação de Dados do Módulo 2**

A IA deve verificar antes de permitir o avanço para a Educação/Carreira:

1. `OriginType` está definido?  
2. `Homeworld` está definido?  
3. As variáveis de `SurvivalDM`, `Path` e `Gravity` estão salvas no objeto do personagem?  
4. Os atributos (STR/DEX/END) foram atualizados pelos modificadores de gravidade?  
5. O número correto de perícias de antecedente foi escolhido?  
6. Se Spacer, `Vacc Suit` está presente?

---

## **Módulo 3: Educação Pré-Carreira (Completo)**

Este módulo ocorre após a seleção da Origem e antes do Primeiro Termo de Carreira. O personagem tem 18 anos.

### **Passo 6: Escolha e Admissão na Educação**

**Descrição Lógica:** O usuário decide se deseja tentar entrar na Universidade ou em uma Academia Militar. A dificuldade (Admission DM) é calculada dinamicamente baseada nos dados do **Módulo 2** (Tech Level do mundo, Tier da nação, Tipo de Origem).

**Variáveis de Entrada (Contexto):**

* `OriginType` ("Frontier" ou "Spacer")  
* `HomeworldTL` (Inteiro, Tech Level do mundo natal escolhido)  
* `NationTier` (Inteiro, 1 a 6, baseado na nacionalidade)  
* `EDU` (Atributo Educação)  
* `SOC` (Atributo Social)

**1\. Cálculo dos Modificadores de Admissão (Ruleset Hardcoded):**

A IA deve calcular dois modificadores separados e oferecer a escolha ao usuário: **Educação Local** ou **Educação Off-World**.

* **Tabela A: Modificador Local (Baseado no TL do Mundo Natal)**

  * Se `HomeworldTL` \<= 7: **DM \-6**  
  * Se `HomeworldTL` 8 ou 9: **DM \-4**  
  * Se `HomeworldTL` 10 ou 11: **DM \-2**  
  * Se `HomeworldTL` \>= 12: **DM \+0**  
* **Tabela B: Modificador Off-World (Baseado no Tier da Nação)**

  * Se `NationTier` 1: **DM \+2**  
  * Se `NationTier` 2: **DM \+0**  
  * Se `NationTier` 3: **DM \-2**  
  * Se `NationTier` 4: **DM \-4**  
  * Se `NationTier` 5: **DM \-6**  
  * Se `NationTier` 6: **DM \-8**  
  * *Regra:* Se o usuário escolher Off-World, marcar flag `OffWorldEducation = True` (Aplica DM-1 em todos os benefícios financeiros no final da criação).  
* **Modificador Spacer:**

  * Se `OriginType == "Spacer"`, aplicar **DM \-2** adicional a qualquer escolha (Local ou Off-World).

**2\. Opções de Instituição (Checks de Entrada):**

O usuário deve clicar em um botão para rolar os dados (2D6).

* **Universidade (University):**

  * *Check:* 2D6 \+ (EDU DM) \+ (Admission DM).  
  * *Sucesso:* 6+  
  * *Bônus:* Se `SOC` \>= 9, adicionar \+1 ao resultado.  
* **Academia Militar (Military Academy):**

  * *Escolha de Ramo:* O usuário deve escolher **Army**, **Marines** ou **Navy**.  
  * *Check (Army):* 2D6 \+ (END DM) \+ (Admission DM). Sucesso: 7+  
  * *Check (Marines):* 2D6 \+ (END DM) \+ (Admission DM). Sucesso: 8+  
  * *Check (Navy):* 2D6 \+ (INT DM) \+ (Admission DM). Sucesso: 8+

**Fluxo de Falha:** Se o teste falhar, o usuário **não pode** repetir. Ele deve prosseguir imediatamente para o **Passo 7 (Carreiras)**, mas sua idade permanece 18 anos.

**Fluxo de Sucesso:** O usuário entra na educação. Idade avança 4 anos (para 22). Prossiga para Passo 6.1.

---

### **Passo 6.1: Currículo e Perícias (Dados Hardcoded)**

Se admitido, o personagem ganha perícias específicas.

**A. Currículo Universitário:**

* **Efeito Imediato:** Aumentar `EDU` em \+1.  
* **Seleção de Perícias:** O usuário deve escolher **duas** perícias da lista abaixo. O sistema deve perguntar qual será Nível 0 e qual será Nível 1\.  
  * *Lista:* Admin, Advocate, Animals (Training ou Veterinary), Art (Any), Astrogation, Electronics (Any), Engineer (Any), Language (Any), Medic, Navigation, Profession (Any), Science (Any).

**B. Currículo Academia Militar:**

* **Efeito Imediato:** O personagem ganha as "Service Skills" da carreira escolhida no **Nível 0**.  
* **Listas de Dados (Service Skills):**  
  * **Se Army:** Drive 0, Athletics 0, Gun Combat 0, Recon 0, Melee 0, Heavy Weapons 0\.  
  * **Se Marines:** Athletics 0, Vacc Suit 0, Tactics 0, Heavy Weapons 0, Gun Combat 0, Stealth 0\.  
  * **Se Navy:** Pilot 0, Vacc Suit 0, Athletics 0, Gunner 0, Mechanic 0, Gun Combat 0\.

---

### **Passo 6.2: Eventos de Educação (Tabela Completa)**

Role 2D6 e aplique o resultado da tabela abaixo.

| 2D6 | Evento e Efeito Lógico |
| ----- | ----- |
| **2** | **Convite Psíquico:** O personagem foi contatado por um grupo psíquico subterrâneo. *Flag:* `PsionQualification = True` (Permite tentar a carreira Psion em qualquer termo futuro). |
| **3** | **Tragédia:** Falha automática na graduação. O personagem não ganha os benefícios de graduação e deve ir para o alistamento (Draft) ou Drifter no próximo termo. |
| **4** | **Prank gone wrong:** Rolar SOC 8+. *Sucesso:* Ganha um Rival. *Falha:* Ganha um Inimigo. *Se rolar natural 2:* Expulso. Deve entrar na carreira `Prisoner` no próximo termo. |
| **5** | **Festas:** Ganha a perícia `Carouse 1`. |
| **6** | **Amizades:** Ganha `1D3` (1 a 3\) Aliados (Allies). |
| **7** | **Life Event:** Rolar na Tabela de Eventos de Vida (Módulo 4). |
| **8** | **Movimento Político:** Rolar SOC 8+. *Sucesso:* Ganha 1 Aliado e 1 Inimigo. |
| **9** | **Hobby:** O usuário escolhe qualquer perícia (exceto Jack-of-all-Trades) no Nível 0\. |
| **10** | **Conflito com Tutor:** O usuário escolhe uma perícia que aprendeu neste termo e rola (Dificuldade 9+). *Sucesso:* Aumenta essa perícia em \+1 nível e ganha o Tutor como Rival. |
| **11** | **Guerra/Alistamento:** O usuário escolhe: (A) Fugir (Carreira Drifter no próximo termo) ou (B) Alistamento Forçado (Role 1D6: 1-3 Army, 4-5 Marine, 6 Navy). Em ambos os casos, não gradua. *Exceção:* Se rolar SOC 9+, evita o draft e gradua normalmente. |
| **12** | **Reconhecimento:** Aumenta `SOC` em \+1. |

---

### **Passo 6.3: Graduação**

Após o evento, verificar se o personagem se formou.

**Checks de Graduação:**

* **Universidade:** 2D6 \+ (INT DM). Sucesso: 6+.  
* **Academia:** 2D6 \+ (INT DM). Sucesso: 7+.  
  * *Bônus Academia:* Se `END` 8+, DM+1. Se `SOC` 8+, DM+1.

**Resultados:**

1. **Falha:**

   * Não ganha bônus de graduação.  
   * Se Academia: Pode entrar na carreira militar associada automaticamente, mas *sem* Comissão (Rank 0).  
   * Se Universidade: Vai para o Passo 7 (Carreira) normal.  
2. **Sucesso (Graduação):**

   * **Universidade:** Aumenta as 2 perícias escolhidas na entrada em \+1 nível. Aumenta `EDU` \+1 adicional. Ganha DM+1 para entrar em carreiras (listadas abaixo).  
   * **Academia:** Aumenta `EDU` \+1. Escolha 3 perícias da lista de "Service Skills" (Passo 6.1B) e aumente para Nível 1\. Ganha entrada automática na carreira militar. Permite rolar Comissão (Rank 1\) antes do primeiro termo com DM+2.  
3. **Honras (Sucesso com 2D6 \>= 10 na Uni ou 11 na Academia):**

   * Todos os benefícios de "Sucesso".  
   * Aumenta `SOC` \+1 adicional.  
   * **Universidade:** DM+2 para qualificação em carreiras.  
   * **Academia:** Comissão Automática (Começa como Oficial Rank 1).

**Carreiras com Bônus Universitário:** Se graduado em Universidade, o usuário recebe bônus (+1 ou \+2 se Honras) para entrar nas carreiras: *Agent, Army, Citizen (Corporate), Entertainer (Journalist), Marines, Navy, Scholar, Scout.*

**Interface do Usuário (UI) para este Módulo:**

* Exibir "Idade: 22 Anos" após a conclusão.  
* Exibir lista clara das perícias ganhas/melhoradas.  
* Se Academia com Honras: Exibir "Comissão Garantida: Você começará como Oficial".

---

**Validação do Módulo 3:** A IA deve verificar:

1. O cálculo de admissão usou a tabela correta (TL/Tier) e aplicou penalidade de Spacer se necessário?  
2. Se escolheu "Off-World", a flag `OffWorldEducation` foi salva?  
3. As perícias foram adicionadas corretamente (não ultrapassando limites de Nível se houver regras restritivas, embora na criação seja permitido acumular)?  
4. O aumento de EDU e SOC foi aplicado?

---

## **Módulo 4: O Ciclo de Carreiras (The Career Loop)**

Este é o loop principal ("The Term") que se repete a cada 4 anos de vida do personagem. Em *2300AD*, a mecânica de sobrevivência é brutalmente alterada pelo ambiente do planeta natal até que o personagem consiga "sair de casa".

### **Variáveis de Controle do Loop**

* `CurrentTerm` (Inteiro, inicia em 1).  
* `CurrentAge` (Inteiro, inicia em 18 ou 22 se foi para faculdade ou academia militar).  
* `HasLeftHome` (Booleano, inicia como FALSE).  
* `IsDrafted` (Booleano, inicia como FALSE).

---

### **Passo 7: Escolha de Carreira**

**Descrição Lógica:** O usuário escolhe uma carreira. Se for o primeiro termo, pode escolher livremente (exceto restrições de Tier). Se for um termo subsequente, é um novo alistamento ou continuação.

**Lista de Carreiras Disponíveis (Atualizado para 2300AD):** A IA deve carregar as tabelas de carreiras do *Traveller Core Rulebook*, mas substituir a carreira "Drifter" pelas variantes do *2300AD*.

1. **Agent** (Law Enforcement, Intelligence, Corporate)  
2. **Army** (Support, Infantry, Cavalry)  
3. **Citizen** (Corporate, Worker, Colonist)  
4. **Drifter (2300AD Variant):**  
   * *Substituir:* Barbarian \-\> **Freelancer**  
   * *Substituir:* Wanderer \-\> **Wanderer** (Sem alterações)  
   * *Substituir:* Scavenger \-\> **Scavenger** (Belter/Salvage)  
5. **Entertainer** (Artist, Journalist, Performer)  
6. **Marine** (Support, Star Marine, Ground Assault)  
7. **Merchant** (Merchant Marine, Free Trader, Broker)  
8. **Navy** (Line/Crew, Engineer/Gunner, Flight)  
9. **Noble** (Administrator, Diplomat, Dilettante) \- *Nota: Em 2300AD, nobres são executivos de alto nível ou elite política.*  
10. **Rogue** (Thief, Enforcer, Pirate)  
11. **Scholar** (Field Researcher, Scientist, Physician)  
12. **Scout** (Courier, Surveyor, Explorer)

**Lógica de Qualificação:**

* **Check:** Rolar 2D6 \+ Modificador do Atributo vs Dificuldade da Carreira.  
* *Se Sucesso:* Entra na carreira.  
* *Se Falha:* O usuário deve escolher: **Drifter** OU **Draft** (Alistamento Militar Obrigatório).  
* *Regra do Draft (Hardcoded):* Role 1D6. 1-3: Army, 4-5: Marine, 6: Navy.

---

### **Passo 8: O Loop do Termo (4 Anos)**

Este passo contém a sequência de operações para cada termo.

#### **8.1. Habilidades e Treinamento**

* **Se Termo 1 (Basic Training):** O personagem ganha todas as "Service Skills" da carreira no Nível 0\.  
* **Todos os Termos:** O usuário escolhe uma tabela de especialização (Personal Development, Service Skills, Specialist, Officer \[se Rank \>0\]).  
* **Rolagem:** 1D6. O personagem ganha a habilidade correspondente ou \+1 nível nela.

#### **8.2. Sobrevivência (Survival) \- *CRÍTICO NO 2300AD***

Aqui aplicamos a regra de ambiente hostil do *Book 1*.

**Lógica de Cálculo do DM de Sobrevivência:** A IA deve calcular o modificador final (`TotalSurvivalDM`) somando:

1. **Atributo Base:** Modificador do atributo exigido pela carreira (ex: END DM).  
2. **Homeworld DM:** Se `HasLeftHome == FALSE`, adicionar o `SurvivalDM` do planeta natal (definido no Passo 3).  
   * *Exemplo:* Um personagem de *King* (DM \-3) tentando sobreviver no Army (END 5+) terá uma penalidade severa.  
3. **DNAM/Genética:** Se o personagem possui DNAMs apropriados, eles podem anular penalidades ambientais (Lógica condicional: Se `DNAM` \== "King Ultra" E `Homeworld` \== "King", ignorar penalidade do mundo).

**Ação:**

* Rolar 2D6 \+ `TotalSurvivalDM`.  
* **Se Sucesso:** Segue para Eventos.  
* **Se Falha:** Rolar na **Tabela de Mishap (Desgraça)** da carreira. O personagem é ejetado da carreira.  
  * *Regra de Augmentação (2300AD):* Se o personagem falhar na sobrevivência por exatamente 1 ponto ou sofrer um Mishap que cause lesão, o usuário pode optar por receber um **Membro Cibernético/Olho Cibernético** (pagando com 1 Slot de Benefício futuro) para ignorar a falha e continuar na carreira.

#### **8.3. Eventos (Events)**

* Rolar 2D6 na Tabela de Eventos da Carreira (ou Tabela de Eventos de Vida).  
* Apresentar o texto do evento e aplicar os efeitos (ganho de skills, contatos, inimigos).

#### **8.4. Comissão e Promoção**

* **Comissão (Só carreiras militares):** Check de atributo para virar Oficial (Rank 1). Só permitido no Termo 1 (ou qualquer termo se SOC \>= 9).  
* **Avanço:** Check de atributo para subir de Rank. Se sucesso, ganha \+1 Skill Roll.

#### **8.5. Leaving Home Check (Sair de Casa) \- *EXCLUSIVO 2300AD***

Se `HasLeftHome` for FALSE, o personagem deve testar se conseguiu juntar recursos/coragem para sair do planeta natal e se livrar dos modificadores de sobrevivência hostis.

**Fórmula do Check:** `2D6 + TermsServed + SpacerBonus >= 8`

* `TermsServed`: Número de termos completados até agora (1, 2, etc.).  
* `SpacerBonus`: Se `OriginType == Spacer`, adicionar \+2.

**Resultado:**

* **Sucesso (8+):** Definir `HasLeftHome = TRUE`. Nos próximos termos, **não** aplicar mais o `SurvivalDM` do planeta natal na fase de sobrevivência. Exibir mensagem: *"Você finalmente deixou seu mundo natal e se adaptou à vida estelar."*  
* **Falha:** O personagem continua atrelado ao mundo natal. A penalidade de sobrevivência continua valendo para o próximo termo.

#### **8.6. Envelhecimento (Aging)**

* **Regra 2300AD:** O envelhecimento começa apenas aos **50 anos** (Termo 8+), devido à medicina avançada (Book 1, pg. 10).  
* Se `CurrentAge` \< 50, pular check de envelhecimento.

---

### **Dados Específicos: A Carreira "Drifter" (Variante 2300AD)**

Como esta carreira foi reescrita, aqui estão os dados hardcoded para a IA implementar:

**Qualificação:** Automática.

**Assinamentos (Assignments):**

1. **Freelancer:** Profissional contratado termo a termo. (Substitui Barbarian).  
   * *Survival:* EDU 7+  
   * *Advancement:* INT 7+  
2. **Wanderer:** Nômade clássico.  
   * *Survival:* END 7+  
   * *Advancement:* INT 7+  
3. **Scavenger:** Belter ou sucateiro espacial.  
   * *Survival:* DEX 7+  
   * *Advancement:* END 7+

**Tabelas de Perícias Drifter (2300AD):**

* **Personal Development:** 1:STR+1, 2:END+1, 3:DEX+1, 4:Language, 5:Profession, 6:Jack-of-all-Trades.  
* **Service Skills:** Athletics, Melee(unarmed), Recon, Streetwise, Stealth, Survival.  
* **Freelancer Skills:** Profession, Electronics, Streetwise, Admin, Deception, Jack-of-all-Trades.  
* **Wanderer Skills:** Drive, Deception, Recon, Stealth, Streetwise, Survival.  
* **Scavenger Skills:** Pilot(small craft), Mechanic, Astrogation, Vacc Suit, Profession, Gun Combat.

---

### **Passo 8.5: Decisão de Continuidade**

Ao final do termo, exibir resumo:

* "Termo \[X\] concluído."  
* "Idade atual: \[X\] anos."  
* "Rank atual: \[Nome do Rank\]."  
* "Benfícios Acumulados: \[N\]."

**Botões:**

* `[Continuar nesta Carreira]` (Requer teste de Avanço se rolagem anterior foi menor que termos servidos).  
* `[Mudar de Carreira]` (Vai para Passo 7).  
* `[Muster Out (Finalizar Criação)]` (Vai para Passo 9).

---

**Validação do Módulo 4:** A IA deve garantir:

1. O `SurvivalDM` do Planeta Natal foi aplicado se `HasLeftHome` é false?  
2. O teste de `Leaving Home` foi feito ao final do termo?  
3. A idade foi incrementada em 4 anos?  
4. O teste de envelhecimento só dispara se Idade \>= 50?  
5. Se o personagem escolheu **Drifter**, usou as tabelas variantes do 2300AD e não do Core?

Esta é a **Parte 4 (revisada e expandida)** da especificação funcional.

Como solicitado, este módulo contém **todos os dados brutos** necessários para processar as carreiras. Dado que as carreiras do *Core Rulebook* seguem um padrão e as do *2300AD* (Drifter e Spaceborne) são customizadas, separei os dados em estruturas lógicas para a IA.

**Nota Importante de Implementação:** O *2300AD* substitui a carreira "Drifter" padrão e adiciona a "Spaceborne". As outras 10 carreiras usam a estrutura do *Core Rulebook*, mas sujeitas às regras de *Survival* do planeta natal.

---

## **Módulo 4: O Ciclo de Carreiras e Dados (Completo)**

### **1\. Estrutura de Dados da Carreira (Objeto Genérico)**

A IA deve ter uma classe/estrutura `Career` com as seguintes propriedades para cada uma das 13 opções disponíveis:

* `Name`: String  
* `Qualification`: Atributo \+ Dificuldade (ex: "INT 6+")  
* `Assignments`: Lista de 3 especializações.  
* `SurvivalStat`: Atributo \+ Dificuldade (varia por Assignment).  
* `AdvancementStat`: Atributo \+ Dificuldade (varia por Assignment).  
* `ServiceSkills`: Lista de 6 perícias.  
* `PersonalDev`: Lista de 6 upgrades (Atributos ou Perícias).  
* `EventsTable`: Lista de 11 eventos (2 a 12).  
* `MishapTable`: Lista de 6 desgraças (1 a 6).  
* `Ranks`: Lista de Títulos e Bônus por Rank (0 a 6).

---

### **2\. Lógica do Loop de Termo (Passo a Passo Detalhado)**

O sistema deve executar este fluxo a cada 4 anos (1 Termo).

#### **Passo 7: Qualificação**

* **Input:** Usuário seleciona uma carreira da lista.  
* **Check:** Rolar 2D6 \+ (Modificador do Atributo da Qualificação).  
  * *DM:* \-1 para cada carreira anterior.  
  * *DM:* \-2 se Idade \>= 30 (para carreiras militares: Army, Navy, Marines).  
* **Sucesso:** Inicia o Termo na carreira.  
* **Falha:** O usuário deve escolher: **Drifter** (Automático) OU **Draft** (Alistamento).  
  * *Draft (Rolagem Automática):* 1=Navy, 2=Army, 3=Marine, 4=Merchant, 5=Scout, 6=Agent. (Se o Draft falhar em qualificar, vai para Drifter).

#### **Passo 8.1: Treinamento e Habilidades**

* **Se Termo 1 na Carreira:**  
  * Adicionar todas as `Service Skills` no Nível 0\.  
* **Qualquer Termo:**  
  * O usuário escolhe uma tabela: *Personal Development*, *Service Skills*, *Assignment Skills* (da especialização atual) ou *Advanced Education* (Requer EDU 8+).  
  * *Rolagem:* 1D6. Adicionar a perícia ou atributo correspondente.

#### **Passo 8.2: Sobrevivência (Survival) \- Regra Crítica 2300AD**

* **Cálculo do DM:**  
  * DM Base: Modificador do atributo de sobrevivência da carreira.  
  * **Regra Leaving Home:** Se `HasLeftHome == False`, aplicar o `HomeworldSurvivalDM` (definido no Passo 3).  
* **Check:** 2D6 \+ DMs vs Dificuldade de Sobrevivência.  
* **Sucesso:** Segue para Eventos.  
* **Falha:** Vai para **Mishap (Passo 8.3b)**.  
  * *Opção de Augmentação (2300AD):* Se falhar, o usuário pode optar por aceitar uma lesão permanente corrigida por cibernética. Se aceitar: Ignora a falha (considera sucesso marginal), mas perde 1 slot de benefício final (Mustering Out) e ganha um Implante (Olho ou Membro Cibernético).

#### **Passo 8.3a: Eventos (Sucesso na Sobrevivência)**

* **Check:** Rolar 2D6 na `EventsTable` da carreira.  
* **Aplicação:** Exibir texto e aplicar bônus (perícias, contatos, aliados).  
* **Life Event:** Se o resultado for 7 (ou instruído pelo texto), rolar na **Tabela de Eventos de Vida (Seção 4 deste documento)**.

#### **Passo 8.3b: Mishaps (Falha na Sobrevivência)**

* **Check:** Rolar 1D6 na `MishapTable` da carreira.  
* **Efeito:** Aplicar texto (lesão, inimigo, expulsão).  
* **Expulsão:** A menos que o texto diga o contrário, o personagem é ejetado da carreira. O termo termina. Ele deve escolher uma nova carreira no próximo termo.

#### **Passo 8.4: Avanço e Comissão**

* **Comissão (Militar apenas):** Se Rank 0, rolar Qualificação de Comissão. Sucesso \= Rank 1\. (DM-1 por termo após o primeiro).  
* **Avanço (Todos):** Check de `AdvancementStat`.  
  * *Sucesso:* Rank aumenta \+1. Ganha 1 rolagem extra de Habilidade (Passo 8.1).  
  * *Sucesso Natural 12:* Deve continuar nesta carreira obrigatoriamente.

#### **Passo 8.5: Teste "Leaving Home" (Regra 2300AD)**

Se `HasLeftHome == False`:

* **Check:** 2D6 \+ (Número de Termos Cumpridos).  
  * *Bônus:* Se Carreira \= Scout, DM+2 extra. Se Origem \= Spacer, DM+2 extra.  
* **Sucesso (8+):** `HasLeftHome = True`. (O personagem não sofre mais penalidade do mundo natal nos próximos termos).

---

### **3\. Banco de Dados das Carreiras (Hardcoded Data)**

Abaixo estão os dados essenciais para as carreiras modificadas e principais do *2300AD*.

#### **A. The Drifter (Versão 2300AD \- Substitui Core Rulebook)**

*Descrição:* Nômades, trabalhadores temporários e habitantes da fronteira.

* **Assignments:**  
  * **Freelancer:** Profissional independente. (Sobrevivência: EDU 7+ / Avanço: INT 7+)  
  * **Wanderer:** Viajante sem rumo. (Sobrevivência: END 7+ / Avanço: INT 7+)  
  * **Scavenger:** Sucateiro ou Belter. (Sobrevivência: DEX 7+ / Avanço: END 7+)  
* **Tabelas de Perícias:**  
  * *Personal:* STR+1, END+1, DEX+1, Language, Profession, Jack-of-all-Trades.  
  * *Service:* Athletics, Melee(unarmed), Recon, Streetwise, Stealth, Survival.  
  * *Freelancer:* Profession, Electronics, Streetwise, Admin, Deception, Jack-of-all-Trades.  
  * *Wanderer:* Drive, Deception, Recon, Stealth, Streetwise, Survival.  
  * *Scavenger:* Pilot(small), Mechanic, Astrogation, Vacc Suit, Profession, Gun Combat.  
* **Eventos Drifter (Resumo Lógico):**  
  * 2: Desastre (Mishap).  
  * 3: Oferta de Patrono (Aceitar: Próx Qualificação \+4, mas deve favor / Recusar: Nada).  
  * 4: Skills (Jack-of-all-Trades, Survival, Streetwise ou Melee).  
  * 5: Item útil (DM+1 em um benefício final).  
  * 6: Unusual Event (Life Event Table).  
  * 7: Life Event.  
  * 8: Ataque. Ganha Inimigo. Teste Combat 8+ para evitar Lesão.  
  * 9: Aventura arriscada. Rolar 1D6: 1-2 (Lesão/Prisão), 3-4 (Nada), 5-6 (DM+4 Benefício).  
  * 10: Treino duro (Aumentar qualquer skill que já tenha).  
  * 11: Draft Forçado (Vai para carreira militar no próx termo).  
  * 12: Promoção Automática.

#### **B. The Spaceborne (Nova Carreira 2300AD)**

*Descrição:* Nascidos e criados no espaço (Belters, Tinkers).

* **Qualificação:** Automática se Origem \= Spacer.  
* **Assignments:**  
  * **Belter:** Minerador de asteroides. (Sobrevivência: DEX 8+ / Avanço: END 6+)  
  * **Tinker:** Técnico itinerante. (Sobrevivência: END 7+ / Avanço: INT 7+)  
  * **Libertine:** Comerciante livre. (Sobrevivência: DEX 7+ / Avanço: INT 7+)  
* **Tabelas de Perícias:**  
  * *Personal:* STR+1, END+1, DEX+1, Language, Profession, Jack-of-all-Trades.  
  * *Service:* Athletics, Melee(unarmed), Recon, Streetwise, Profession, Vacc Suit.  
  * *Belter:* Pilot(small), Mechanic, Astrogation, Vacc Suit, Profession, Science.  
  * *Tinker:* Pilot, Profession, Mechanic, Streetwise, Engineer, Vacc Suit.  
  * *Libertine:* Pilot, Vacc Suit, Persuade, Mechanic, Engineer, Electronics.  
* **Eventos Spaceborne:** (Muito similares ao Drifter, focados em espaço).  
  * *Destaque:* Rank 1 Belter ganha "Vacc Suit 1". Rank 1 Tinker ganha "Profession 1".

#### **C. Carreiras Militares e Outras (Resumo de Dados para IA)**

Para estas carreiras, use a estrutura padrão do *Traveller Core*, mas aplique os seguintes *Ranks* e *Special Skills* do 2300AD onde notado:

1. **Army (Exército):**  
   * *Assignment:* Support, Infantry, Cavalry.  
   * *Regra Especial 2300AD:* Pode escolher **"Foreign Legion"** (Legião Estrangeira Francesa).  
     * Se sim: Qualificação \+1, Sobrevivência \-1.  
     * Benefício: Cidadania Francesa após 1 termo. Ganha `Language (French) 0`.  
2. **Marine:** (Space Marines). Focado em Zero-G e abordagem.  
3. **Navy:** (Marinha Espacial).  
4. **Scout:** (Exploração).  
   * *Leaving Home Bonus:* Scouts ganham \+2 por termo no teste de sair de casa.  
5. **Agent / Citizen / Entertainer / Merchant / Noble / Rogue / Scholar:** Seguem tabelas padrão.

---

### **4\. Tabela Global de "Life Events" (Eventos de Vida)**

Se qualquer carreira rolar "Life Event" (geralmente resultado 7), role 2D6 nesta tabela:

* **2 (Sickness/Injury):** O personagem adoece ou é ferido. Role na Tabela de Lesões (Ver abaixo).  
* **3 (Birth/Death):** Alguém próximo morre ou nasce. Envolvimento pessoal.  
* **4 (Ending of Relationship):** Relacionamento romântico termina mal. Ganha um **Rival** ou **Enemy**.  
* **5 (Improved Relationship):** Relacionamento melhora (casamento/compromisso). Ganha um **Ally**.  
* **6 (New Relationship):** Novo romance. Ganha um **Ally**.  
* **7 (New Contact):** Ganha um **Contact**.  
* **8 (Betrayal):** Traído por um amigo. Um Contact/Ally vira Rival/Enemy. Se não tiver, ganha um novo Rival.  
* **9 (Travel):** Move-se para outro mundo. DM+2 na próxima qualificação.  
* **10 (Good Fortune):** Sorte grande. DM+2 em uma rolagem de Benefício.  
* **11 (Crime):** Vítima ou acusado de crime. Perde 1 Benefício OU deve entrar na carreira **Prisoner** no próximo termo.  
* **12 (Unusual Event):**  
  * 1: Psionics (Teste PSI, se elegível).  
  * 2: Aliens (Ganha Science 1 e Contato Alien).  
  * 3: Alien Artifact (Ganha item estranho).  
  * 4: Amnesia.  
  * 5: Contact w/ Govt (Contato de alto nível).  
  * 6: Ancient Tech (Item tecnológico misterioso).

---

### **5\. Regras de Geração de NPCs (Aliados e Inimigos)**

Quando um evento disser "Gain an Enemy/Ally/Rival/Contact/Patron", o sistema deve gerar e armazenar este NPC na ficha.

**Definições:**

* **Ally (Aliado):** Ajuda ativamente.  
* **Contact (Contato):** Conhecido útil, troca favores.  
* **Rival (Rival):** Compete, odeia, mas age dentro da lei (social/político).  
* **Enemy (Inimigo):** Quer ferir, matar ou destruir o personagem (físico/ilegal).

**Gerador Aleatório (Opcional se o evento não especificar):** Se o evento diz apenas "Ganha um Inimigo", a IA pode rolar 1D6 para definir a natureza:

1. Criminoso / Pirata  
2. Oficial do Governo / Militar  
3. Executivo Corporativo  
4. Ex-Amante / Familiar  
5. Alien / Forasteiro  
6. Rival Profissional

---

### **6\. Tabela de Lesões (Injury Table)**

Usada quando um evento ou mishap causa "Injury". Role 1D6:

1. **Nearly Killed:** Reduzir um atributo físico em 1D6, dois outros em 2\. (Personagem quase morre).  
2. **Severely Injured:** Reduzir um atributo físico em 1D6.  
3. **Missing Eye/Limb:** Perde Olho ou Membro. Reduz STR ou DEX em 2\. *Oportunidade para Augmentação Cibernética no 2300AD.*  
4. **Scarred:** Cicatrizes. Reduz atributo físico em 2\.  
5. **Injured:** Reduz atributo físico em 1\.  
6. **Lightly Injured:** Sem efeito permanente.

**Tratamento de Lesões (Regra Médica):** O usuário pode pagar para restaurar atributos perdidos ("Medical Debt").

* Custo: Cr 5000 por ponto restaurado.  
* O sistema deve registrar essa "Dívida Médica" para ser paga com os benefícios finais.

---

### **7\. Validação do Módulo 4**

A IA deve verificar ao final de cada termo:

1. O `Survival Roll` usou o modificador do Planeta Natal (se ainda em casa)?  
2. Se falhou na sobrevivência, rodou Mishap e ejetou da carreira (salvo regra de Drifter/Militar específica)?  
3. O `Advancement Roll` foi feito? Se falhou com valor \<= nº de termos, forçou a saída?  
4. O teste de `Leaving Home` foi realizado? Se 8+, limpou a flag de penalidade do mundo natal?  
5. A idade aumentou \+4?  
6. Se idade \>= 50, rodou teste de envelhecimento?

---

## **Módulo 5: Mustering Out e Finalização**

Este módulo é executado quando o usuário decide encerrar a carreira (ou é forçado a isso) e consolidar os ganhos de sua vida antes do início do jogo.

### **Passo 9: Benefícios de Saída (Mustering Out)**

**Descrição Lógica:** O sistema calcula quantas rolagens de benefícios o personagem acumulou e permite que o usuário as distribua entre "Dinheiro" (Cash) e "Outros Benefícios" (Benefits).

**Variáveis de Controle:**

* `TotalBenefitRolls`: Inteiro.  
* `CashRollsCount`: Inteiro (Máximo 3).  
* `BenefitRollsCount`: Inteiro.  
* `PathModifier`: Inteiro (+1 ou \-1).  
* `EducationModifier`: Inteiro (0 ou \-1).

#### **9.1. Cálculo de Rolagens Disponíveis (Regra)**

A IA deve somar:

1. **1 rolagem por Termo servido** (em qualquer carreira).  
2. **Bônus de Rank:**  
   * Rank 1 ou 2: \+1 Rolagem total.  
   * Rank 3 ou 4: \+2 Rolagens totais.  
   * Rank 5 ou 6: \+3 Rolagens totais E `DM+1` em todas as rolagens de benefícios desta carreira.

#### **9.2. Cálculo de Modificadores (DMs) \- *Regras Críticas 2300AD***

Antes de rolar, o sistema deve aplicar os modificadores globais acumulados nos passos anteriores:

1. **Filosofia (Path):**  
   * Se `Path == "Hard"` (Tecnológico): **DM \+1** em todas as rolagens.  
   * Se `Path == "Soft"` (Biológico/Genético): **DM \-1** em todas as rolagens.  
2. **Educação Off-World:**  
   * Se `OffWorldEducation == True` (Passo 6): **DM \-1** em todas as rolagens (representando empréstimos estudantis).  
3. **Perícia Gambler:**  
   * Se o personagem tem `Gambler 1+`: **DM \+1** nas rolagens da tabela de **Dinheiro (Cash)**.

#### **9.3. Execução das Rolagens**

O usuário deve alocar suas `TotalBenefitRolls`.

* **Restrição:** No máximo **3** rolagens podem ser feitas na tabela de **Dinheiro (Cash)** (somando todas as carreiras). As restantes devem ser em **Outros Benefícios**.  
* **Drifter:** Se a carreira for Drifter, não há limite de rolagens em Cash (mas o máximo de 3 global geralmente se mantém no Traveller padrão, o 2300AD não explicita exceção, então mantenha a regra padrão: máx 3 em Cash).

**Tabelas de Dados (Hardcoded):** Use as tabelas de benefícios específicas de cada carreira (Core Rulebook ou Drifter/Spaceborne do 2300AD listados no Módulo 4).

**Tratamento de Resultados Específicos do 2300AD:**

1. **Ship Shares (Participações de Nave):**  
   * *Regra Core:* 1 Ship Share \= MCr 1 (1 milhão).  
   * *Regra 2300AD:* 1 Ship Share \= **Lv 500,000** (500 mil Livres).  
   * *Restrição:* Não podem ser trocados por dinheiro (Cash). Devem ser usados para abater financiamento de nave ou convertidos em "Pensão de Investimento" (veja Passo 12).  
2. **TAS Membership (Associação à Sociedade de Apoio ao Viajante):**  
   * *Regra 2300AD:* Não existe TAS em 2300AD. Se o resultado for "TAS Membership", converter automaticamente em **\+1 Ship Share** (Total Lv 500,000).  
3. **Armas (Weapon):**  
   * Se o resultado for "Weapon": O usuário escolhe uma arma da lista de equipamentos.  
   * *Restrição 2300AD:* Se a carreira **não** for militar (Army, Navy, Marines), o usuário só pode escolher Rifles ou Pistolas (Slug throwers).  
   * *Exceção:* Se a carreira for **Spaceborne** ou **Belter**, pode escolher Laser Weapons.  
   * *Benefício Repetido:* Se rolar "Weapon" novamente, pode pegar outra arma ou aumentar a perícia adequada (Gun Combat ou Melee) em \+1.  
4. **Armor (Armadura):**  
   * *Regra 2300AD:* O limite de valor é Lv 10,000 e TL 12\. Se rolar de novo, pode fazer upgrade para Lv 25,000.  
5. **Vehicle (Veículo):**  
   * *Regra 2300AD:* Limite de valor Lv 300,000 e TL 10\. Não pode ser veículo armado.

---

### **Passo 10: Pacotes de Perícias de Campanha (Skill Packages)**

**Descrição Lógica:** Após criar os personagens individualmente, o grupo seleciona um "Pacote de Campanha" para garantir que tenham as perícias necessárias para a aventura.

**Interface do Usuário:**

* Apresentar lista de pacotes.  
* O usuário seleciona UM pacote.  
* O sistema exibe as perícias do pacote. O usuário distribui as perícias entre os membros do grupo (ou, se for criação solo, o usuário escolhe 1 ou 2 perícias deste pacote para adicionar à sua ficha).

**Banco de Dados de Pacotes (2300AD Book 1, pg 14):**

1. **Troubleshooter (Resolvedores de Problemas):**  
   * Electronics (any) 1, Gun Combat (any) 1, Investigate 1, Medic 1, Melee (any) 1, Recon 1, Stealth 1, Streetwise 1\.  
2. **Colonist (Colonistas na Fronteira):**  
   * Animals (any) 1, Drive (any) 1, Gun Combat (any) 1, Mechanic 1, Medic 1, Navigation 1, Recon 1, Survival 1\.  
3. **Urbanite (Urbano/Cyberpunk):**  
   * Carouse 1, Computers 1, Deception 1, Gun Combat (any) 1, Melee (any) 1, Stealth 1, Streetwise 1\.  
4. **Corporate (Corporativo):**  
   * Admin 1, Advocate 1, Deception 1, Investigate 1, Profession (any) 1, Science (any) 1, Streetwise 1\.  
5. **Libertine Trader (Comerciante Livre):**  
   * Advocate 1, Broker 1, Deception 1, Diplomat 1, Engineer (any) 1, Gun Combat (any) 1, Persuade 1, Pilot 1, Streetwise 1\.  
6. **Starship Skills (Genérico Espacial):**  
   * Astrogation 1, Electronics 1, Engineer 1, Gunner 1, Mechanic 1, Medic 1, Pilot 1, Tactics (naval) 1\.  
7. **Mercenary (Mercenário):**  
   * Electronics 1, Medic 1, Leadership 1, Heavy Weapons 1, Gun Combat 1, Stealth 1, Recon 1\.

**Regra de Aplicação:**

* Adicionar a perícia em Nível 1\.  
* Se o personagem já tem a perícia em nível maior, não aumenta.  
* Se tem em nível 0, sobe para 1\.

---

### **Passo 11: Equipamento e Finanças Iniciais**

**Descrição Lógica:** Compilar o dinheiro, converter moedas e equipar itens padrão.

#### **11.1. Moeda**

* **Regra de Conversão:** O sistema deve renomear "Créditos" (Cr) para "Livres" (Lv). A taxa é 1:1 para fins de regras mecânicas.  
* **Cálculo:** Somar todo o dinheiro das rolagens de Benefício (Cash).

#### **11.2. Equipamento Gratuito (Standard Issue)**

Todo personagem em *2300AD* recebe automaticamente (Book 1, pg 11):

1. **Hand Comp:** (Computador de mão, TL 10).  
2. **Link Phone:** (Smartphone avançado, TL 10).  
3. **Roupas:** Conjunto básico de roupas adequadas à carreira e mundo natal.

#### **11.3. Compra de Equipamento (Shop)**

Permitir que o usuário gaste seus Livres iniciais (máximo Lv 2,000 na criação rápida ou totalidade se "Deep Creation") em equipamentos.

* *Nota para IA:* Carregar lista básica de armas e armaduras do *Book 1* (Seção Tools of the Trade).  
  * Ex: *Stutterwarp Engineer Kit*, *Filter Mask* (Cr 100), *Vacc Suit* (Cr 10,000+).

#### **11.4. Dívida Médica e Cibernética**

Se o personagem sofreu lesões (Injury Table) ou escolheu instalar implantes cibernéticos sem pagar (durante eventos de Mishap ou via Benefício "Cybernetic Implant"):

* Deduzir o custo dos implantes/tratamentos do dinheiro inicial.  
* Se o dinheiro acabar, registrar o restante como "Dívida Médica" (Medical Debt) a ser paga durante a campanha.  
* *Custo de Referência:* Restauração de atributo \= Lv 5,000 por ponto.

---

### **Passo 12: Finalização da Ficha (Dados Derivados)**

**Descrição Lógica:** Cálculos finais para exibir na interface.

1. **Idade Final:** 18 \+ (4 \* Termos Servidos). Adicionar \+4 se fez Educação Pré-Carreira.  
2. **Pensões:**  
   * Se Termos \>= 5: Calcular pensão anual (Lv 10,000 \+ 2,000 por termo extra acima de 5).  
   * Se Ship Shares não usadas: Adicionar Lv 1,000/ano por share (dividendos).  
3. **Características Finais:** Exibir STR, DEX, END, INT, EDU, SOC atuais e seus DMs.  
4. **Lista de Perícias:** Consolidar todas as perícias.  
   * Exibir Nível.  
   * Se Nível 0: "Básico".  
5. **Equipamento:** Listar armas, armaduras, implantes (Augments) e itens.  
6. **Histórico:** Compilar o log de eventos (Eventos de Vida, Promoções, Inimigos, Aliados).

---

### **Exemplo de Saída de Dados (JSON Structure)**

Para a IA de programação, a saída final do gerador deve ser um JSON robusto. Aqui está o exemplo completo do arquivo JSON. Este documento representa o "Estado Final" de um personagem após passar por todos os 12 passos descritos anteriormente.

Usei um personagem de exemplo nascido no mundo **Huntsland** (Gravidade Extrema, Nacionalidade Azania), para demonstrar como o sistema deve lidar com modificadores complexos, DNAMs (modificações genéticas) e o histórico de carreiras mistas (Militar e Drifter).

### **Estrutura JSON Modelo: `character_sheet_2300ad.json`**

{

  "metadata": {

    "version": "1.0",

    "gameSystem": "Traveller: 2300AD",

    "timestamp": "2023-10-27T10:00:00Z",

    "creationMode": "FullTerm"

  },

  "character": {

    "biography": {

      "name": "Jonas 'Breaker' Visser",

      "age": 34,

      "gender": "Male",

      "nationality": "Azania",

      "homeworld": {

        "name": "Huntsland",

        "system": "Zeta Herculis",

        "uwp": "D347544-B",

        "gravity": 3.08,

        "gravityCode": "Extreme",

        "environment": "Hostile (Tainted Atmosphere)",

        "originType": "Frontier",

        "dominantPath": "Soft",

        "survivalDM": \-3

      },

      "philosophy": {

        "path": "Soft",

        "description": "Biological Adaptation over Technology",

        "financialMod": \-1

      },

      "appearance": "Stocky build, dense musculature, protective nictitating membranes on eyes."

    },

    "characteristics": {

      "STR": {

        "base": 9,

        "gravityMod": 2,

        "geneticMod": 3,

        "augmentsMod": 0,

        "current": 14,

        "dm": 2

      },

      "DEX": {

        "base": 8,

        "gravityMod": \-2,

        "geneticMod": 0,

        "augmentsMod": 0,

        "current": 6,

        "dm": 0

      },

      "END": {

        "base": 8,

        "gravityMod": 2,

        "geneticMod": 2,

        "augmentsMod": 0,

        "current": 12,

        "dm": 2

      },

      "INT": {

        "base": 7,

        "current": 7,

        "dm": 0

      },

      "EDU": {

        "base": 6,

        "educationHistoryMod": 1,

        "current": 7,

        "dm": 0

      },

      "SOC": {

        "base": 5,

        "current": 5,

        "dm": \-1

      },

      "PSI": {

        "base": 0,

        "current": 0,

        "dm": \-3,

        "potential": false

      }

    },

    "skills": \[

      { "name": "Athletics", "specialty": "Strength", "level": 2 },

      { "name": "Gun Combat", "specialty": "Slug", "level": 1 },

      { "name": "Survival", "specialty": null, "level": 1 },

      { "name": "Melee", "specialty": "Unarmed", "level": 1 },

      { "name": "Vacc Suit", "specialty": null, "level": 1 },

      { "name": "Drive", "specialty": "Walker", "level": 0 },

      { "name": "Heavy Weapons", "specialty": "Man Portable", "level": 1 },

      { "name": "Streetwise", "specialty": null, "level": 0 },

      { "name": "Language", "specialty": "Afrikaans", "level": 2 },

      { "name": "Profession", "specialty": "Mining", "level": 0 }

    \],

    "traits": \[

      {

        "name": "Extreme Gravity Adaptation",

        "effect": "No penalty in high gravity. Encumbrance capacity doubled."

      }

    \],

    "augments": \[

      {

        "name": "King Ultra Variant",

        "type": "DNAM",

        "location": "Genetic",

        "techLevel": 11,

        "effects": "STR \+1D, END \+1D. Requires respirator in atmosphere \< Dense.",

        "cost": 0,

        "isNatural": true

      },

      {

        "name": "Subdermal Comm",

        "type": "Cybernetic",

        "location": "Head/Ear",

        "techLevel": 10,

        "effects": "Short range radio communication.",

        "cost": 500,

        "isNatural": false

      }

    \],

    "history": \[

      {

        "term": 1,

        "age": 22,

        "type": "Education",

        "name": "Military Academy (Azania)",

        "result": "Failed Graduation",

        "notes": "Drafted into Marines.",

        "leavingHome": false

      },

      {

        "term": 2,

        "age": 26,

        "type": "Career",

        "careerName": "Marine",

        "assignment": "Ground Assault",

        "rank": 0,

        "rankTitle": "Marine",

        "survival": true,

        "event": "Advanced Training. Gain XP in heavy weapons.",

        "advancement": false,

        "leavingHome": false,

        "leavingHomeRoll": 5

      },

      {

        "term": 3,

        "age": 30,

        "type": "Career",

        "careerName": "Marine",

        "assignment": "Ground Assault",

        "rank": 1,

        "rankTitle": "Lance Corporal",

        "survival": true,

        "event": "Life Event: New Relationship.",

        "advancement": true,

        "leavingHome": true,

        "leavingHomeRoll": 9,

        "notes": "Leaving Home success\! No longer suffers Homeworld Survival DM."

      },

      {

        "term": 4,

        "age": 34,

        "type": "Career",

        "careerName": "Drifter",

        "assignment": "Scavenger",

        "rank": 0,

        "rankTitle": "Scavenger",

        "survival": true,

        "event": "Found a valuable item.",

        "advancement": false,

        "leavingHome": true

      }

    \],

    "finances": {

      "currency": "Livres (Lv)",

      "cashOnHand": 12500,

      "pension": 0,

      "debt": 0,

      "monthlyLivingCost": 1200,

      "shipShares": {

        "count": 2,

        "valuePerShare": 500000,

        "totalValue": 1000000

      }

    },

    "equipment": \[

      {

        "name": "Stacher MP-67",

        "type": "Weapon",

        "techLevel": 10,

        "stats": "3D Damage, AP 4, Auto 4",

        "condition": "New"

      },

      {

        "name": "Inertial Armour Vest",

        "type": "Armour",

        "techLevel": 10,

        "protection": 6,

        "radProtection": 0

      },

      {

        "name": "Hand Comp",

        "type": "Electronics",

        "description": "Standard issue personal computer."

      },

      {

        "name": "Link Phone",

        "type": "Electronics",

        "description": "Standard communication device."

      }

    \],

    "social": {

      "allies": \[

        { "name": "Sgt. Mabaso", "description": "Drill Instructor from Academy" }

      \],

      "contacts": \[

        { "name": "Fixer Joe", "description": "Fence for scavenged goods on Beta Canum" }

      \],

      "enemies": \[\],

      "rivals": \[

        { "name": "Cpl. Jenkins", "description": "Competed for promotion in Term 3" }

      \]

    }

  }

}

### **Explicação dos Campos Chave para a IA**

1. **`biography.homeworld`**: Contém todos os metadados do **Passo 3**. Note os campos `gravityCode` e `survivalDM` que são essenciais para os cálculos lógicos dos passos seguintes.  
2. **`characteristics.[STAT]`**:  
   * `base`: A rolagem original (2D6).  
   * `gravityMod`: O ajuste do **Passo 4.1** (Mundo Extremo dá STR+2, DEX-2, END+2).  
   * `geneticMod`: O ajuste do **Passo 4.2** (DNAM King Ultra).  
   * `dm`: O modificador final usado em rolagens de dados (Calculado após a soma de tudo).  
3. **`augments`**: Lista mista contendo tanto modificações genéticas (`DNAM`) quanto implantes tecnológicos (`Cybernetic`). Isso reflete a natureza híbrida do cenário 2300AD.  
4. **`history` (Array)**: O coração do processo.  
   * Cada objeto representa 4 anos.  
   * A flag `leavingHome` indica o estado da variável booleana crítica descrita no **Passo 8.5**. Note que no Termo 1 e 2 é `false` (o personagem sofria penalidades de sobrevivência), e no Termo 3 virou `true` (sucesso na rolagem).  
5. **`finances.shipShares`**: Implementa a regra específica do 2300AD onde cada share vale Lv 500,000 (e não MCr 1 como no Traveller padrão), mas mantém a lógica de contagem.

---

### **Considerações Finais para a IA**

1. **Validar Dependências:** Nunca permita escolher uma perícia de Nível 1 se o personagem não tiver o pré-requisito lógico (embora Traveller permita, a UI deve alertar).  
2. **Prioridade de Regras:** 2300AD sempre sobrescreve Core Rulebook. Se Core diz "Ship Share \= MCr 1" e 2300AD diz "Lv 500k", use 2300AD.  
3. **Aliados/Inimigos:** Certifique-se de que cada NPC gerado tenha um nome provisório ou tag (ex: "Rival: Instrutor da Academia") para que o Mestre possa preencher depois.

