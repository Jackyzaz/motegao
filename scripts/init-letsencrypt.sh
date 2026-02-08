#!/bin/bash
# Initialize SSL certificates for first-time setup
# Usage: ./init-letsencrypt.sh

set -e

# Load environment variables
if [ -f .env.production ]; then
    export $(grep -v '^#' .env.production | xargs)
fi

DOMAIN="${SSL_DOMAIN}"
EMAIL="${SSL_EMAIL}"
CERTBOT_PATH="./certbot"
COMPOSE="docker compose --env-file .env.production -f docker-compose.ssl.yml"

if [ -z "$DOMAIN" ]; then
    echo "ERROR: SSL_DOMAIN is not set. Check your .env.production file."
    exit 1
fi

if [ -z "$EMAIL" ]; then
    echo "ERROR: SSL_EMAIL is not set. Check your .env.production file."
    exit 1
fi

echo "==> Setting up SSL for domain: $DOMAIN"

# Step 1: Create required directories
mkdir -p "$CERTBOT_PATH/conf/live/$DOMAIN"
mkdir -p "$CERTBOT_PATH/www"

# Step 2: Generate temporary self-signed certificate so nginx can start
echo "==> Creating temporary self-signed certificate..."
openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout "$CERTBOT_PATH/conf/live/$DOMAIN/privkey.pem" \
    -out "$CERTBOT_PATH/conf/live/$DOMAIN/fullchain.pem" \
    -subj "/CN=$DOMAIN" 2>/dev/null
echo "==> Temporary certificate created."

# Step 3: Start nginx (it can now load the temp cert)
echo "==> Starting nginx..."
$COMPOSE up -d nginx

echo "==> Waiting for nginx to be ready..."
sleep 10

# Step 4: Verify nginx is running and port 80 is reachable
if ! docker inspect motegao-nginx-ssl --format '{{.State.Running}}' 2>/dev/null | grep -q true; then
    echo "ERROR: nginx container is not running. Check logs with: docker logs motegao-nginx-ssl"
    exit 1
fi
echo "==> Nginx is running."

# Step 5: Request real certificate from Let's Encrypt (nginx serves ACME challenge on port 80)
echo "==> Requesting Let's Encrypt certificate for $DOMAIN..."
$COMPOSE run --rm certbot

# Step 6: Reload nginx with the real certificate
echo "==> Reloading nginx..."
$COMPOSE exec nginx nginx -s reload

echo ""
echo "==> SSL setup complete for $DOMAIN!"
echo "==> You can now start all services with:"
echo "    $COMPOSE up -d"
