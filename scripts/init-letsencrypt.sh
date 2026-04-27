#!/bin/bash
# First-time SSL certificate setup using Docker-based Certbot
# Run this BEFORE starting the Docker production stack
set -euo pipefail

DOMAIN="the-exp.net"
EMAIL="${1:?Usage: $0 <email>}"

echo "=== Initial Let's Encrypt Certificate Setup ==="
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "[1/4] Creating dummy certificate for initial nginx startup..."
    sudo mkdir -p /etc/letsencrypt/live/$DOMAIN
    sudo openssl req -x509 -nodes \
        -newkey rsa:2048 \
        -days 1 \
        -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
        -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
        -subj "/CN=$DOMAIN" 2>/dev/null

    echo "[2/4] Starting nginx with dummy cert..."
    docker compose -f docker-compose.prod.yml up -d nginx

    echo "[3/4] Waiting for nginx to start..."
    sleep 5

    echo "[4/4] Requesting real certificate..."
    docker compose -f docker-compose.prod.yml run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        --domain "$DOMAIN" \
        --domain "www.$DOMAIN"

    echo "Reloading nginx with real certificate..."
    docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
else
    echo "Certificate already exists at /etc/letsencrypt/live/$DOMAIN"
    echo "Skipping initial setup. To renew, run:"
    echo "  docker compose -f docker-compose.prod.yml run --rm certbot renew"
fi

echo ""
echo "=== SSL Setup Complete ==="
echo "Start all services with:"
echo "  docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "Verify with:"
echo "  ./scripts/verify-deploy.sh $DOMAIN"