import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || webhookSecret === 'whsec_placeholder') {
    // Scaffold mode: log webhook received
    return NextResponse.json({
      received: true,
      mode: 'scaffold_test',
      message: 'Stripe webhook receiver initialized. Configure STRIPE_WEBHOOK_SECRET to enable live validation.',
    });
  }

  if (!signature) {
    return NextResponse.json({ error: 'Signature Stripe manquante' }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.info('[Stripe Webhook] Paiement réussi :', paymentIntent.id, paymentIntent.amount);
        break;
      }
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.info('[Stripe Webhook] Session checkout complétée :', session.id);
        break;
      }
      default:
        console.info(`[Stripe Webhook] Événement ignoré : ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur de validation webhook';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
