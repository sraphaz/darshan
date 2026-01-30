# Fluxo completo e regras da aplicação Darshan

Este documento descreve o fluxo da aplicação e as regras em vigor para facilitar correções e alinhamento.

---

## 1. Visão geral

- **Frontend:** uma única página (`app/page.tsx`) que chama a API de revelação e exibe a resposta em telas de transição.
- **Backend:** `POST /api/darshan` gera **uma** revelação por request (modo `revelation: true`): uma mensagem orgânica e dinâmica inspirada no espírito do Darshan, sem ordem fixa de aspectos nem blocos obrigatórios.
- **Interação:** o usuário só interage (campo de texto, botões) depois que a conexão com a IA é validada (`GET /api/darshan/check`) e, na sequência, após a revelação terminar de ser exibida (ou se ele tocar no hint para revelar o campo).

---

## 2. Validação inicial (conexão com IA)

| Onde | O que acontece |
|------|----------------|
| **Frontend (mount)** | Chama `GET /api/darshan/check`. |
| **Backend** | `getConnector()` — se existir chave (OPENAI, GOOGLE ou ANTHROPIC), retorna `{ ok: true, provider }`; senão `503` e `{ ok: false, message }`. |
| **Frontend** | `aiReady = true` → libera interação. `aiReady = false` → mostra "Conexão com IA indisponível" e instruções. `aiReady = null` → mostra "Verificando conexão com IA...". |

**Regra:** Nenhum campo de pergunta nem botão "Receber Luz" / "Nova pergunta" aparece se `aiReady !== true`.

---

## 3. Estados da página (frontend)

| Estado | Descrição |
|--------|-----------|
| `history` | Lista de turnos: `{ userMessage?, darshanMessage }[]`. Cada "Receber Luz" ou "Nova pergunta" adiciona um item. |
| `currentMessage` | Texto da última revelação retornada pela API (exibido no `DarshanMessage`). |
| `loading` | `true` enquanto o `POST /api/darshan` está em andamento. |
| `revelationComplete` | `true` quando o `DarshanMessage` terminou de mostrar todos os blocos (último bloco + timer de 7s). |
| `inputRevealed` | `true` quando o usuário já interagiu com o campo (focus ou clique no hint). |
| `isStart` | `history.length === 0` — primeira revelação da sessão. |

**Regras de exibição:**

- **Campo de texto + botões:** só aparecem se `canInteract && !loading && (isStart || inputRevealed)` (área de input) e, para cada botão, conforme abaixo.
- **"Receber Luz":** só se `canInteract && isStart && !loading`.
- **"Nova pergunta":** só se `canInteract && !loading && revelationComplete && currentMessage !== null`.
- **Hint "Toque aqui para prosseguir...":** quando há mensagem, revelação não completa e usuário ainda não revelou o input.
- **Botão "Toque para fazer uma nova pergunta":** quando `revelationComplete` e usuário ainda não revelou o input.

---

## 4. Fluxo de uma revelação (passo a passo)

1. **Usuário vê:** título, TimeHeader, CrystalOrb e (se IA ok) campo + "Receber Luz".
2. **Usuário** digita (ou deixa vazio) e clica **"Receber Luz"**.
3. **Frontend:** `requestRevelation(userInput, [])` — envia `revelation: true`, `userMessage`, `userProfile` (se tiver dados), `history: []`.
4. **Frontend:** `loading = true`, `currentMessage = null`, `revelationComplete = false`. Mostra "Aguarde...".
5. **Backend:** Monta o prompt com os 7 aspectos, pergunta do usuário, mapa (se houver) e histórico. Chama a IA. Retorna `{ message: string }`.
6. **Frontend:** Recebe a resposta, `setCurrentMessage(message)`, `setHistory([...prev, { userMessage, darshanMessage }])`, `loading = false`.
7. **DarshanMessage:** Recebe `message`. Divide por `\n\n` em blocos. Mostra um bloco por vez, 7 segundos cada; no último bloco, após 7s chama `onComplete()`.
8. **Frontend:** `onComplete` → `setRevelationComplete(true)`.
9. **Usuário** vê o hint ou o botão "Toque para fazer uma nova pergunta". Se tocar, o campo e "Nova pergunta" aparecem.
10. **Usuário** pode digitar nova pergunta e clicar **"Nova pergunta"**.
11. **Frontend:** `requestRevelation(input, history)` — envia o **histórico completo** (todas as revelações anteriores) para a API não repetir e manter coerência.
12. Volta ao passo 4 (loading, nova mensagem, telas de transição, etc.).

---

## 5. API POST /api/darshan

**Body esperado:**

- `revelation: true` — sempre usado pelo app atual (uma revelação por request).
- `userMessage?: string` — pergunta ou intenção do usuário.
- `userProfile?: { fullName?, birthDate?, birthPlace?, birthTime? }` — mapa para contexto (Jyotish, etc.).
- `history?: { userMessage?: string, darshanMessage: string }[]` — revelações anteriores da sessão.

**Regras no backend:**

- Sempre que houver `userProfile` com pelo menos um campo preenchido, é montado o "Mapa do usuário" e enviado no prompt para **assertividade** da resposta.
- O histórico é enviado como contexto; o prompt pede para **nunca repetir** o que já foi dito e usar a nova pergunta como semente.
- Resposta: **uma** mensagem em português, **orgânica e dinâmica**. Blocos separados por `\n\n` conforme a IA decidir (1 a 7 blocos); não há ordem fixa de aspectos nem obrigação de isolar um aspecto por bloco; as revelações falam do **mesmo tema**.
- Nada é fixo: a quantidade de blocos varia conforme a pergunta e a complexidade da resposta.

**Resposta da API:** `{ message: string, phase: number }`. O frontend usa só `message`.

---

## 6. DarshanMessage (uma frase por vez, interação do usuário)

- **Entrada:** `message` (texto completo) e `onComplete` (callback).
- **Divisão:** `message` é partido por `\n\n+` em blocos (trim, sem vazios). Se não houver `\n\n`, um único bloco. **Máximo 7 telas:** se a API devolver mais de 7 blocos, os blocos extras são reunidos na última tela.
- **Exibição:** **apenas um bloco por vez.** Não há timer; a próxima frase só aparece quando o usuário clica em **"Próxima"** (ou **"Continuar"** no último bloco).
- **Fim:** no último bloco, o usuário clica em **"Continuar"** → chama `onComplete()`. Só então o frontend considera a revelação "completa" e pode mostrar "Nova pergunta".
- **Comportamento:** uma revelação por vez; aguarda sempre uma nova interação do usuário para revelar a próxima frase.

---

## 7. Perfil do usuário (mapa)

- **Armazenamento:** `localStorage` (chave `darshan_user_profile`). Campos: nome completo, data de nascimento, local, horário.
- **Uso:** ao montar o body do `POST /api/darshan`, se `hasProfileData(profile)` for true, `userProfile` é enviado. O backend usa para contexto (Jyotish, etc.), sem fixar identidade.
- **Painel:** ProfilePanel permite editar e **limpar dados** (botão "Limpar dados").
- **Hidratação:** o ícone de perfil usa `hasData` só após `mounted`, para evitar mismatch servidor/cliente (localStorage só no cliente).

---

## 8. Tratamento de erros

- **API sem conector:** retorna 200 com `message: "O tempo pede presença. Respire e sinta o agora."`
- **Falha na chamada à IA (catch):** retorna 200 com mensagem amigável; se for 429 (quota), mensagem específica sobre limite/billing.
- **Frontend (fetch falha ou resposta com erro):** mostra `FALLBACK_MESSAGE`: "O tempo pede pausa. Respire e tente novamente quando se sentir pronto."

---

## 9. Resumo das regras para correções

| Regra | Onde |
|-------|------|
| Uma revelação por request; mensagem orgânica e dinâmica, mesmo tema | API: `revelation: true`, REVELATION_INSTRUCTION |
| 1 a 7 blocos conforme complexidade; blocos por `\n\n` quando fizer sentido; sem ordem fixa de aspectos | API: instruções no prompt |
| Nunca repetir o que já está no histórico | API: history no body, instruções no prompt |
| Dados do usuário para assertividade (não fixar identidade) | API: buildUserContext, inclusão no prompt |
| Interação só após conexão IA ok | Frontend: `canInteract = aiReady === true` |
| Interação (campo/botões) só após usuário revelar ou ser início | Frontend: `isStart \|\| inputRevealed` para área de input; revelationComplete para "Nova pergunta" |
| Uma resposta por vez; aguardar interação do usuário | Frontend: não há loop automático; nova revelação só ao clicar "Receber Luz" ou "Nova pergunta" |
| Perfil do usuário sempre que preenchido no contexto da API | Frontend: envia `userProfile` se `hasProfileData(profile)`; Backend: buildUserContext e inclusão no prompt |
| Uma frase por vez; avançar só ao clicar em "Próxima" / "Continuar"; no máximo 7 telas | DarshanMessage: botão por bloco, MAX_STEPS = 7 |

---

## 10. Pontos que podem causar "sete mensagens" ou "loop"

- O app **não** chama a API 7 vezes por revelação. Chama **1 vez** com `revelation: true`; a IA devolve **uma** mensagem que pode ter vários blocos (separados por `\n\n`).
- Se a IA devolver texto com muitos `\n\n`, o DarshanMessage mostra muitos blocos em sequência (7s cada). Para reduzir, o prompt já limita a "máx. 2 frases por bloco".
- Se em algum momento o frontend chamasse a API em loop, seria por lógica em `useEffect` ou em handler (ex.: chamar `requestRevelation` sem depender de clique). Na implementação atual, `requestRevelation` só é chamado em `handleReceberLuz` e `handleNovaPergunta` (ação do usuário).

---

## 11. Pontos que podem causar erro quando o perfil está preenchido

- **Frontend:** o body do POST usa `hasProfileData(profile) ? profile : undefined`. Se `profile` tiver campos com tipo inesperado (ex.: número em vez de string), o backend pode receber algo que não trata.
- **Backend:** `buildUserContext` só adiciona strings não vazias (`trim()`). Se o frontend enviar `birthDate` como número ou objeto, `typeof body.userProfile.birthDate === "string"` falha e o campo é ignorado; normalmente não gera erro 500, mas o mapa pode ficar vazio ou incompleto.
- **Erro explícito (ex.: 500):** pode vir da IA (timeout, conteúdo filtrado, etc.) ou de outro serviço. Vale checar o log do servidor no momento em que o perfil está preenchido (ex.: tamanho do prompt, formato do JSON retornado).

Para evitar erro com perfil preenchido: garantir que no frontend só sejam enviados strings (ex.: `birthDate` como "YYYY-MM-DD", `birthTime` como "HH:mm") e que o backend continue validando tipos como hoje (apenas strings nos campos do perfil).
