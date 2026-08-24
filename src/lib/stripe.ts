import Stripe from 'stripe';

let _stripe: Stripe | null = null;

/* Built on first use, not at import, so a missing key surfaces as a clear
   message from the route that needed it rather than a crash on boot. */
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set — payments are unavailable.');
  _stripe = new Stripe(key, { apiVersion: '2024-04-10', typescript: true });
  return _stripe;
}

/* Back-compat for existing call sites: stripe.customers.create(...) still works. */
export const stripe = new Proxy({} as Stripe, {
  get(_t, prop) {
    const client = getStripe() as any;
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export const PLANS = {
  DAILY: {
    label: 'Daily',
    mealsPerWeek: 5,
    pricePerMeal: 9,
    pricePerWeek: 45,
    savingsPct: 0,
    description: '5 meals/week',
  },
  WEEKLY: {
    label: 'Weekly',
    mealsPerWeek: 10,
    pricePerMeal: 7.5,
    pricePerWeek: 75,
    savingsPct: 17,
    description: '10 meals/week · save 17%',
    popular: true,
  },
  MONTHLY: {
    label: 'Monthly',
    mealsPerWeek: 10,
    pricePerMeal: 6.75,
    pricePerWeek: 67.5,
    savingsPct: 25,
    description: '40 meals/month · save 25%',
  },
} as const;
