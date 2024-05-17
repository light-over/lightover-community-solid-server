#!/bin/bash

DOMAIN_NAME="$1"  # The first argument to the script is stored as DOMAIN_NAME
EMAIL="$2"        # The second argument is the email address

if [ -z "$DOMAIN_NAME" ] || [ -z "$EMAIL" ]; then
    echo "Usage: $0 <domain-name> <email>"
    exit 1
fi

if ! grep -q "127.0.0.1 $DOMAIN_NAME" /etc/hosts; then
    echo "127.0.0.1 $DOMAIN_NAME" | sudo tee -a /etc/hosts > /dev/null
fi

if [ ! -e "/etc/letsencrypt/live/$DOMAIN_NAME" ]; then
    certbot certonly --webroot --webroot-path=/var/www/certbot --email $EMAIL --agree-tos --no-eff-email --staging --domains $DOMAIN_NAME
fi
