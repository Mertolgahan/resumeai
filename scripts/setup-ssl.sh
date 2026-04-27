#!/bin/bash
set -euo pipefail

DOMAIN="the-exp.net"
EMAIL="${1:?Usage: $0 <email>}"
MODE="${2:-standalone}"

echo "=== SSL Certificate Setup for $DOMAIN ==="
echo "Email: $EMAIL"
echo "Mode: $MODE"
echo ""

if ! command -v certbot &>/dev/null; then
    echo "Installing certbot..."
    sudo apt-get update -qq
    sudo apt-get install -y certbot python3-certbot-nginx
fi

if [ "$MODE" = "docker" ]; then
    echo "Using Docker-based certbot..."
    docker run --rm \
        -v /etc/letsencrypt:/etc/letsencrypt \
        -v /var/www/certbot:/var/www/certbot \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        --domain "$DOMAIN" \
        --domain "www.$DOMAIN"
elif [ "$MODE" = "nginx" ]; then
    echo "Using nginx plugin..."
    sudo certbot --nginx \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        --domain "$DOMAIN" \
        --domain "www.$DOMAIN"
else
    echo "Using standalone mode (stop any service on port 80 first)..."
    sudo certbot certonly --standalone \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        --domain "$DOMAIN" \
        --domain "www.$DOMAIN"
fi

echo ""
echo "=== SSL certificate obtained successfully ==="
echo "Certificate path: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
echo "Key path: /etc/letsencrypt/live/$DOMAIN/privkey.pem"
echo ""

echo "Setting up auto-renewal..."
sudo systemctl enable certbot.timer 2>/dev/null || {
    (sudo crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --deploy-hook 'docker compose -f /opt/saaskit/docker-compose.prod.yml exec nginx nginx -s reload'") | sudo crontab -
}
echo "Auto-renewal configured."

echo ""
echo "Next steps:"
echo "1. Verify DNS: ./scripts/verify-dns.sh $DOMAIN"
echo "2. Start services: docker compose -f docker-compose.prod.yml up -d"
echo "3. Verify HTTPS: ./scripts/verify-deploy.sh $DOMAIN"