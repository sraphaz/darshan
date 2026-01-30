/**
 * Cliente Stripe para Checkout (pagamento com cartão e Google Pay).
 */

import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.trim()) return null;
  if (!stripe) {
    stripe = new Stripe(key.trim());
  }
  return stripe;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}
