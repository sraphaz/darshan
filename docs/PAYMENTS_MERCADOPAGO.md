# Mercado Pago Integration — Darshan Premium

## Why Mercado Pago
Brazil users convert best with:
- PIX
- Credit card
- Simple checkout

## Flow
User → Paywall → Mercado Pago Checkout → Webhook → Premium Enabled

## Required Endpoints

### POST /api/checkout/mercadopago
Creates a payment preference and returns checkout URL.

### POST /api/webhooks/mercadopago
Receives payment confirmation and activates premium.

## Copy (Portal Style)
Not: "Pay to continue"
But:

"You received the key.
Do you want to open the full path?"

Button:
🔓 Become Premium
