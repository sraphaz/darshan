# Acesso à página de configuração (administradores)

A página de configuração **não tem link na aplicação**. Só quem conhece o código secreto pode acessá-la.

## Passos

1. **Obtenha o código secreto**  
   O valor está na variável `CONFIG_SECRET` do servidor (`.env.local` em desenvolvimento ou variáveis de ambiente no deploy). Quem gerencia o servidor deve te informar esse valor.

2. **Abra a URL da página** no navegador:
   - Produção: `https://seu-dominio.com/config`
   - Desenvolvimento: `http://localhost:3000/config`

3. **Digite o código secreto** no campo e clique em **Entrar**.

4. Se o código estiver correto, a página abre e você pode editar Master Prompt, instrução de revelação e mensagens mock. Use **Salvar** para aplicar e **Sair** para bloquear de novo.

---

## Página irmã: Monitor (logs e observabilidade)

A página **Monitor** usa o **mesmo código secreto** e permite ver logs e estado da plataforma para depuração e observabilidade.

- **URL:** `/monitor` (ex.: `https://seu-dominio.com/monitor` ou `http://localhost:3000/monitor`)
- **O que mostra:** status (Stripe, Supabase, rate limit, limite diário IA, taxa da plataforma, NODE_ENV), últimas linhas de **app.log** e **audit.log**, filtro por nível (ERROR, WARN, INFO, DEBUG) e atualização automática opcional a cada 30s.
- **APIs usadas:** `GET /api/admin/logs?source=both&lines=300` e `GET /api/admin/status`, com header `X-Config-Key: CONFIG_SECRET`.

De **Config** você pode ir para **Monitor** (e vice-versa) pelo link no topo da página.

---

Documentação completa (variáveis, API, KV): [CONFIG_SEEDS.md](./CONFIG_SEEDS.md).
