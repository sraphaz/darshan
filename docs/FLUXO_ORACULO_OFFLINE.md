# Fluxo do oráculo offline — Jyotish, numerologia e dicionários

Este documento descreve **como** o Darshan usa a biblioteca Jyotish (mhah-panchang), numerologia, arquétipos, textos clássicos e formulações quando a **IA está desligada (modo mock)** e **como escolhemos o que retornar** ao usuário.

---

## 0. Garantias: IA desativada = 100% offline (revelação)

- **A IA desativada não chama a IA por baixo dos panos.** Quando o frontend envia `mock: true` no POST para `/api/darshan`, a rota retorna **antes** de qualquer `getConnector()` ou `connector.complete()`. Nenhum provedor externo (OpenAI, Google, Anthropic) é chamado.
- **Quem faz o trabalho é só o nosso código:** `lib/oracleOffline.ts` + `lib/knowledge/*` (formulações, arquétipos, Jyotish, numerologia, textos clássicos). Tudo roda no servidor Node/Next sem chamadas a APIs de IA.
- **Não há bypass em dev.** O modo mock não é “desconsiderado” em desenvolvimento: se `body.mock === true`, o servidor sempre usa `getOfflineRevelation` e responde imediatamente, em qualquer ambiente.
- **Leitura (mapa pessoal):** quando a IA está desligada (toggle “AI desligada”), o modal **Leitura** pode gerar uma **leitura offline** (sem IA e sem custo): o frontend envia `offline: true` para `/api/map/personal`, que chama `getOfflineReading(profile)` em `lib/readingOffline.ts` e monta o texto a partir do conhecimento local (Jyotish, numerologia, arquétipos, textos clássicos). Nenhum crédito é debitado. Com IA ligada, a Leitura usa a IA e debita créditos normalmente.

---

## 1. Quando o oráculo offline é usado

- O frontend envia `mock: true` no body do POST para `/api/darshan` (toggle "AI desligada").
- A rota chama `getOfflineRevelation(userProfile, userMessage)` em vez da IA.
- O **perfil** (nome, data de nascimento, local, horário) é o que alimenta todo o fluxo; a **pergunta** do usuário hoje não altera o conteúdo (pode ser usada em versões futuras).

---

## 2. Fluxo passo a passo

### 2.1 Seed a partir do perfil

- Montamos uma string: `nome|data|hora|offset` (com offsets 0, 1, 2, 3, 4).
- Calculamos um **hash numérico** (função de 32 bits) dessa string.
- Esse número serve de **seed** para todas as escolhas “aleatórias”. Assim:
  - O mesmo perfil tende a gerar **outra combinação** se mudar nome/data/hora.
  - Evitamos repetir sempre as mesmas frases para o mesmo usuário em sequência.

### 2.2 Chart védico (Jyotish) — biblioteca instalada

1. **Entrada:** `birthDate` (YYYY-MM-DD) e, se existir, `birthTime` (HH:mm).
2. **Biblioteca:** chamamos `mhah-panchang`:
   - `new MhahPanchang().calculate(data)` com a data/hora de nascimento.
   - O resultado traz **Nakshatra** (ino 1–27) e **Raasi** (ino 1–12) da **Lua** naquele instante.
3. **Mapeamento:**
   - `Raasi.ino` → nosso **Rashi** (mesha, vrishabha, …, mina).
   - `Nakshatra.ino` → nossa **Nakshatra** (ashwini, bharani, …, revati).
4. **Arquétipos:** em `archetypes.ts`, cada Rashi e cada Nakshatra estão ligados a um **arquétipo** (ex.: lua em Karka → arquétipo "cuidador"). O chart devolve uma lista `archetypeKeys`; usamos o **primeiro** como arquétipo principal da revelação.

Se a biblioteca **não** estiver instalada ou der erro, usamos o **cálculo simplificado** em `vedic.ts` (Sol/Lua aproximados por fórmulas locais) e, a partir daí, o mesmo mapeamento Rashi/Nakshatra → arquétipo.

### 2.3 Número regente (numerologia)

- **Entrada:** `fullName` (nome completo).
- **Cálculo:** em `numerology.ts`, usamos o método **pitagórico**:
  - Cada letra tem um valor (A=1, B=2, …, I=9, J=1, …).
  - Somamos os valores de todas as letras do nome (sem espaços).
  - Reduzimos a um dígito (1–9) ou mantemos **11** ou **22** (números mestres).
- Esse **número regente** é usado para escolher uma frase do dicionário de numerologia (tendências, desafios, frases por número).

### 2.4 Escolha do que retornar (blocos da mensagem)

A mensagem final é uma sequência de **até 7 blocos** separados por `\n\n`. Cada bloco vem de um recurso diferente; as escolhas usam os **seeds** para não serem totalmente aleatórias e para reduzir repetição.

| Ordem | Recurso | Como escolhemos |
|-------|--------|------------------|
| 1 | **Formulação** | Lista de ~40 frases internas. Filtramos por **arquétipo** (chart); escolhemos uma com `seedBase % tamanho_da_lista`. |
| 2 | **Frase do arquétipo** | Em `archetypeTraits.ts`, cada arquétipo tem várias frases. Escolhemos uma com `seed1 % tamanho`. Só acrescentamos se for **diferente** do bloco 1 (evitar repetição). |
| 3 | **Texto clássico** | Em `classicTexts.ts`: classificados por **guna** (sattva, rajas, tamas) e por **arquétipo**. Escolhemos entre os que combinam com o arquétipo (e com a guna do arquétipo) via `getRandomClassicTextForArchetype(archetypeKey, seed2)`. Textos em português, sem sânscrito para o usuário. |
| 4 | **Frase Jyotish** | Em `jyotishMeanings.ts`: por Rashi e Nakshatra do chart (temas de consciência, efeitos psicológicos, frases para o oráculo). Só entra se houver frase disponível e não repetir bloco. |
| 5 | **Frase da numerologia** | Em `numerology.ts`, cada número regente (1–9, 11, 22) tem várias frases. Escolhemos com `seed3 % tamanho`. Só acrescentamos se ainda tivermos ≤5 blocos e a frase for **diferente** das já escolhidas. |
| 6 | **Fechamento** | Se `seed4 % 3 === 0` e houver primeiro nome no perfil: *"\[Nome], o que em você já sabe?"*. Senão: *"O que em você já sabe?"*. Só acrescentamos se tivermos ≤6 blocos. |

- **Corte:** usamos no máximo 7 blocos (`blocks.slice(0, 7)`).
- **Unicidade:** antes de empurrar frase de arquétipo e frase de numerologia, checamos `blocks.every(b => b !== novaFrase)` para não repetir texto igual.

---

## 3. Resumo do uso de cada recurso

| Recurso | Onde está | Entrada | Papel na resposta |
|--------|------------|---------|-------------------|
| **Jyotish (mhah-panchang)** | `vedic.ts` | Data + hora de nascimento | Fornece Rashi e Nakshatra da Lua → define o **arquétipo** principal. |
| **Arquétipos** | `archetypes.ts` + `archetypeTraits.ts` | Chart (Rashi, Nakshatra) | Define qual conjunto de frases/traits usar; gera o **bloco 2**. |
| **Formulações** | `formulations.ts` | Arquétipo + seed | Gera o **bloco 1** (frase inicial). |
| **Textos clássicos** | `classicTexts.ts` | Seed | Gera o **bloco 3** (Upanishad, Gita ou Yoga Sutra). |
| **Numerologia** | `numerology.ts` | Nome completo | Número regente → gera o **bloco 4** (frase do número). |
| **Seed do perfil** | `oracleOffline.ts` | Nome + data + hora | Define **qual** item de cada lista é escolhido (índice estável por perfil, variando com offset). |

---

## 4. Exemplo rápido

- **Perfil:** Maria, 15/08/1990, 14:30.
- **Seed (ex.):** 12345, 12346, 12347, 12348 (offsets 0–4).
- **Jyotish:** data+hora → mhah-panchang → Lua em algum Rashi/Nakshatra → ex.: arquétipo "cuidador".
- **Numerologia:** "Maria" → soma → redução → ex.: 7 (Buscador).
- **Blocos:**  
  1) Uma formulação do arquétipo cuidador (seed 0).  
  2) Uma frase de traits do cuidador (seed 1).  
  3) Um trecho de Upanishad/Gita/Yoga Sutras (seed 2).  
  4) Uma frase do número 7 (seed 3).  
  5) "Maria, o que em você já sabe?" (porque seed4 % 3 === 0).

A resposta final é a concatenação desses blocos com `\n\n`, no mesmo formato que a IA (mensagem em blocos para o frontend exibir).

---

## 5. Onde alterar o comportamento

- **Mais/menos blocos:** em `oracleOffline.ts`, ordem e condições dos `blocks.push` e o `slice(0, 7)`.
- **Peso do arquétipo vs numerologia:** hoje arquétipo define bloco 1 e 2; numerologia só bloco 4; pode-se inverter ou acrescentar mais frases de um deles.
- **Usar a pergunta do usuário:** `getOfflineRevelation` recebe `userMessage`; hoje não é usado; pode-se, por exemplo, escolher fonte (Upanishad vs Gita) ou tema conforme palavras-chave da pergunta.
- **Conteúdo:** editar listas em `formulations.ts`, `classicTexts.ts`, `archetypeTraits.ts`, `numerology.ts` para mudar o que pode ser retornado.
