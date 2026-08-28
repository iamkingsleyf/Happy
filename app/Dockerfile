# =============================================================================
# app/Dockerfile
# Happy — Node.js application image.
# No build step. npm ci --omit=dev. Starts with node src/server.js.
#
# @package Happy
# @since   1.0.0
# =============================================================================

FROM node:20-alpine

RUN apk add --no-cache wget

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src/ ./src/
COPY public/ ./public/

EXPOSE 3000

CMD ["node", "src/server.js"]
