# Histórico de respostas e leituras

O Darshan armazena no Supabase as respostas da interação com o orb (revelações) e as leituras completas (mapa pessoal), associadas ao usuário logado (por `user_id`). Isso permite exibir um ícone de **Histórico** quando há dados e uma página com abas para consultar o passado.

---

## Tabelas (Supabase)

- **revelations** — respostas da IA na interação com o orb  
  - `user_id`, `question_text` (opcional), `response_text`, `created_at`
- **readings** — resultado das leituras completas (mapa pessoal)  
  - `user_id`, `content`, `created_at`

Migration: `supabase/migrations/20250129100000_history_tables.sql`.

---

## Quando os dados são gravados

Apenas **respostas geradas pela IA** são gravadas no histórico.

- **Revelações:** após cada resposta da IA no orb (POST `/api/darshan` com `revelation: true`). Modo mock/oráculo offline **não** grava em `revelations`.
- **Leituras:** após cada leitura completa gerada pela IA (POST `/api/map/personal`). Modo offline (leitura sem IA) **não** grava em `readings`.

Ambos usam o email da sessão para resolver o `user_id` na tabela `users`; se o Supabase não estiver configurado, a gravação é silenciosa (não quebra o fluxo).

---

## APIs

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/history/count` | Retorna `{ revelations, readings }` do usuário logado (para exibir o ícone quando > 0). |
| GET | `/api/history/revelations` | Lista revelações (query: `limit`, `offset`). |
| GET | `/api/history/readings` | Lista leituras (query: `limit`, `offset`). |

Todas exigem sessão (cookie); sem login retornam 401 ou contagem zerada.

---

## UI

- **Ícone Histórico:** aparece à direita (abaixo do ícone Leitura) **somente quando** o usuário está logado e há pelo menos uma revelação ou leitura armazenada.
- **Página de histórico:** painel lateral com duas abas:
  - **Respostas** — lista de revelações (data, pergunta se houver, resposta; expandir para ver texto completo).
  - **Leituras** — lista de leituras (data, trecho; expandir para ver conteúdo completo).

Estilo alinhado ao painel "Dados de Entrada" (cores suaves, minimalista).
