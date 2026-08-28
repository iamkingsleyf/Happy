#!/bin/bash
# =============================================================================
# tests/smoke-test.sh
# Happy — Integration smoke test (no real Fal.ai calls).
#
# @package Happy
# @since   1.0.0
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="docker compose -f ${ROOT_DIR}/docker-compose.yml -f ${ROOT_DIR}/tests/compose.override.yml --env-file ${ROOT_DIR}/tests/smoke-test.env"
KEEP_STACK=false
TEST_HTTP_PORT="${TEST_HTTP_PORT:-18081}"
BASE_URL="http://127.0.0.1:${TEST_HTTP_PORT}"

if [ "${1:-}" = "--keep" ]; then
    KEEP_STACK=true
fi

pass() { echo "[PASS] $*"; }
fail() { echo "[FAIL] $*"; exit 1; }
info() { echo "[INFO] $*"; }

CREATED_ENV=false

cleanup() {
    if [ "${KEEP_STACK}" = true ]; then
        info "Keeping stack running (--keep). Base URL: ${BASE_URL}"
        return 0
    fi
    info "Tearing down test stack..."
    ${COMPOSE} down -v --remove-orphans 2>/dev/null || true
    if [ "${CREATED_ENV}" = true ] && [ -f "${ROOT_DIR}/.env" ]; then
        rm -f "${ROOT_DIR}/.env"
    fi
}

trap cleanup EXIT

info "Creating dokploy-network if missing..."
docker network inspect dokploy-network >/dev/null 2>&1 || docker network create dokploy-network

if [ ! -f "${ROOT_DIR}/.env" ]; then
    info "No .env file; copying tests/smoke-test.env for Compose"
    cp "${ROOT_DIR}/tests/smoke-test.env" "${ROOT_DIR}/.env"
    CREATED_ENV=true
fi

info "Building and starting stack..."
export TEST_HTTP_PORT
${COMPOSE} up -d --build

info "Waiting for app container to be healthy..."
for i in $(seq 1 40); do
    if ${COMPOSE} ps app 2>/dev/null | grep -q "(healthy)"; then
        pass "App container healthy"
        break
    fi
    if [ "$i" -eq 40 ]; then
        ${COMPOSE} logs app
        fail "App container did not become healthy in time"
    fi
    sleep 5
done

info "Waiting for nginx container to be healthy..."
for i in $(seq 1 20); do
    if ${COMPOSE} ps nginx 2>/dev/null | grep -q "(healthy)"; then
        pass "Nginx container healthy"
        break
    fi
    if [ "$i" -eq 20 ]; then
        fail "Nginx container did not become healthy in time"
    fi
    sleep 3
done

info "Testing /healthz..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/healthz")
[ "${HTTP_CODE}" = "200" ] || fail "/healthz returned ${HTTP_CODE}"
pass "/healthz returned 200"

info "Testing homepage..."
curl -s "${BASE_URL}/" | grep -q "Happy" || fail "homepage did not contain Happy"
pass "homepage returned Happy UI"

info "Testing /api/ready..."
curl -s "${BASE_URL}/api/ready" | python3 -c "import sys,json; d=json.load(sys.stdin); assert d.get('ok') is True" \
    || fail "/api/ready did not return ok"
pass "/api/ready returned ok"

info "Testing empty Create prompt is rejected..."
GEN_CODE=$(curl -s -o /tmp/happy-gen.json -w "%{http_code}" -X POST "${BASE_URL}/api/generate" -H "Content-Type: application/json" -d '{}')
[ "${GEN_CODE}" = "400" ] || fail "/api/generate empty body returned ${GEN_CODE}"
python3 -c "import json; d=json.load(open('/tmp/happy-gen.json')); assert 'picture' in d['error'].lower() or 'prompt' in d['error'].lower()" \
    || fail "/api/generate error was not clear"
pass "/api/generate rejects an empty prompt"

echo ""
echo "=============================================="
echo "  ALL SMOKE TESTS PASSED"
echo "  Stack URL: ${BASE_URL}"
echo "=============================================="
