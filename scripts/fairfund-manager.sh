#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
SMART_CONTRACT_DIR="${ROOT_DIR}/smart-contract"
WEB_DIR="${ROOT_DIR}/web-fairfund"

ROOT_ENV_FILE="${ROOT_DIR}/.env"
CONFIG_ENV_FILE="${ROOT_DIR}/config/.env"

TMP_DIR="${ROOT_DIR}/tmp"
LOG_DIR="${ROOT_DIR}/logs"

ANVIL_PID_FILE="${TMP_DIR}/anvil.pid"
ANVIL_LOG_FILE="${LOG_DIR}/anvil.log"
NEXT_PID_FILE="${TMP_DIR}/next.pid"
NEXT_LOG_FILE="${LOG_DIR}/next.log"

ABI_SOURCE="${SMART_CONTRACT_DIR}/out/FairFund.sol/FairFund.json"
ABI_TARGET_DIR="${WEB_DIR}/lib/abi"
ABI_TARGET_FILE="${ABI_TARGET_DIR}/FairFund.json"
NEXT_ENV_FILE="${WEB_DIR}/.env.local"

DEPLOY_SCRIPT_DEFAULT="script/DeployFairFund.s.sol:DeployFairFund"

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

log() {
    printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >&2
}

ensure_dirs() {
    mkdir -p "${TMP_DIR}" "${LOG_DIR}"
}

load_env_file() {
    local file="$1"
    if [[ -f "${file}" ]]; then
        log "Cargando variables desde ${file}"
        set -o allexport
        # shellcheck disable=SC1090
        source "${file}"
        set +o allexport
    fi
}

require_command() {
    local cmd="$1"
    if ! command -v "${cmd}" >/dev/null 2>&1; then
        log "Error: comando requerido no encontrado: ${cmd}"
        exit 1
    fi
}

require_env_vars() {
    local missing=0
    for var_name in "$@"; do
        local value="${!var_name-}"
        if [[ -z "${value}" ]]; then
            log "Error: variable de entorno requerida '${var_name}' no está definida."
            missing=1
        fi
    done

    if [[ "${missing}" -eq 1 ]]; then
        log "Sugerencia: revisa 'config/env.example' y completa los valores necesarios."
        exit 1
    fi
}

stop_if_running() {
    local pid_file="$1"
    local name="$2"
    if [[ -f "${pid_file}" ]]; then
        local pid
        pid="$(cat "${pid_file}")"
        if kill -0 "${pid}" >/dev/null 2>&1; then
            log "Deteniendo ${name} (PID ${pid})..."
            kill "${pid}" >/dev/null 2>&1 || true
            sleep 1
            if kill -0 "${pid}" >/dev/null 2>&1; then
                kill -9 "${pid}" >/dev/null 2>&1 || true
            fi
        fi
        rm -f "${pid_file}"
    fi
}

update_env_var() {
    local file="$1"
    local key="$2"
    local value="$3"

    mkdir -p "$(dirname "${file}")"
    touch "${file}"

    if grep -q "^${key}=" "${file}"; then
        sed -i.bak "s|^${key}=.*|${key}=${value}|g" "${file}"
    else
        printf '%s=%s\n' "${key}" "${value}" >>"${file}"
    fi
    rm -f "${file}.bak"
}

is_anvil_running() {
    curl -s -m 1 -X POST \
        -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
        "${RPC_URL}" >/dev/null 2>&1
}

wait_for_anvil() {
    for _ in {1..20}; do
        if is_anvil_running; then
            return 0
        fi
        sleep 0.5
    done
    return 1
}

start_anvil_if_needed() {
    require_command "${ANVIL_CMD}"
    ensure_dirs

    if is_anvil_running; then
        log "Anvil ya está activo en ${RPC_URL}"
        return
    fi

    log "Iniciando Anvil con '${ANVIL_CMD} ${ANVIL_ARGS[*]}'..."
    stop_if_running "${ANVIL_PID_FILE}" "Anvil"

    (
        nohup "${ANVIL_CMD}" "${ANVIL_ARGS[@]}" >>"${ANVIL_LOG_FILE}" 2>&1 &
        echo $! >"${ANVIL_PID_FILE}"
    )

    if wait_for_anvil; then
        log "Anvil listo. PID $(cat "${ANVIL_PID_FILE}")"
    else
        log "No fue posible confirmar Anvil en ${RPC_URL}"
        exit 1
    fi
}

run_deploy() {
    require_command forge
    require_command jq
    require_env_vars PRIVATE_KEY_DEPLOYER FAIRFUND_OWNER FAIRFUND_FEE_VAULT FAIRFUND_PLATFORM_FEE_BPS

    local broadcast_flag=""
    [[ "${BROADCAST}" == "true" ]] && broadcast_flag="--broadcast"

    ensure_dirs

    (
        cd "${SMART_CONTRACT_DIR}" || exit 1
        forge build >/dev/null
        log "Ejecutando despliegue con ${DEPLOY_SCRIPT}..."
        forge script "${DEPLOY_SCRIPT}" \
            --rpc-url "${RPC_URL}" \
            --chain "${CHAIN_ID}" \
            ${broadcast_flag} \
            --json >"${TMP_DIR}/deploy-output.json"
    )

    if [[ ! -s "${TMP_DIR}/deploy-output.json" ]]; then
        log "El despliegue no generó salida. Revisa los mensajes de Forge anteriores."
        exit 1
    fi

    local address
    address="$(
        jq -r '
            [
                (try (.transactions | select(type == "array" and length > 0) | last | .contractAddress) catch empty),
                (try (.transactions | select(type == "array" and length > 0) | last | .address) catch empty),
                (.deployedTo // empty),
                ((.returns // {}) | .deployed? | .value? // empty),
                (.returned // empty)
            ]
            | map(select(. != null and . != "" and . != "null"))
            | .[0] // empty
        ' "${TMP_DIR}/deploy-output.json"
    )"

    if [[ -z "${address}" ]]; then
        log "No se pudo obtener la dirección del contrato desde deploy-output.json"
        exit 1
    fi

    log "Contrato desplegado en ${address}"
    echo "${address}"
}

sync_abi() {
    if [[ ! -f "${ABI_SOURCE}" ]]; then
        log "ABI no encontrado en ${ABI_SOURCE}. Ejecuta 'forge build' primero."
        exit 1
    fi
    mkdir -p "${ABI_TARGET_DIR}"
    cp "${ABI_SOURCE}" "${ABI_TARGET_FILE}"
    log "ABI sincronizado en ${ABI_TARGET_FILE}"
}

update_next_env() {
    local contract_address="$1"

    update_env_var "${NEXT_ENV_FILE}" "NEXT_PUBLIC_FAIRFUND_ADDRESS" "${contract_address}"
    update_env_var "${NEXT_ENV_FILE}" "NEXT_PUBLIC_RPC_URL" "${RPC_URL}"
    update_env_var "${NEXT_ENV_FILE}" "NEXT_PUBLIC_CHAIN_ID" "${CHAIN_ID}"

    if [[ -n "${SUPPORTED_TOKENS_JSON}" ]]; then
        update_env_var "${NEXT_ENV_FILE}" "NEXT_PUBLIC_SUPPORTED_TOKENS" "${SUPPORTED_TOKENS_JSON}"
    fi

    log "Variables actualizadas en ${NEXT_ENV_FILE}"
}

deploy_and_configure_tokens() {
    local contract_address="$1"

    if [[ -z "${TOKEN_DEPLOY_JSON:-}" ]]; then
        log "No se definieron tokens para desplegar. Saltando configuración de tokens."
        return
    fi

    if [[ "${BROADCAST}" != "true" ]]; then
        log "BROADCAST está en 'false'; se omite despliegue y configuración automática de tokens."
        return
    fi

    require_command forge
    require_command jq
    require_command cast
    require_command python3
    require_env_vars PRIVATE_KEY_DEPLOYER FAIRFUND_OWNER

    local owner_private_key="${FAIRFUND_OWNER_PRIVATE_KEY:-${PRIVATE_KEY_DEPLOYER}}"

    mapfile -t token_entries < <(jq -c '.[]' <<<"${TOKEN_DEPLOY_JSON}" 2>/dev/null || true)

    if [[ "${#token_entries[@]}" -eq 0 ]]; then
        log "TOKEN_DEPLOY_JSON no contiene elementos válidos. Revisa el formato."
        exit 1
    fi

    local tokens_env_json="[]"

    for token_entry in "${token_entries[@]}"; do
        local name symbol decimals fee_bps initial_supply recipient deployer_key
        name="$(jq -r '.name // empty' <<<"${token_entry}")"
        symbol="$(jq -r '.symbol // empty' <<<"${token_entry}")"
        decimals="$(jq -r '.decimals // 18' <<<"${token_entry}")"
        fee_bps="$(jq -r '.feeBps // 0' <<<"${token_entry}")"
        initial_supply="$(jq -r '.initialSupply // "0"' <<<"${token_entry}")"
        recipient="$(jq -r '.recipient // empty' <<<"${token_entry}")"
        deployer_key="$(jq -r '.privateKey // empty' <<<"${token_entry}")"

        if [[ -z "${name}" || -z "${symbol}" ]]; then
            log "Cada token debe incluir 'name' y 'symbol'. Entrada inválida: ${token_entry}"
            exit 1
        fi

        if [[ ! "${decimals}" =~ ^[0-9]+$ ]]; then
            log "El campo 'decimals' debe ser numérico. Entrada: ${token_entry}"
            exit 1
        fi

        if [[ ! "${fee_bps}" =~ ^[0-9]+$ ]]; then
            log "El campo 'feeBps' debe ser numérico. Entrada: ${token_entry}"
            exit 1
        fi

        local deployer_private_key="${deployer_key:-${PRIVATE_KEY_DEPLOYER}}"
        local mint_to="${recipient:-${FAIRFUND_OWNER}}"
        local initial_units="0"
        if [[ -n "${initial_supply}" && "${initial_supply}" != "0" ]]; then
            initial_units="$(decimal_to_uint "${initial_supply}" "${decimals}")"
        fi

        if [[ "${initial_units}" != "0" ]]; then
            log "Mint inicial configurado: ${initial_supply} ${symbol} para ${mint_to}"
        fi

        local script_output="${TMP_DIR}/deploy-token-${symbol}.json"

        log "Desplegando token mock '${name}' (${symbol})..."
        (
            cd "${SMART_CONTRACT_DIR}" || exit 1
            forge script script/DeployMockToken.s.sol:DeployMockToken \
                --sig "run(string,string,uint8,uint256,address)" \
                "${name}" "${symbol}" "${decimals}" "${initial_units}" "${mint_to}" \
                --rpc-url "${RPC_URL}" \
                --chain "${CHAIN_ID}" \
                "${FORGE_BROADCAST_ARGS[@]}" \
                --json >"${script_output}"
        )

        if [[ ! -s "${script_output}" ]]; then
            log "No se generó salida JSON para el despliegue del token ${symbol}."
            exit 1
        fi

        local script_success
        script_success="$(jq -sr 'map(select(has("success"))) | (first | .success // false)' "${script_output}")"
        if [[ "${script_success}" != "true" ]]; then
            log "El script de despliegue del token ${symbol} falló. Revisa ${script_output}"
            exit 1
        fi

        local token_address
        token_address="$(jq -sr 'map(select(has("returns"))) | (first | .returns.deployed.value // empty)' "${script_output}")"

        if [[ -z "${token_address}" || "${token_address}" == "0x0000000000000000000000000000000000000000" ]]; then
            log "No fue posible obtener la dirección del token para ${symbol}. Revisa ${script_output}"
            exit 1
        fi

        log "Token ${symbol} desplegado en ${token_address}"

        if [[ "${fee_bps}" -gt 0 ]]; then
            log "Permitiendo token ${symbol} con comisión personalizada ${fee_bps} bps..."
        else
            log "Permitiendo token ${symbol} sin comisión personalizada..."
        fi

        cast send "${contract_address}" "allowToken(address,uint16)" "${token_address}" "${fee_bps}" \
            --rpc-url "${RPC_URL}" \
            --private-key "${owner_private_key}" \
            >/dev/null

        tokens_env_json="$(
            jq -c \
                --arg symbol "${symbol}" \
                --arg address "${token_address}" \
                --argjson decimals "${decimals}" \
                '. + [{symbol: $symbol, address: $address, decimals: $decimals}]' \
                <<<"${tokens_env_json}"
        )"
    done

    SUPPORTED_TOKENS_JSON="${tokens_env_json}"
    log "Tokens configurados: ${SUPPORTED_TOKENS_JSON}"
}

start_next() {
    require_command "${NEXT_CMD}"
    ensure_dirs

    if [[ ! -d "${WEB_DIR}" ]]; then
        log "Directorio ${WEB_DIR} no encontrado."
        exit 1
    fi

    stop_if_running "${NEXT_PID_FILE}" "Next.js"

    log "Iniciando Next.js (${NEXT_CMD} ${NEXT_ARGS[*]})..."
    (
        cd "${WEB_DIR}" || exit 1
        nohup "${NEXT_CMD}" "${NEXT_ARGS[@]}" >>"${NEXT_LOG_FILE}" 2>&1 &
        echo $! >"${NEXT_PID_FILE}"
    )
    log "Next.js iniciado. PID $(cat "${NEXT_PID_FILE}")"
}

restart_all() {
    load_env_file "${ROOT_ENV_FILE}"
    load_env_file "${CONFIG_ENV_FILE}"

    RPC_URL=${RPC_URL:-http://127.0.0.1:8545}
    CHAIN_ID=${CHAIN_ID:-31337}
    BROADCAST=${BROADCAST:-true}
    DEPLOY_SCRIPT=${DEPLOY_SCRIPT:-${DEPLOY_SCRIPT_DEFAULT}}
    SUPPORTED_TOKENS_JSON=${SUPPORTED_TOKENS_JSON:-${NEXT_PUBLIC_SUPPORTED_TOKENS:-}}
    if [[ "${BROADCAST}" == "true" ]]; then
        FORGE_BROADCAST_ARGS=("--broadcast")
    else
        FORGE_BROADCAST_ARGS=()
    fi

    local anvil_args_default=("--host" "127.0.0.1" "--port" "8545" "--chain-id" "${CHAIN_ID}")
    local anvil_args_raw="${ANVIL_ARGS:-}"
    if [[ -n "${anvil_args_raw}" ]]; then
        IFS=' ' read -r -a ANVIL_ARGS <<<"${anvil_args_raw}"
    else
        ANVIL_ARGS=("${anvil_args_default[@]}")
    fi
    ANVIL_CMD=${ANVIL_CMD:-anvil}

    local next_args_raw="${NEXT_ARGS:-}"
    if [[ -n "${next_args_raw}" ]]; then
        IFS=' ' read -r -a NEXT_ARGS <<<"${next_args_raw}"
    else
        NEXT_ARGS=("dev")
    fi
    NEXT_CMD=${NEXT_CMD:-pnpm}

    require_command curl

    start_anvil_if_needed
    local contract_address
    contract_address="$(run_deploy)"
    deploy_and_configure_tokens "${contract_address}"
    sync_abi
    update_next_env "${contract_address}"
    start_next

    log "Proceso 'restart-all' finalizado correctamente."
}

usage() {
    cat <<'EOF'
Uso: fairfund-manager.sh restart-all

Acciones:
  - Verifica si Anvil está en ejecución; si no, lo inicia.
  - Despliega el contrato FairFund usando los valores de config/.env.
  - Despliega tokens mock definidos en TOKEN_DEPLOY_JSON y los autoriza.
  - Sincroniza el ABI y actualiza web-fairfund/.env.local.
  - Arranca la aplicación Next.js (web-fairfund).

Variables opcionales:
  ANVIL_CMD, ANVIL_ARGS, NEXT_CMD, NEXT_ARGS, DEPLOY_SCRIPT,
  RPC_URL, CHAIN_ID, BROADCAST, SUPPORTED_TOKENS_JSON,
  TOKEN_DEPLOY_JSON, FAIRFUND_OWNER_PRIVATE_KEY.
EOF
}

main() {
    local cmd="${1:-restart-all}"
    case "${cmd}" in
        restart-all)
            restart_all
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            log "Comando no reconocido: ${cmd}"
            usage
            exit 1
            ;;
    esac
}

main "$@"
