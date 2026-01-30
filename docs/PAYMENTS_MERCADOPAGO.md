# Mercado Pago — Darshan Premium

## Por que Mercado Pago
Usuários no Brasil convertem melhor com:
- PIX
- Cartão de crédito
- Checkout simples (Checkout Pro)

## Fluxo

1. Usuário abre o modal de créditos e escolhe um pacote.
2. Front chama **POST /api/checkout/mercadopago** (body: `{ packageId }`).
3. Backend cria preferência no Mercado Pago e retorna `{ url }`.
4. Front redireciona o usuário para a URL (Checkout Pro do MP).
5. Após pagamento, o MP redireciona para `/?checkout=success&provider=mercadopago&payment_id=...`.
6. A página chama **POST /api/checkout/fulfill-mercadopago** (body: `{ payment_id }`) e atualiza o saldo.
7. O MP também envia **POST /api/webhooks/mercadopago** (notificação); o webhook credita o usuário mesmo se ele não voltar à página (idempotente: não duplica créditos).

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/checkout/mercadopago` | Cria preferência Checkout Pro; retorna `{ url }` para redirecionar. |
| POST | `/api/checkout/fulfill-mercadopago` | Chamado pelo front após retorno do MP; verifica pagamento e adiciona créditos. |
| POST | `/api/webhooks/mercadopago` | Recebe notificação do MP (tipo `payment`); credita se `status === approved` e ainda não processado. |

## Configuração

- **Variável:** `MERCADOPAGO_ACCESS_TOKEN` (Access Token da aplicação em [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel/app)).
- **URL de notificação:** configurada na preferência como `notification_url: ${origin}/api/webhooks/mercadopago`.
- **Back URLs:** success, failure e pending apontam para a aplicação (`/?checkout=success&provider=mercadopago`, etc.). O MP adiciona `payment_id` e `status` na URL de retorno.

## Prioridade no modal

O modal de créditos tenta primeiro Mercado Pago; se retornar 503 (não configurado), tenta Stripe. Se ambos estiverem configurados, o MP é usado primeiro.

## Copy (estilo portal)

Não: "Pague para continuar"  
Mas: "Você recebeu a chave. Quer abrir o caminho?"

Botão: 🔓 Tornar Premium
