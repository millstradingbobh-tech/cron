import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export async function generateConnectionToken() {
  const token = await stripe.terminal.connectionTokens.create();
  return token.secret;
}

export async function createPaymentIntent(req: any) {
  const { amount, description, meta, supplier, terminal_id } = req;

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'aud',
    payment_method_types: ['card_present'],
    capture_method: 'manual',
    metadata: {
      description,
      supplier,
      terminal_id,
      ...meta
    }
  });
  return paymentIntent.client_secret;
}