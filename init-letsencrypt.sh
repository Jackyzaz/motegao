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
if [ ! -f "$CERTBOT_PATH/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "==> Creating temporary self-signed certificate..."
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout "$CERTBOT_PATH/conf/live/$DOMAIN/privkey.pem" \
        -out "$CERTBOT_PATH/conf/live/$DOMAIN/fullchain.pem" \
        -subj "/CN=$DOMAIN"
    echo "==> Temporary certificate created."
else
    echo "==> Certificate already exists, skipping self-signed generation."
fi

# Step 3: Start nginx (it can now load the temp cert)
echo "==> Starting nginx..."
docker compose --env-file .env.production -f docker-compose.ssl.yml up -d nginx

echo "==> Waiting for nginx to be ready..."
sleep 5

# Step 4: Delete the temporary certificate
echo "==> Removing temporary certificate..."
rm -f "$CERTBOT_PATH/conf/live/$DOMAIN/fullchain.pem"
rm -f "$CERTBOT_PATH/conf/live/$DOMAIN/privkey.pem"
rm -rf "$CERTBOT_PATH/conf/live/$DOMAIN"

# Step 5: Request real certificate from Let's Encrypt
echo "==> Requesting Let's Encrypt certificate for $DOMAIN..."
docker compose --env-file .env.production -f docker-compose.ssl.yml run --rm certbot

# Step 6: Reload nginx with the real certificate
echo "==> Reloading nginx with real certificate..."
docker compose --env-file .env.production -f docker-compose.ssl.yml exec nginx nginx -s reload

echo "==> SSL setup complete for $DOMAIN!"
echo "==> You can now start all services with:"
echo "    docker compose --env-file .env.production -f docker-compose.ssl.yml up -d"
