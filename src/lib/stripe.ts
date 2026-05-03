import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
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
