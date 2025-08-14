# Setting Up Yearly Billing in Stripe

## Overview
The application now supports both monthly and yearly billing. However, you need to create yearly price IDs in Stripe and add them to your environment variables.

## Step 1: Create Yearly Prices in Stripe Dashboard

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Products → Prices
3. For each of your existing products (Starter, Pro, Premium), create a new yearly price:

### Starter Yearly
- **Product**: Starter
- **Pricing**: $279/year (20% discount from $348/year)
- **Billing Period**: Yearly
- **Save the Price ID**: It will look like `price_XXXXXXXXXXXX`

### Pro Yearly
- **Product**: Pro  
- **Pricing**: $662/year (20% discount from $828/year)
- **Billing Period**: Yearly
- **Save the Price ID**: It will look like `price_XXXXXXXXXXXX`

### Premium Yearly
- **Product**: Premium
- **Pricing**: $1,526/year (20% discount from $1,908/year)
- **Billing Period**: Yearly
- **Save the Price ID**: It will look like `price_XXXXXXXXXXXX`

## Step 2: Add Environment Variables

### Local Development (.env.local)
Add these new environment variables to your `.env.local` file:

```bash
# Yearly Price IDs
STRIPE_PRICE_STARTER_YEARLY=price_XXXXXXXXXXXX
STRIPE_PRICE_PRO_YEARLY=price_XXXXXXXXXXXX
STRIPE_PRICE_PREMIUM_YEARLY=price_XXXXXXXXXXXX

# Optional: Also add public versions if needed
NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEARLY=price_XXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_XXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY=price_XXXXXXXXXXXX
```

### Vercel Production
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add the same variables for production:
   - `STRIPE_PRICE_STARTER_YEARLY`
   - `STRIPE_PRICE_PRO_YEARLY`
   - `STRIPE_PRICE_PREMIUM_YEARLY`
   - `NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEARLY` (optional)
   - `NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY` (optional)
   - `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY` (optional)

## Step 3: Test the Setup

### Local Testing
1. Run the development server: `npm run dev`
2. Visit: http://localhost:3000/api/stripe/test-yearly
3. Verify that yearly prices are found for all tiers

### Test Checkout Flow
1. Go to the pricing page
2. Toggle to "Yearly" billing
3. Click on a plan
4. Verify that the Stripe checkout shows the yearly price

## How It Works

### Frontend (pricing/page.tsx)
- The pricing page now has a billing cycle toggle (Monthly/Yearly)
- Each tier has both `priceId` (monthly) and `priceIdYearly` fields
- When yearly is selected, it sends `billingPeriod: 'yearly'` to the API

### Backend (api/stripe/create-checkout-session/route.ts)
- The API now accepts a `billingPeriod` parameter
- It maps to the correct price ID based on tier and billing period
- Supports multiple environment variable naming conventions:
  - `STRIPE_PRICE_[TIER]_YEARLY`
  - `NEXT_PUBLIC_STRIPE_PRICE_[TIER]_YEARLY`
  - `STRIPE_PRICE_[TIER]_ANNUAL`
  - `NEXT_PUBLIC_STRIPE_PRICE_[TIER]_ANNUAL`

### Fallback Behavior
If yearly prices aren't configured:
- The system will log a warning
- It will fall back to monthly prices
- This ensures the checkout flow doesn't break

## Troubleshooting

### Yearly prices not working?
1. Check environment variables are set correctly
2. Verify price IDs exist in Stripe dashboard
3. Check the test endpoint: `/api/stripe/test-yearly`
4. Look for console warnings in the checkout API logs

### Common Issues
- **Price not found**: Ensure the price ID is correct and active in Stripe
- **Wrong price shown**: Clear browser cache and restart dev server
- **Vercel not working**: Redeploy after adding environment variables