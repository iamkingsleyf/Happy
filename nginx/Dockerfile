# =============================================================================
# nginx/Dockerfile
# Happy — Nginx reverse proxy image.
# Same pattern as IMGverse Search: nginx:alpine, envsubst, custom entrypoint.
#
# @package Happy
# @since   1.0.0
# =============================================================================

FROM nginx:alpine

RUN apk add --no-cache gettext wget

COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint-custom.sh
RUN chmod +x /docker-entrypoint-custom.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint-custom.sh"]
CMD ["nginx", "-g", "daemon off;"]
