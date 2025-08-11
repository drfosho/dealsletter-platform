#!/bin/bash

echo "🚀 Running Supabase migrations for subscription system..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "Install it with: brew install supabase/tap/supabase"
    exit 1
fi

# Run migrations
echo "📦 Running subscription fields migration..."
supabase db push --file supabase/migrations/20250111_add_subscription_fields.sql

echo ""
echo "📦 Running billing history migration..."
supabase db push --file supabase/migrations/20250111_add_billing_history.sql

echo ""
echo "✅ Migrations complete!"
echo ""
echo "🔔 Next steps:"
echo "1. Set up webhook in Stripe Dashboard:"
echo "   → https://dashboard.stripe.com/webhooks"
echo "   → Endpoint: https://yourdomain.com/api/stripe/webhook"
echo ""
echo "2. Copy webhook signing secret to .env.local:"
echo "   STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "3. Test the subscription flow:"
echo "   → Visit /pricing"
echo "   → Click on a plan"
echo "   → Complete checkout"
echo "   → Verify subscription in /account/subscription"