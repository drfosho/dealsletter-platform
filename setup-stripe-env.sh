#!/bin/bash

# Setup script for Stripe environment variables
# This will help you quickly add the required Stripe configuration

echo "🚀 Stripe Environment Setup"
echo "=========================="
echo ""
echo "This script will help you add the required Stripe environment variables."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
fi

# Function to add or update env variable
add_env_var() {
    local key=$1
    local value=$2
    
    if grep -q "^${key}=" .env.local; then
        # Update existing
        sed -i.bak "s|^${key}=.*|${key}=${value}|" .env.local
        echo "✅ Updated ${key}"
    else
        # Add new
        echo "" >> .env.local
        echo "${key}=${value}" >> .env.local
        echo "✅ Added ${key}"
    fi
}

echo "📝 Please provide your Stripe configuration:"
echo ""

# Get Stripe Secret Key
echo "1. Go to: https://dashboard.stripe.com/test/apikeys"
echo "   (or https://dashboard.stripe.com/apikeys for live mode)"
echo ""
read -p "Enter your Stripe Secret Key (starts with sk_test_ or sk_live_): " STRIPE_KEY

if [ -z "$STRIPE_KEY" ]; then
    echo "❌ Stripe Secret Key is required!"
    exit 1
fi

add_env_var "STRIPE_SECRET_KEY" "$STRIPE_KEY"

echo ""
echo "2. Optional: Add specific Price IDs"
echo "   If you have already created products in Stripe, enter their price IDs."
echo "   Otherwise, press Enter to skip and the system will create them automatically."
echo ""

read -p "Pro Plan Monthly Price ID (or press Enter to skip): " PRO_MONTHLY
if [ ! -z "$PRO_MONTHLY" ]; then
    add_env_var "STRIPE_PRICE_PRO_MONTHLY" "$PRO_MONTHLY"
    add_env_var "NEXT_PUBLIC_STRIPE_PRICE_PRO" "$PRO_MONTHLY"
fi

read -p "Pro Plan Yearly Price ID (or press Enter to skip): " PRO_YEARLY
if [ ! -z "$PRO_YEARLY" ]; then
    add_env_var "STRIPE_PRICE_PRO_YEARLY" "$PRO_YEARLY"
fi

echo ""
echo "3. Webhook Secret (for production)"
read -p "Stripe Webhook Secret (starts with whsec_, or press Enter to skip): " WEBHOOK_SECRET
if [ ! -z "$WEBHOOK_SECRET" ]; then
    add_env_var "STRIPE_WEBHOOK_SECRET" "$WEBHOOK_SECRET"
fi

# Ensure APP_URL is set
if ! grep -q "^NEXT_PUBLIC_APP_URL=" .env.local; then
    add_env_var "NEXT_PUBLIC_APP_URL" "http://localhost:3000"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Restart your development server: npm run dev"
echo "2. If you didn't provide Price IDs, run: node scripts/setup-stripe-products.js"
echo "3. Visit http://localhost:3000/pricing and test the checkout"
echo ""
echo "For testing, use card number: 4242 4242 4242 4242"