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

---

Aqui estão os dados completos da **Injury Table (Tabela de Lesões)** e as regras de tratamento médico, integrando o *Traveller Core Rulebook Update 2022* com as regras específicas de substituição cibernética e custos do *2300AD Book 1*.

---

### INJURY TABLE (Tabela de Lesões)
**Trigger:** Acionada quando um evento de carreira ou mishap diz "Roll on the Injury Table".
**Input:** Rolar 1D6.

| 1D6 | Resultado | Efeito Mecânico (Aplicação Imediata) |
| :--- | :--- | :--- |
| **1** | **Nearly Killed** | Rolar 1D6: Reduzir uma característica física (STR, DEX ou END) por esse valor. Reduzir as outras duas características físicas em 2 pontos cada. |
| **2** | **Severely Injured** | Rolar 1D6: Reduzir uma característica física (escolha do jogador) por esse valor. |
| **3** | **Missing Eye or Limb** | Escolha do jogador: Perdeu um Olho ou um Membro. Reduzir **STR** ou **DEX** em 2 pontos (permanente até clonagem/cibernética). |
| **4** | **Scarred** | Cicatrizes e ferimentos. Reduzir qualquer característica física (STR, DEX, END) em 2 pontos. |
| **5** | **Injured** | Ferimento moderado. Reduzir qualquer característica física em 1 ponto. |
| **6** | **Lightly Injured** | Sem efeito mecânico permanente. Apenas narrativo. |

---

### REGRAS E LÓGICA DE TRATAMENTO (Rules Engine)

A IA deve apresentar ao usuário opções de como lidar com a lesão assim que o resultado for gerado. Existem duas rotas principais: **Tratamento Médico (Dívida)** ou **Augmentação (Regra 2300AD)**.

#### Opção A: A Regra de Augmentação (2300AD Special Rule)
*Referência: 2300AD Book 1, pg. 7 e 10.*

Se o personagem sofrer uma lesão (qualquer resultado na tabela acima), o jogador pode optar por uma solução radical para se manter na carreira e ignorar as penalidades de atributos.

*   **Ação:** O jogador aceita uma prótese/implante imediato.
*   **Custo:** O personagem perde **1 Rolagem de Benefício (Mustering Out Roll)** no final da criação.
*   **Benefício 1:** Ignora **todas** as reduções de atributos aplicadas pela *Injury Table* (o implante compensa a perda).
*   **Benefício 2:** Se a lesão foi resultado de uma falha de Sobrevivência (Mishap) que ejetaria o personagem da carreira, ele **NÃO é ejetado** e pode continuar na mesma carreira.
*   **Item Recebido:** O personagem ganha um implante cibernético relevante (ex: Olho Cibernético, Braço Cibernético ou Perna Cibernética de TL 10).

#### Opção B: Tratamento Médico e Dívida (Medical Care)
*Referência: Core Rulebook Update 2022, pg. 48 e 2300AD Book 1 para custos.*

Se o jogador não quiser a cibernética (ou não tiver rolagens de benefício para gastar), ele aceita o dano nos atributos e tenta pagar para curá-lo.

1.  **Custo de Restauração:**
    *   Regra Base: Restaurar 1 ponto de atributo perdido custa **Lv 5,000**.
    *   Regra 2300AD (Regeneração em Tanque):
        *   Membro/Órgão Maior perdido (Resultado 3): **Lv 10,000**.
        *   Órgão Crítico: **Lv 30,000**.
        *   Clonagem de corpo inteiro: **Lv 100,000**.

2.  **Quem Paga a Conta? (Medical Bills Table):**
    Se a lesão ocorreu durante um termo de serviço, a organização pode pagar parte da conta. A IA deve rolar **2D6 + Rank Atual** e consultar a tabela abaixo:

| Organização (Carreira) | 2D6+Rank < 4 | 2D6+Rank 4–7 | 2D6+Rank 8–11 | 2D6+Rank 12+ |
| :--- | :--- | :--- | :--- | :--- |
| **Army, Navy, Marines, Agent** | Paga 0% | Paga 75% | Paga 100% | Paga 100% |
| **Scout, Rogue, Drifter** | Paga 0% | Paga 0% | Paga 50% | Paga 75% |
| **Outras (Citizen, Merchant, etc)** | Paga 0% | Paga 50% | Paga 75% | Paga 100% |

3.  **Dívida Médica (Medical Debt):**
    Qualquer valor não coberto pela organização e não pago com o dinheiro inicial (Cash) do personagem torna-se **Dívida**.
    *   *Output:* Adicionar valor ao campo `MedicalDebt` na ficha. O personagem começa o jogo devendo esse valor (geralmente para um banco ou hospital corporativo).

---

### Resumo do Fluxo Lógico para a IA

1.  **Input:** Evento chama `InjuryTable()`.
2.  **Processo:** Rolar 1D6 -> Determinar `StatLoss` (ex: STR -2).
3.  **Decisão do Usuário:**
    *   `[Button] Aceitar Cibernética`:
        *   Remover 1 `BenefitRoll`.
        *   Anular `StatLoss`.
        *   Adicionar `Augment` à ficha.
        *   Manter na Carreira (se Mishap).
    *   `[Button] Tratamento Médico`:
        *   Aplicar `StatLoss` temporariamente.
        *   Calcular `RepairCost` (StatLoss * 5000).
        *   Rolar `MedicalBills` (2D6+Rank). Deduzir porcentagem coberta.
        *   Adicionar restante ao `MedicalDebt`.
        *   *Nota:* O usuário pode escolher pagar a dívida com o "Cash" ganho no Passo 9 (Mustering Out), restaurando os atributos. Se não pagar, começa o jogo com os atributos reduzidos e a dívida.


        ---

Aqui está a estrutura em árvore das perícias (skills) e suas especializações, ajustada especificamente para o cenário de **2300AD** (onde tecnologias como *Grav* são substituídas por *Vectored Thrust* e *Jump Drive* por *Stutterwarp*), sem os atributos relacionados.

# Árvore de Perícias (Traveller: 2300AD)

*   **Admin** (Administração)
*   **Advocate** (Advocacia/Direito)
*   **Animals** (Animais)
    *   Handling (Lidar/Adestrar)
    *   Training (Treinamento)
    *   Veterinary (Veterinária)
*   **Art** (Arte)
    *   Holography (Holografia)
    *   Instrument (Instrumento Musical)
    *   Performer (Performance/Atuação)
    *   Visual Media (Artes Visuais)
    *   Write (Escrita)
*   **Astrogation** (Astrogacia)
*   **Athletics** (Atletismo)
    *   Dexterity (Agilidade/Equilíbrio)
    *   Endurance (Resistência/Corrida)
    *   Strength (Força/Levantamento)
*   **Broker** (Negociante)
*   **Carouse** (Socializar/Festa)
*   **Deception** (Enganação)
*   **Diplomat** (Diplomacia)
*   **Drive** (Pilotagem de Solo)
    *   Hover (Hovercraft)
    *   Mole (Perfuradores/Tuneladoras)
    *   Track (Lagartas/Tanques)
    *   Walker (Andadores/Mechs)
    *   Wheel (Rodas)
*   **Electronics** (Eletrônica)
    *   Comms (Comunicações)
    *   Computers (Computadores/Hacking)
    *   Remote Ops (Operações Remotas/Drones)
    *   Sensors (Sensores)
*   **Engineer** (Engenharia)
    *   Life Support (Suporte de Vida)
    *   M-Drive (Manobra/Propulsão de Reação)
    *   Power (Energia/Reatores)
    *   Stutterwarp (Motor de Dobra - *Substitui J-Drive*)
*   **Explosives** (Explosivos)
*   **Flyer** (Pilotagem Aérea)
    *   Airship (Dirigíveis/Balões)
    *   Ornithopter (Ornitópteros)
    *   Rotor (Helicópteros)
    *   Vectored Thrust (Empuxo Vetorado/Aerodynes - *Substitui Grav*)
    *   Wing (Asa Fixa/Jatos)
*   **Gambler** (Jogos de Azar)
*   **Gun Combat** (Combate Armado)
    *   Archaic (Arcaicas)
    *   Energy (Armas de Energia - Lasers/Plasma)
    *   Slug (Balísticas - Armas de fogo convencionais)
*   **Gunner** (Artilharia de Nave)
    *   Capital (Armas Capitais/Baías)
    *   Ortillery (Bombardeio Orbital)
    *   Screen (Defesas/Escudos)
    *   Turret (Torres de Artilharia)
*   **Heavy Weapons** (Armas Pesadas)
    *   Artillery (Artilharia de Campo)
    *   Man Portable (Portáteis)
    *   Vehicle (Montadas em Veículos)
*   **Investigate** (Investigação)
*   **Jack-of-all-Trades** (Pau pra toda obra)
*   **Language** (Idiomas)
    *   *Deve ser especificado (ex: French, German, Spanish, Pentapod, Zhargon)*
*   **Leadership** (Liderança)
*   **Mechanic** (Mecânica)
*   **Medic** (Medicina)
*   **Melee** (Combate Corpo-a-Corpo)
    *   Blade (Lâminas)
    *   Bludgeon (Contundentes)
    *   Unarmed (Desarmado)
*   **Navigation** (Navegação)
*   **Persuade** (Persuasão)
*   **Pilot** (Pilotagem Espacial)
    *   Capital Ships (Naves Capitais > 5.000 ton)
    *   Small Craft (Naves Pequenas < 100 ton)
    *   Spacecraft (Naves Espaciais 100-5.000 ton)
*   **Profession** (Profissão)
    *   Belter (Minerador de Asteroides)
    *   Biologicals (Engenharia Biológica)
    *   Civil Engineering (Engenharia Civil)
    *   Construction (Construção)
    *   Hydroponics (Hidroponia)
    *   Polymers (Polímeros)
    *   *Outras profissões civis variadas*
*   **Recon** (Reconhecimento)
*   **Science** (Ciências)
    *   Archaeology (Arqueologia)
    *   Astronomy (Astronomia)
    *   Biology (Biologia)
    *   Chemistry (Química)
    *   Cosmology (Cosmologia)
    *   Cybernetics (Cibernética)
    *   Economics (Economia)
    *   Genetics (Genética)
    *   History (História)
    *   Linguistics (Linguística)
    *   Philosophy (Filosofia)
    *   Physics (Física)
    *   Planetology (Planetologia)
    *   Psionicology (Psionicologia)
    *   Psychology (Psicologia)
    *   Robotics (Robótica)
    *   Sophontology (Sofontologia)
    *   Xenology (Xenologia)
*   **Seafarer** (Marinharia/Náutica)
    *   Ocean Ship (Navios Oceânicos)
    *   Personal (Veículos Pessoais Aquáticos)
    *   Sail (Vela)
    *   Submarine (Submarinos)
*   **Stealth** (Furtividade)
*   **Steward** (Comissário/Mordomo)
*   **Streetwise** (Manha de Rua)
*   **Survival** (Sobrevivência)
*   **Tactics** (Táticas)
    *   Military (Militar/Terrestre)
    *   Naval (Naval/Espacial)
*   **Vacc Suit** (Traje Espacial)

        ---


        Com base no *MgT 2E - Core Rulebook Update 2022* e nas adaptações específicas de *2300AD - Book 1*, aqui está o detalhamento minucioso das regras de aquisição e aumento de perícias durante a criação de personagens.

A regra fundamental para interpretar as tabelas é distinguir entre **"Aumento"** (quando a tabela lista apenas o nome da perícia, ex: "Gun Combat") e **"Nível Fixo"** (quando a tabela lista um número, ex: "Gun Combat 1" ou "Gun Combat 0").

Aqui está a aplicação detalhada para cada um dos seus cenários:

### 1. Ganhar uma perícia nova que você não era treinado

*   **Se a tabela diz apenas o nome (ex: "Vacc Suit"):** Você ganha a perícia no **Nível 1**.
*   **Se a tabela diz o nome e nível 0 (ex: "Vacc Suit 0"):** Você ganha a perícia no **Nível 0**. Isso remove a penalidade de -3 para testes não treinados, tornando-o competente, mas sem bônus.
*   **Se a tabela diz o nome e nível 1+ (ex: "Vacc Suit 1"):** Você ganha a perícia diretamente no **Nível 1**.

### 2. Ganhar uma especialização de uma perícia não treinada

Algumas perícias (como *Engineer*, *Science*, *Animals*) exigem especializações.
*   **Nível 0:** Geralmente, o Nível 0 cobre a perícia de forma ampla. Se você tem *Engineer 0*, você tem competência básica em todos os tipos de engenharia sem penalidade.
*   **Nível 1 (O momento da escolha):** No momento em que você adquire o **Nível 1** em uma perícia com especializações, você deve escolher uma específica (ex: *Engineer (J-drive)*).
    *   Você terá Nível 1 naquela especialização específica.
    *   Para todas as outras especializações dessa mesma perícia, você continua sendo considerado Nível 0 (competente, mas sem bônus).
*   **Se a tabela der uma especialização específica (ex: "Pilot (Small Craft)"):** Você ganha essa especialização específica no Nível 1.

### 3. Se já tem treinamento (Nível 0) e ganha a perícia novamente

*   **Se a tabela diz apenas o nome (ex: "Vacc Suit"):** A perícia sobe de Nível 0 para **Nível 1**.
*   **Se a tabela diz nível 0 (ex: "Vacc Suit 0"):** **Nada acontece.** Níveis iguais não se somam. Você permanece no Nível 0. O *Book 1* deixa isso explícito no exemplo de Jasmine Anderson: *"Note that this Mechanic 0 does not stack with the Mechanic 0 gained from her homeworld background skills"*.
*   **Se a tabela diz nível 1 (ex: "Vacc Suit 1"):** A perícia sobe para o **Nível 1**, pois o nível listado é superior ao seu atual.

### 4. Ganhar a mesma perícia múltiplas vezes (Acúmulo)

*   **Regra de Aumento:** Se a tabela lista apenas o nome (sem número), você aumenta o nível existente em **+1**.
    *   *Exemplo:* Você tem *Gun Combat 1*. Você rola na tabela e cai "Gun Combat". Você agora tem *Gun Combat 2*.
*   **Regra de Nível Fixo:** Se a tabela lista um número (ex: "Streetwise 1"), você só recebe o benefício se o número listado for **maior** que o seu nível atual.
    *   *Exemplo:* Você tem *Streetwise 1*. Você rola um evento que dá "Streetwise 1". **Nada acontece**, pois você já possui esse nível.
    *   *Exemplo:* Você tem *Streetwise 1*. Você rola um evento que dá "Streetwise 2". Você sobe para *Streetwise 2*.
*   **Limite Máximo:** Durante a criação de personagem, nenhuma perícia pode ultrapassar o **Nível 4**. Qualquer aumento além disso é perdido.

### 5. Comportamento das perícias na Educação Universitária

A Universidade segue regras específicas de entrada e graduação:
1.  **Entrada:** Ao entrar, você escolhe duas perícias da lista da Universidade. Você define uma para ser **Nível 0** e a outra para ser **Nível 1**.
2.  **Graduação (Sucesso):** Se você graduar, você aumenta o nível de **ambas** as perícias escolhidas anteriormente em **+1**.
    *   A de Nível 0 vira Nível 1.
    *   A de Nível 1 vira Nível 2.

### 6. Comportamento das perícias na Educação Militar (Academia)

A Academia Militar funciona de forma ligeiramente diferente:
1.  **Entrada:** Você recebe **todas** as perícias de "Service Skills" da carreira militar escolhida (Army, Navy ou Marines) no **Nível 0**. Se você já tiver alguma delas em nível maior, mantém o nível maior.
2.  **Graduação (Sucesso):** Se você graduar, você escolhe quaisquer **três** perícias dessa lista de Service Skills e as aumenta para o **Nível 1** (assumindo que estavam no 0). Se você falhar na graduação, você fica apenas com as perícias no nível 0 que ganhou na entrada.

### 7. Skills do Primeiro Termo (Basic Training) vs. Skills Existentes

No *Traveller*, você geralmente ganha algumas perícias de antecedente (Background Skills) ou do mundo natal antes de entrar na primeira carreira.

*   **Regra do Primeiro Termo:** Na sua primeira carreira (se você não foi para a Universidade/Academia), você recebe todas as perícias da tabela "Service Skills" daquela carreira no **Nível 0**.
*   **Conflito com Antecedentes:** Se você já possui uma perícia (vinda do seu *Homeworld* ou *Background*) e ela aparece na lista de *Service Skills* do seu primeiro termo:
    *   **Você não ganha benefícios adicionais.** A perícia **não** sobe para nível 1. Ela permanece no nível que estava (seja 0 ou 1). O treinamento básico serve apenas para elevar quem não tem a perícia até o nível de competência básica (0).

### Resumo Lógico para a IA

1.  **Input:** `CurrentSkillLevel`, `NewSkillEntry`
2.  **Lógica:**
    *   SE `NewSkillEntry` for do tipo "Nome Apenas" (ex: "Pilot"): `CurrentSkillLevel` += 1.
    *   SE `NewSkillEntry` for do tipo "Nível Fixo" (ex: "Pilot 1"):
        *   SE `NewSkillEntry.Level` > `CurrentSkillLevel`: `CurrentSkillLevel` = `NewSkillEntry.Level`.
        *   SENÃO: Mantenha `CurrentSkillLevel` (sem alteração).
3.  **Restrição Global:** Se `CurrentSkillLevel` > 4, então `CurrentSkillLevel` = 4.
4.  **Limite Total de Perícias:** A soma de todos os níveis de perícias não pode exceder `3 * (INT + EDU)`.

---

Aqui está a estrutura completa da **Tabela de Eventos de Educação (Pre-Career Events)**, formatada com instruções lógicas para a implementação na IA.

Esta tabela é usada durante os termos em **University** (Universidade) ou **Military Academy** (Academia Militar).

---

### Tabela de Eventos de Educação (Pre-Career Events)

**Trigger:** Acionada uma vez por termo de educação.
**Input:** Rolar 2D6.

- **2 | Psionic Contact.** You are approached by an underground psionic group.
-- O sistema deve marcar a flag `PsionicPotential = TRUE` na ficha do personagem.
-- O sistema deve exibir uma mensagem informando que o personagem agora é elegível para testar seu atributo PSI e, se desejar, tentar ingressar na carreira **Psion** em termos futuros (se o Mestre/Campanha permitir).

- **3 | Tragedy.** Something terrible happens.
-- O sistema deve definir a variável `Graduated = FALSE`.
-- O sistema deve impedir que o personagem receba os benefícios de graduação (bônus de perícias e EDU) no final deste termo.
-- O personagem é ejetado da educação e deve prosseguir para a fase de Carreira no próximo termo (sem diploma).

- **4 | Prank Gone Wrong.** A prank goes wrong. Roll SOC 8+.
-- O sistema deve solicitar uma rolagem de **SOC** com dificuldade **8+**.
--- **Se Sucesso:** O personagem ganha um **Rival**. Adicionar NPC à lista de relacionamentos.
--- **Se Falha:** O personagem ganha um **Inimigo**. Adicionar NPC à lista.
--- **Se Falha Crítica (Resultado natural 2 nos dados):** O personagem é expulso. Definir `Graduated = FALSE`. O personagem deve obrigatoriamente escolher a carreira **Prisoner** (Prisioneiro) no próximo termo.

- **5 | Partying.** You enjoy your time socialising.
-- O sistema deve adicionar a perícia **Carouse 1** à ficha.
--- Se o personagem já tiver Carouse 0, sobe para 1.
--- Se já tiver Carouse 1 ou mais, não há efeito adicional (ou sobe +1 dependendo da interpretação do Mestre, mas a regra padrão é nível fixo se houver número). *Regra segura: Aumentar nível existente em +1 ou conceder nível 1.*

- **6 | Friends.** You make many friends.
-- O sistema deve rolar **1D3** (1d6 dividido por 2, arredondado para cima).
-- O resultado define a quantidade de **Aliados** que o personagem ganha.
-- O sistema deve solicitar ao usuário que nomeie ou defina esses Aliados (ex: "Colegas de turma").

- **7 | Life Event.** Something happens in your personal life.
-- O sistema deve acionar a função `RollLifeEventTable()` (Tabela de Eventos de Vida Universal).
-- Aplicar o resultado daquela tabela.

- **8 | Political Movement.** You get involved in politics. Roll SOC 8+.
-- O sistema deve solicitar uma rolagem de **SOC** com dificuldade **8+**.
--- **Se Sucesso:** O personagem se torna uma figura de destaque. Ganha **1 Aliado** e **1 Inimigo**.
--- **Se Falha:** O personagem não ganha nada (apenas envolvimento narrativo).

- **9 | Hobby.** You pick up a new interest.
-- O sistema deve exibir a lista completa de perícias disponíveis no jogo, **exceto** *Jack-of-all-Trades*.
-- O sistema deve permitir que o usuário selecione uma perícia dessa lista.
-- O sistema adiciona a perícia selecionada no **Nível 0** (se o personagem ainda não a tiver). Se já tiver, aumenta para o próximo nível (Regra de Hobby geralmente concede nível 0, mas em criação de personagem, ganhar a mesma coisa aumenta o nível). *Implementação segura: Adicionar Skill 0.*

- **10 | Tutor.** A tutor takes an interest in your studies.
-- O sistema deve listar as perícias que o personagem está estudando ou obteve *neste termo* de educação.
-- O usuário seleciona uma dessas perícias.
-- O sistema solicita uma rolagem (Check) usando a perícia selecionada com dificuldade **9+** (geralmente usando INT ou EDU).
--- **Se Sucesso:** Aumentar a perícia selecionada em **+1 Nível**. O personagem ganha o Tutor como **Rival** (ciúmes ou exigência excessiva).
--- **Se Falha:** Nenhum efeito mecânico.

- **11 | War.** War comes (or a draft is instituted).
-- O sistema deve verificar o atributo SOC.
-- **Se SOC >= 9:** O sistema exibe a opção: `[Evitar a Guerra]`. Se o usuário clicar, o evento é ignorado e a graduação prossegue normalmente.
-- **Se SOC < 9 (ou usuário escolher participar):**
--- Definir `Graduated = FALSE` (O personagem não se forma).
--- O sistema exibe duas opções: `[Fugir (Drifter)]` ou `[Alistamento (Draft)]`.
---- **Se Fugir:** O próximo termo deve ser obrigatoriamente e automaticamente na carreira **Drifter** , sem teste de qualificação.
---- **Se Alistamento:** O sistema rola 1D6 automaticamente:
----- 1-3: Carreira **Army**.
----- 4-5: Carreira **Marine**.
----- 6: Carreira **Navy**.
----- O personagem entra nessa carreira no próximo termo automaticamente (sem teste de qualificação).

- **12 | Recognition.** You are recognised for your academic or social achievements.
-- O sistema deve aumentar o atributo **SOC** em **+1**.


---


Aqui está a estrutura completa da **Tabela de Eventos de Vida (Life Events)**, formatada com instruções lógicas para a implementação na IA.

Esta tabela é "chamada" por outras tabelas de carreira (geralmente quando o resultado é 7), mas também pode ser acessada diretamente por certas regras de criação (como o evento "Unusual Encounter" do Drifter).

---

### Tabela de Eventos de Vida (Life Events)

**Trigger:** Acionada quando um Evento de Carreira resulta em 7 (Life Event) ou instruções específicas de outras tabelas.
**Input:** Rolar 2D6.

- **2 | Sickness or Injury.** You are injured or become sick.
-- O sistema deve acionar a função `RollInjuryTable()`.
-- Aplicar os resultados de perda de atributos ou dívida médica conforme definido na lógica de Lesões.

- **3 | Birth or Death.** Someone close to you dies or is born.
-- O sistema deve exibir um campo de texto para o usuário descrever o evento (narrativo).
-- Não há efeito mecânico direto, mas o sistema deve salvar essa nota no histórico do personagem.

- **4 | Ending of Relationship.** A romantic relationship ends badly.
-- O sistema deve adicionar um novo NPC à lista de relacionamentos.
-- O usuário deve escolher o tipo: **Rival** ou **Inimigo** (Enemy).
-- O sistema solicita ao usuário que nomeie ou descreva esse NPC.

- **5 | Improved Relationship.** A romantic relationship deepens.
-- O sistema deve adicionar um novo NPC à lista de relacionamentos.
-- O tipo do NPC é fixado como **Aliado** (Ally).
-- O sistema solicita ao usuário que nomeie ou descreva esse Aliado.

- **6 | New Relationship.** You become involved in a romantic relationship.
-- O sistema deve adicionar um novo NPC à lista de relacionamentos.
-- O tipo do NPC é fixado como **Aliado** (Ally).
-- O sistema solicita ao usuário que nomeie ou descreva esse Aliado.

- **7 | New Contact.** You gain a new contact.
-- O sistema deve adicionar um novo NPC à lista de relacionamentos.
-- O tipo do NPC é fixado como **Contato** (Contact).
-- O sistema solicita ao usuário que nomeie ou descreva esse Contato.

- **8 | Betrayal.** You are betrayed by a friend.
-- O sistema deve verificar a lista atual de **Aliados** e **Contatos**.
--- **Se a lista não estiver vazia:** O sistema solicita que o usuário selecione um Aliado ou Contato existente. Este NPC deve ter seu tipo alterado para **Rival** ou **Inimigo** (Enemy).
--- **Se a lista estiver vazia:** O sistema cria um novo NPC do tipo **Rival** ou **Inimigo** (Enemy).

- **9 | Travel.** You move to another world.
-- O sistema deve definir uma variável temporária `NextQualificationBonus = 2`.
-- Este bônus (+2) deve ser aplicado automaticamente à rolagem de **Qualificação** (Qualification Roll) da próxima carreira que o usuário tentar entrar.
-- O sistema deve solicitar ao usuário o nome do novo mundo ou selecioná-lo de uma lista (opcional, para sabor narrativo).

- **10 | Good Fortune.** Something good happens to you.
-- O sistema deve incrementar a variável `BenefitRollMod` em +1 (ou criar um token de "Bônus").
-- O efeito prático: O usuário ganha **DM+2** em *uma* rolagem de Benefício (Benefit Roll) de sua escolha durante a fase de **Mustering Out**. O sistema deve perguntar ao usuário quando ele quer usar esse bônus no final da criação.

- **11 | Crime.** You commit or are the victim of a crime.
-- O sistema deve apresentar duas opções para o usuário (Botões):
--- **Opção A: Perder um Benefício.** Se escolhido, decrementar a variável `TotalBenefitRolls` em -1.
--- **Opção B: Ir para a Prisão.** Se escolhido, o sistema força a próxima carreira (Next Term) a ser **Prisoner** (Prisioneiro). O teste de qualificação é ignorado/automático.

- **12 | Unusual Event.** Something weird happens.
-- O sistema deve rolar 1D6 automaticamente e aplicar o sub-resultado abaixo:
--- **1 (Psionics):** O personagem encontra um instituto psíquico.
---- Marcar flag `PsionicPotential = TRUE`.
---- O usuário pode escolher entrar na carreira **Psion** no próximo termo (se o cenário permitir).
--- **2 (Aliens):** O personagem passa tempo com uma espécie alienígena.
---- Adicionar perícia **Science 1** (O usuário escolhe especialização, ex: *Xenology* ou *Sophontology*).
---- Adicionar um novo NPC do tipo **Contato** (Alien).
--- **3 (Alien Artefact):** O personagem encontra um dispositivo estranho.
---- Adicionar um item "Alien Artefact" ao inventário. (Sem regras específicas, item narrativo/valioso).
--- **4 (Amnesia):** Algo aconteceu, mas você não lembra.
---- Salvar nota no histórico: "Perdeu a memória de um evento neste termo."
--- **5 (Contact with Government):** Contato com altos escalões.
---- O sistema deve adicionar um novo NPC do tipo **Contato**.
---- Nota automática do NPC: "Alto Oficial do Governo/Império".
---- Aumentar a perícia **Diplomat** ou **Admin** em +1 nível (Regra opcional sugerida para refletir a interação, ou apenas manter o contato).
--- **6 (Ancient Technology):** Você tem algo mais antigo que a humanidade.
---- Adicionar item "Ancient Artefact" ao inventário.

---

Aqui está a estrutura completa da **Tabela de Lesões (Injury Table)**, com as regras lógicas detalhadas para a implementação na IA.

Esta tabela é acionada principalmente por **Mishaps** (Desgraças) de carreira ou pelo resultado 2 na tabela de **Life Events**.

Em *2300AD*, a lógica de lesão possui um desvio crítico (Branching Logic) chamado **"The Augmentation Rule"**, que deve ser apresentado ao usuário imediatamente após a determinação da lesão.

---

### Tabela de Lesões (Injury Table)

**Trigger:** Acionada por falha na Sobrevivência (Mishap) ou Evento de Vida (Resultado 2).
**Input:** Rolar 1D6.

#### Passo 1: Determinar a Gravidade (Logic Calculation)

- **1 | Nearly Killed.**
-- O sistema deve rolar 1D6 (chamaremos de `MajorLoss`).
-- O sistema deve reduzir uma característica física (STR, DEX ou END) escolhida pelo usuário em um valor igual a `MajorLoss`.
-- O sistema deve reduzir as outras duas características físicas em 2 pontos cada.
-- *Flag:* `InjurySeverity = Critical`.

- **2 | Severely Injured.**
-- O sistema deve rolar 1D6 (chamaremos de `MajorLoss`).
-- O sistema deve reduzir uma característica física (STR, DEX ou END) escolhida pelo usuário em um valor igual a `MajorLoss`.
-- *Flag:* `InjurySeverity = Severe`.

- **3 | Missing Eye or Limb.**
-- O sistema deve reduzir **STR** ou **DEX** (escolha do usuário) em 2 pontos.
-- *Narrativa:* O usuário deve escolher se perdeu um Olho ou um Membro.
-- *Flag:* `InjurySeverity = Severe`.

- **4 | Scarred.**
-- O sistema deve reduzir **STR**, **DEX** ou **END** (escolha do usuário) em 2 pontos.
-- *Flag:* `InjurySeverity = Moderate`.

- **5 | Injured.**
-- O sistema deve reduzir **STR**, **DEX** ou **END** (escolha do usuário) em 1 ponto.
-- *Flag:* `InjurySeverity = Minor`.

- **6 | Lightly Injured.**
-- Nenhum efeito mecânico permanente. O fluxo encerra aqui (não há custos médicos nem opção de augmentação necessária).

---

#### Passo 2: Regras de Tratamento e Decisão (2300AD Rules Engine)

*Se o resultado foi 1 a 5, o sistema deve apresentar o seguinte menu de decisão ao usuário:*

**Opção A: Aceitar Augmentação (Cibernética/Prótese)**
*Esta é a regra específica de 2300AD que permite salvar o personagem.*
- **Requisito:** O personagem deve ter pelo menos 1 `BenefitRoll` acumulado (ou aceitar ficar com saldo negativo/zero se for o primeiro termo).
- **Ação Lógica:**
  1.  Decrementar `TotalBenefitRolls` em -1.
  2.  **Anular** todas as reduções de atributos calculadas no Passo 1 (O implante compensa a perda).
  3.  Adicionar um item à lista de equipamentos/augments: "Prosthetic Limb/Eye" (Inicialmente cosmético/funcional, sem bônus extras além de restaurar a função).
  4.  **Se** a lesão foi causada por um Mishap que forçaria a saída da carreira:
      -- Definir `ForceEjection = FALSE` (O personagem tem permissão para continuar na carreira).
  5.  Exibir mensagem: *"Você sacrificou um benefício futuro para pagar por uma prótese avançada e terapia genética imediata. Você está totalmente recuperado e apto para o serviço."*

**Opção B: Tratamento Médico Padrão (Dívida Médica)**
*O personagem recusa a cibernética ou prefere o tratamento biológico natural, arcando com os custos.*
- **Ação Lógica:**
  1.  Aplicar as reduções de atributos calculadas no Passo 1.
  2.  Calcular o `RestorationCost`:
      -- Regra Base: 5.000 Lv (Livres) para cada ponto de atributo perdido.
  3.  Calcular a cobertura do empregador (`EmployerCoverage`):
      -- Rolar **2D6 + Rank Atual**. Consultar a tabela abaixo:
      -- **Army/Navy/Marine:** <4: 0% | 4-7: 75% | 8-11: 100% | 12+: 100%
      -- **Agent/Noble/Scholar/Entertainer/Merchant/Citizen:** <4: 0% | 4-7: 50% | 8-11: 75% | 12+: 100%
      -- **Scout/Rogue/Drifter/Spaceborne:** <8: 0% | 8-11: 50% | 12+: 75%
  4.  Calcular `MedicalDebt`:
      -- `MedicalDebt` = `RestorationCost` * (1 - `EmployerCoverage`).
  5.  Adicionar `MedicalDebt` à ficha do personagem.
  6.  Se a lesão foi um Mishap que força a saída:
      -- Definir `ForceEjection = TRUE` (O personagem é dispensado por motivos médicos).
  7.  *Nota:* O usuário poderá pagar essa dívida usando o dinheiro inicial (Mustering Out Cash) no final da criação para restaurar os atributos. Se não pagar, começa o jogo com os atributos reduzidos e a dívida financeira.

---

### Exemplo de Fluxo de Dados (JSON Output)

```json
{
  "event": "Injury",
  "roll": 2,
  "description": "Severely Injured",
  "mechanics": {
    "statLossRoll": 4,
    "targetStat": "END",
    "lossAmount": 4
  },
  "decision": {
    "type": "USER_INPUT_REQUIRED",
    "options": [
      {
        "id": "AUGMENT",
        "label": "Aceitar Prótese Cibernética",
        "cost": "1 Benefit Roll",
        "effect": "Ignora perda de END. Mantém na carreira.",
        "condition": "TotalBenefitRolls > 0"
      },
      {
        "id": "MEDICAL_CARE",
        "label": "Tratamento Médico Convencional",
        "cost": "Medical Debt (Calculado baseada no Rank)",
        "effect": "Perde 4 END temporariamente. Deve pagar Lv 20.000 (menos seguro) para recuperar. Ejetado da carreira."
      }
    ]
  }
}
```

---

#Regras para tabelas de eventos e mishaps das carreiras:

---

# 1. CAREER: AGENT (Agente)
**Fontes:** *Traveller Core Rulebook Update 2022* (pág. 22) e *2300AD Book 1* (Regras de Augmentação).

### Estrutura de Dados
*   **Assignments (Sub-carreiras):**
    1.  *Law Enforcement* (Polícia/Detetive)
    2.  *Intelligence* (Espião/Analista)
    3.  *Corporate* (Espionagem Industrial/Segurança)
*   **Qualificação:** INT 6+.
    *   *DM:* -1 por carreira anterior.

---

### Tabela de Desgraças (Mishap Table)
*Acionada se a rolagem de Sobrevivência falhar. O padrão é a ejeção da carreira, salvo regra de Augmentação.*

**Input:** Rolar 1D6.

*   **1 | Severely Injured.**
    *   **Lógica do Sistema:**
        1.  Chamar função `RollInjuryTable()`.
        2.  Apresentar o resultado da lesão e o menu de decisão **"Augmentation vs Medical Care"** (Regra 2300AD).
        3.  **Se** Usuário escolher *Augmentation*:
            *   Remover 1 `BenefitRoll`.
            *   Anular penalidades de atributos.
            *   Definir `Ejected = FALSE` (Personagem continua na carreira).
            *   Exibir: "Você aceitou um implante para continuar na ativa."
        4.  **Se** Usuário escolher *Medical Care*:
            *   Aplicar penalidades de atributos e dívida.
            *   Definir `Ejected = TRUE`.
            *   Remover o Benefício deste termo (`TermBenefit = FALSE`).

*   **2 | Compromised.**
    *   **Texto:** Um criminoso ou alvo oferece um acordo.
    *   **Input do Usuário:** Botões `[Aceitar Acordo]` ou `[Recusar e Ser Exposto]`.
    *   **Lógica (Aceitar):**
        *   Definir `Ejected = TRUE` (Sai da carreira).
        *   **Não** rolar mais nada na tabela de Mishap (saiu "por vontade própria").
        *   Remover o Benefício deste termo.
        *   *Nota:* O personagem evita inimigos/lesões, mas sai de mãos vazias.
    *   **Lógica (Recusar):**
        *   Chamar `RollInjuryTable()` **duas vezes**. O sistema deve aplicar o **menor** resultado (menor gravidade).
        *   Adicionar 1 NPC: `Type = Enemy`, `Note = "Criminoso ou alvo que você não aceitou subornar"`.
        *   Adicionar +1 nível em qualquer perícia que o personagem já possua (`SkillChoice`).
        *   Definir `Ejected = TRUE`.
        *   Remover o Benefício deste termo.

*   **3 | Investigation Blown.**
    *   **Lógica do Sistema:**
        1.  Solicitar Check: `Advocate 8+` (Modificador de INT ou EDU).
        2.  **Se Sucesso:**
            *   Definir `Ejected = TRUE`.
            *   Manter o Benefício deste termo (`TermBenefit = TRUE`).
            *   Mensagem: "Você foi afastado, mas conseguiu limpar seu nome o suficiente para manter sua pensão."
        3.  **Se Falha (mas não crítica):**
            *   Definir `Ejected = TRUE`.
            *   Remover o Benefício deste termo.
        4.  **Se Falha Crítica (2 natural nos dados):**
            *   Definir `Ejected = TRUE`.
            *   Remover o Benefício deste termo.
            *   Definir `NextCareerForce = "Prisoner"` (Obrigatório ir para Prisão no próximo termo).

*   **4 | Hunted.**
    *   **Lógica do Sistema:**
        1.  Adicionar 1 NPC: `Type = Enemy`, `Note = "Pessoas poderosas que querem te silenciar"`.
        2.  Adicionar/Aumentar Perícia: `Deception` para Nível 1 (ou +1 se já tiver).
        3.  Definir `Ejected = TRUE`.
        4.  Remover o Benefício deste termo.

*   **5 | Work Comes Home.**
    *   **Lógica do Sistema:**
        1.  Verificar lista de `Allies`, `Contacts` ou `Family` no histórico.
        2.  **Se Lista > 0:** O usuário escolhe um NPC. O sistema marca no histórico desse NPC: "Ferido/Prejudicado devido ao meu trabalho". (Narrativo).
        3.  **Se Lista == 0:** O personagem sofre o dano. Chamar `RollInjuryTable()` duas vezes, aplicar o menor resultado.
        4.  Definir `Ejected = TRUE`.
        5.  Remover o Benefício deste termo.

*   **6 | Injured.**
    *   **Lógica do Sistema:**
        1.  Chamar `RollInjuryTable()`.
        2.  Definir `Ejected = TRUE`.
        3.  Remover o Benefício deste termo.

---

### Tabela de Eventos (Event Table)
*Acionada se a rolagem de Sobrevivência for um Sucesso.*

**Input:** Rolar 2D6.

*   **2 | Disaster!**
    *   **Lógica:**
        1.  Rolar 1D6 na **Mishap Table** (acima).
        2.  Aplicar todos os efeitos (lesões, inimigos, perda de benefício), **EXCETO** a variável `Ejected`.
        3.  Forçar `Ejected = FALSE`. O personagem sofre a desgraça, mas continua empregado.

*   **3 | Dangerous Investigation.**
    *   **Input do Usuário:** Escolher perícia para o teste: `Investigate` OU `Streetwise`.
    *   **Lógica:**
        1.  Rolagem dificuldade 8+.
        2.  **Se Sucesso:** O usuário escolhe uma perícia para aumentar +1 Nível: `Deception`, `Jack-of-all-Trades`, `Persuade` ou `Tactics`.
        3.  **Se Falha:** Rolar na **Mishap Table** (neste caso, `Ejected = TRUE` se aplica normalmente).

*   **4 | Mission Rewarded.**
    *   **Lógica:** Incrementar `BenefitRollModifier` em +1. (Isso adiciona +1 ao resultado do dado quando for rolar na tabela de Cash ou Benefits no final).

*   **5 | Establish Network.**
    *   **Lógica:**
        1.  Rolar 1D3 (1d6 / 2 arredondado para cima).
        2.  Adicionar essa quantidade de NPCs: `Type = Contact`.

*   **6 | Advanced Training.**
    *   **Lógica:**
        1.  Solicitar Check: `EDU 8+`.
        2.  **Se Sucesso:** Permitir ao usuário escolher **qualquer** perícia que já possua na ficha (Nível >= 0) e aumentar em +1 Nível (Max 4).

*   **7 | Life Event.**
    *   **Lógica:** Chamar função `RollLifeEventTable()`.

*   **8 | Undercover.**
    *   **Lógica:**
        1.  Solicitar Check: `Deception 8+`.
        2.  **Se Sucesso:**
            *   Exibir menu para usuário: "Escolha uma carreira para o disfarce: [Rogue] ou [Citizen]".
            *   Rolar um evento na tabela da carreira escolhida. Aplicar o resultado (ex: ganhou uma skill de Rogue).
            *   **Bônus Extra:** Adicionar +1 Nível em uma perícia da carreira escolhida (Rogue ou Citizen).
        3.  **Se Falha:**
            *   Exibir menu: "Escolha uma carreira onde o disfarce falhou: [Rogue] ou [Citizen]".
            *   Rolar na **Mishap Table** da carreira escolhida e aplicar o resultado (incluindo ejeção se houver). Note que isso ejeta o personagem da carreira de *Agent*.

*   **9 | Above and Beyond.**
    *   **Lógica:** Adicionar +2 à variável temporária `NextAdvancementDM`. (Aplica-se apenas à rolagem de promoção deste termo).

*   **10 | Specialist Training.**
    *   **Lógica:** O usuário seleciona uma perícia para ganhar/aumentar: `Drive (any)`, `Flyer (any)`, `Pilot (any)` ou `Gunner (any)`. Adiciona Nível 1.

*   **11 | Mentor.**
    *   **Input do Usuário:** Botões `[Treinamento]` ou `[Ajuda na Carreira]`.
    *   **Lógica:**
        *   **Se Treinamento:** Aumentar `Investigate` em +1 Nível.
        *   **Se Ajuda:** Adicionar +4 à variável `NextAdvancementDM`.

*   **12 | Major Conspiracy Uncovered.**
    *   **Lógica:** Definir `AutomaticPromotion = TRUE`. O personagem sobe um Rank automaticamente no passo 8.4.

---

# 2. CAREER: ARMY (Exército)
**Fontes:** *Traveller Core Rulebook Update 2022* (pág. 24) e *2300AD Book 1* (Regras de Legião Estrangeira e Spacer).

### Estrutura de Dados e Regras de Entrada
*   **Restrição de Origem (Spacer):**
    *   **Lógica:** Se `Origin == "Spacer"`, o personagem **NÃO** pode escolher Army no **Termo 1**.
    *   A partir do Termo 2, Spacers podem entrar, mas sofrem **DM-1** na Qualificação.
*   **Opção Especial: French Foreign Legion (Legião Estrangeira):**
    *   **Input:** Antes de rolar a qualificação, perguntar: *"Deseja se alistar na Legião Estrangeira Francesa?"*
    *   **Se Sim:**
        *   Adicionar **DM+1** na Qualificação.
        *   Adicionar **DM-1** em *todas* as rolagens de Sobrevivência (Survival) nesta carreira.
        *   Adicionar Perícia: `Language (French) 0` imediatamente.
        *   Adicionar Traço: `Citizenship (France)` após completar 1 termo.
        *   *Nota:* Legionários nunca precisam fazer testes de moral (regra de combate, mas bom anotar na ficha).
*   **Assignments (Sub-carreiras):**
    1.  *Support* (Suporte/Logística/Engenharia)
    2.  *Infantry* (Infantaria)
    3.  *Cavalry* (Cavalaria - Tanques/Walkers)
*   **Qualificação:** END 5+.
    *   *DM:* -1 por carreira anterior (-2 se Spacer no termo 2+).
    *   *DM:* -2 se Idade >= 30.

---

### Tabela de Desgraças (Mishap Table)
*Acionada se a rolagem de Sobrevivência falhar.*

**Input:** Rolar 1D6.

*   **1 | Severely Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  Apresentar menu **"Augmentation vs Medical Care"**.
        3.  **Se Augmentation:** Remove 1 Benefício, ignora penalidades de atributos, `Ejected = FALSE` (Fica no exército, pois o exército paga pela cibernética para manter o soldado).
        4.  **Se Medical Care:** Aplica lesão, `Ejected = TRUE` (Baixa médica honrosa).

*   **2 | Unit Destroyed.**
    *   **Texto:** Você é o único sobrevivente da sua unidade.
    *   **Lógica:**
        *   Adicionar Traço/Nota: "Sobrevivente (PTSD)".
        *   Aplicar **DM-2** em todas as interações sociais (Persuade, Carouse, etc.) durante o resto da criação de personagem.
        *   `Ejected = TRUE`.

*   **3 | Command Failure.**
    *   **Lógica:**
        1.  Solicitar Check: `Leadership 8+`.
        2.  **Se Sucesso:** `Ejected = TRUE`, mas mantém o Benefício do termo (Dispensado com honra).
        3.  **Se Falha:** `Ejected = TRUE`, perde o Benefício e ganha 1 **Inimigo** (Oficial Superior). (Dispensado sem honra).

*   **4 | War Crime.**
    *   **Texto:** Você testemunha ou comete um crime de guerra.
    *   **Lógica:**
        1.  Adicionar 1 **Inimigo**.
        2.  Adicionar Perícia: `Gun Combat (any) 1` (Você aprendeu a lutar sujo).
        3.  `Ejected = TRUE`.
        4.  Remover o Benefício deste termo.

*   **5 | Quarrel.**
    *   **Lógica:**
        1.  Adicionar 1 **Rival** (Oficial ou colega).
        2.  `Ejected = TRUE`.

*   **6 | Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  `Ejected = TRUE`. (Baixa médica).

---

### Tabela de Eventos (Event Table)
*Acionada se a rolagem de Sobrevivência for um Sucesso.*

**Input:** Rolar 2D6.

*   **2 | Disaster!**
    *   **Lógica:**
        1.  Rolar na **Mishap Table** (acima).
        2.  Aplicar efeitos, mas forçar `Ejected = FALSE`.

*   **3 | Hostile World.**
    *   **Lógica:** O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Vacc Suit`, `Engineer (any)`, `Animals (handling/training)` ou `Recon`.

*   **4 | Urban War.**
    *   **Lógica:** O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Stealth`, `Streetwise`, `Persuade` ou `Recon`.

*   **5 | Special Assignment.**
    *   **Lógica:** Incrementar `BenefitRollModifier` em +1.

*   **6 | Brutal War.**
    *   **Lógica:**
        1.  Solicitar Check: `EDU 8+` (Representando treinamento) ou `Survival 8+` (Opcional do mestre). *Padrão Core: EDU 8+*.
        2.  **Se Sucesso:** O usuário escolhe: `Gun Combat (any) 1` ou `Leadership 1`.
        3.  **Se Falha:** Chamar `RollInjuryTable()`. (O personagem se fere, mas não sai da carreira, pois é um evento, não mishap).

*   **7 | Life Event.**
    *   **Lógica:** Chamar função `RollLifeEventTable()`.

*   **8 | Advanced Training.**
    *   **Lógica:**
        1.  Solicitar Check: `EDU 8+`.
        2.  **Se Sucesso:** Aumentar qualquer perícia já possuída em +1 Nível.

*   **9 | Surrounded.**
    *   **Lógica:** Adicionar +2 à variável `NextAdvancementDM`.

*   **10 | Peacekeeping.**
    *   **Lógica:** O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Admin`, `Investigate`, `Deception` ou `Recon`.

*   **11 | Commanding Officer Interest.**
    *   **Input do Usuário:** Botões `[Táticas]` ou `[Promoção]`.
    *   **Lógica:**
        *   **Se Táticas:** Ganha `Tactics (military) 1`.
        *   **Se Promoção:** Adicionar +4 à variável `NextAdvancementDM`.

*   **12 | Heroism.**
    *   **Lógica:** Definir `AutomaticPromotion = TRUE`. Se o personagem já for Rank máximo, ganha +1 Benefício extra.

---

### Tabelas de Perícias (Skill Tables)
*O usuário escolhe UMA coluna para rolar 1D6.*

| 1D6 | Personal Development | Service Skills | Assignment: Support | Assignment: Infantry | Assignment: Cavalry | Officer (Rank 1+) |
|:---:|:---|:---|:---|:---|:---|:---|
| 1 | STR +1 | Drive (any) | Mechanic | Gun Combat (any) | Mechanic | Tactics (military) |
| 2 | DEX +1 | Athletics (any) | Drive (any) | Melee (any) | Drive (any) | Leadership |
| 3 | END +1 | Gun Combat (any) | Profession (any) | Heavy Weapons (any) | Flyer (any) | Advocate |
| 4 | Gambler | Recon | Explosives | Stealth | Recon | Diplomat |
| 5 | Medic | Melee (any) | Electronics (comms) | Athletics (any) | Heavy Weapons (vehicle) | Electronics (any) |
| 6 | Melee (any) | Heavy Weapons (any) | Medic | Recon | Electronics (sensors) | Admin |

*   **Advanced Education (EDU 8+):** 1: Tactics (military), 2: Electronics, 3: Navigation, 4: Explosives, 5: Engineer (any), 6: Survival.

---

### Ranks e Bônus (Army)

**Enlisted (Praças):**
*   **Rank 0:** Private (Recruta) — Ganha `Gun Combat (slug) 1`.
*   **Rank 1:** Lance Corporal — Ganha `Recon 1`.
*   **Rank 2:** Corporal — (Sem bônus).
*   **Rank 3:** Lance Sergeant — Ganha `Leadership 1`.
*   **Rank 4:** Sergeant — (Sem bônus).
*   **Rank 5:** Gunnery Sergeant — (Sem bônus).
*   **Rank 6:** Sergeant Major — (Sem bônus).

**Officer (Oficiais - Requer Comissão):**
*   **Rank 1:** Lieutenant — Ganha `Leadership 1`.
*   **Rank 2:** Captain — (Sem bônus).
*   **Rank 3:** Major — Ganha `Tactics (military) 1`.
*   **Rank 4:** Lieutenant Colonel — (Sem bônus).
*   **Rank 5:** Colonel — (Sem bônus).
*   **Rank 6:** General — Ganha `SOC 10` (ou +1 se já for 10+).

---

# 3. CAREER: CITIZEN (Cidadão)
**Fontes:** *Traveller Core Rulebook Update 2022* (pág. 26) e *2300AD Book 1*.

### Estrutura de Dados e Regras de Entrada
*   **Assignments (Sub-carreiras):**
    1.  *Corporate* (Executivo, Gerente, Burocrata)
    2.  *Worker* (Operário, Técnico, Proletário)
    3.  *Colonist* (Colono, Pioneiro, Fazendeiro)
*   **Qualificação:** EDU 5+.
    *   *DM:* -1 por carreira anterior.
*   **Regra Especial de Treinamento Básico:**
    *   Diferente das carreiras militares, se for a *primeira* carreira do personagem, ele recebe as perícias da tabela de **Assignment Skills** (não Service Skills) no Nível 0.

---

### Tabela de Desgraças (Mishap Table)
*Acionada se a rolagem de Sobrevivência falhar.*

**Input:** Rolar 1D6.

*   **1 | Severely Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  Apresentar menu **"Augmentation vs Medical Care"**.
        3.  **Se Augmentation:** Remove 1 Benefício, ignora penalidades de atributos, `Ejected = FALSE`.
        4.  **Se Medical Care:** Aplica lesão e Dívida Médica, `Ejected = TRUE`.

*   **2 | Harassed.**
    *   **Texto:** Você é assediado e sua vida arruinada por uma gangue criminosa ou rivais corporativos.
    *   **Lógica:**
        1.  Adicionar 1 **Inimigo** (Gangue ou Executivo Rival).
        2.  `Ejected = TRUE`.
        3.  Remover o Benefício deste termo.

*   **3 | Hard Times.**
    *   **Texto:** Tempos difíceis causados por falta de comércio interestelar ou recessão custam seu emprego.
    *   **Lógica:**
        1.  Reduzir característica **SOC** em -1 (Perda de status social).
        2.  `Ejected = TRUE`.
        3.  Remover o Benefício deste termo.

*   **4 | Investigation.**
    *   **Texto:** Sua empresa ou colônia é investigada.
    *   **Input do Usuário:** Botões `[Cooperar]` ou `[Recusar]`.
    *   **Lógica (Cooperar):**
        *   `Ejected = TRUE`.
        *   Adicionar **DM+2** na Qualificação da *próxima* carreira (Recompensa pela ajuda).
        *   Remover o Benefício deste termo.
    *   **Lógica (Recusar):**
        *   `Ejected = TRUE`.
        *   Adicionar 1 **Aliado** (Colega leal ou Patrão que você protegeu).
        *   Remover o Benefício deste termo.

*   **5 | Revolution/Event.**
    *   **Texto:** Uma revolução, ataque ou evento incomum lança sua vida no caos.
    *   **Lógica:**
        1.  Solicitar Check: `Streetwise 8+`.
        2.  **Se Sucesso:** O usuário escolhe *qualquer* perícia que já possua e aumenta em +1 Nível (Aprendeu a se virar).
        3.  **Se Falha:** Nenhum ganho extra.
        4.  Em ambos os casos: `Ejected = TRUE` e Remove o Benefício deste termo.

*   **6 | Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  `Ejected = TRUE`.

---

### Tabela de Eventos (Event Table)
*Acionada se a rolagem de Sobrevivência for um Sucesso.*

**Input:** Rolar 2D6.

*   **2 | Disaster!**
    *   **Lógica:** Rolar na **Mishap Table** (acima), aplicar efeitos, mas forçar `Ejected = FALSE`.

*   **3 | Political Upheaval.**
    *   **Input do Usuário:** Escolher uma perícia para o teste: `Advocate`, `Persuade`, `Explosives` ou `Streetwise`.
    *   **Lógica:**
        1.  Adicionar a perícia escolhida no Nível 1 (se não tiver) ou ignorar se já tiver. *Nota: Regra padrão geralmente dá a skill se necessário para o teste, ou apenas pede o teste. Implementação recomendada: Solicitar o teste direto.*
        2.  Rolagem dificuldade 8+.
        3.  **Se Sucesso:** Adicionar **DM+2** na próxima rolagem de **Advancement**. (Saiu no lado vencedor).
        4.  **Se Falha:** Adicionar **DM-2** na rolagem de **Survival** do *próximo* termo. (Saiu no lado perdedor e está marcado).

*   **4 | Vehicle Hobby.**
    *   **Lógica:** O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Mechanic`, `Drive (any)`, `Electronics (any)`, `Flyer (any)` ou `Engineer (any)`.

*   **5 | Business Expands.**
    *   **Lógica:** Incrementar `BenefitRollModifier` em +1 (DM+1 em uma rolagem de benefício).

*   **6 | Advanced Training.**
    *   **Lógica:**
        1.  Solicitar Check: `EDU 10+`.
        2.  **Se Sucesso:** O usuário escolhe **qualquer** perícia (exceto Jack-of-all-Trades) e ganha no Nível 1 (se não tiver) ou aumenta +1 (se já tiver).

*   **7 | Life Event.**
    *   **Lógica:** Chamar função `RollLifeEventTable()`.

*   **8 | Illegal Profit.**
    *   **Texto:** Você descobre um segredo ou escândalo.
    *   **Input do Usuário:** Botões `[Chantagear/Lucrar]` ou `[Recusar]`.
    *   **Lógica (Lucrar):**
        *   Incrementar `BenefitRollModifier` em +1.
        *   Adicionar Perícia: `Streetwise 1` ou `Deception 1` (Escolha do usuário).
        *   Adicionar 1 **Inimigo** (A vítima da chantagem).
    *   **Lógica (Recusar):** Nada acontece.

*   **9 | Diligence.**
    *   **Lógica:** Adicionar **DM+2** à próxima rolagem de **Advancement**.

*   **10 | Technical Experience.**
    *   **Lógica:** O usuário escolhe: Aumentar `Electronics (any)` ou `Engineer (any)` em +1 Nível.

*   **11 | Befriend Superior.**
    *   **Lógica:**
        1.  Adicionar 1 **Aliado** (Superior).
        2.  **Input do Usuário:** Escolher entre:
            *   Ganhar `Diplomat 1`.
            *   **OU** Adicionar **DM+4** na próxima rolagem de **Advancement**.

*   **12 | Rise to Power.**
    *   **Lógica:** Definir `AutomaticPromotion = TRUE`.

---

### Tabelas de Perícias (Skill Tables)
*O usuário escolhe UMA coluna para rolar 1D6.*

| 1D6 | Personal Development | Service Skills | Assignment: Corporate | Assignment: Worker | Assignment: Colonist |
|:---:|:---|:---|:---|:---|:---|
| 1 | EDU +1 | Drive (any) | Advocate | Drive (any) | Animals (any) |
| 2 | INT +1 | Flyer (any) | Admin | Mechanic | Athletics (any) |
| 3 | Carouse | Streetwise | Broker | Electronics (any) | Jack-of-all-Trades |
| 4 | Gambler | Melee (any) | Electronics (computers) | Engineer (any) | Drive (any) |
| 5 | Drive (any) | Steward | Diplomat | Profession (any) | Survival |
| 6 | Jack-of-all-Trades | Profession (any) | Leadership | Science (any) | Recon |

*   **Advanced Education (EDU 10+):** 1: Art (any), 2: Advocate, 3: Diplomat, 4: Language (any), 5: Electronics (computers), 6: Medic.

---

### Ranks e Bônus (Citizen)

**Assignment: Corporate**
*   **Rank 0:** Staff — (Sem bônus).
*   **Rank 1:** — (Sem bônus).
*   **Rank 2:** Manager — Ganha `Admin 1`.
*   **Rank 3:** — (Sem bônus).
*   **Rank 4:** Senior Manager — Ganha `Advocate 1`.
*   **Rank 5:** — (Sem bônus).
*   **Rank 6:** Director — Ganha `SOC +1`.

**Assignment: Worker**
*   **Rank 0:** Worker — (Sem bônus).
*   **Rank 1:** — (Sem bônus).
*   **Rank 2:** Technician — Ganha `Profession (any) 1`.
*   **Rank 3:** — (Sem bônus).
*   **Rank 4:** Craftsman — Ganha `Mechanic 1`.
*   **Rank 5:** — (Sem bônus).
*   **Rank 6:** Master Technician — Ganha `Engineer (any) 1`.

**Assignment: Colonist**
*   **Rank 0:** Citizen — (Sem bônus).
*   **Rank 1:** — (Sem bônus).
*   **Rank 2:** Settler — Ganha `Survival 1`.
*   **Rank 3:** — (Sem bônus).
*   **Rank 4:** Explorer — Ganha `Navigation 1`.
*   **Rank 5:** — (Sem bônus).
*   **Rank 6:** Elder — Ganha `Gun Combat (any) 1`.

---

# 4. CAREER: DRIFTER (Andarilho - 2300AD)
**Fontes:** *2300AD Book 1: Characters & Equipment* (pág. 28 / PDF 84).

### Estrutura de Dados e Regras de Entrada
*   **Qualificação:** Automática (Nenhum teste necessário).
*   **Assignments (Sub-carreiras):**
    1.  *Freelancer* (Profissional independente, trabalha contrato a contrato).
    2.  *Wanderer* (Nômade, vive de bicos em favelas e espaçoportos).
    3.  *Scavenger* (Belter independente ou membro de equipe de salvamento).
*   **Regra de Ejeção:** Diferente de outras carreiras, o Drifter **não** é ejetado por falha na rolagem de Sobrevivência (Mishap), a menos que o resultado do Mishap diga explicitamente o contrário (ex: ir para a Prisão).

---

### Tabela de Desgraças (Mishap Table)
*Acionada se a rolagem de Sobrevivência falhar.*

**Input:** Rolar 1D6.

*   **1 | Severely Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  Apresentar menu **"Augmentation vs Medical Care"**.
        3.  *Nota:* Mesmo com tratamento médico, o Drifter *não* é ejetado da carreira (regra específica de Drifter), mas perde o Benefício do termo.

*   **2 | Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  Remover o Benefício deste termo.

*   **3 | Foe.**
    *   **Texto:** Você desagrada uma gangue criminosa ou um burocrata corrupto.
    *   **Lógica:**
        1.  Adicionar 1 **Inimigo**.
        2.  Remover o Benefício deste termo.

*   **4 | Illness.**
    *   **Texto:** Você sofre de uma doença com risco de vida.
    *   **Lógica:**
        1.  Reduzir característica **END** em -1.
        2.  Remover o Benefício deste termo.

*   **5 | Betrayal.**
    *   **Texto:** Traído por um amigo.
    *   **Lógica:**
        1.  Se tiver Aliado/Contato: Converter um em **Rival** ou **Inimigo**.
        2.  Se não tiver: Ganhar um **Rival** ou **Inimigo**.
        3.  **Check Crítico:** Rolar 2D6. Se o resultado for 2, o personagem deve ir para a carreira **Prisoner** (Prisioneiro) no próximo termo. (Esta é a única forma de ser "ejetado").
        4.  Remover o Benefício deste termo.

*   **6 | Amnesia.**
    *   **Texto:** Você não sabe o que aconteceu. Há uma lacuna na sua memória.
    *   **Lógica:**
        1.  Remover o Benefício deste termo.
        2.  Adicionar nota no histórico: "Período de Amnésia".

---

### Tabela de Eventos (Event Table)
*Acionada se a rolagem de Sobrevivência for um Sucesso.*

**Input:** Rolar 2D6.

*   **2 | Disaster!**
    *   **Lógica:** Rolar na **Mishap Table** (acima), aplicar efeitos, manter na carreira.

*   **3 | Patron Offer.**
    *   **Input do Usuário:** Botões `[Aceitar]` ou `[Recusar]`.
    *   **Lógica (Aceitar):**
        *   Adicionar **DM+4** na rolagem de Qualificação da *próxima* carreira (representando uma recomendação).
        *   Adicionar nota: "Deve um favor ao Patrono".
    *   **Lógica (Recusar):** Nada acontece.

*   **4 | Useful Skills.**
    *   **Lógica:** O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Jack-of-all-Trades`, `Survival`, `Streetwise` ou `Melee (any)`.

*   **5 | Scavenge.**
    *   **Lógica:** Incrementar `BenefitRollModifier` em +1 (DM+1 em uma rolagem de benefício).

*   **6 | Unusual Encounter.**
    *   **Lógica:** Chamar a função `RollLifeEventTable()` e forçar o resultado para **12 (Unusual Event)**.

*   **7 | Life Event.**
    *   **Lógica:** Chamar função `RollLifeEventTable()`.

*   **8 | Attacked.**
    *   **Lógica:**
        1.  Adicionar 1 **Inimigo** (se ainda não tiver).
        2.  Solicitar Check: `Melee 8+` OU `Gun Combat 8+` OU `Stealth 8+`.
        3.  **Se Sucesso:** Evita ferimentos.
        4.  **Se Falha:** Chamar `RollInjuryTable()`.

*   **9 | Risky Adventure.**
    *   **Input do Usuário:** Botões `[Aceitar Risco]` ou `[Recusar]`.
    *   **Lógica (Aceitar):**
        *   Rolar 1D6.
        *   **1-2:** Chamar `RollInjuryTable()` OU definir próxima carreira como **Prisoner**. (Usuário escolhe ou sistema define).
        *   **3-4:** Sobrevive, mas sem ganho.
        *   **5-6:** Adicionar **DM+4** a uma rolagem de Benefício.

*   **10 | Life on the Edge.**
    *   **Lógica:** Aumentar *qualquer* perícia que o personagem já possua em +1 Nível.

*   **11 | Drafted.**
    *   **Lógica:** O personagem é forçado a entrar no **Draft** (Alistamento Militar) no próximo termo. (Ignorar qualificação da próxima carreira, rolar na tabela de Draft).

*   **12 | Thrive.**
    *   **Lógica:** Promoção Automática.

---

### Tabelas de Perícias (Skill Tables)
*O usuário escolhe UMA coluna para rolar 1D6.*

| 1D6 | Personal Development | Service Skills | Assignment: Freelancer | Assignment: Wanderer | Assignment: Scavenger |
|:---:|:---|:---|:---|:---|:---|
| 1 | STR +1 | Athletics (any) | Electronics (any) | Drive (any) | Pilot (small craft) |
| 2 | END +1 | Melee (unarmed) | Art (any) | Deception | Mechanic |
| 3 | DEX +1 | Recon | Carouse | Recon | Astrogation |
| 4 | Language (any) | Streetwise | Profession (any) | Stealth | Vacc Suit |
| 5 | Profession (any) | Stealth | Language (any) | Streetwise | Profession (any) |
| 6 | Jack-of-all-Trades | Survival | Science (any) | Survival | Gun Combat (any) |

*   *Nota de Implementação:* A tabela de Freelancer não está explícita no snippet do livro, então usei um mix lógico de perícias "gig worker" baseadas no perfil EDU/INT da carreira (Electronics, Art, Carouse, Profession, Language, Science) para preencher a lacuna de dados, ou use a tabela "Barbarian" do Core se preferir estritamente RAW, mas renomeada. As tabelas de Wanderer e Scavenger seguem o padrão Core/2300AD.

---

### Ranks e Bônus (Drifter 2300AD)

*   **Rank 0:** (Sem Título) — (Sem bônus).
*   **Rank 1:** — Scavenger ganha `Vacc Suit 1`.
*   **Rank 2:** — (Sem bônus).
*   **Rank 3:** — Scavenger ganha `Profession (belter) 1` OU `Mechanic 1`.
*   **Rank 4:** — (Sem bônus).
*   **Rank 5:** — (Sem bônus).
*   **Rank 6:** — (Sem bônus).

---

### Benefícios de Mustering Out (2300AD)
*Moeda: Livres (Lv).*

| 1D6 | Cash (Lv) | Benefits |
|:---:|:---|:---|
| 1 | None | Contact |
| 2 | None | Weapon |
| 3 | 1,000 | Ally |
| 4 | 2,000 | Weapon |
| 5 | 3,000 | EDU +1 |
| 6 | 4,000 | Ship Share |
| 7 | 8,000 | Two Ship Shares |

---

# 5. CAREER: ENTERTAINER (Entretenimento)
**Fontes:** *Traveller Core Rulebook Update 2022* (pág. 30).

### Estrutura de Dados e Regras de Entrada
*   **Assignments (Sub-carreiras):**
    1.  *Artist* (Escritor, Holográfo, Escultor) - Focado em criar obras.
    2.  *Journalist* (Repórter, Correspondente, Blogger) - Focado em investigar e relatar.
    3.  *Performer* (Ator, Músico, Atleta, Dançarino) - Focado em se apresentar.
*   **Qualificação:** DEX 5+ **OU** INT 5+ (O jogador escolhe qual atributo usar).
    *   *DM:* -1 por carreira anterior.

---

### Tabela de Desgraças (Mishap Table)
*Acionada se a rolagem de Sobrevivência falhar.*

**Input:** Rolar 1D6.

*   **1 | Severely Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  Apresentar menu **"Augmentation vs Medical Care"**.
        3.  *Nota:* Um artista ou performer pode se preocupar mais com a estética da cibernética (pagando extra por versões sutis) do que um soldado, mas a regra mecânica é a mesma.
        4.  `Ejected = TRUE`.

*   **2 | Scandal.**
    *   **Texto:** Você expõe ou se envolve em um escândalo.
    *   **Lógica:**
        1.  O personagem é ejetado.
        2.  Perde o Benefício deste termo.
        3.  *Opcional:* Adicionar nota no histórico "Envolvido no escândalo X".

*   **3 | Bad Publicity.**
    *   **Texto:** A opinião pública se volta contra você.
    *   **Lógica:**
        1.  Reduzir característica **SOC** em -1.
        2.  `Ejected = TRUE`.
        3.  Remover o Benefício deste termo.

*   **4 | Betrayal.**
    *   **Texto:** Traído por um igual.
    *   **Lógica:**
        1.  Verificar lista de `Allies` e `Contacts`.
        2.  **Se existir:** Converter um deles em **Rival** ou **Inimigo**.
        3.  **Se não existir:** Criar um novo **Rival** ou **Inimigo** (Ex: Outro artista que roubou seu trabalho).
        4.  `Ejected = TRUE`.
        5.  Remover o Benefício deste termo.

*   **5 | Expedition Wrong.**
    *   **Texto:** Uma investigação, turnê ou projeto dá errado, deixando você preso longe de casa.
    *   **Lógica:**
        1.  O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Survival`, `Pilot (any)`, `Persuade` ou `Streetwise`.
        2.  `Ejected = TRUE`.
        3.  Remover o Benefício deste termo.

*   **6 | Censorship.**
    *   **Texto:** Você é forçado a sair por censura ou controvérsia. De que verdade você chegou perto demais?
    *   **Lógica:**
        1.  `Ejected = TRUE`.
        2.  Adicionar **DM+2** na Qualificação da *próxima* carreira (Sua infâmia atrai novos empregadores curiosos).
        3.  Remover o Benefício deste termo.

---

### Tabela de Eventos (Event Table)
*Acionada se a rolagem de Sobrevivência for um Sucesso.*

**Input:** Rolar 2D6.

*   **2 | Disaster!**
    *   **Lógica:** Rolar na **Mishap Table** (acima), aplicar efeitos, mas forçar `Ejected = FALSE`.

*   **3 | Controversial Event.**
    *   **Input do Usuário:** Escolher perícia para o teste: `Art (any)` OU `Investigate`.
    *   **Lógica:**
        1.  Rolagem dificuldade 8+.
        2.  **Se Sucesso:** Aumentar **SOC** em +1 (Fama positiva).
        3.  **Se Falha:** Reduzir **SOC** em -1 (Infâmia/Cancelamento).

*   **4 | Celebrity Circles.**
    *   **Lógica:** O usuário escolhe um benefício:
        *   Ganhar/Aumentar `Carouse`.
        *   Ganhar/Aumentar `Persuade`.
        *   Ganhar/Aumentar `Steward`.
        *   Ganhar 1 **Contato**.

*   **5 | Popular Work.**
    *   **Texto:** Um de seus trabalhos é especialmente bem recebido.
    *   **Lógica:** Incrementar `BenefitRollModifier` em +1.

*   **6 | Patron.**
    *   **Lógica:**
        1.  Adicionar 1 **Aliado** (Mecenas/Patrocinador).
        2.  Adicionar **DM+2** na próxima rolagem de **Advancement**.

*   **7 | Life Event.**
    *   **Lógica:** Chamar função `RollLifeEventTable()`.

*   **8 | Political Criticism.**
    *   **Texto:** Você tem a chance de criticar ou derrubar um líder questionável.
    *   **Input do Usuário:** Botões `[Criticar]` ou `[Recusar]`.
    *   **Lógica (Criticar):**
        1.  Adicionar 1 **Inimigo**.
        2.  Solicitar Check: `Art 8+` OU `Persuade 8+`.
        3.  **Se Sucesso:** O usuário escolhe *qualquer* perícia que já possua e aumenta em +1 Nível.
        4.  **Se Falha:** O usuário aumenta uma perícia mesmo assim, mas deve rolar imediatamente na **Mishap Table** (mas não perde o benefício, apenas sofre o efeito narrativo e possível ejeção).
    *   **Lógica (Recusar):** Nada acontece.

*   **9 | Tour.**
    *   **Texto:** Você faz uma turnê pelo setor.
    *   **Lógica:**
        1.  Adicionar `1D3` **Contatos**.
        2.  *Regra 2300AD:* Se o personagem ainda não saiu do mundo natal (`HasLeftHome == False`), este evento pode contar como sair de casa automaticamente ou dar bônus no teste de Leaving Home.

*   **10 | Theft/Stolen Work.**
    *   **Lógica:** O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Streetwise`, `Investigate`, `Recon` ou `Stealth`.

*   **11 | Charmed Life.**
    *   **Lógica:** Chamar a função `RollLifeEventTable()`. (Sim, esta carreira tem duas chances de cair na tabela de eventos de vida).

*   **12 | Prize.**
    *   **Lógica:** Promoção Automática.

---

### Tabelas de Perícias (Skill Tables)
*O usuário escolhe UMA coluna para rolar 1D6.*

| 1D6 | Personal Development | Service Skills | Assignment: Artist | Assignment: Journalist | Assignment: Performer |
|:---:|:---|:---|:---|:---|:---|
| 1 | DEX +1 | Art (any) | Art (any) | Art (write/holography) | Art (performer/instrument) |
| 2 | INT +1 | Carouse | Carouse | Electronics (any) | Athletics (any) |
| 3 | SOC +1 | Deception | Electronics (computers) | Drive (any) | Carouse |
| 4 | Language (any) | Drive (any) | Gambler | Investigate | Deception |
| 5 | Carouse | Persuade | Persuade | Recon | Stealth |
| 6 | Jack-of-all-Trades | Steward | Profession (any) | Streetwise | Streetwise |

*   **Advanced Education (EDU 10+):** 1: Advocate, 2: Broker, 3: Deception, 4: Science (any), 5: Streetwise, 6: Diplomat.

---

### Ranks e Bônus (Entertainer)

**Assignment: Artist**
*   **Rank 0:** — (Sem bônus).
*   **Rank 1:** — Ganha `Art (any) 1`.
*   **Rank 2:** — (Sem bônus).
*   **Rank 3:** — Ganha `Investigate 1`.
*   **Rank 4:** — (Sem bônus).
*   **Rank 5:** Famous Artist — Ganha `SOC +1`.
*   **Rank 6:** — (Sem bônus).

**Assignment: Journalist**
*   **Rank 0:** — (Sem bônus).
*   **Rank 1:** Freelancer — Ganha `Electronics (comms) 1`.
*   **Rank 2:** Staff Writer — Ganha `Investigate 1`.
*   **Rank 3:** — (Sem bônus).
*   **Rank 4:** Correspondent — Ganha `Persuade 1`.
*   **Rank 5:** — (Sem bônus).
*   **Rank 6:** Senior Correspondent — Ganha `SOC +1`.

**Assignment: Performer**
*   **Rank 0:** — (Sem bônus).
*   **Rank 1:** — Ganha `DEX +1`.
*   **Rank 2:** — (Sem bônus).
*   **Rank 3:** — Ganha `STR +1`.
*   **Rank 4:** — (Sem bônus).
*   **Rank 5:** Famous Performer — Ganha `SOC +1`.
*   **Rank 6:** — (Sem bônus).

---

# 6. CAREER: MARINE (Fuzileiro)
**Fontes:** *Traveller Core Rulebook Update 2022* (pág. 32) e *2300AD Book 1* (Regras de Augmentação e Neural Jack).

### Estrutura de Dados e Regras de Entrada
*   **Assignments (Sub-carreiras):**
    1.  *Support* (Suporte: Intendência, engenharia, médico de combate).
    2.  *Star Marine* (Fuzileiro Estelar: Especialista em abordagens e combate em gravidade zero).
    3.  *Ground Assault* (Assalto Terrestre: Tropas de choque lançadas de órbita para capturar cabeças de ponte).
*   **Qualificação:** END 6+.
    *   *DM:* -1 por carreira anterior.
*   **Regra Especial 2300AD (Neural Jack):**
    *   Se o personagem servir a uma nação de **Tier 3 ou superior** (ex: America, France, Britain, Germany, etc.), ele pode optar por instalar um **Neural Jack** (Interface Neural) gratuitamente como parte do serviço.
    *   *Custo:* Consome 1 `BenefitRoll` final.
    *   *Benefício:* Adiciona **DM+1** em todas as rolagens de **Advancement** nesta carreira (devido à interface direta com equipamentos).

---

### Tabela de Desgraças (Mishap Table)
*Acionada se a rolagem de Sobrevivência falhar.*

**Input:** Rolar 1D6.

*   **1 | Severely Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  Apresentar menu **"Augmentation vs Medical Care"**.
        3.  *Nota:* Fuzileiros frequentemente aceitam augmentações de combate.
        4.  Se Medical Care: `Ejected = TRUE`.

*   **2 | Captured.**
    *   **Texto:** Uma missão dá errado; você e outros são capturados e maltratados pelo inimigo.
    *   **Lógica:**
        1.  Adicionar 1 **Inimigo** (Seu carcereiro/interrogador).
        2.  Reduzir **STR** e **DEX** em -1 (Dano físico persistente da tortura/maus tratos).
        3.  `Ejected = TRUE` (Dispensado cedo por razões médicas/psicológicas).
        4.  Remover o Benefício deste termo.

*   **3 | Stranded.**
    *   **Texto:** Uma missão dá errado e você fica preso atrás das linhas inimigas.
    *   **Lógica:**
        1.  O usuário escolhe aumentar uma perícia em +1 Nível: `Stealth` ou `Survival`.
        2.  `Ejected = TRUE` (A missão falhou, dispensa).
        3.  Remover o Benefício deste termo.

*   **4 | Black Ops Conflict.**
    *   **Texto:** Você recebe ordens para uma missão de operações negras que viola sua consciência.
    *   **Input do Usuário:** Botões `[Recusar]` ou `[Aceitar]`.
    *   **Lógica (Recusar):**
        *   `Ejected = TRUE`.
        *   Remover o Benefício deste termo.
    *   **Lógica (Aceitar):**
        *   `Ejected = FALSE` (Você **continua** na carreira, apesar de ter caído na tabela de Mishap - exceção rara).
        *   Adicionar 1 **Inimigo** (O único sobrevivente da missão ou uma testemunha).
        *   *Nota:* O personagem carrega o peso moral, mas o comando o mantém por ser útil.

*   **5 | Quarrel.**
    *   **Lógica:**
        1.  Adicionar 1 **Rival** (Oficial ou colega fuzileiro).
        2.  `Ejected = TRUE`.

*   **6 | Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  `Ejected = TRUE`.

---

### Tabela de Eventos (Event Table)
*Acionada se a rolagem de Sobrevivência for um Sucesso.*

**Input:** Rolar 2D6.

*   **2 | Disaster!**
    *   **Lógica:** Rolar na **Mishap Table** (acima). Aplicar efeitos, mas forçar `Ejected = FALSE` (exceto se o resultado do mishap for morte ou algo irreversível narrativamente, mas por regra de sistema, Disaster mantém na carreira).

*   **3 | Trapped.**
    *   **Texto:** Preso atrás das linhas inimigas, você tem que sobreviver sozinho.
    *   **Lógica:** O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Survival`, `Stealth`, `Deception` ou `Streetwise`.

*   **4 | Security Duty.**
    *   **Texto:** Você é designado para a segurança de uma estação espacial ou base.
    *   **Lógica:** O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Vacc Suit` ou `Athletics (dexterity)`.

*   **5 | Advanced Training.**
    *   **Lógica:**
        1.  Solicitar Check: `EDU 8+`.
        2.  **Se Sucesso:** O usuário escolhe **qualquer** perícia que já possua e aumenta em +1 Nível.

*   **6 | Assault.**
    *   **Texto:** Você participa de um assalto a uma fortaleza inimiga.
    *   **Lógica:**
        1.  Solicitar Check: `Melee (any) 8+` OU `Gun Combat (any) 8+`.
        2.  **Se Sucesso:** O usuário escolhe ganhar `Tactics (military) 1` OU `Leadership 1`.
        3.  **Se Falha:** O personagem é ferido. Reduzir qualquer característica física (STR, DEX, END) em -1 ponto.

*   **7 | Life Event.**
    *   **Lógica:** Chamar função `RollLifeEventTable()`.

*   **8 | Front Lines.**
    *   **Texto:** Você está na linha de frente de um assalto planetário.
    *   **Lógica:** O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Recon`, `Gun Combat (any)`, `Leadership` ou `Electronics (comms)`.

*   **9 | Commander Error.**
    *   **Texto:** Uma missão falha desastrosamente devido a erro do comandante, mas você sobrevive.
    *   **Input do Usuário:** Botões `[Reportar Comandante]` ou `[Proteger Comandante]`.
    *   **Lógica (Reportar):**
        *   Adicionar **DM+2** na próxima rolagem de **Advancement**.
        *   Adicionar 1 **Inimigo** (O comandante reportado).
    *   **Lógica (Proteger):**
        *   Adicionar 1 **Aliado** (O comandante protegido).
        *   Nenhum bônus de avanço.

*   **10 | Black Ops.**
    *   **Lógica:** Adicionar **DM+2** à próxima rolagem de **Advancement**. (Missão bem sucedida e secreta).

*   **11 | Commanding Officer Interest.**
    *   **Input do Usuário:** Escolher entre:
        *   Ganhar `Tactics (military) 1`.
        *   **OU** Adicionar **DM+4** na próxima rolagem de **Advancement**.

*   **12 | Heroism.**
    *   **Lógica:** Definir `AutomaticPromotion = TRUE`. Se o personagem não for oficial, ele pode trocar a promoção por uma `AutomaticCommission = TRUE` (vira Oficial Rank 1).

---

### Tabelas de Perícias (Skill Tables)
*O usuário escolhe UMA coluna para rolar 1D6.*

| 1D6 | Personal Development | Service Skills | Assignment: Support | Assignment: Star Marine | Assignment: Ground Assault | Officer (Rank 1+) |
|:---:|:---|:---|:---|:---|:---|:---|
| 1 | STR +1 | Athletics (any) | Electronics (any) | Vacc Suit | Vacc Suit | Electronics (any) |
| 2 | DEX +1 | Vacc Suit | Mechanic | Athletics (any) | Heavy Weapons (any) | Tactics (any) |
| 3 | END +1 | Tactics (any) | Drive (any) | Gunner (any) | Recon | Admin |
| 4 | Gambler | Heavy Weapons (any) | Medic | Melee (blade) | Melee (blade) | Advocate |
| 5 | Melee (unarmed) | Gun Combat (any) | Heavy Weapons (any) | Electronics (any) | Tactics (military) | Diplomat |
| 6 | Melee (blade) | Stealth | Gun Combat (any) | Gun Combat (any) | Gun Combat (any) | Leadership |

*   **Advanced Education (EDU 8+):** 1: Medic, 2: Survival, 3: Explosives, 4: Engineer (any), 5: Pilot (any), 6: Navigation.

---

### Ranks e Bônus (Marine)

**Enlisted (Praças):**
*   **Rank 0:** Marine (Fuzileiro) — Ganha `Gun Combat (any) 1` (Geralmente Slug ou Energy).
*   **Rank 1:** Lance Corporal — Ganha `Melee (blade) 1`.
*   **Rank 2:** Corporal — Ganha `Vacc Suit 1`.
*   **Rank 3:** Sergeant — (Sem bônus).
*   **Rank 4:** Gunnery Sergeant — Ganha `END +1`.
*   **Rank 5:** Sergeant Major — (Sem bônus).
*   **Rank 6:** — (Sem bônus).

**Officer (Oficiais - Requer Comissão):**
*   **Rank 1:** Lieutenant — Ganha `Leadership 1`.
*   **Rank 2:** Captain — (Sem bônus).
*   **Rank 3:** Major — Ganha `Tactics (military) 1`.
*   **Rank 4:** Lieutenant Colonel — (Sem bônus).
*   **Rank 5:** Colonel — (Sem bônus).
*   **Rank 6:** Brigadier — Ganha `SOC +1` (Status Social aumenta).

---

# 7. CAREER: MERCHANT (Comerciante)
**Fontes:** *Traveller Core Rulebook Update 2022* (pág. 34) e *2300AD Book 1*.

### Estrutura de Dados e Regras de Entrada
*   **Assignments (Sub-carreiras):**
    1.  *Merchant Marine* (Marinha Mercante): Tripulante de grandes cargueiros corporativos ou estatais. Salário fixo, menos risco.
    2.  *Free Trader* (Comerciante Livre): Operador independente ou tripulante de pequena nave. Alto risco, alta recompensa.
    3.  *Broker* (Corretor): Especialista em lidar com acordos comerciais, taxas de porto e negociações, muitas vezes em estações orbitais.
*   **Qualificação:** INT 4+.
    *   *DM:* -1 por carreira anterior.

---

### Tabela de Desgraças (Mishap Table)
*Acionada se a rolagem de Sobrevivência falhar.*

**Input:** Rolar 1D6.

*   **1 | Severely Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  Apresentar menu **"Augmentation vs Medical Care"**.
        3.  Se *Medical Care*: `Ejected = TRUE`.

*   **2 | Bankrupt.**
    *   **Texto:** Sua empresa ou nave vai à falência devido à falta de lucros.
    *   **Lógica:**
        1.  O personagem perde **todos** os `Cash Benefits` (Benefícios em Dinheiro) acumulados nesta carreira até agora. (Outros benefícios como itens ou Ship Shares são mantidos).
        2.  `Ejected = TRUE`.
        3.  Remover o Benefício deste termo.

*   **3 | Trade War.**
    *   **Texto:** Você se envolve em uma guerra comercial ou ataque de sindicato.
    *   **Lógica:**
        1.  Adicionar 1 **Inimigo** (Rival comercial, Pirata ou Sindicato).
        2.  `Ejected = TRUE`.
        3.  Remover o Benefício deste termo.

*   **4 | Legal Trouble.**
    *   **Texto:** Você é processado ou investigado por práticas ilegais.
    *   **Lógica:**
        1.  Solicitar Check: `Advocate 8+`.
        2.  **Se Sucesso:** `Ejected = TRUE`, mas mantém o Benefício do termo.
        3.  **Se Falha:** `Ejected = TRUE`, perde o Benefício e define `NextCareerForce = "Prisoner"` (Obrigatório ir para a Prisão no próximo termo).

*   **5 | Market Crash.**
    *   **Texto:** Uma mudança repentina no mercado ou ataque de piratas destrói seu negócio.
    *   **Lógica:**
        1.  `Ejected = TRUE`.
        2.  Remover o Benefício deste termo.

*   **6 | Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  `Ejected = TRUE`.

---

### Tabela de Eventos (Event Table)
*Acionada se a rolagem de Sobrevivência for um Sucesso.*

**Input:** Rolar 2D6.

*   **2 | Disaster!**
    *   **Lógica:** Rolar na **Mishap Table** (acima), aplicar efeitos (incluindo perda de Cash se cair Bankrupt), mas forçar `Ejected = FALSE`.

*   **3 | Smuggling Offer.**
    *   **Texto:** Oferecem a você a chance de contrabandear itens ilegais (armas, drogas, tecnologia alienígena).
    *   **Input do Usuário:** Botões `[Aceitar]` ou `[Recusar]`.
    *   **Lógica (Aceitar):**
        1.  Solicitar Check: `Deception 8+` OU `Persuade 8+`.
        2.  **Se Sucesso:** Ganha `Streetwise 1` e adiciona +1 `BenefitRoll` extra para este termo.
        3.  **Se Falha:** Adicionar 1 **Inimigo** (Polícia/Alfândega) e subtrair -1 `BenefitRoll` deste termo.
    *   **Lógica (Recusar):** Adicionar 1 **Inimigo** (O criminoso que fez a oferta, ofendido pela recusa).

*   **4 | Diverse Experience.**
    *   **Lógica:** O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Profession (any)`, `Electronics (any)`, `Engineer (any)`, `Animals (any)` ou `Science (any)`.

*   **5 | Gambling/Risk.**
    *   **Texto:** Você tem a chance de arriscar sua fortuna em um negócio ou jogo de azar.
    *   **Lógica:**
        1.  Ganha `Gambler 1` (se não tiver).
        2.  **Input do Usuário:** "Quantas rolagens de benefício você quer apostar?" (Input numérico X).
        3.  Solicitar Check: `Gambler 8+` OU `Broker 8+`.
        4.  **Se Sucesso:** Ganha metade do valor apostado (X / 2, arredondado para cima) como rolagens de benefício *extras*.
        5.  **Se Falha:** Perde todas as X rolagens apostadas.

*   **6 | High Connection.**
    *   **Lógica:** Adicionar 1 **Contato**.

*   **7 | Life Event.**
    *   **Lógica:** Chamar função `RollLifeEventTable()`.

*   **8 | Legal Trouble.**
    *   **Lógica:**
        1.  O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Advocate`, `Admin`, `Diplomat` ou `Investigate`.
        2.  O sistema rola **2D6** automaticamente.
        3.  **Se Resultado == 2:** Define `NextCareerForce = "Prisoner"` (O personagem é preso no final do termo).

*   **9 | Advanced Training.**
    *   **Lógica:**
        1.  Solicitar Check: `EDU 8+`.
        2.  **Se Sucesso:** Aumentar qualquer perícia já possuída em +1 Nível.

*   **10 | Good Deal.**
    *   **Lógica:** Incrementar `BenefitRollModifier` em +1 (DM+1 em uma rolagem de benefício).

*   **11 | Helpful Ally.**
    *   **Lógica:**
        1.  Adicionar 1 **Aliado**.
        2.  **Input do Usuário:** Escolher entre:
            *   Ganhar `Carouse 1`.
            *   **OU** Adicionar **DM+4** na próxima rolagem de **Advancement**.

*   **12 | Thriving.**
    *   **Lógica:** Promoção Automática.

---

### Tabelas de Perícias (Skill Tables)
*O usuário escolhe UMA coluna para rolar 1D6.*

| 1D6 | Personal Development | Service Skills | Assignment: Merchant Marine | Assignment: Free Trader | Assignment: Broker |
|:---:|:---|:---|:---|:---|:---|
| 1 | STR +1 | Drive (any) | Pilot (spacecraft) | Pilot (spacecraft) | Admin |
| 2 | DEX +1 | Vacc Suit | Vacc Suit | Vacc Suit | Advocate |
| 3 | END +1 | Broker | Electronics (comms) | Deception | Broker |
| 4 | INT +1 | Steward | Mechanic | Mechanic | Streetwise |
| 5 | EDU +1 | Electronics (any) | Engineer (any) | Streetwise | Deception |
| 6 | SOC +1 | Persuade | Electronics (any) | Gunner (any) | Persuade |

*   **Advanced Education (EDU 8+):** 1: Engineer (any), 2: Astrogation, 3: Electronics (sensors), 4: Pilot (small craft), 5: Admin, 6: Advocate.

---

### Ranks e Bônus (Merchant)

**Assignment: Merchant Marine**
*   **Rank 0:** Crewman — (Sem bônus).
*   **Rank 1:** Senior Crewman — Ganha `Mechanic 1`.
*   **Rank 2:** 4th Officer — (Sem bônus).
*   **Rank 3:** 3rd Officer — (Sem bônus).
*   **Rank 4:** 2nd Officer — Ganha `Pilot 1`.
*   **Rank 5:** 1st Officer — Ganha `SOC +1`.
*   **Rank 6:** Captain — (Sem bônus).

**Assignment: Free Trader**
*   **Rank 0:** — (Sem bônus).
*   **Rank 1:** — Ganha `Persuade 1`.
*   **Rank 2:** — (Sem bônus).
*   **Rank 3:** — Ganha `Jack-of-all-Trades 1`.
*   **Rank 4:** — (Sem bônus).
*   **Rank 5:** — (Sem bônus).
*   **Rank 6:** Captain — (Sem bônus).

**Assignment: Broker**
*   **Rank 0:** — (Sem bônus).
*   **Rank 1:** — Ganha `Broker 1`.
*   **Rank 2:** — (Sem bônus).
*   **Rank 3:** Experienced Broker — Ganha `Streetwise 1`.
*   **Rank 4:** — (Sem bônus).
*   **Rank 5:** — (Sem bônus).
*   **Rank 6:** — (Sem bônus).

---

# 8. CAREER: NAVY (Marinha Espacial)
**Fontes:** *Traveller Core Rulebook Update 2022* (pág. 36) e *2300AD Book 1* (Regras de Augmentação e Neural Jack).

### Estrutura de Dados e Regras de Entrada
*   **Assignments (Sub-carreiras):**
    1.  *Line/Crew* (Tripulação de Linha): Tripulação geral, operações de convés, sensores e comando.
    2.  *Engineer/Gunner* (Engenharia/Artilharia): Técnicos de propulsão (Stutterwarp/MHD) e artilheiros de torres ou baías.
    3.  *Flight* (Voo): Pilotos de caças, lançadeiras e pequenas naves auxiliares.
*   **Qualificação:** INT 6+.
    *   *DM:* -1 por carreira anterior.
    *   *DM:* -2 se Idade >= 34.
*   **Regra Especial 2300AD (Neural Jack):**
    *   Se o personagem servir a uma nação de **Tier 3 ou superior** (ex: America, France, Britain, Germany, Japan, etc.), ele pode optar por instalar um **Neural Jack** (Interface Neural) gratuitamente como parte do serviço.
    *   *Custo:* Consome 1 `BenefitRoll` final.
    *   *Benefício:* Adiciona **DM+1** em todas as rolagens de **Advancement** nesta carreira.

---

### Tabela de Desgraças (Mishap Table)
*Acionada se a rolagem de Sobrevivência falhar.*

**Input:** Rolar 1D6.

*   **1 | Severely Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  Apresentar menu **"Augmentation vs Medical Care"**.
        3.  *Nota:* Marinheiros feridos em serviço geralmente recebem cibernética de alta qualidade se optarem por ficar.
        4.  Se *Medical Care*: `Ejected = TRUE`.

*   **2 | Frozen Watch Error.**
    *   **Texto:** Colocado em sono criogênico (para transporte médico ou missão de longo alcance) e revivido incorretamente.
    *   **Lógica:**
        1.  O usuário escolhe reduzir uma característica física (**STR**, **DEX** ou **END**) em -1 ponto (atrofia muscular/dano celular).
        2.  `Ejected = FALSE` (O personagem **não** é ejetado, mas sofre o dano permanente).
        3.  Mantém o Benefício do termo.

*   **3 | Battle Responsibility.**
    *   **Texto:** Durante uma batalha, a vitória ou derrota depende de suas ações.
    *   **Lógica:**
        1.  Determinar perícia de teste baseada no Assignment:
            *   *Line/Crew:* `Electronics (sensors) 8+` OU `Gunner 8+`.
            *   *Eng/Gunner:* `Mechanic 8+` OU `Vacc Suit 8+`.
            *   *Flight:* `Pilot (any) 8+` OU `Tactics (naval) 8+`.
        2.  **Se Sucesso:** O esforço garante uma baixa honrosa. `Ejected = TRUE`, mas **mantém** o Benefício do termo.
        3.  **Se Falha:** O navio sofre danos severos e você é culpado. Corte Marcial. `Ejected = TRUE` e **perde** o Benefício do termo.

*   **4 | Blamed for Accident.**
    *   **Texto:** Você é culpado por um acidente que causou mortes.
    *   **Input do Usuário:** Botões `[Assumir Culpa]` ou `[Negar/Inocente]`.
    *   **Lógica (Assumir):**
        *   A culpa o impulsiona a excelência antes de sair.
        *   Ganha **1 Rolagem de Perícia Extra** (Skill Table) imediatamente.
        *   `Ejected = TRUE`.
    *   **Lógica (Negar):**
        *   Ganha 1 **Inimigo** (O oficial que te culpou).
        *   Mantém o Benefício do termo.
        *   `Ejected = TRUE`.

*   **5 | Quarrel.**
    *   **Lógica:**
        1.  Adicionar 1 **Rival** (Oficial ou colega).
        2.  `Ejected = TRUE`.

*   **6 | Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  `Ejected = TRUE`.

---

### Tabela de Eventos (Event Table)
*Acionada se a rolagem de Sobrevivência for um Sucesso.*

**Input:** Rolar 2D6.

*   **2 | Disaster!**
    *   **Lógica:** Rolar na **Mishap Table** (acima), aplicar efeitos, mas forçar `Ejected = FALSE`.

*   **3 | Gambling Circle.**
    *   **Input do Usuário:** Botões `[Jogar]` ou `[Observar]`.
    *   **Lógica (Observar):** Ganha `Gambler 1` ou `Deception 1`.
    *   **Lógica (Jogar):**
        1.  Solicitar Check: `Gambler 8+`.
        2.  **Se Sucesso:** Adicionar +1 à variável `TotalBenefitRolls`.
        3.  **Se Falha:** Subtrair -1 da variável `TotalBenefitRolls`.

*   **4 | Special Assignment.**
    *   **Lógica:** Incrementar `BenefitRollModifier` em +1 (DM+1 em uma rolagem de benefício).

*   **5 | Advanced Training.**
    *   **Lógica:**
        1.  Solicitar Check: `EDU 8+`.
        2.  **Se Sucesso:** O usuário escolhe **qualquer** perícia que já possua e aumenta em +1 Nível.

*   **6 | Notable Engagement.**
    *   **Texto:** Sua nave participa de uma batalha ou missão notável.
    *   **Lógica:** O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Electronics (any)`, `Engineer (any)`, `Gunner (any)` ou `Pilot (any)`.

*   **7 | Life Event.**
    *   **Lógica:** Chamar função `RollLifeEventTable()`.

*   **8 | Diplomatic Mission.**
    *   **Lógica:** O usuário escolhe um benefício:
        *   Ganhar/Aumentar `Recon`.
        *   Ganhar/Aumentar `Diplomat`.
        *   Ganhar/Aumentar `Steward`.
        *   Ganhar 1 **Contato** (Diplomata ou Alienígena).

*   **9 | Foil Crime.**
    *   **Texto:** Você impede um motim, sabotagem ou contrabando a bordo.
    *   **Lógica:**
        1.  Adicionar 1 **Inimigo** (O criminoso preso).
        2.  Adicionar **DM+2** na próxima rolagem de **Advancement**.

*   **10 | Abuse Position.**
    *   **Input do Usuário:** Botões `[Lucrar]` ou `[Recusar]`.
    *   **Lógica (Lucrar):**
        *   Adicionar +1 `TotalBenefitRolls` (extra).
        *   *Opcional:* Adicionar 1 **Rival** ou marca de corrupção.
    *   **Lógica (Recusar):**
        *   Adicionar **DM+2** na próxima rolagem de **Advancement**.

*   **11 | Commanding Officer Interest.**
    *   **Lógica:** O usuário escolhe entre:
        *   Ganhar `Tactics (naval) 1`.
        *   **OU** Adicionar **DM+4** na próxima rolagem de **Advancement**.

*   **12 | Heroism.**
    *   **Lógica:** Definir `AutomaticPromotion = TRUE` ou `AutomaticCommission = TRUE`.

---

### Tabelas de Perícias (Skill Tables)
*O usuário escolhe UMA coluna para rolar 1D6.*

| 1D6 | Personal Development | Service Skills | Assignment: Line/Crew | Assignment: Engineer/Gunner | Assignment: Flight | Officer (Rank 1+) |
|:---:|:---|:---|:---|:---|:---|:---|
| 1 | STR +1 | Pilot (any) | Electronics (any) | Engineer (any) | Pilot (any) | Leadership |
| 2 | DEX +1 | Vacc Suit | Mechanic | Mechanic | Flyer (any) | Electronics (any) |
| 3 | END +1 | Athletics (any) | Gun Combat (any) | Electronics (any) | Gunner (any) | Pilot (any) |
| 4 | INT +1 | Gunner (any) | Flyer (any) | Engineer (any) | Pilot (small craft) | Melee (blade) |
| 5 | EDU +1 | Mechanic | Melee (any) | Gunner (any) | Astrogation | Admin |
| 6 | SOC +1 | Gun Combat (any) | Vacc Suit | Flyer (any) | Electronics (any) | Tactics (naval) |

*   **Advanced Education (EDU 8+):** 1: Electronics (any), 2: Astrogation, 3: Engineer (any), 4: Drive (any), 5: Medic, 6: Admin.

---

### Ranks e Bônus (Navy)

**Enlisted (Praças):**
*   **Rank 0:** Crewman — (Sem bônus).
*   **Rank 1:** Able Spacehand — Ganha `Mechanic 1`.
*   **Rank 2:** Petty Officer 3rd Class — Ganha `Vacc Suit 1`.
*   **Rank 3:** Petty Officer 2nd Class — (Sem bônus).
*   **Rank 4:** Petty Officer 1st Class — Ganha `END +1`.
*   **Rank 5:** Chief Petty Officer — (Sem bônus).
*   **Rank 6:** Master Chief — (Sem bônus).

**Officer (Oficiais - Requer Comissão):**
*   **Rank 1:** Ensign — Ganha `Melee (blade) 1`.
*   **Rank 2:** Sublieutenant — Ganha `Leadership 1`.
*   **Rank 3:** Lieutenant — (Sem bônus).
*   **Rank 4:** Commander — Ganha `Tactics (naval) 1`.
*   **Rank 5:** Captain — Ganha `SOC 10` (ou +1 se já for maior).
*   **Rank 6:** Admiral — Ganha `SOC 12` (ou +1 se já for maior).

---

# 9. CAREER: NOBLE (Nobre/Elite)
**Fontes:** *Traveller Core Rulebook Update 2022* (pág. 38) e *2300AD Book 1*.

### Estrutura de Dados e Regras de Entrada
*   **Assignments (Sub-carreiras):**
    1.  *Administrator* (Administrador): Você serve em um governo planetário, burocracia estatal ou alta gestão corporativa.
    2.  *Diplomat* (Diplomata): Você é um embaixador, cônsul ou oficial de relações estatais.
    3.  *Dilettante* (Diletante): Você é um "bon vivant", playboy ou celebridade sem função útil, vivendo da riqueza da família.
*   **Qualificação:** SOC 10+.
    *   *DM:* -1 por carreira anterior.
    *   *Exceção:* Se o personagem já tiver SOC 10 ou mais, a qualificação é **Automática**.

---

### Tabela de Desgraças (Mishap Table)
*Acionada se a rolagem de Sobrevivência falhar.*

**Input:** Rolar 1D6.

*   **1 | Severely Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  Apresentar menu **"Augmentation vs Medical Care"**.
        3.  *Nota:* A elite tem acesso aos melhores cuidados; se escolher Augmentation, a prótese será de altíssima qualidade estética (indistinguível da real).
        4.  Se *Medical Care*: `Ejected = TRUE`.

*   **2 | Family Scandal.**
    *   **Texto:** Um escândalo familiar ou político força sua saída.
    *   **Lógica:**
        1.  Reduzir característica **SOC** em -1.
        2.  `Ejected = TRUE`.
        3.  Remover o Benefício deste termo.

*   **3 | Disaster/War.**
    *   **Texto:** Um desastre ou guerra atinge sua posição.
    *   **Lógica:**
        1.  Solicitar Check: `Stealth 8+` OU `Deception 8+` (Para escapar despercebido).
        2.  **Se Sucesso:** `Ejected = TRUE`, mas sai ileso.
        3.  **Se Falha:** Chamar `RollInjuryTable()`. `Ejected = TRUE`.
        4.  Em ambos os casos, remove o Benefício deste termo.

*   **4 | Political Maneuver.**
    *   **Texto:** Manobras políticas usurpam sua posição.
    *   **Lógica:**
        1.  O usuário escolhe aumentar uma perícia em +1 Nível: `Diplomat` ou `Advocate`.
        2.  Adicionar 1 **Rival**.
        3.  `Ejected = TRUE`.
        4.  Remover o Benefício deste termo.

*   **5 | Assassin.**
    *   **Texto:** Um assassino tenta acabar com sua vida.
    *   **Lógica:**
        1.  Solicitar Check: `END 8+`.
        2.  **Se Sucesso:** Sobrevive sem danos.
        3.  **Se Falha:** Chamar `RollInjuryTable()`.
        4.  `Ejected = TRUE`.
        5.  Remover o Benefício deste termo.

*   **6 | Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  `Ejected = TRUE`.

---

### Tabela de Eventos (Event Table)
*Acionada se a rolagem de Sobrevivência for um Sucesso.*

**Input:** Rolar 2D6.

*   **2 | Disaster!**
    *   **Lógica:** Rolar na **Mishap Table** (acima), aplicar efeitos (como perda de SOC se cair 2), mas forçar `Ejected = FALSE`.

*   **3 | Challenge/Duel.**
    *   **Texto:** Você é desafiado para um duelo de honra ou debate público.
    *   **Input do Usuário:** Botões `[Aceitar]` ou `[Recusar]`.
    *   **Lógica (Recusar):** Reduzir **SOC** em -1.
    *   **Lógica (Aceitar):**
        1.  Solicitar Check: `Melee (blade) 8+` OU `Leadership 8+` OU `Tactics 8+` (dependendo da natureza do duelo).
        2.  **Se Sucesso:** Aumentar **SOC** em +1.
        3.  **Se Falha:** Reduzir **SOC** em -1 E Chamar `RollInjuryTable()`.
        4.  *Bônus:* Em ambos os casos (sucesso ou falha no dado), ganhar +1 Nível na perícia usada (Melee, Leadership, etc.).

*   **4 | Diverse Experience.**
    *   **Lógica:** O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Animals (handling)`, `Art (any)`, `Carouse` ou `Streetwise`.

*   **5 | Inheritance.**
    *   **Texto:** Você herda um presente de um parente rico.
    *   **Lógica:** Incrementar `BenefitRollModifier` em +1 (DM+1 em uma rolagem de benefício).

*   **6 | Political Intrigue.**
    *   **Lógica:**
        1.  O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Advocate`, `Admin`, `Diplomat` ou `Persuade`.
        2.  Adicionar 1 **Rival**.

*   **7 | Life Event.**
    *   **Lógica:** Chamar função `RollLifeEventTable()`.

*   **8 | Conspiracy.**
    *   **Texto:** Uma conspiração tenta recrutá-lo.
    *   **Input do Usuário:** Botões `[Aceitar]` ou `[Recusar]`.
    *   **Lógica (Recusar):** Adicionar 1 **Inimigo** (A conspiração).
    *   **Lógica (Aceitar):**
        1.  Solicitar Check: `Deception 8+` OU `Persuade 8+`.
        2.  **Se Sucesso:** O usuário escolhe uma perícia para aumentar (+1 Nível): `Deception`, `Persuade`, `Tactics` ou `Carouse`.
        3.  **Se Falha:** Rolar na **Mishap Table** (A conspiração colapsa e você cai junto).

*   **9 | Acclaimed Reign.**
    *   **Lógica:**
        1.  Adicionar **DM+2** na próxima rolagem de **Advancement**.
        2.  Adicionar 1 **Inimigo** (Parente invejoso ou súdito infeliz).

*   **10 | High Society.**
    *   **Lógica:**
        1.  O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Carouse`, `Diplomat`, `Persuade` ou `Steward`.
        2.  Adicionar 1 **Rival**.
        3.  Adicionar 1 **Aliado**.

*   **11 | Mentor.**
    *   **Lógica:**
        1.  Adicionar 1 **Aliado**.
        2.  **Input do Usuário:** Escolher entre:
            *   Ganhar `Leadership 1`.
            *   **OU** Adicionar **DM+4** na próxima rolagem de **Advancement**.

*   **12 | Attention of Imperium/State.**
    *   **Lógica:** Promoção Automática.

---

### Tabelas de Perícias (Skill Tables)
*O usuário escolhe UMA coluna para rolar 1D6.*

| 1D6 | Personal Development | Service Skills | Assignment: Administrator | Assignment: Diplomat | Assignment: Dilettante |
|:---:|:---|:---|:---|:---|:---|
| 1 | STR +1 | Admin | Admin | Advocate | Art (any) |
| 2 | DEX +1 | Advocate | Advocate | Carouse | Carouse |
| 3 | END +1 | Electronics (any) | Broker | Diplomat | Deception |
| 4 | INT +1 | Diplomat | Diplomat | Electronics (any) | Flyer (any) |
| 5 | EDU +1 | Investigate | Leadership | Steward | Streetwise |
| 6 | SOC +1 | Persuade | Persuade | Streetwise | Jack-of-all-Trades |

*   **Advanced Education (EDU 8+):** 1: Admin, 2: Advocate, 3: Language (any), 4: Leadership, 5: Diplomat, 6: Art (any).

---

### Ranks e Bônus (Noble)

*Nota: Em 2300AD, os títulos (Barão, Duque) são usados apenas por nações que os mantêm (UK, Alemanha, Japão). Para outras (EUA, França), use os equivalentes burocráticos (Diretor, Ministro).*

**Assignment: Administrator**
*   **Rank 0:** Assistant — (Sem bônus).
*   **Rank 1:** Clerk — Ganha `Admin 1`.
*   **Rank 2:** Supervisor — (Sem bônus).
*   **Rank 3:** Manager — Ganha `Advocate 1`.
*   **Rank 4:** Chief — (Sem bônus).
*   **Rank 5:** Director — Ganha `Leadership 1`.
*   **Rank 6:** Minister — (Sem bônus).

**Assignment: Diplomat**
*   **Rank 0:** Intern — (Sem bônus).
*   **Rank 1:** 3rd Secretary — Ganha `Admin 1`.
*   **Rank 2:** 2nd Secretary — (Sem bônus).
*   **Rank 3:** 1st Secretary — Ganha `Advocate 1`.
*   **Rank 4:** Counsellor — (Sem bônus).
*   **Rank 5:** Minister — Ganha `Diplomat 1`.
*   **Rank 6:** Ambassador — (Sem bônus).

**Assignment: Dilettante**
*   **Rank 0:** Wastrel — (Sem bônus).
*   **Rank 1:** — (Sem bônus).
*   **Rank 2:** Ingrate — Ganha `Carouse 1`.
*   **Rank 3:** Black Sheep — (Sem bônus).
*   **Rank 4:** Scoundrel — Ganha `Persuade 1`.
*   **Rank 5:** — (Sem bônus).
*   **Rank 6:** — Ganha `Jack-of-all-Trades 1`.

---

# 10. CAREER: ROGUE (Criminoso)
**Fontes:** *Traveller Core Rulebook Update 2022* (pág. 40).

### Estrutura de Dados e Regras de Entrada
*   **Assignments (Sub-carreiras):**
    1.  *Thief* (Ladrão): Especialista em roubo, invasão e furtividade (Cat burglar, Hacker).
    2.  *Enforcer* (Executor): Músculos para aluguel, assassino ou guarda-costas do crime organizado.
    3.  *Pirate* (Pirata): Operador de naves que ataca o comércio interestelar ou planetário.
*   **Qualificação:** DEX 6+.
    *   *DM:* -1 por carreira anterior.

---

### Tabela de Desgraças (Mishap Table)
*Acionada se a rolagem de Sobrevivência falhar.*

**Input:** Rolar 1D6.

*   **1 | Severely Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  Apresentar menu **"Augmentation vs Medical Care"**.
        3.  Se *Medical Care*: `Ejected = TRUE`.

*   **2 | Arrested.**
    *   **Texto:** Você é preso.
    *   **Lógica:**
        1.  `Ejected = TRUE`.
        2.  Remover o Benefício deste termo.
        3.  Definir `NextCareerForce = "Prisoner"` (Obrigatório ir para a Prisão no próximo termo).

*   **3 | Betrayal.**
    *   **Texto:** Traído por um amigo ou parceiro.
    *   **Lógica:**
        1.  Verificar lista de `Allies` e `Contacts`.
        2.  **Se existir:** Converter um em **Rival** ou **Inimigo**.
        3.  **Se não existir:** Criar um novo **Rival** ou **Inimigo**.
        4.  Rolar 2D6. **Se Resultado == 2:** Definir `NextCareerForce = "Prisoner"`.
        5.  `Ejected = TRUE`.
        6.  Remover o Benefício deste termo.

*   **4 | Forced Flee.**
    *   **Texto:** Um trabalho dá errado, forçando você a fugir do planeta.
    *   **Lógica:**
        1.  O usuário escolhe aumentar uma perícia em +1 Nível: `Deception`, `Pilot (any)`, `Athletics (dexterity)` ou `Gunner (any)`.
        2.  `Ejected = TRUE`.
        3.  Remover o Benefício deste termo.

*   **5 | Hunted.**
    *   **Texto:** Um detetive de polícia ou rival criminoso força sua fuga e jura caçá-lo.
    *   **Lógica:**
        1.  Adicionar 1 **Inimigo**.
        2.  `Ejected = TRUE`.
        3.  Remover o Benefício deste termo.

*   **6 | Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  `Ejected = TRUE`.

---

### Tabela de Eventos (Event Table)
*Acionada se a rolagem de Sobrevivência for um Sucesso.*

**Input:** Rolar 2D6.

*   **2 | Disaster!**
    *   **Lógica:** Rolar na **Mishap Table** (acima), aplicar efeitos (prisão, inimigos), mas forçar `Ejected = FALSE` (escapou por pouco, continua na vida do crime).

*   **3 | Arrested (Event).**
    *   **Texto:** Você é preso e acusado.
    *   **Input do Usuário:** Botões `[Defender-se]` ou `[Advogado]`.
    *   **Lógica (Defender-se):**
        *   Solicitar Check: `Advocate 8+`.
        *   **Se Sucesso:** Acusações retiradas. Nada acontece.
        *   **Se Falha:** Ganha 1 **Inimigo** e `NextCareerForce = "Prisoner"`.
    *   **Lógica (Advogado):**
        *   Ganha o advogado como **Contato**.
        *   Perde 1 `BenefitRoll` deste termo (custo legal).
        *   Não vai preso.

*   **4 | Heist.**
    *   **Texto:** Você planeja um grande roubo.
    *   **Lógica:** O usuário escolhe aumentar uma perícia em +1 Nível: `Electronics (any)` ou `Mechanic`.

*   **5 | Crime Pays.**
    *   **Lógica:**
        1.  Ganha 1 **Inimigo** (A vítima).
        2.  Adicionar **DM+2** em qualquer rolagem de **Benefit** desta carreira.

*   **6 | Backstab Opportunity.**
    *   **Texto:** Chance de trair um colega para ganho pessoal.
    *   **Input do Usuário:** Botões `[Trair]` ou `[Recusar]`.
    *   **Lógica (Trair):** Adicionar **DM+4** na próxima rolagem de **Advancement**.
    *   **Lógica (Recusar):** Adicionar 1 **Aliado**.

*   **7 | Life Event.**
    *   **Lógica:** Chamar função `RollLifeEventTable()`.

*   **8 | Underworld Life.**
    *   **Lógica:** O usuário escolhe aumentar uma perícia em +1 Nível: `Streetwise`, `Stealth`, `Melee (any)` ou `Gun Combat (any)`.

*   **9 | Gang War.**
    *   **Lógica:**
        1.  Solicitar Check: `Stealth 8+` OU `Gun Combat (any) 8+`.
        2.  **Se Sucesso:** Ganha +1 `BenefitRoll` extra (Espólios de guerra).
        3.  **Se Falha:** Chamar `RollInjuryTable()`.

*   **10 | Gambling Ring.**
    *   **Lógica:**
        1.  Ganha `Gambler 1`.
        2.  **Input do Usuário:** "Quantas rolagens de benefício você quer apostar?" (Input numérico X).
        3.  Solicitar Check: `Gambler 8+`.
        4.  **Se Sucesso:** Ganha metade do valor apostado (X / 2, arredondado para cima) como rolagens extras.
        5.  **Se Falha:** Perde todas as X rolagens apostadas.

*   **11 | Protégé.**
    *   **Lógica:**
        1.  Adicionar 1 **Inimigo** ou **Rival** (O chefe anterior ou rival do novo chefe). *Nota: Texto original diz que um Lorde do Crime te adota. Isso geralmente é positivo (Aliado/Advancement), mas vou seguir a interpretação padrão de Mentor.*
        2.  **Input do Usuário:** Escolher entre:
            *   Ganhar `Tactics (military) 1`.
            *   **OU** Adicionar **DM+4** na próxima rolagem de **Advancement**.

*   **12 | Legendary Crime.**
    *   **Lógica:** Promoção Automática.

---

### Tabelas de Perícias (Skill Tables)
*O usuário escolhe UMA coluna para rolar 1D6.*

| 1D6 | Personal Development | Service Skills | Assignment: Thief | Assignment: Enforcer | Assignment: Pirate |
|:---:|:---|:---|:---|:---|:---|
| 1 | Carouse | Deception | Stealth | Gun Combat (any) | Pilot (any) |
| 2 | DEX +1 | Recon | Electronics (computers) | Melee (any) | Astrogation |
| 3 | END +1 | Athletics (any) | Recon | Streetwise | Gunner (any) |
| 4 | Gambler | Gun Combat (any) | Streetwise | Persuade | Engineer (any) |
| 5 | Melee (any) | Stealth | Deception | Athletics (any) | Vacc Suit |
| 6 | Gun Combat (any) | Streetwise | Athletics (any) | Drive (any) | Melee (any) |

*   **Advanced Education (EDU 10+):** 1: Electronics (any), 2: Navigation, 3: Medic, 4: Investigate, 5: Broker, 6: Advocate.

---

### Ranks e Bônus (Rogue)

**Assignment: Thief**
*   **Rank 0:** — (Sem bônus).
*   **Rank 1:** — Ganha `Stealth 1`.
*   **Rank 2:** — (Sem bônus).
*   **Rank 3:** — Ganha `Streetwise 1`.
*   **Rank 4:** — (Sem bônus).
*   **Rank 5:** — Ganha `Recon 1`.
*   **Rank 6:** — (Sem bônus).

**Assignment: Enforcer**
*   **Rank 0:** — (Sem bônus).
*   **Rank 1:** — Ganha `Persuade 1`.
*   **Rank 2:** — (Sem bônus).
*   **Rank 3:** — Ganha `Gun Combat (any) 1` OU `Melee (any) 1`.
*   **Rank 4:** — (Sem bônus).
*   **Rank 5:** — Ganha `Streetwise 1`.
*   **Rank 6:** — (Sem bônus).

**Assignment: Pirate**
*   **Rank 0:** Lackey — (Sem bônus).
*   **Rank 1:** Henchman — Ganha `Pilot 1` OU `Gunner 1`.
*   **Rank 2:** Corporal — (Sem bônus).
*   **Rank 3:** Sergeant — Ganha `Gun Combat 1` OU `Melee 1`.
*   **Rank 4:** Lieutenant — (Sem bônus).
*   **Rank 5:** Leader — Ganha `Leadership 1`.
*   **Rank 6:** Captain — (Sem bônus).

---

# 11. CAREER: SCHOLAR (Acadêmico)
**Fontes:** *Traveller Core Rulebook Update 2022* (pág. 42) e *2300AD Book 1*.

### Estrutura de Dados e Regras de Entrada
*   **Assignments (Sub-carreiras):**
    1.  *Field Researcher* (Pesquisador de Campo): Explorador científico, biólogo em novos mundos, arqueólogo xeno.
    2.  *Scientist* (Cientista): Pesquisador de laboratório, físico teórico, engenheiro de materiais.
    3.  *Physician* (Médico): Doutor, cirurgião ou pesquisador médico.
*   **Qualificação:** INT 6+.
    *   *DM:* -1 por carreira anterior.

---

### Tabela de Desgraças (Mishap Table)
*Acionada se a rolagem de Sobrevivência falhar.*

**Input:** Rolar 1D6.

*   **1 | Severely Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  Apresentar menu **"Augmentation vs Medical Care"**.
        3.  Se *Medical Care*: `Ejected = TRUE`.

*   **2 | Disaster.**
    *   **Texto:** Um desastre deixa vários feridos e você é culpado.
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()` **duas vezes**. O sistema deve aplicar o **maior** resultado (maior gravidade, pois você tentou salvar outros ou estava no epicentro).
        2.  Adicionar 1 **Rival** (Colega que te culpa ou sobrevivente).
        3.  `Ejected = TRUE`.
        4.  Remover o Benefício deste termo.

*   **3 | Interference.**
    *   **Texto:** O governo ou uma corporação interfere na sua pesquisa por razões políticas ou religiosas.
    *   **Input do Usuário:** Botões `[Continuar Abertamente]` ou `[Continuar Secretamente]`.
    *   **Lógica (Abertamente):**
        *   Ganha 1 **Inimigo**.
        *   Aumenta `Science (any)` em +1 Nível.
        *   *Não é ejetado* (Você luta pelo seu posto).
    *   **Lógica (Secretamente):**
        *   Reduz **SOC** em -2 (Você se torna um pária ou recluso).
        *   Aumenta `Science (any)` em +1 Nível.
        *   *Não é ejetado*.

*   **4 | Expedition Wrong.**
    *   **Texto:** Uma expedição dá errado, deixando você preso no deserto/espaço.
    *   **Lógica:**
        1.  O usuário escolhe aumentar uma perícia em +1 Nível: `Survival` ou `Athletics (any)`.
        2.  `Ejected = TRUE` (Quando você volta, seu emprego já era).
        3.  Remover o Benefício deste termo.

*   **5 | Sabotage.**
    *   **Texto:** Seu trabalho é sabotado.
    *   **Input do Usuário:** Botões `[Desistir]` ou `[Recomeçar]`.
    *   **Lógica (Desistir):**
        *   `Ejected = TRUE`.
        *   **Mantém** o Benefício deste termo.
    *   **Lógica (Recomeçar):**
        *   `Ejected = FALSE` (Fica na carreira).
        *   **Perde** o Benefício deste termo.

*   **6 | Rival.**
    *   **Texto:** Um pesquisador rival rouba seu trabalho ou mancha seu nome.
    *   **Lógica:**
        1.  Adicionar 1 **Rival**.
        2.  `Ejected = FALSE` (Você fica para provar seu valor).
        3.  Mantém o Benefício do termo.

---

### Tabela de Eventos (Event Table)
*Acionada se a rolagem de Sobrevivência for um Sucesso.*

**Input:** Rolar 2D6.

*   **2 | Disaster!**
    *   **Lógica:** Rolar na **Mishap Table** (acima). Se o resultado for ejeção, force `Ejected = FALSE` (o desastre ocorre, mas você sobrevive profissionalmente).

*   **3 | Conscience.**
    *   **Texto:** Você é chamado para realizar uma pesquisa que vai contra sua consciência (bioarmas, testes em sencientes).
    *   **Input do Usuário:** Botões `[Aceitar]` ou `[Recusar]`.
    *   **Lógica (Aceitar):**
        *   Ganha +1 `BenefitRoll` extra.
        *   Ganha +1 Nível em **duas** especializações diferentes de `Science` (Ex: Biology e Chemistry).
        *   Ganha `1D3` **Inimigos** (Ativistas, vítimas ou sua própria culpa personificada).
    *   **Lógica (Recusar):** Nada acontece.

*   **4 | Special Project.**
    *   **Texto:** Você é designado para um projeto secreto (Black Project).
    *   **Lógica:** O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Medic`, `Science (any)`, `Engineer (any)`, `Electronics (any)` ou `Investigate`.

*   **5 | Prize.**
    *   **Texto:** Você ganha um prêmio prestigiado (Nobel, trilon Award).
    *   **Lógica:** Incrementar `BenefitRollModifier` em +1.

*   **6 | Advanced Training.**
    *   **Lógica:**
        1.  Solicitar Check: `EDU 8+`.
        2.  **Se Sucesso:** O usuário escolhe **qualquer** perícia que já possua e aumenta em +1 Nível.

*   **7 | Life Event.**
    *   **Lógica:** Chamar função `RollLifeEventTable()`.

*   **8 | Cheating.**
    *   **Texto:** Oportunidade de trapacear, roubar dados ou usar tecnologia alienígena proibida.
    *   **Input do Usuário:** Botões `[Trapacear]` ou `[Recusar]`.
    *   **Lógica (Recusar):** Nada acontece.
    *   **Lógica (Trapacear):**
        1.  Solicitar Check: `Deception 8+` OU `Admin 8+`.
        2.  **Se Sucesso:** Ganha +1 Nível em qualquer perícia, Ganha DM+2 em um Benefício, Ganha 1 **Inimigo**.
        3.  **Se Falha:** Ganha 1 **Inimigo** e perde 1 `BenefitRoll`.

*   **9 | Breakthrough.**
    *   **Lógica:** Adicionar **DM+2** na próxima rolagem de **Advancement**.

*   **10 | Bureaucracy.**
    *   **Texto:** Você se envolve em burocracia legal.
    *   **Lógica:** O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Admin`, `Advocate`, `Persuade` ou `Diplomat`.

*   **11 | Mentor.**
    *   **Lógica:**
        1.  Adicionar 1 **Aliado**.
        2.  **Input do Usuário:** Escolher entre:
            *   Ganhar `Science (any) 1`.
            *   **OU** Adicionar **DM+4** na próxima rolagem de **Advancement**.

*   **12 | Great Breakthrough.**
    *   **Lógica:** Promoção Automática.

---

### Tabelas de Perícias (Skill Tables)
*O usuário escolhe UMA coluna para rolar 1D6.*

| 1D6 | Personal Development | Service Skills | Assignment: Field Researcher | Assignment: Scientist | Assignment: Physician |
|:---:|:---|:---|:---|:---|:---|
| 1 | INT +1 | Drive (any) | Electronics (any) | Admin | Medic |
| 2 | EDU +1 | Electronics (any) | Vacc Suit | Engineer (any) | Electronics (any) |
| 3 | SOC +1 | Diplomat | Navigation | Science (any) | Investigate |
| 4 | DEX +1 | Medic | Survival | Science (any) | Medic |
| 5 | END +1 | Investigate | Investigate | Electronics (any) | Persuade |
| 6 | Language (any) | Science (any) | Science (any) | Science (any) | Science (any) |

*   **Advanced Education (EDU 10+):** 1: Art (any), 2: Advocate, 3: Electronics (any), 4: Language (any), 5: Engineer (any), 6: Science (any).

---

### Ranks e Bônus (Scholar)

**Assignment: Field Researcher**
*   **Rank 0:** — (Sem bônus).
*   **Rank 1:** — Ganha `Science (any) 1`.
*   **Rank 2:** — Ganha `Electronics (computers) 1`.
*   **Rank 3:** — Ganha `Investigate 1`.
*   **Rank 4:** — (Sem bônus).
*   **Rank 5:** — Ganha `Science (any) 1` (aumenta nível ou nova especialidade).
*   **Rank 6:** — (Sem bônus).

**Assignment: Scientist**
*   **Rank 0:** — (Sem bônus).
*   **Rank 1:** — Ganha `Science (any) 1`.
*   **Rank 2:** — Ganha `Electronics (computers) 1`.
*   **Rank 3:** — Ganha `Investigate 1`.
*   **Rank 4:** — (Sem bônus).
*   **Rank 5:** — Ganha `Science (any) 1`.
*   **Rank 6:** — (Sem bônus).

**Assignment: Physician**
*   **Rank 0:** — (Sem bônus).
*   **Rank 1:** — Ganha `Medic 1`.
*   **Rank 2:** — (Sem bônus).
*   **Rank 3:** — Ganha `Science (any) 1`.
*   **Rank 4:** — (Sem bônus).
*   **Rank 5:** — Ganha `Science (any) 1`.
*   **Rank 6:** — (Sem bônus).

---

Aqui está o detalhamento completo para a carreira **SCOUT (Explorador)**.

Em *2300AD*, os Exploradores são a vanguarda da humanidade, mapeando as rotas de *Stutterwarp* (Dobra), localizando pontos de descarga gravitacional e fazendo o primeiro contato com biomas alienígenas hostis. Eles operam sozinhos ou em pequenas equipes, muitas vezes longe do suporte da civilização.

---

# 12. CAREER: SCOUT (Explorador)
**Fontes:** *Traveller Core Rulebook Update 2022* (pág. 44) e *2300AD Book 1* (Adaptações de Stutterwarp).

### Estrutura de Dados e Regras de Entrada
*   **Assignments (Sub-carreiras):**
    1.  *Courier* (Correio/Mensageiro): Transporta dados vitais e mensagens de alta prioridade entre as colônias (já que não há comunicação FTL sem naves).
    2.  *Surveyor* (Agrimensor/Cartógrafo): Mapeia novos sistemas, asteroides e recursos em mundos de fronteira.
    3.  *Explorer* (Explorador): Vai onde o mapa está em branco, lidando com o desconhecido absoluto.
*   **Qualificação:** INT 5+.
    *   *DM:* -1 por carreira anterior.

---

### Tabela de Desgraças (Mishap Table)
*Acionada se a rolagem de Sobrevivência falhar.*

**Input:** Rolar 1D6.

*   **1 | Severely Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  Apresentar menu **"Augmentation vs Medical Care"**.
        3.  Se *Medical Care*: `Ejected = TRUE`.

*   **2 | Psychologically Damaged.**
    *   **Texto:** O isolamento do espaço profundo ou horrores alienígenas afetam sua mente.
    *   **Lógica:**
        1.  O usuário escolhe: Reduzir **INT** ou **SOC** em -1.
        2.  `Ejected = TRUE`.
        3.  Remover o Benefício deste termo.

*   **3 | Ship Damaged.**
    *   **Texto:** Sua nave é danificada e você precisa pegar carona de volta à civilização.
    *   **Lógica:**
        1.  Adicionar `1D6` **Contatos** (Pessoas que te deram carona).
        2.  Adicionar `1D3` **Inimigos** (Pessoas que você irritou na viagem ou credores da nave perdida).
        3.  `Ejected = TRUE`.
        4.  Remover o Benefício deste termo.

*   **4 | Diplomatic Incident.**
    *   **Texto:** Você inadvertidamente causa um conflito entre sua nação e uma espécie alienígena ou colônia menor.
    *   **Lógica:**
        1.  Adicionar 1 **Rival**.
        2.  Adicionar Perícia: `Diplomat 1`.
        3.  `Ejected = TRUE`.
        4.  Remover o Benefício deste termo.

*   **5 | Mystery.**
    *   **Texto:** Você não tem ideia do que aconteceu. Encontraram sua nave à deriva.
    *   **Lógica:**
        1.  Adicionar nota no histórico: "Lacuna de memória/Evento inexplicável no espaço profundo".
        2.  `Ejected = TRUE`.
        3.  Remover o Benefício deste termo.

*   **6 | Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  `Ejected = TRUE`.

---

### Tabela de Eventos (Event Table)
*Acionada se a rolagem de Sobrevivência for um Sucesso.*

**Input:** Rolar 2D6.

*   **2 | Disaster!**
    *   **Lógica:** Rolar na **Mishap Table** (acima), aplicar efeitos, mas forçar `Ejected = FALSE`.

*   **3 | Ambushed.**
    *   **Texto:** Sua nave é emboscada (por Kaefers, piratas ou rivais).
    *   **Input do Usuário:** Botões `[Fugir]` ou `[Negociar]`.
    *   **Lógica (Fugir):**
        *   Solicitar Check: `Pilot (any) 8+`.
        *   **Se Sucesso:** Sobrevive, ganha `Electronics (sensors) 1`, ganha 1 **Inimigo**.
        *   **Se Falha:** Nave destruída. `Ejected = TRUE`. (Fim da carreira).
    *   **Lógica (Negociar):**
        *   Solicitar Check: `Persuade 10+`.
        *   **Se Sucesso:** Sobrevive, ganha `Electronics (sensors) 1`, ganha 1 **Inimigo**.
        *   **Se Falha:** Nave destruída/Roubada. `Ejected = TRUE`.

*   **4 | Alien Survey.**
    *   **Texto:** Você pesquisa um mundo alienígena.
    *   **Lógica:** O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Animals (handling/training)`, `Survival`, `Recon` ou `Science (any)`.

*   **5 | Exemplary Service.**
    *   **Lógica:** Incrementar `BenefitRollModifier` em +1.

*   **6 | Stutterwarp Route.**
    *   **Texto:** Você passa anos mapeando rotas de dobra entre sistemas.
    *   **Lógica:** O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Astrogation`, `Electronics (any)`, `Navigation`, `Pilot (small craft)` ou `Mechanic`.

*   **7 | Life Event.**
    *   **Lógica:** Chamar função `RollLifeEventTable()`.

*   **8 | Gather Intelligence.**
    *   **Texto:** Oportunidade de espionar uma espécie alienígena (Pentapods, Kaefers, Sung).
    *   **Lógica:**
        1.  Solicitar Check: `Electronics (any) 8+` OU `Deception 8+`.
        2.  **Se Sucesso:** Ganha 1 **Aliado** (na Inteligência Naval/Governo) e Adiciona **DM+2** no próximo **Advancement**.
        3.  **Se Falha:** Rolar na **Mishap Table** (mas não é ejetado da carreira).

*   **9 | Rescue Mission.**
    *   **Texto:** Você é o primeiro a chegar em um desastre.
    *   **Lógica:**
        1.  Solicitar Check: `Medic 8+` OU `Engineer (any) 8+`.
        2.  **Se Sucesso:** Ganha 1 **Contato** e Adiciona **DM+2** no próximo **Advancement**.
        3.  **Se Falha:** Ganha 1 **Inimigo** (Sobrevivente que culpa você ou parente da vítima).

*   **10 | The Fringes.**
    *   **Texto:** Você passa tempo na orla do espaço conhecido.
    *   **Lógica:**
        1.  Solicitar Check: `Survival 8+` OU `Pilot (any) 8+`.
        2.  **Se Sucesso:** Ganha 1 **Contato** (Alien ou Fronteiriço) e aumenta *qualquer* perícia em +1 Nível.
        3.  **Se Falha:** Rolar na **Mishap Table** (mas não é ejetado).

*   **11 | Courier Duty.**
    *   **Texto:** Você entrega uma mensagem vital.
    *   **Lógica:**
        1.  **Input do Usuário:** Escolher entre:
            *   Ganhar `Diplomat 1`.
            *   **OU** Adicionar **DM+4** na próxima rolagem de **Advancement**.

*   **12 | Discovery.**
    *   **Texto:** Você descobre um novo mundo, artefato ou rota estável.
    *   **Lógica:** Promoção Automática.

---

### Tabelas de Perícias (Skill Tables)
*O usuário escolhe UMA coluna para rolar 1D6.*

| 1D6 | Personal Development | Service Skills | Assignment: Courier | Assignment: Surveyor | Assignment: Explorer |
|:---:|:---|:---|:---|:---|:---|
| 1 | STR +1 | Pilot (any) | Electronics (any) | Electronics (any) | Electronics (any) |
| 2 | DEX +1 | Survival | Flyer (any) | Persuade | Pilot (any) |
| 3 | END +1 | Mechanic | Pilot (spacecraft) | Pilot (any) | Engineer (any) |
| 4 | INT +1 | Astrogation | Engineer (any) | Navigation | Science (any) |
| 5 | EDU +1 | Vacc Suit | Athletics (any) | Diplomat | Stealth |
| 6 | Jack-of-all-Trades | Gun Combat (any) | Astrogation | Streetwise | Recon |

*   **Advanced Education (EDU 8+):** 1: Medic, 2: Language (any), 3: Seafarer (any), 4: Explosives, 5: Science (any), 6: Jack-of-all-Trades.

---

### Ranks e Bônus (Scout)

*   **Rank 0:** — (Sem bônus).
*   **Rank 1:** Scout — Ganha `Vacc Suit 1`.
*   **Rank 2:** — (Sem bônus).
*   **Rank 3:** Senior Scout — Ganha `Pilot (any) 1`.
*   **Rank 4:** — (Sem bônus).
*   **Rank 5:** — (Sem bônus).
*   **Rank 6:** — (Sem bônus).

---

# 13. CAREER: SPACEBORNE (Nascido no Espaço)
**Fontes:** *2300AD Book 1* (pág. 60-63).

### Estrutura de Dados e Regras de Entrada
*   **Assignments (Sub-carreiras):**
    1.  *Belter* (Minerador de Cinturão): Trabalha extraindo minério em gravidade zero.
    2.  *Tinker* (Faz-tudo Espacial): Vive consertando estações e naves velhas, mantendo os sistemas de suporte de vida funcionando.
    3.  *Libertine* (Libertino/Nômade): Membro das famílias nômades que vivem em naves clã viajando entre sistemas (como os Ciganos Espaciais).
*   **Qualificação:** Automática (Substitui Drifter).
*   **Traço Especial:** Todos os Spaceborne recebem automaticamente a modificação genética **0-G DNAM** (Adaptação a Gravidade Zero).

---

### Tabela de Desgraças (Mishap Table)
*Acionada se a rolagem de Sobrevivência falhar.*

**Input:** Rolar 1D6.

*   **1 | Severely Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  *Nota:* Role duas vezes e pegue o menor resultado (regra específica desta tabela), ou aplique resultado 2.
        3.  Menu "Augmentation vs Medical Care". Se Medical, perde o benefício.

*   **2 | Corp Harassment.**
    *   **Texto:** Você é assediado e tem a vida arruinada por uma corporação.
    *   **Lógica:**
        1.  Adicionar 1 **Inimigo** (Executivo Corporativo).
        2.  Perde o Benefício deste termo.

*   **3 | Hard Times.**
    *   **Texto:** A falta de comércio interestelar custa seu emprego.
    *   **Lógica:**
        1.  Reduzir **SOC** em -1.
        2.  Perde o Benefício deste termo.

*   **4 | Family Investigation.**
    *   **Texto:** Sua família/clã é investigada pelas autoridades planetárias.
    *   **Input do Usuário:** Botões `[Cooperar]` ou `[Recusar]`.
    *   **Lógica (Cooperar):**
        *   A família enfrenta acusações.
        *   Ganha **DM+2** na Qualificação da *próxima* carreira (Recompensa).
        *   Perde o Benefício deste termo.
    *   **Lógica (Recusar):**
        *   Ganha 1 **Aliado** (Membro da família grato).
        *   Perde o Benefício deste termo.

*   **5 | Corp Challenge.**
    *   **Texto:** Uma corporação desafia sua família, forçando você a deixar o sistema.
    *   **Lógica:**
        1.  Solicitar Check: `Streetwise 8+`.
        2.  **Se Sucesso:** Aumentar *qualquer* perícia que já possua em +1 Nível.
        3.  **Se Falha:** Nenhum bônus.
        4.  Em ambos os casos: Perde o Benefício deste termo.

*   **6 | Injured.**
    *   **Lógica:**
        1.  Chamar `RollInjuryTable()`.
        2.  Perde o Benefício deste termo.

---

### Tabela de Eventos (Event Table)
*Acionada se a rolagem de Sobrevivência for um Sucesso.*

**Input:** Rolar 2D6.

*   **2 | Disaster!**
    *   **Lógica:** Rolar na **Mishap Table**. Aplicar efeitos, mas **não** é ejetado.

*   **3 | Patron Offer.**
    *   **Lógica:**
        *   **Se Aceitar:** Ganha **DM+4** na próxima Qualificação. Nota: "Deve Favor".
        *   **Se Recusar:** Nada.

*   **4 | Useful Skills.**
    *   **Lógica:** O usuário escolhe uma perícia para ganhar/aumentar (+1 Nível): `Jack-of-all-Trades`, `Survival`, `Streetwise`, `Melee (any)`.

*   **5 | Scavenge.**
    *   **Lógica:** Incrementar `BenefitRollModifier` em +1.

*   **6 | Unusual Encounter.**
    *   **Lógica:** Ir para a tabela `Life Events` e aplicar o resultado 12 (Unusual Event).

*   **7 | Life Event.**
    *   **Lógica:** Chamar função `RollLifeEventTable()`.

*   **8 | Attacked.**
    *   **Lógica:**
        1.  Ganha 1 **Inimigo** (se não tiver).
        2.  Solicitar Check: `Melee 8+` OU `Gun Combat 8+` OU `Stealth 8+`.
        3.  **Se Sucesso:** Evita ferimentos.
        4.  **Se Falha:** Chamar `RollInjuryTable()`.

*   **9 | Risky Adventure.**
    *   **Input do Usuário:** Botões `[Aceitar]` ou `[Recusar]`.
    *   **Lógica (Aceitar):** Rolar 1D6.
        *   **1-2:** Chamar `RollInjuryTable()` OU definir próxima carreira como **Prisoner**.
        *   **3-4:** Nada acontece.
        *   **5-6:** Adicionar **DM+4** a uma rolagem de Benefício.

*   **10 | Life on the Edge.**
    *   **Lógica:** Aumentar *qualquer* perícia que o personagem já possua em +1 Nível.

*   **11 | Life on the Fringe.**
    *   **Lógica:** Chamar função `RollLifeEventTable()`. (Sim, outra chance de evento de vida).

*   **12 | Thrive.**
    *   **Lógica:** Promoção Automática.

---

### Tabelas de Perícias (Skill Tables)
*O usuário escolhe UMA coluna para rolar 1D6.*

| 1D6 | Personal Development | Service Skills | Assignment: Libertine | Assignment: Tinker | Assignment: Belter |
|:---:|:---|:---|:---|:---|:---|
| 1 | STR +1 | Athletics | Pilot (any) | Pilot (any) | Pilot (small craft) |
| 2 | END +1 | Melee (unarmed) | Vacc Suit | Profession (any) | Mechanic |
| 3 | DEX +1 | Recon | Persuade | Mechanic | Astrogation |
| 4 | Language (any) | Streetwise | Mechanic | Streetwise | Vacc Suit |
| 5 | Profession (any) | Stealth | Engineer (any) | Engineer (any) | Profession (belter) |
| 6 | Jack-of-all-Trades | Survival | Electronics (any) | Vacc Suit | Science (any) |

*   **Advanced Education (EDU 8+):** 1: Engineer (any), 2: Astrogation, 3: Science (any), 4: Profession (any), 5: Admin, 6: Advocate.

---

### Ranks e Bônus (Spaceborne)

**Assignment: Belter**
*   **Rank 0:** — (Sem bônus).
*   **Rank 1:** — Ganha `Vacc Suit 1`.
*   **Rank 2:** — (Sem bônus).
*   **Rank 3:** — Ganha `Profession (belter) 1` OU `Mechanic 1`.
*   **Rank 4-6:** — (Sem bônus).

*(Os outros assignments não listam ranks específicos no snippet, assumir padrão sem bônus extra ou usar Belter como base).*

---

# 14. CAREER: PRISONER (Prisioneiro)
**Fontes:** *Traveller Core Rulebook Update 2022* (pág. 427).

### Regras Especiais de Prisão
*   **Parole Threshold (Limiar de Liberdade Condicional):** Ao entrar na carreira, defina `ParoleThreshold = 0`. Este valor mudará com eventos.
*   **Sair da Prisão:** Ao final do termo, faça um teste de **Advancement** (usando o atributo do Assignment escolhido).
    *   **Se Resultado > ParoleThreshold:** O personagem é libertado (Sai da carreira).
    *   **Se Resultado <= ParoleThreshold:** O personagem permanece preso (Deve fazer outro termo como Prisoner).
*   **Sem Benefícios Normais:** Prisioneiros não ganham salário. Os "Benefícios" listados são itens ilícitos ou contatos feitos na prisão.

### Assignments
1.  *Inmate* (Detento Comum): Tenta ficar na sua.
2.  *Thug* (Valentão): Junta-se a gangues e usa força.
3.  *Fixer* (Negociador): Contrabandeia e arranja coisas.

---

### Tabela de Desgraças (Mishap Table)
*Acionada se a rolagem de Sobrevivência falhar.*

**Input:** Rolar 1D6.

*   **1 | Severely Injured.**
    *   **Lógica:** `RollInjuryTable()`.

*   **2 | Accused.**
    *   **Texto:** Acusado de atacar um guarda.
    *   **Lógica:** `ParoleThreshold += 2`.

*   **3 | Gang Persecution.**
    *   **Input:** `[Lutar]` ou `[Não Lutar]`.
    *   **Lógica (Não Lutar):** Perde **todos** os Benefícios desta carreira acumulados.
    *   **Lógica (Lutar):** Rolar `Melee (unarmed) 8+`.
        *   Sucesso: Ganha 1 **Inimigo**, `ParoleThreshold += 1`.
        *   Falha: `RollInjuryTable()` duas vezes (pegar menor).

*   **4 | Guard Hate.**
    *   **Lógica:** Ganha 1 **Inimigo** (Guarda). `ParoleThreshold += 1`.

*   **5 | Disgraced.**
    *   **Lógica:** Perde -1 **SOC**.

*   **6 | Injured.**
    *   **Lógica:** `RollInjuryTable()`.

---

### Tabela de Eventos (Event Table)
*Acionada se a rolagem de Sobrevivência for um Sucesso.*

**Input:** Rolar 2D6.

*   **2 | Disaster!**
    *   **Lógica:** Rolar na **Mishap Table** (acima), mas não é ejetado (não se ejeta da prisão, apenas sofre a penalidade).

*   **3 | Escape Opportunity.**
    *   **Input:** `[Tentar]` ou `[Ficar]`.
    *   **Lógica (Tentar):** Rolar `Stealth 10+` ou `Deception 10+`.
        *   Sucesso: **Libertado imediatamente** (Sai da carreira).
        *   Falha: `ParoleThreshold += 2`.

*   **4 | Hard Labour.**
    *   **Lógica:** Rolar `END 8+`.
        *   Sucesso: `ParoleThreshold -= 1`. Ganha `Athletics 1`, `Mechanic 1` ou `Melee (unarmed) 1`.
        *   Falha: `ParoleThreshold += 1`.

*   **5 | Join Gang.**
    *   **Lógica:** Rolar `Persuade 8+` ou `Melee 8+`.
        *   Sucesso: Ganha DM+1 em Sobrevivência futura. Ganha `Deception 1`, `Persuade 1`, `Melee 1` ou `Stealth 1`. `ParoleThreshold += 1`.
        *   Falha: Ganha 1 **Inimigo**.

*   **6 | Vocational Training.**
    *   **Lógica:** Rolar `EDU 8+`. Sucesso: Ganha qualquer perícia (exceto Jack-of-all-Trades) nível 1.

*   **7 | Prison Event.**
    *   **Lógica:** Rolar 1D6 na sub-tabela:
        1.  **Riot:** Rolar 1D6. 1-2: Lesão. 5-6: +1 Benefício.
        2.  **Contact:** Ganha 1 Contato.
        3.  **Rival:** Ganha 1 Rival.
        4.  **Transferred:** Re-rolar o `ParoleThreshold` (Resetar para 0 ou rolar 1d6, regra padrão é resetar ou manter o atual dependendo do mestre. Vamos assumir: Mantenha o atual ou resete se for muito alto. *Lógica segura: Não altera valor numérico, apenas "sabor", ou reduz em 1*).
        5.  **Good Behaviour:** `ParoleThreshold -= 2`.
        6.  **Attacked:** Rolar `Melee (unarmed) 8+`. Falha: Lesão.

*   **8 | Parole Hearing.**
    *   **Lógica:** `ParoleThreshold -= 1`.

*   **9 | Hire Lawyer.**
    *   **Lógica:** Pagar Cr (ou Lv) 1000 x Nível de Advocate do advogado. Rolar `2D + Advocate`. Se 8+, `ParoleThreshold -= 1D`.

*   **10 | Special Duty.**
    *   **Lógica:** Ganha `Admin 1`, `Advocate 1`, `Electronics (computers) 1` ou `Steward 1`.

*   **11 | Warden Interest.**
    *   **Lógica:** `ParoleThreshold -= 2`.

*   **12 | Heroism (Save Guard).**
    *   **Input:** `[Arriscar]` ou `[Não]`.
    *   **Lógica (Arriscar):** Rolar 2D.
        *   7 ou menos: `RollInjuryTable()`.
        *   8+: Ganha 1 **Aliado** (Guarda), `ParoleThreshold -= 2`.

---

### Ranks e Bônus (Prisoner)
*   **Rank 0:** — Ganha `Melee (unarmed) 1`.
*   **Rank 1:** — (Sem bônus).
*   **Rank 2:** — Ganha `Athletics 1`.
*   **Rank 3:** — (Sem bônus).
*   **Rank 4:** — Ganha `Advocate 1`.
*   **Rank 5:** — (Sem bônus).
*   **Rank 6:** — Ganha `END +1`.

---

Com base no *MgT 2E - Core Rulebook Update 2022* (que fornece as regras base usadas pelo *2300AD*) e as notas de conversão de moeda do *2300AD - Book 1*, aqui está o detalhamento minucioso das regras de **Pensão**.

Em *2300AD*, a pensão representa a aposentadoria ou o pagamento de reserva que seu personagem recebe anualmente por seus longos anos de serviço leal a uma organização (governo, militares ou megacorporação).

### 1. Requisitos de Elegibilidade

Para se qualificar para uma pensão, o personagem deve cumprir dois critérios rígidos:

*   **Tempo de Serviço:** O personagem deve ter completado **pelo menos 5 Termos** (20 anos) na **mesma carreira**.
*   **Carreira Válida:** Nem todas as carreiras oferecem pensão. As seguintes carreiras **NÃO** pagam pensão, não importa quanto tempo você sirva nelas:
    *   **Scout** (Explorador)
    *   **Rogue** (Criminoso)
    *   **Drifter** (Andarilho)
    *   **Prisoner** (Prisioneiro)
    *   *Nota para 2300AD:* A carreira **Spaceborne** (Nascido no Espaço) substitui o Drifter e segue a mesma lógica: não oferece pensão estatal.

### 2. O Valor da Pensão

O valor é calculado com base no número total de termos servidos naquela carreira específica. O pagamento é anual.

*Nota de Moeda:* As regras base usam Créditos (Cr), mas em *2300AD*, 1 Cr equivale a **1 Livre (Lv)**.

| Termos Servidos | Pensão Anual (Livres/Lv) |
| :--- | :--- |
| **5 Termos** | Lv 10.000 |
| **6 Termos** | Lv 12.000 |
| **7 Termos** | Lv 14.000 |
| **8 Termos** | Lv 16.000 |
| **9+ Termos** | Lv 16.000 + Lv 2.000 por termo adicional além do 8º |

*Exemplo:* Um Almirante da Marinha Francesa que serviu 10 termos (40 anos) receberia: Lv 16.000 (base 8 termos) + Lv 4.000 (2 termos extras) = **Lv 20.000 por ano**.

---

Aqui estão os detalhes minuciosos sobre as regras de lesões (Injuries), as escolhas do jogador e a lógica de implementação para a interface do sistema, baseando-se no *Traveller Core Rulebook Update 2022* e nas regras específicas de augmentação do *2300AD Book 1*.

### 1. Quando as Lesões são Calculadas?

As lesões ocorrem em dois momentos específicos durante o ciclo de criação de personagem (cada Termo de 4 anos):

1.  **Falha na Sobrevivência (Mishap):** Se o jogador falhar na rolagem de Sobrevivência de sua carreira, ele deve rolar na Tabela de Desgraças (Mishap Table). O resultado **6** é sempre "Injured" (Lesionado), e o resultado **1** é frequentemente "Severely Injured" (Gravemente Lesionado). Outros resultados também podem levar à tabela de lesões.
2.  **Evento de Vida (Life Event):** Se o jogador obtiver um Evento de Vida (geralmente resultado 7 na tabela de eventos da carreira), ele rola na tabela de Life Events. O resultado **2** nesta tabela é "Sickness or Injury" (Doença ou Lesão).

### 2. A Tabela de Lesões (Input e Cálculo)

Quando uma lesão é acionada, o sistema deve solicitar ao jogador rolar **1D6** na Tabela de Lesões [Source 383]. Essa tabela deve ser exibida no rolador de dados.

*   **1 (Nearly Killed):** O sistema deve rolar 1D6 para reduzir uma característica física (1-2 STR, 3-4 DEX ou 5-6 END) em **1D6** pontos. Reduz as outras duas em **2** pontos cada. Deve ser informado visualmente ao jogador.
*   **2 (Severely Injured):** O sistema deve rolar 1D6 para reduzir uma característica física (1-2 STR, 3-4 DEX ou 5-6 END) em **1D6** pontos (solicitar rolagem).
*   **3 (Missing Eye or Limb):** Reduz STR (limb) ou DEX (eye) em **2** pontos. (Escolha narrativa do jogador: Olho ou Membro).
*   **4 (Scarred):** Reduz qualquer característica física (STR, DEX ou END) em **2** pontos.
*   **5 (Injured):** Reduz qualquer característica física (STR, DEX ou END) em **1** ponto.
*   **6 (Lightly Injured):** Sem efeito mecânico permanente.

Essas reduções são temporárias e devem ser registradas a parte na ficha do jogador. O sistema deve apresentar o valor total e o atual de cada atributo que o personagem possui, bem como seu modificador total e atual.

### 3. Escolhas do Jogador e Ações (O "Fork" de Decisão)

No momento em que a lesão ocorre (exceto resultado 6), o jogador enfrenta uma decisão crítica. Em *2300AD*, esta escolha é expandida em relação ao Traveller padrão.

O sistema deve apresentar duas opções imediatas:

#### Opção A: Tratamento Médico Padrão (Medical Care)
*   **Consequência na Carreira:** Se a lesão veio de uma falha de Sobrevivência (Mishap), o personagem é **Ejetado** da carreira (fim forçado deste emprego).
*   **Efeito nos Atributos:** O personagem sofre a redução de atributos indicada na tabela temporariamente.
*   **Custo Financeiro:**
    1.  O sistema calcula o custo de restauração: **Lv 5.000** por ponto de atributo perdido [Source 384].
    2.  O sistema calcula a cobertura do empregador: Rola **2D6 + Rank**.
        *   *Exemplo (Militar):* 4+ (75%), 8+ (100%).
        *   *Exemplo (Civil/Outros):* 4+ (0-50%), 8+ (50-75%), 12+ (75-100%) [Source 384].
    3.  A diferença que o empregador não paga é adicionada à **"Medical Debt"** (Dívida Médica) do personagem.

#### Opção B: Augmentação/Prótese (Regra Específica de 2300AD)
*Esta opção permite "salvar" a carreira e os atributos sacrificando benefícios futuros.*
*   **Requisito:** O personagem deve aceitar perder um **Benefício de Mustering Out**.
*   **Consequência na Carreira:** O personagem **NÃO** é ejetado (mesmo que tenha sido um Mishap). Ele pode continuar na carreira no próximo termo [Source 45].
*   **Efeito nos Atributos:** O personagem **ignora** todas as reduções de atributos da tabela de lesões. A parte biológica danificada é substituída por cibernética.
*   **Custo:** **-1 Rolagem de Benefício** (Benefit Roll) na fase final de criação. O personagem ganha uma prótese (olho ou membro) funcional, mas inicialmente cosmética/padrão, sem bônus extras de stats a menos que seja atualizada depois [Source 43].

---

### 4. Sequência Lógica no Mustering Out

A gestão de lesões e dívidas segue uma ordem cronológica estrita para não quebrar a matemática da ficha:

1.  **Durante os Termos (Criação):**
    *   Lesão ocorre -> Jogador escolhe A (Dívida + Ejeção) ou B (Augmentação).
    *   Se escolheu **B**: O sistema marca `-1 Benefit Roll` no contador total do personagem e adiciona o implante na lista de equipamentos.
    *   Se escolheu **A**: O sistema calcula a dívida imediata (ex: Lv 10.000) e a armazena na variável `MedicalDebt`. Os atributos são reduzidos.

2.  **Após o Último Termo (Mustering Out):**
    *   O jogador rola seus Benefícios restantes (Cash e Material).
    *   O jogador coleta todo o dinheiro (Cash Benefits).

3.  **Fase Final (Pagamento da Dívida):**
    *   **Antes de começar o jogo**, o jogador deve usar o dinheiro inicial obtido (Cash Benefits) para pagar a `MedicalDebt` acumulada.
    *   Se o jogador pagar a dívida integralmente, os atributos reduzidos na Opção A são restaurados ao normal.
    *   Se o jogador não puder ou não quiser pagar, ele começa o jogo com os atributos reduzidos e a dívida pendente (que será cobrada durante a campanha, provavelmente com juros ou capangas) [Source 385].
	*	O sistema deve apresentar uma tela antes de finalizar a criação do personagem oferecendo a possibilidade de pagar suas dívidas. Para isso deve ser listadas as lesões sofridas, o efeito e suas penalidades de atributo e quanto custa para quitar a dívida. Deve haver um botão para que o jogador quite uma dívida específica. Após o sistema confirmar a ação, a dívida médica desaparece, subtraindo o valor da dívida restante e o atributo ao qual a lesão penalisa deve ser retirado, ajustando o atributo do personagem.

Quando o sistema apresentar ao jogador que escolha entre receber um implante e reduzir seus benefícios, ou aceitar a lesão e a dívida médica, o sistema deve apresentar o quanto de dívida o personagem vai contrair se escolher a segunda opção e como o cálculo foi feito.

---

