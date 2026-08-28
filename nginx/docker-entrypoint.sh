#!/bin/sh
# =============================================================================
# nginx/docker-entrypoint.sh
# Happy — Nginx entrypoint.
# Processes the config template with envsubst before starting nginx.
#
# @package Happy
# @since   1.0.0
# =============================================================================

set -e

echo "Nginx configuration:"
echo "  upstream app: app:3000"

envsubst '' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Nginx configuration generated successfully"

exec "$@"
