#!/bin/bash
set -euo pipefail

DOMAIN="the-exp.net"
SERVER_IP="${1:?Usage: $0 <server-ip> <email>"
EMAIL="${2:?Usage: $0 <server-ip> <email>}"

echo "========================================="
echo "  SaaSKit Pro - Domain & Infrastructure Setup"
echo "  Domain: $DOMAIN"
echo "  Server IP: $SERVER_IP"
echo "  Email: $EMAIL"
echo "========================================="
echo ""

echo "This script will:"
echo "  1. Configure DNS records"
echo "  2. Set up Docker Compose production deployment"
echo "  3. Obtain SSL certificates via Let's Encrypt"
echo "  4. Configure email DNS (MX, SPF, DKIM, DMARC)"
echo "  5. Set up Resend domain verification"
echo ""

read -p "Continue? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "========================================="
echo "  PHASE 1: DNS Configuration"
echo "========================================="
echo ""

echo "Add these DNS records at your domain registrar or Cloudflare:"
echo ""
echo "  Type: A      | Name: @                   | Value: $SERVER_IP"
echo "  Type: CNAME  | Name: www                 | Value: $DOMAIN"
echo "  Type: MX     | Name: @                   | Value: mx1.resend.com  | Priority: 10"
echo "  Type: MX     | Name: @                   | Value: mx2.resend.com  | Priority: 20"
echo "  Type: TXT    | Name: @                   | Value: v=spf1 include:resend.com ~all"
echo "  Type: TXT    | Name: _dmarc              | Value: v=DMARC1; p=none; rua=mailto:dmarc@$DOMAIN"
echo ""
echo "DKIM and Resend verification records will be added after Resend setup."
echo ""

read -p "Have you configured DNS records? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please configure DNS records first, then re-run this script."
    echo "See: ./scripts/setup-dns.sh $SERVER_IP"
    exit 1
fi

echo ""
echo "Verifying DNS propagation..."
echo "  A record: $(dig +short $DOMAIN A 2>/dev/null || echo 'not found')"
echo "  www CNAME: $(dig +short www.$DOMAIN CNAME 2>/dev/null || echo 'not found')"
echo ""

echo "========================================="
echo "  PHASE 2: Production Deployment"
echo "========================================="
echo ""

if [ ! -f ".env" ]; then
    echo "Error: .env file not found. Copy .env.example to .env and configure."
    exit 1
fi

echo "Building Docker image..."
docker compose -f docker-compose.prod.yml build

echo ""
echo "========================================="
echo "  PHASE 3: SSL Certificate"
echo "========================================="
echo ""

if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "SSL certificate already exists. Skipping."
    echo "To renew: ./scripts/init-letsencrypt.sh $EMAIL"
else
    echo "Running initial SSL setup..."
    ./scripts/init-letsencrypt.sh "$EMAIL"
fi

echo ""
echo "========================================="
echo "  PHASE 4: Start Services"
echo "========================================="
echo ""

echo "Starting production services..."
docker compose -f docker-compose.prod.yml up -d

echo "Waiting for app to be healthy..."
for i in $(seq 1 60); do
    if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "  App is healthy!"
        break
    fi
    if [ "$i" -eq 60 ]; then
        echo "  Error: App not healthy after 60s."
        docker compose -f docker-compose.prod.yml logs --tail 50
        exit 1
    fi
    sleep 1
done

echo ""
echo "========================================="
echo "  PHASE 5: Email & Resend Setup"
echo "========================================="
echo ""
echo "Follow the Resend domain verification guide:"
echo "  ./scripts/setup-resend.sh $EMAIL"
echo ""
echo "After adding Resend DNS records, verify:"
echo "  ./scripts/verify-dns.sh $DOMAIN"
echo ""

echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "  App URL:          https://$DOMAIN"
echo "  Health Check:      https://$DOMAIN/api/health"
echo "  SSL Certificate:   /etc/letsencrypt/live/$DOMAIN/"
echo ""
echo "  Verify deployment:   ./scripts/verify-deploy.sh $DOMAIN"
echo "  Check DNS:           ./scripts/verify-dns.sh $DOMAIN"
echo "  View logs:           docker compose -f docker-compose.prod.yml logs -f"
echo "  Restart:             docker compose -f docker-compose.prod.yml restart"
echo "  Stop:                docker compose -f docker-compose.prod.yml down"