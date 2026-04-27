#!/bin/bash
set -euo pipefail

echo "=== SaaSKit Pro Production Deployment ==="
echo ""

ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found. Copy .env.example to .env and fill in values."
    exit 1
fi

DOMAIN=$(grep -E '^NEXT_PUBLIC_APP_URL=' "$ENV_FILE" | sed 's/NEXT_PUBLIC_APP_URL=.*:\/\/\([^:/]*\).*/\1/' | sed 's/\/$//')
if [ -z "$DOMAIN" ]; then
    DOMAIN=$(grep -E '^NEXTAUTH_URL=' "$ENV_FILE" | sed 's/NEXTAUTH_URL=.*:\/\/\([^:/]*\).*/\1/' | sed 's/\/$//')
fi
if [ -z "$DOMAIN" ]; then
    echo "Warning: Could not extract domain from .env. Using localhost."
    DOMAIN="localhost"
fi

echo "Domain: $DOMAIN"
echo ""

echo "[1/6] Validating .env configuration..."
REQUIRED_VARS=(
    "NEXTAUTH_URL"
    "NEXTAUTH_SECRET"
    "NEXT_PUBLIC_APP_URL"
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "STRIPE_SECRET_KEY"
    "STRIPE_PUBLISHABLE_KEY"
    "OPENROUTER_API_KEY"
)
MISSING=0
for VAR in "${REQUIRED_VARS[@]}"; do
    VAL=$(grep -E "^${VAR}=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2-)
    if [ -z "$VAL" ] || echo "$VAL" | grep -qi "your-\|xxx\|change-me\|placeholder"; then
        echo "  MISSING: $VAR"
        MISSING=$((MISSING + 1))
    else
        echo "  OK: $VAR"
    fi
done
if [ "$MISSING" -gt 0 ]; then
    echo ""
    echo "Error: $MISSING required env variables are missing or contain placeholder values."
    echo "Fix .env before deploying."
    exit 1
fi
echo ""

COMPOSE_FILES="-f docker-compose.prod.yml"
if [ "${PRODUCTION:-true}" = "false" ]; then
    COMPOSE_FILES=""
fi

echo "[2/6] Building Docker image..."
docker compose $COMPOSE_FILES build

echo "[3/6] Stopping any existing containers..."
docker compose $COMPOSE_FILES down 2>/dev/null || true

echo "[4/6] Starting application..."
docker compose $COMPOSE_FILES up -d

echo "[5/6] Waiting for health check..."
for i in $(seq 1 45); do
    if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
        HEALTH=$(curl -s http://localhost:3000/api/health)
        echo "  App is healthy! $HEALTH"
        break
    fi
    if [ "$i" -eq 45 ]; then
        echo "  Error: App not healthy after 45s. Check logs: docker compose logs"
        docker compose logs --tail 50
        exit 1
    fi
    sleep 1
done

echo "[6/6] Verifying nginx (production mode uses Docker nginx)..."
if [ "$DOMAIN" != "localhost" ] && [ "${PRODUCTION:-true}" = "false" ]; then
    NGINX_CONF="nginx.conf"
    if [ -f "$NGINX_CONF" ]; then
        NGINX_SITE="/etc/nginx/sites-available/$DOMAIN"
        if [ ! -f "$NGINX_SITE" ]; then
            sudo cp "$NGINX_CONF" "$NGINX_SITE"
            sudo ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/"
            echo "  nginx site config installed."
        fi
        if sudo nginx -t 2>/dev/null; then
            sudo systemctl reload nginx
            echo "  nginx reloaded successfully."
        else
            echo "  Warning: nginx config test failed. SSL may not be set up yet."
            echo "  Run ./scripts/setup-ssl.sh hello@$DOMAIN after DNS is configured."
        fi
    fi
fi
        NGINX_SITE="/etc/nginx/sites-available/$DOMAIN"
        if [ ! -f "$NGINX_SITE" ]; then
            sudo cp "$NGINX_CONF" "$NGINX_SITE"
            sudo ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/
            echo "  nginx site config installed."
        else
            echo "  nginx site config already exists. Update manually if needed."
        fi
        if sudo nginx -t 2>/dev/null; then
            sudo systemctl reload nginx
            echo "  nginx reloaded successfully."
        else
            echo "  Warning: nginx config test failed. SSL may not be set up yet."
            echo "  Run ./scripts/setup-ssl.sh $DOMAIN hello@$DOMAIN after DNS is configured."
        fi
    fi
fi

echo ""
echo "=== Deployment Complete ==="
echo "App URL: http://localhost:3000"
if [ "$DOMAIN" != "localhost" ]; then
    echo "Public URL: https://$DOMAIN"
    echo ""
    echo "Next steps if SSL not yet configured:"
    echo "  1. Ensure DNS A record points to this server"
    echo "  2. Run: ./scripts/setup-ssl.sh $DOMAIN hello@$DOMAIN"
    echo "  3. Verify: curl -s https://$DOMAIN/api/health"
fi
echo ""
echo "Useful commands:"
echo "  View logs:     docker compose $COMPOSE_FILES logs -f"
echo "  Stop:          docker compose $COMPOSE_FILES down"
echo "  Restart:       docker compose $COMPOSE_FILES restart"
echo "  Check health:  curl -s http://localhost:3000/api/health | jq ."