#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

ROOT_ENV_FILE="${ROOT_DIR}/.env"
CONFIG_ENV_FILE="${ROOT_DIR}/config/.env"

usage() {
    cat <<'EOF'
Uso: wallet-balances.sh [wallet_address]

Resumen:
  Muestra el balance de cada token configurado para una wallet.

Argumentos:
  wallet_address  Dirección a consultar. Si se omite, utiliza FAIRFUND_OWNER.

Requisitos:
  - Variables de entorno: RPC_URL (default http://127.0.0.1:8545), CHAIN_ID (default 31337)
  - Lista de tokens en SUPPORTED_TOKENS_JSON o NEXT_PUBLIC_SUPPORTED_TOKENS
  - Herramientas: cast, jq, python3
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

uint_to_decimal() {
    local value="$1"
    local decimals="$2"
    python3 - <<PY
from decimal import Decimal, getcontext

value = "${value}".strip()
decimals = int("${decimals}")

if value.startswith(("0x", "0X")):
    int_value = int(value, 16)
else:
    int_value = int(value or "0")

if decimals == 0:
    print(str(int_value))
else:
    getcontext().prec = decimals + 40
    scaled = Decimal(int_value) / (Decimal(10) ** decimals)
    formatted = f"{scaled:.{decimals}f}".rstrip("0").rstrip(".")
    print(formatted if formatted else "0")
PY
}

if [[ "${1-}" == "--help" || "${1-}" == "-h" ]]; then
    usage
fi

WALLET="${1-}"

load_env_file "${ROOT_ENV_FILE}"
load_env_file "${CONFIG_ENV_FILE}"

RPC_URL=${RPC_URL:-http://127.0.0.1:8545}
CHAIN_ID=${CHAIN_ID:-31337}

if [[ -z "${WALLET}" ]]; then
    WALLET="${FAIRFUND_OWNER:-}"
fi

if [[ -z "${WALLET}" ]]; then
    printf 'Error: proporciona una wallet o define FAIRFUND_OWNER en el entorno.\n' >&2
    exit 1
fi

if [[ "${WALLET}" != 0x* ]]; then
    printf 'Error: la wallet debe comenzar con 0x.\n' >&2
    exit 1
fi

TOKENS_SOURCE="${SUPPORTED_TOKENS_JSON:-${NEXT_PUBLIC_SUPPORTED_TOKENS:-}}"

if [[ -z "${TOKENS_SOURCE}" || "${TOKENS_SOURCE}" == "[]" ]]; then
    printf 'No hay tokens configurados en SUPPORTED_TOKENS_JSON o NEXT_PUBLIC_SUPPORTED_TOKENS.\n' >&2
    exit 1
fi

require_command cast
require_command jq
require_command python3

mapfile -t TOKENS < <(jq -c '.[]' <<<"${TOKENS_SOURCE}" 2>/dev/null || true)

if [[ "${#TOKENS[@]}" -eq 0 ]]; then
    printf 'No se pudieron parsear tokens desde la configuración.\n' >&2
    exit 1
fi

printf 'Wallet: %s\n' "${WALLET}"
printf 'RPC: %s\n' "${RPC_URL}"
printf '\n%-8s %-30s %s\n' "Símbolo" "Balance" "Token"
printf '%-8s %-30s %s\n' "-------" "------------------------------" "----------------------------------------------"

for token_entry in "${TOKENS[@]}"; do
    symbol="$(jq -r '.symbol // empty' <<<"${token_entry}")"
    address="$(jq -r '.address // empty' <<<"${token_entry}")"
    decimals="$(jq -r '.decimals // empty' <<<"${token_entry}")"

    if [[ -z "${symbol}" || -z "${address}" ]]; then
        printf 'Saltando entrada inválida: %s\n' "${token_entry}" >&2
        continue
    fi

    if [[ -z "${decimals}" || "${decimals}" == "null" ]]; then
        decimals="$(cast call "${address}" "decimals()(uint8)" --rpc-url "${RPC_URL}" || echo "18")"
    fi

    # Normaliza decimales en caso de que cast devuelva enteros con formato distinto
    decimals="$(python3 - <<PY
value = "${decimals}".strip()
if value.startswith(("0x", "0X")):
    print(int(value, 16))
else:
    print(int(value))
PY
)"

    units="$(cast call "${address}" "balanceOf(address)(uint256)" "${WALLET}" --rpc-url "${RPC_URL}")"
    human="$(uint_to_decimal "${units}" "${decimals}")"

    printf '%-8s %-30s %s\n' "${symbol}" "${human}" "${address}"
done

printf '\n'

