# Stripe Setup Instructions

## Quick Setup

The Stripe integration is missing required environment variables. To fix the checkout issue:

### 1. Add Stripe Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Stripe Price IDs (Get these from your Stripe Dashboard)
STRIPE_PRICE_PRO_MONTHLY=price_your-pro-monthly-price-id
STRIPE_PRICE_PRO_YEARLY=price_your-pro-yearly-price-id

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Secret key** (starts with `sk_test_`)
3. Replace `sk_test_your-stripe-secret-key` with your actual key

### 3. Create Products and Prices in Stripe

1. Go to [Stripe Products](https://dashboard.stripe.com/test/products)
2. Create a product called "Pro Plan"
3. Add pricing:
   - Monthly: $29/month with 7-day free trial
   - Yearly: $290/year with 7-day free trial
4. Copy the Price IDs (start with `price_`)
5. Replace the price IDs in your `.env.local`

### 4. Set Up Webhook (for production)

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the Signing secret (starts with `whsec_`)
5. Replace `whsec_your-webhook-secret` in `.env.local`

### 5. Restart Your Development Server

```bash
npm run dev
```

## Testing

1. Visit http://localhost:3000/pricing
2. Click "Start 7-Day Free Trial" on the Pro plan
3. You'll be redirected to Stripe Checkout
4. Use test card: `4242 4242 4242 4242` with any future date and CVC

## Test Webhook Locally

Use the Stripe CLI to forward webhooks to your local server:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret shown and update STRIPE_WEBHOOK_SECRET
```

## Troubleshooting

If you see "Could not find the 'stripe_price_id' column" error:
1. This is a Supabase schema cache issue
2. The code has been updated to handle this gracefully
3. Run migrations if needed: `npm run db:migrate`