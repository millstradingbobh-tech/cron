import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export async function generateConnectionToken() {
  const token = await stripe.terminal.connectionTokens.create();
  return token.secret;
}

export async function createPaymentIntent(amount: number) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'aud',
    payment_method_types: ['card_present'], // for terminal payments
    capture_method: 'manual',
  });
  return paymentIntent.client_secret;
}