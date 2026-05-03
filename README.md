# TiffinGo — Web App

> Homemade food. Delivered.

A Next.js 14 delivery platform for tiffin services and restaurants, with AI-powered meal planning.

## Tech stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API routes + Prisma ORM
- **Database**: PostgreSQL (Supabase recommended)
- **Payments**: Stripe + Stripe Connect
- **AI**: Claude API (Anthropic) for meal planner
- **State**: Zustand (cart + auth)
- **Fonts**: DM Sans + DM Serif Display

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — discovery feed |
| `/explore` | Browse all kitchens with filters |
| `/kitchen/[id]` | Kitchen detail + menu + subscribe |
| `/checkout` | Subscription checkout (3-step) |
| `/confirmation` | Post-subscription success + AI planner onboarding |
| `/orders` | Live order tracking with animated map |
| `/planner` | AI meal planner (Claude-powered chat) |
| `/profile` | User profile + settings |
| `/auth/login` | Sign in |
| `/auth/signup` | Create account |

## API routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/kitchens` | GET | List kitchens with filters |
| `/api/orders` | GET, POST | User orders |
| `/api/subscriptions` | GET, POST, PATCH | Meal subscriptions |
| `/api/planner` | POST | AI meal planner (Claude API) |
| `/api/auth` | POST | Login + signup |
| `/api/auth/logout` | POST | Clear session cookie |

## Getting started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.local.example .env.local
# Fill in your keys (see below)
```

### 3. Set up the database (Supabase)
1. Go to [supabase.com](https://supabase.com) → New project
2. Copy the connection string → paste into `DATABASE_URL` in `.env.local`
3. Run: `npm run db:push` to create all tables
4. (Optional) `npm run db:studio` to view data

### 4. Set up Stripe
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Get your test API keys
3. Set up webhook: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### 5. Get Anthropic API key (for AI planner)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key → paste into `ANTHROPIC_API_KEY`
3. The planner works without this key too (falls back to hardcoded responses)

### 6. Start the dev server
```bash
npm run dev
```
Open [localhost:3000](http://localhost:3000)

## Environment variables

```env
DATABASE_URL="postgresql://..."          # Supabase connection string
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
ANTHROPIC_API_KEY="sk-ant-..."           # Optional — enables live AI planner
NEXTAUTH_SECRET="random-string"
JWT_SECRET="another-random-string"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Project structure

```
src/
├── app/
│   ├── page.tsx                  # Home
│   ├── explore/page.tsx          # Explore
│   ├── kitchen/[id]/page.tsx     # Kitchen detail
│   ├── checkout/page.tsx         # Checkout
│   ├── confirmation/page.tsx     # Confirmation
│   ├── orders/page.tsx           # Order tracking
│   ├── planner/page.tsx          # AI meal planner
│   ├── profile/page.tsx          # Profile
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   └── api/
│       ├── kitchens/route.ts
│       ├── orders/route.ts
│       ├── subscriptions/route.ts
│       ├── planner/route.ts
│       └── auth/route.ts
├── components/
│   ├── NavBar.tsx
│   ├── KitchenCard.tsx
│   ├── PlanCard.tsx
│   └── CartDrawer.tsx
├── lib/
│   ├── prisma.ts
│   ├── stripe.ts
│   ├── auth.ts
│   ├── types.ts
│   └── mock-data.ts
└── store/
    └── cart.ts                   # Zustand cart + auth
```

## What's included

- Full subscription flow (Daily / Weekly / Monthly plans)
- Live order tracking with animated schematic map
- AI meal planner powered by Claude API
- Halal / vegetarian / vegan filters
- Cart with multi-item support
- JWT authentication (signup + login + logout)
- Full Prisma schema (User, Kitchen, MenuItem, Order, Subscription, Review)
- Stripe payment integration scaffold
- Mock data with 6 kitchens and 12+ menu items
- Graceful fallback to mock data when DB is not set up

## Next steps (you handle the backend)

1. Run `npm run db:push` to create the database tables
2. Add a kitchen seed script: `prisma/seed.ts`
3. Wire up real Stripe payment intents in `/api/subscriptions`
4. Add Stripe webhook handler: `/api/webhooks/stripe/route.ts`
5. Build the restaurant owner dashboard: `/dashboard`
6. Build the driver app: `/driver`

---
Built with TiffinGo · Vancouver, BC 🍁
