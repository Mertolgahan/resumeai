#!/bin/bash
set -euo pipefail

# Stripe Product Setup for SaaSKit Pro
# Run this script to create Stripe products and prices for the SaaS boilerplate.
# Requires: Stripe CLI installed and authenticated (stripe login)

STRIPE_KEY="${STRIPE_SECRET_KEY:?$STRIPE_SECRET_KEY is required}"

echo "=== Stripe Product Setup for SaaSKit Pro ==="
echo ""

# Use the Stripe CLI or API. We'll use the API directly with curl.

STRIPE_API="https://api.stripe.com/v1"

echo "[1/8] Creating Starter product..."
STARTER_PRODUCT=$(curl -s -u "$STRIPE_KEY:" \
    -d name="SaaSKit Starter" \
    -d description="Starter plan - AI content generation with daily limits" \
    "$STRIPE_API/products")
STARTER_PRODUCT_ID=$(echo "$STARTER_PRODUCT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  Starter Product ID: $STARTER_PRODUCT_ID"

echo "[2/8] Creating Starter monthly price ($9/mo)..."
STARTER_MONTHLY=$(curl -s -u "$STRIPE_KEY:" \
    -d product="$STARTER_PRODUCT_ID" \
    -d unit_amount=900 \
    -d currency=usd \
    -d "recurring[interval]=month" \
    "$STRIPE_API/prices")
STARTER_MONTHLY_ID=$(echo "$STARTER_MONTHLY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "[3/8] Creating Starter yearly price ($90/yr)..."
STARTER_YEARLY=$(curl -s -u "$STRIPE_KEY:" \
    -d product="$STARTER_PRODUCT_ID" \
    -d unit_amount=9000 \
    -d currency=usd \
    -d "recurring[interval]=year" \
    "$STRIPE_API/prices")
STARTER_YEARLY_ID=$(echo "$STARTER_YEARLY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "[4/8] Creating Pro product..."
PRO_PRODUCT=$(curl -s -u "$STRIPE_KEY:" \
    -d name="SaaSKit Pro" \
    -d description="Pro plan - Full AI content generation with higher limits" \
    "$STRIPE_API/products")
PRO_PRODUCT_ID=$(echo "$PRO_PRODUCT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  Pro Product ID: $PRO_PRODUCT_ID"

echo "[5/8] Creating Pro monthly price ($29/mo)..."
PRO_MONTHLY=$(curl -s -u "$STRIPE_KEY:" \
    -d product="$PRO_PRODUCT_ID" \
    -d unit_amount=2900 \
    -d currency=usd \
    -d "recurring[interval]=month" \
    "$STRIPE_API/prices")
PRO_MONTHLY_ID=$(echo "$PRO_MONTHLY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "[6/8] Creating Pro yearly price ($290/yr)..."
PRO_YEARLY=$(curl -s -u "$STRIPE_KEY:" \
    -d product="$PRO_PRODUCT_ID" \
    -d unit_amount=29000 \
    -d currency=usd \
    -d "recurring[interval]=year" \
    "$STRIPE_API/prices")
PRO_YEARLY_ID=$(echo "$PRO_YEARLY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "[7/8] Creating Enterprise product..."
ENT_PRODUCT=$(curl -s -u "$STRIPE_KEY:" \
    -d name="SaaSKit Enterprise" \
    -d description="Enterprise plan - Unlimited AI content generation" \
    "$STRIPE_API/products")
ENT_PRODUCT_ID=$(echo "$ENT_PRODUCT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  Enterprise Product ID: $ENT_PRODUCT_ID"

echo "[8/8] Creating Enterprise monthly price ($99/mo)..."
ENT_MONTHLY=$(curl -s -u "$STRIPE_KEY:" \
    -d product="$ENT_PRODUCT_ID" \
    -d unit_amount=9900 \
    -d currency=usd \
    -d "recurring[interval]=month" \
    "$STRIPE_API/prices")
ENT_MONTHLY_ID=$(echo "$ENT_MONTHLY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

ENT_YEARLY=$(curl -s -u "$STRIPE_KEY:" \
    -d product="$ENT_PRODUCT_ID" \
    -d unit_amount=99000 \
    -d currency=usd \
    -d "recurring[interval]=year" \
    "$STRIPE_API/prices")
ENT_YEARLY_ID=$(echo "$ENT_YEARLY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Add these to your .env file:"
echo ""
echo "STRIPE_STARTER_PRICE_ID=$STARTER_MONTHLY_ID"
echo "STRIPE_STARTER_YEARLY_PRICE_ID=$STARTER_YEARLY_ID"
echo "STRIPE_PRO_PRICE_ID=$PRO_MONTHLY_ID"
echo "STRIPE_PRO_YEARLY_PRICE_ID=$PRO_YEARLY_ID"
echo "STRIPE_ENTERPRISE_PRICE_ID=$ENT_MONTHLY_ID"
echo "STRIPE_ENTERPRISE_YEARLY_PRICE_ID=$ENT_YEARLY_ID"
echo ""
echo "NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=$STARTER_MONTHLY_ID"
echo "NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID=$STARTER_YEARLY_ID"
echo "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=$PRO_MONTHLY_ID"
echo "NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=$PRO_YEARLY_ID"
echo "NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=$ENT_MONTHLY_ID"
echo "NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID=$ENT_YEARLY_ID"
echo ""
echo "=== Webhook Setup ==="
echo ""
echo "After deploying, create a Stripe webhook endpoint:"
echo "  URL: https://YOUR_DOMAIN/api/stripe/webhook"
echo "  Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted"
echo ""
echo "Then add the webhook secret to .env:"
echo "  STRIPE_WEBHOOK_SECRET=whsec_..."