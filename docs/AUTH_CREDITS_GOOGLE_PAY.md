# Autenticação, Créditos e Google Pay

## Implementado

### Login sem senha (código por e-mail)
- **POST /api/auth/send-code** — Envia código de uso único para o e-mail. Em produção usa **Resend** (configure `RESEND_API_KEY` e `RESEND_FROM`); em desenvolvimento o código é logado no servidor e o código fixo `123456` continua aceito para qualquer e-mail.
- **POST /api/auth/verify** — Verifica código e define sessão em cookie. Em desenvolvimento o código `123456` é aceito para qualquer e-mail.
- **GET /api/auth/session** — Retorna sessão atual (e-mail).
- **POST /api/auth/logout** — Encerra sessão e limpa cookie de créditos.

### Login com Google (SSO)
- **GET /api/auth/google** — Redireciona para o consentimento Google OAuth 2.0 (escopos: email, profile). Requer `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` em `.env.local`.
- **GET /api/auth/callback/google** — Callback: troca o código por tokens, obtém o e-mail do usuário e define a mesma sessão (cookie) que o login por código. Redireciona para `/`.
- No modal de login, o botão **Google** leva o usuário a `/api/auth/google`. Se as variáveis não estiverem definidas, o usuário é redirecionado para `/?error=google_not_configured`.

### Créditos
- Cada revelação com IA consome **1 crédito** (modo ritual). A margem da plataforma é configurável via `PLATFORM_FEE_PERCENT` (ver `docs/PRECIFICACAO_CREDITOS.md`).
- **GET /api/credits** — Saldo do usuário (cookie).
- **POST /api/credits** — Adiciona créditos (body: `{ amount: number }`). Usado pelo backend após confirmação de pagamento (Stripe) ou em dev/teste.
- **POST /api/credits/dev-decrease** — Apenas em `NODE_ENV=development`: diminui créditos em 1 revelação (1 crédito). Na página, **clique direito** na área de créditos (número ou “+ Créditos”) para testar o fluxo de saldo baixo.
- **Pacotes de créditos** — Definidos em `lib/credits.ts` (`CREDIT_PACKAGES`): Fibonacci (13, 21, 34, 55, 89 créditos) com preços em BRL. O modal “Adicionar créditos” exibe os pacotes; ao clicar em “Comprar”, tenta **Mercado Pago** (se configurado) e, em seguida, **Stripe Checkout**; se nenhum estiver configurado, mostra erro.
- **Mercado Pago:** **POST /api/checkout/mercadopago** (body: `{ packageId }`) cria preferência Checkout Pro e retorna URL; o usuário é redirecionado ao MP (PIX, cartão, etc.). Após pagamento, volta com `?checkout=success&provider=mercadopago&payment_id=...` e a página chama **POST /api/checkout/fulfill-mercadopago** (body: `{ payment_id }`) para creditar. **POST /api/webhooks/mercadopago** recebe notificações do MP e credita mesmo se o usuário não retornar à página. Configure `MERCADOPAGO_ACCESS_TOKEN` (ver `.env.example`).
- **Stripe Checkout:** **POST /api/checkout/create** (body: `{ packageId }`) cria sessão e redireciona para o Stripe (cartão, **Google Pay**, Stripe Link). Após pagamento, o usuário volta com `?checkout=success&session_id=...` e a página chama **POST /api/checkout/fulfill** (body: `{ sessionId }`) para creditar. **POST /api/webhooks/stripe** recebe o evento `checkout.session.completed` e credita mesmo se o usuário não retornar (ex.: pagou com Google Pay e fechou a aba). Configure `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` (ver `.env.example`).
- A IA só é chamada se o usuário estiver logado e com saldo ≥ 1 crédito. Caso contrário: 401 (login) ou 402 (créditos insuficientes).

### Perfil
- Acesso ao painel de perfil (nome, data, local, horário) **somente quando logado**. Sem login, o toque no ícone abre o modal de entrada.
- Campos no estilo minimalista (borda inferior apenas, como o input central).
- **Data no formato Brasil:** DD/MM/AAAA com máscara ao digitar.
- **Hora no formato Brasil:** HH:mm com máscara.
- Botão **Excluir conta**: faz logout, limpa perfil local e fecha o painel.

### UI
- Header: **Entrar** (sem sessão) ou **+ Créditos** e **X créditos** (com sessão).
- Botão **?** no canto para **Suporte e dúvidas**: consumo de créditos, como adicionar, login sem senha, contato.
- Modo mock (oráculo offline) continua disponível sem login e não consome créditos.

---

## A fazer (placeholders)

### Código por e-mail em produção
- **Resend** já integrado em **send-code**: defina `RESEND_API_KEY` e `RESEND_FROM` no `.env.local`. Em produção o código é enviado por e-mail; em dev continua logado no console e o código `123456` aceito para qualquer e-mail.

### Login por biometria (celular)
- Usar Web Authentication API (WebAuthn) ou SDK do dispositivo para “login com biometria” após o primeiro login por e-mail (registrar credential no dispositivo e, depois, permitir reautenticação por biometria sem novo código).

### Login com Google (SSO) — implementado
- **GET /api/auth/google** e **GET /api/auth/callback/google** já criam sessão pelo e-mail da conta Google. Configure `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` (ver `.env.example`).

### Google Pay / Stripe Checkout — implementado
- Modal com pacotes Fibonacci (13, 21, 34, 55, 89 créditos) e preços em BRL. "Comprar" chama **POST /api/checkout/create** e redireciona para Stripe Checkout (cartão, **Google Pay**, Stripe Link). Após pagamento, retorno com `?checkout=success&session_id=...` aciona **POST /api/checkout/fulfill** para creditar. O webhook **POST /api/webhooks/stripe** (evento `checkout.session.completed`) credita mesmo se o usuário não voltar à página. Configure `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET`.

---

## Google Pay completo (Stripe)

Para que o **Google Pay** apareça no Stripe Checkout:

1. **Stripe Dashboard** — Em [Configurações > Métodos de pagamento](https://dashboard.stripe.com/settings/payment_methods), ative **Wallets** (Google Pay e Apple Pay). Com `payment_method_types: ["card", "link"]`, o Checkout já exibe Google Pay quando o navegador do cliente suporta e o usuário tem cartão no Google Pay.
2. **HTTPS** — Em produção o site deve usar HTTPS (Stripe exige para wallets).
3. **Webhook (recomendado)** — Em [Webhooks](https://dashboard.stripe.com/webhooks), adicione o endpoint `https://seu-dominio.com/api/webhooks/stripe`, selecione o evento `checkout.session.completed` e copie o **Signing secret** (`whsec_...`) para `STRIPE_WEBHOOK_SECRET`. Assim o usuário recebe os créditos mesmo se fechar a aba após pagar com Google Pay.

---

## Como finalizar créditos com Google Pay e Apple Pay

### Opções de gateway

1. **Stripe** — Aceita Google Pay e Apple Pay no mesmo fluxo (Payment Request API / Stripe Elements). Webhook `payment_intent.succeeded` ou `checkout.session.completed` → servidor identifica o usuário (session/cookie ou `client_reference_id`) e chama lógica interna que incrementa créditos (ex.: **POST /api/credits** com `amount` do pacote comprado).
2. **Mercado Pago** — Suporta pagamentos nativos; webhook de notificação → backend confirma o pagamento e credita. Ver `docs/PAYMENTS_MERCADOPAGO.md` se existir.
3. **Provedor específico Google/Apple** — Google Pay API (Android/Web) e Apple Pay JS; em ambos os casos o pagamento real passa por um **processor** (Stripe, Adyen, etc.). O app envia o token de pagamento ao backend; o backend processa com o processor e, em sucesso, credita.

### Fluxo recomendado (genérico)

1. **Frontend:** Botão “Adicionar créditos” → escolha de pacote (Fibonacci: 13, 21, 34, 55, 89 créditos com preço em R$) → abre o fluxo do gateway (Google Pay / Apple Pay via Stripe ou outro).
2. **Pagamento:** Usuário conclui o pagamento no gateway; o gateway redireciona ou notifica o backend.
3. **Backend:**  
   - Recebe webhook ou callback do gateway (com `payment_id`, `user_id` ou `client_reference_id`, valor/pacote).  
   - Valida a assinatura/evento e confirma o pagamento com o gateway se necessário.  
   - Identifica o usuário (ex.: pelo cookie de sessão usado no checkout ou pelo `client_reference_id` que você enviou = e-mail ou id interno).  
   - Chama a mesma lógica que incrementa créditos (ex.: ler cookie de sessão, obter saldo atual, somar o pacote, **Set-Cookie** com novo saldo). Pode ser uma função interna que atualiza cookie ou DB; em produção pode ser **POST /api/credits** restrito ao servidor (token interno) ou um service que escreve no mesmo store de créditos.
4. **Frontend:** Após redirect ou polling, chama **GET /api/credits** para atualizar o saldo exibido.

### Pacotes e preços

- Pacotes fixos em `lib/credits.ts`: Fibonacci (13, 21, 34, 55, 89 créditos).  
- Preço em R$ por pacote em `lib/credits.ts`; margem da plataforma configurável via `PLATFORM_FEE_PERCENT` (ver `docs/PRECIFICACAO_CREDITOS.md`).  
- Constante `CREDITS_PER_AI_REQUEST = 1` em `lib/credits.ts`; pacotes Fibonacci (13, 21, 34, 55, 89).

---

## Como fazer login com SSO e biometria (Android)

### SSO com Google

1. **Backend (Next.js):**  
   - Usar **NextAuth.js** com provider Google (ou OAuth 2.0 manual: `GET /api/auth/google` que redireciona para Google; callback em `GET /api/auth/callback/google`).  
   - No callback: obter e-mail (e opcionalmente id) do perfil Google; criar ou recuperar sessão (mesmo formato de cookie que o login por código) e definir cookie de sessão. Assim o usuário fica “logado” como hoje, mas sem código por e-mail.

2. **Frontend (Web):**  
   - Botão “Entrar com Google” que redireciona para `GET /api/auth/google` (ou link do NextAuth). Após callback, a página principal já recebe o cookie e **GET /api/auth/session** retorna a sessão.

3. **Android (WebView ou PWA):**  
   - Mesmo fluxo OAuth em WebView: abrir a URL de login Google; após redirect de volta para o app (custom scheme ou deep link), o cookie de sessão fica no WebView e as requisições para a API já vão autenticadas.  
   - Se for app nativo (React Native / Expo): usar `expo-auth-session` ou lib Google Sign-In para obter o token; enviar o token ao backend; o backend valida o token com Google e cria a sessão (cookie ou token próprio).

### Biometria (Android / Web)

1. **Web (PWA ou navegador):**  
   - **Web Authentication API (WebAuthn)** com “platform authenticator” (biometria do dispositivo). Fluxo: após primeiro login (código ou Google), oferecer “Usar biometria na próxima vez”. O backend registra um credential (chave pública) associado ao usuário; o dispositivo guarda a chave privada (protegida por biometria). Na próxima visita, o front chama `navigator.credentials.get()` com desafio do servidor; o usuário usa a digital/face; o backend valida a assinatura e cria a sessão. Não depende de senha nem de código por e-mail naquele dispositivo.

2. **Android (app nativo ou WebView):**  
   - **WebAuthn** no WebView: se o WebView/Chrome no Android suportar WebAuthn com platform authenticator, o mesmo fluxo acima funciona (usuário usa biometria no Android e o navegador completa o get).  
   - **Android BiometricPrompt:** em app nativo (Kotlin/Java), usar `BiometricPrompt` para “desbloquear” um token armazenado de forma segura (Android Keystore). Ou seja: após login (código ou Google), o app guarda um refresh token ou session token no Keystore; na próxima abertura, o app exibe BiometricPrompt e, se o usuário autenticar, lê o token e restaura a sessão (chamando o backend para validar/renovar se necessário). No Darshan atual (web), o caminho mais direto é **WebAuthn** no navegador/WebView para “login com biometria” sem app nativo.

### Resumo prático

- **SSO Google (web e Android WebView):** NextAuth (ou OAuth manual) → callback define o mesmo cookie de sessão que o login por código.  
- **Biometria (web/Android):** WebAuthn com platform authenticator: registrar credential após primeiro login; nas próximas vezes, `get()` com biometria e backend valida e abre sessão.  
- **Biometria em app Android nativo:** Guardar token de sessão no Keystore e usar BiometricPrompt para liberar o token e enviar ao backend.

---

## Resumo de margem
- 1 revelação com IA = 1 crédito (modo ritual). Preços por pacote em `lib/credits.ts` (Fibonacci).
- Taxa da plataforma configurável: `PLATFORM_FEE_PERCENT` (0–100, padrão 30). Ver `docs/PRECIFICACAO_CREDITOS.md`.
- Constante em código: `CREDITS_PER_AI_REQUEST = 1` em `lib/credits.ts`.

---

## Requisitos para lançar na loja (Google Play / PWA)

### Já implementado
- **Login:** Código por e-mail (Resend em produção) + **Login com Google (SSO)**. Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, e para e-mail real: `RESEND_API_KEY`, `RESEND_FROM`.
- **Créditos:** Modal "Adicionar créditos" com pacotes Fibonacci (13, 21, 34, 55, 89) e preços em BRL. Compra via **Stripe Checkout** (cartão ou Google Pay): `POST /api/checkout/create` → redirect Stripe → retorno com `session_id` → `POST /api/checkout/fulfill` credita. Configure `STRIPE_SECRET_KEY`.
- **Sessão:** Cookie de sessão (e-mail); mesmo formato para login por código e Google.

### Pendente para produção
- **Webhook Stripe:** Já implementado; configure `STRIPE_WEBHOOK_SECRET` e o endpoint no Dashboard para creditar mesmo se o usuário não retornar (Google Pay, etc.).
- **Política de privacidade e termos:** URLs obrigatórias para loja.
- **Apple:** Login com Apple e Apple Pay não são prioridade no momento; implementar depois se publicar na App Store.
