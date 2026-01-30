# Configuração de sementes da IA

Este documento descreve como alterar os textos que alimentam o oráculo e a IA **sem publicar nova versão da aplicação**: Master Prompt, instrução de revelação e mensagens mock.

---

## Guia de acesso (administradores)

A página de configuração **não aparece em nenhum link** da aplicação. Apenas quem conhece o código secreto pode acessá-la.

### Como acessar

1. **Defina o código** no servidor: em `.env.local` (ou nas variáveis de ambiente do deploy), crie a variável `CONFIG_SECRET` com um valor secreto forte, por exemplo:
   ```bash
   CONFIG_SECRET=seu-codigo-secreto-aqui
   ```
2. **Reinicie o servidor** (Next.js) para carregar a variável.
3. **Abra a URL da página de configuração** no navegador. A URL é:
   ```
   https://seu-dominio.com/config
   ```
   Em desenvolvimento local: `http://localhost:3000/config`
4. Se o reCAPTCHA estiver configurado, **marque "Não sou um robô"** (e complete o desafio de imagens, se aparecer). Depois **digite exatamente o mesmo valor** que você colocou em `CONFIG_SECRET` no campo "Código secreto" e clique em **Entrar**.
5. Se o código estiver correto, a página abre e exibe os formulários para editar Master Prompt, instrução de revelação e mensagens mock. Se estiver errado, aparece "Código inválido." e a página continua bloqueada.
6. **reCAPTCHA (opcional):** para exibir o reCAPTCHA v2 (checkbox e seleção de imagens) na tela de acesso, defina `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` e `RECAPTCHA_SECRET_KEY` em `.env.local`. Chaves em [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin) — tipo "reCAPTCHA v2" ("Não sou um robô"). Se não definir, a página aceita apenas o código secreto.

### Segurança

- **Não coloque link para /config** em lugar visível para usuários finais. Este guia é para administradores (documentação ou acesso interno).
- Guarde o valor de `CONFIG_SECRET` em um gerenciador de senhas ou em variáveis de ambiente do provedor de hospedagem; não commite em repositório.

---

## Visão geral

- **Store**: por padrão um arquivo `data/config.json` (pasta `data/` no projeto). Em produção pode usar KV (Vercel KV / Upstash) definindo variáveis de ambiente.
- **API**: `GET` e `PUT` em `/api/config`, protegidas pelo mesmo código (`CONFIG_SECRET`).
- **Página**: `/config` — primeiro exige o código secreto; depois exibe os formulários para editar os textos.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `CONFIG_SECRET` | Sim (para usar /config) | Chave que autoriza leitura e gravação em `/api/config`. Defina em `.env.local` e use a mesma chave na página `/config`. |
| `DATA_DIR` | Não | Pasta onde será criado `config.json`. Padrão: `./data` (relativo ao `cwd` do processo). |
| `DARSHAN_CONFIG_KV` | Não | Se `1`, o store usa KV em vez de arquivo (requer `KV_REST_API_URL` e `KV_REST_API_TOKEN`). |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Não | Chave pública do reCAPTCHA v2 (página /config). Se definida, exibe o widget "Não sou um robô" e desafio de imagens. |
| `RECAPTCHA_SECRET_KEY` | Não | Chave secreta do reCAPTCHA (servidor). Obrigatória se `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` estiver definida. |

## Uso da página /config (após desbloquear)

1. Acesse `/config` e digite o código secreto (valor de `CONFIG_SECRET`); clique em **Entrar**.
2. Após a página abrir, edite os campos:
   - **Master Prompt**: substitui o conteúdo de `docs/MASTER_PROMPT.md` quando a IA for chamada. Deixe vazio para usar o arquivo.
   - **Instrução de revelação**: texto enviado à IA na revelação única. Deixe vazio para usar o padrão do código.
   - **Mensagens mock**: lista de mensagens usadas como fallback do oráculo offline (uma por bloco; blocos separados por linha em branco). Deixe vazio para usar as mensagens padrão.
3. Clique em **Salvar**. As alterações passam a valer imediatamente para as próximas requisições.
4. Use **Sair** para bloquear a página de novo (o próximo acesso exigirá o código outra vez).

## API

- **GET /api/config**  
  Retorna a configuração atual. Cabeçalho: `X-Config-Key: <CONFIG_SECRET>` ou `Authorization: Bearer <CONFIG_SECRET>`.

- **PUT /api/config**  
  Atualiza a configuração (merge parcial). Mesmos cabeçalhos. Body JSON:
  - `masterPromptOverride`: string | null
  - `revelationInstructionOverride`: string | null
  - `mockMessagesOverride`: string[] | null

## Onde a configuração é usada

- **Master Prompt**: em `app/api/darshan/route.ts`, ao montar o contexto para o conector de IA (`connector.complete(masterPrompt, userContent)`). Se houver `masterPromptOverride`, ele é usado no lugar do conteúdo de `docs/MASTER_PROMPT.md`.
- **Instrução de revelação**: no mesmo route, na revelação única (`revelation === true`). Se houver `revelationInstructionOverride`, ele substitui o texto fixo `REVELATION_INSTRUCTION`.
- **Mensagens mock**: no mesmo route, quando o modo mock está ativo e o oráculo offline não retorna mensagem; nesse caso é escolhida uma mensagem aleatória da lista. Se houver `mockMessagesOverride`, essa lista é usada no lugar da lista padrão do código.

## KV para produção (opcional)

Para persistir a configuração em um store externo (ex.: Vercel KV, Upstash):

1. Defina no ambiente:
   - `DARSHAN_CONFIG_KV=1`
   - `KV_REST_API_URL` e `KV_REST_API_TOKEN` (ou o par equivalente do seu provedor)

2. Implemente em `lib/configStore.ts`:
   - `getConfigFromKV()`: ler o objeto de configuração da chave `darshan:config`.
   - `setConfigToKV(config)`: gravar o objeto na mesma chave.

O tipo já está definido (`AppConfig`); basta preencher as funções com a API do seu provedor KV (REST ou SDK).

## Segurança

- Não commite `data/config.json` nem `.env.local` (a pasta `data/` está no `.gitignore`).
- Use um código forte e único para `CONFIG_SECRET` em produção.
- A página `/config` não tem link visível na aplicação; só quem souber a URL e o código secreto consegue acessar. Consulte o **Guia de acesso (administradores)** no início deste documento.
