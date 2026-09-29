// ==============================================================================
// PERLE NOIRE - STRIPE CLIENT (SCAFFOLD)
// Configured and ready for future checkout & payment activation
// ==============================================================================

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
  appInfo: {
    name: 'Perle Noire Joaillerie',
    version: '1.0.0',
  },
});
