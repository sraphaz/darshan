# Log e auditoria em arquivo

O Darshan grava **log** (app) e **auditoria** (eventos) em arquivos na pasta `data/logs/` (ou em `LOG_DIR/logs/` quando definido).

## Arquivos

| Arquivo      | Conteúdo |
|-------------|----------|
| `data/logs/app.log`   | Log da aplicação (níveis: debug, info, warn, error). Uma linha por evento: `timestamp [LEVEL] mensagem { "meta": "opcional" }`. |
| `data/logs/audit.log` | Trilha de auditoria. Uma linha por evento: `timestamp evento subject="..." { "detalhes": "opcional" }`. |

A pasta `data/` está no `.gitignore`; os arquivos de log não são commitados.

## Variáveis de ambiente

| Variável   | Descrição |
|------------|-----------|
| `LOG_DIR`  | Pasta base para logs (ex.: `./data`). Dentro dela é criada a subpasta `logs/`. Se não definido, usa `DATA_DIR` ou `./data`. |
| `DATA_DIR` | Usado como base para logs quando `LOG_DIR` não está definido. |
| `LOG_LEVEL`| Nível mínimo de log: `debug`, `info`, `warn` ou `error`. Em desenvolvimento o padrão é `debug`; em produção, `info`. |

## Uso do logger (`lib/logger.ts`)

```ts
import { logger } from "@/lib/logger";

logger.info("Mensagem");
logger.warn("Aviso", { code: "X" });
logger.error("Erro na IA", { connector: "openai", status: 429 });
logger.debug("Detalhe", { payload: data });
```

- Grava em `data/logs/app.log` (append).
- Respeita `LOG_LEVEL`: só grava níveis >= o configurado.
- Em caso de falha na escrita, o erro é enviado para `console.error`.

## Uso da auditoria (`lib/audit.ts`)

```ts
import { audit } from "@/lib/audit";

audit("login_email", "user@example.com");
audit("credits_add", "user@example.com", { amount: 100, balanceAfter: 150 });
```

**Eventos auditados:**

| Evento          | Onde                    | subject / detalhes |
|-----------------|-------------------------|---------------------|
| `login_email`   | POST /api/auth/verify   | e-mail do usuário   |
| `login_google`  | GET /api/auth/callback/google | e-mail do usuário   |
| `logout`        | POST /api/auth/logout   | e-mail (antes de limpar sessão) |
| `credits_add`   | POST /api/credits       | e-mail; details: amount, balanceBefore, balanceAfter |
| `credits_use`   | POST /api/darshan (sucesso IA) | e-mail; details: amount, balanceBefore, balanceAfter |
| `config_read`   | GET /api/config         | "admin"             |
| `config_update` | PUT /api/config        | "admin"; details: keys atualizadas |
| `config_unlock` | POST /api/config/unlock | "admin"             |

- Grava em `data/logs/audit.log` (append).
- Em caso de falha na escrita, o erro é enviado para `console.error`.

## Formato das linhas

**app.log (exemplo):**
```
2025-01-29T12:00:00.000Z [ERROR] darshan IA request failed {"connector":"openai","message":"rate limit","status":429}
```

**audit.log (exemplo):**
```
2025-01-29T12:00:00.000Z login_email subject="user@example.com"
2025-01-29T12:01:00.000Z credits_use subject="user@example.com" {"amount":13,"balanceBefore":50,"balanceAfter":37}
```

## Produção e serverless

Em ambientes **serverless** (ex.: Vercel), o sistema de arquivos pode ser efêmero ou read-only. Nesses casos:

- Os arquivos de log/auditoria podem não persistir entre invocações ou não ser graváveis.
- Para produção com persistência, considere: desabilitar log em arquivo quando `LOG_DIR` não for gravável, ou enviar logs/auditoria para um serviço externo (Datadog, Axiom, CloudWatch, etc.) usando a mesma interface (`logger.*` e `audit()`), implementando adaptadores que escrevem no serviço em vez do arquivo.

Em ambiente **Node.js persistente** (ex.: `next start` ou servidor próprio), usar `LOG_DIR` ou `DATA_DIR` em um diretório gravável garante que `app.log` e `audit.log` sejam criados e atualizados corretamente.
