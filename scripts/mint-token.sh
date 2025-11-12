#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

ROOT_ENV_FILE="${ROOT_DIR}/.env"
CONFIG_ENV_FILE="${ROOT_DIR}/config/.env"

usage() {
    cat <<'EOF'
Uso: mint-token.sh <token_address> <destinatario> <cantidad> [--raw]

Argumentos:
  token_address  Dirección del contrato ERC20 (con función mint).
  destinatario   Dirección que recibirá los tokens.
  cantidad       Monto expresado en unidades decimales (ej. 1500.5).
                 Si agregas el flag --raw, se interpreta como cantidad en wei.

Flags opcionales:
  --raw          Evita conversión usando los decimales del token (usa valor en wei).

Variables de entorno requeridas:
  RPC_URL (default: http://127.0.0.1:8545)
  CHAIN_ID (default: 31337)
  MINT_PRIVATE_KEY o PRIVATE_KEY_DEPLOYER
EOF
    exit 1
}

load_env_file() {
    local file="$1"
    if [[ -f "${file}" ]]; then
        set -o allexport
        # shellcheck disable=SC1090
        source "${file}"
        set +o allexport
    fi
}

require_command() {
    local cmd="$1"
    if ! command -v "${cmd}" >/dev/null 2>&1; then
        printf 'Error: comando requerido no encontrado: %s\n' "${cmd}" >&2
        exit 1
    fi
}

decimal_to_uint() {
    local amount="$1"
    local decimals="$2"
    python3 - <<PY
from decimal import Decimal, getcontext
from math import floor

getcontext().prec = 78
amount = Decimal("${amount}")
decimals = int("${decimals}")
multiplier = Decimal(10) ** decimals
result = floor(amount * multiplier)
print(str(result))
PY
}

if [[ $# -lt 3 ]]; then
    usage
fi

TOKEN_ADDRESS="$1"
RECIPIENT="$2"
AMOUNT_INPUT="$3"
RAW_FLAG="${4-}"

if [[ "${TOKEN_ADDRESS}" != 0x* ]]; then
    printf 'Error: token_address debe ser una dirección válida (0x...)\n' >&2
    exit 1
fi

if [[ "${RECIPIENT}" != 0x* ]]; then
    printf 'Error: destinatario debe ser una dirección válida (0x...)\n' >&2
    exit 1
fi

load_env_file "${ROOT_ENV_FILE}"
load_env_file "${CONFIG_ENV_FILE}"

RPC_URL=${RPC_URL:-http://127.0.0.1:8545}
CHAIN_ID=${CHAIN_ID:-31337}

MINT_PRIVATE_KEY=${MINT_PRIVATE_KEY:-${PRIVATE_KEY_DEPLOYER:-}}
if [[ -z "${MINT_PRIVATE_KEY}" ]]; then
    printf 'Error: define MINT_PRIVATE_KEY o PRIVATE_KEY_DEPLOYER en tu entorno.\n' >&2
    exit 1
fi

require_command cast
require_command python3

AMOUNT_UNITS=""

if [[ "${RAW_FLAG}" == "--raw" ]]; then
    AMOUNT_UNITS="${AMOUNT_INPUT}"
else
    # Intenta obtener decimales del token
    DECIMALS_RAW="$(cast call "${TOKEN_ADDRESS}" "decimals()(uint8)" --rpc-url "${RPC_URL}" || true)"
    if [[ -z "${DECIMALS_RAW}" ]]; then
        printf 'Advertencia: no se pudo obtener decimals(), se asumirá 18.\n' >&2
        DECIMALS_RAW="18"
    fi

    # cast normalmente devuelve decimal, pero aceptamos hex.
    DECIMALS="$(python3 - <<PY
value = "${DECIMALS_RAW}".strip()
if value.startswith(("0x", "0X")):
    print(int(value, 16))
else:
    print(int(value))
PY
)"

    AMOUNT_UNITS="$(decimal_to_uint "${AMOUNT_INPUT}" "${DECIMALS}")"
fi

printf 'Minting %s (raw: %s) tokens to %s on %s...\n' "${AMOUNT_INPUT}" "${AMOUNT_UNITS}" "${RECIPIENT}" "${TOKEN_ADDRESS}"

cast send "${TOKEN_ADDRESS}" "mint(address,uint256)" "${RECIPIENT}" "${AMOUNT_UNITS}" \
    --rpc-url "${RPC_URL}" \
    --private-key "${MINT_PRIVATE_KEY}" \
    --chain "${CHAIN_ID}"

printf 'Mint completado.\n'

