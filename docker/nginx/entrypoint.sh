#!/bin/sh
# Substitute environment variable values into the NGINX config template
envsubst '$SERVER_NAME' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Start NGINX
exec nginx -g 'daemon off;'
