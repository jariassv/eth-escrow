#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Defaults (can be overridden via environment variables)
ANVIL_CMD=${ANVIL_CMD:-anvil}
ANVIL_ARGS=${ANVIL_ARGS:-"--host 127.0.0.1 --port 8545 --chain-id 31337"}
ANVIL_PID_FILE="${ROOT_DIR}/tmp/anvil.pid"
ANVIL_LOG_FILE="${ROOT_DIR}/logs/anvil.log"

NEXT_WORKDIR=${NEXT_WORKDIR:-${ROOT_DIR}/web-fairfund}
NEXT_CMD=${NEXT_CMD:-pnpm}
NEXT_ARGS=${NEXT_ARGS:-"dev"}
NEXT_PID_FILE="${ROOT_DIR}/tmp/next.pid"
NEXT_LOG_FILE="${ROOT_DIR}/logs/next.log"

SMART_CONTRACT_DIR="${ROOT_DIR}/smart-contract"
DEPLOY_SCRIPT=${DEPLOY_SCRIPT:-script/DeployFairFund.s.sol:DeployFairFund}
RPC_URL=${RPC_URL:-http://127.0.0.1:8545}
BROADCAST=${BROADCAST:-true}
CHAIN_ID=${CHAIN_ID:-31337}

ABI_SOURCE="${SMART_CONTRACT_DIR}/out/FairFund.sol/FairFund.json"
ABI_TARGET_DIR=${ABI_TARGET_DIR:-${ROOT_DIR}/web-fairfund/lib/abi}
ABI_TARGET_FILE="${ABI_TARGET_DIR}/FairFund.json"

NEXT_ENV_FILE=${NEXT_ENV_FILE:-${ROOT_DIR}/web-fairfund/.env.local}
SUPPORTED_TOKENS_JSON=${SUPPORTED_TOKENS_JSON:-${NEXT_PUBLIC_SUPPORTED_TOKENS:-}}

# Utility --------------------------------------------------------------------

log() {
    printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >&2
}

ensure_dirs() {
    mkdir -p "${ROOT_DIR}/tmp" "${ROOT_DIR}/logs"
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
        log "Sugerencia: revisa 'config/env.example' y exporta las variables necesarias antes de ejecutar este comando."
        exit 1
    fi
}

stop_process() {
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
                log "${name} no se detuvo, forzando con SIGKILL."
                kill -9 "${pid}" >/dev/null 2>&1 || true
            fi
        fi
        rm -f "${pid_file}"
    fi
}

start_background() {
    local cmd="$1"
    local args_string="$2"
    local workdir="$3"
    local pid_file="$4"
    local log_file="$5"

    ensure_dirs
    mkdir -p "$(dirname "${log_file}")"

    if [[ -n "${workdir}" && ! -d "${workdir}" ]]; then
        log "Directorio ${workdir} no existe. Omitiendo inicio de $(basename "${pid_file%.*}")."
        return
    fi

    read -r -a args_array <<< "${args_string}"

    log "Iniciando ${cmd} ${args_string}"
    (
        cd "${workdir:-${ROOT_DIR}}" || exit 1
        nohup "${cmd}" "${args_array[@]}" >>"${log_file}" 2>&1 &
        echo $! >"${pid_file}"
    )
    log "Proceso iniciado. PID $(cat "${pid_file}"). Logs: ${log_file}"
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
        printf '%s=%s
' "${key}" "${value}" >>"${file}"
    fi
    rm -f "${file}.bak"
}

update_supported_tokens() {
    if [[ -n "${SUPPORTED_TOKENS_JSON}" ]]; then
        update_env_var "${NEXT_ENV_FILE}" "NEXT_PUBLIC_SUPPORTED_TOKENS" "${SUPPORTED_TOKENS_JSON}"
        log "Tokens soportados registrados en ${NEXT_ENV_FILE}"
    fi
}

# Service management ---------------------------------------------------------

restart_anvil() {
    require_command "${ANVIL_CMD}"
    stop_process "${ANVIL_PID_FILE}" "Anvil"
    start_background "${ANVIL_CMD}" "${ANVIL_ARGS}" "" "${ANVIL_PID_FILE}" "${ANVIL_LOG_FILE}"
}

restart_next() {
    if [[ ! -d "${NEXT_WORKDIR}" ]]; then
        log "Directorio Next.js no encontrado en ${NEXT_WORKDIR}. Omitiendo reinicio."
        return
    fi
    require_command "${NEXT_CMD}"
    stop_process "${NEXT_PID_FILE}" "Next.js"
    start_background "${NEXT_CMD}" "${NEXT_ARGS}" "${NEXT_WORKDIR}" "${NEXT_PID_FILE}" "${NEXT_LOG_FILE}"
}

restart_services() {
    restart_anvil
    restart_next
}

# Deployment -----------------------------------------------------------------

run_deploy() {
    require_command forge
    require_command jq
    require_env_vars PRIVATE_KEY_DEPLOYER FAIRFUND_OWNER FAIRFUND_FEE_VAULT FAIRFUND_PLATFORM_FEE_BPS

    local broadcast_flag=""
    [[ "${BROADCAST}" == "true" ]] && broadcast_flag="--broadcast"

    (
        cd "${SMART_CONTRACT_DIR}" || exit 1
        forge build >/dev/null
        log "Ejecutando despliegue con ${DEPLOY_SCRIPT}..."
        forge script "${DEPLOY_SCRIPT}" \
            --rpc-url "${RPC_URL}" \
            --chain "${CHAIN_ID}" \
            ${broadcast_flag} \
            --json >"${ROOT_DIR}/tmp/deploy-output.json"
    )

    if [[ ! -s "${ROOT_DIR}/tmp/deploy-output.json" ]]; then
        log "El despliegue no generó salida. Revisa los mensajes de Forge anteriores."
        exit 1
    fi

    local address
    address="$(jq -r '.transactions[-1].contractAddress // empty' "${ROOT_DIR}/tmp/deploy-output.json")"
    if [[ -z "${address}" || "${address}" == "null" ]]; then
        address="$(jq -r '.deployedTo // empty' "${ROOT_DIR}/tmp/deploy-output.json")"
    fi
    if [[ -z "${address}" || "${address}" == "null" ]]; then
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
    if [[ ! -d "${ABI_TARGET_DIR}" ]]; then
        log "Creando directorio ABI destino: ${ABI_TARGET_DIR}"
        mkdir -p "${ABI_TARGET_DIR}"
    fi
    cp "${ABI_SOURCE}" "${ABI_TARGET_FILE}"
    log "ABI sincronizado en ${ABI_TARGET_FILE}"
}

update_next_env() {
    local contract_address="$1"
    update_env_var "${NEXT_ENV_FILE}" "NEXT_PUBLIC_FAIRFUND_ADDRESS" "${contract_address}"
    update_env_var "${NEXT_ENV_FILE}" "NEXT_PUBLIC_CHAIN_ID" "${CHAIN_ID}"
    update_env_var "${NEXT_ENV_FILE}" "NEXT_PUBLIC_RPC_URL" "${RPC_URL}"
    update_supported_tokens
    log "Variables actualizadas en ${NEXT_ENV_FILE}"
}

deploy_and_sync() {
    local address
    address="$(run_deploy)"
    sync_abi
    update_next_env "${address}"
    log "Despliegue y sincronización completados."
}

# CLI ------------------------------------------------------------------------

usage() {
    cat <<EOF
Uso: $(basename "$0") <comando>

Comandos disponibles:
  restart-services   Reinicia Anvil y Next.js (según configuración)
  restart-anvil      Reinicia solo Anvil
  restart-next       Reinicia solo Next.js
  deploy             Ejecuta el script de despliegue de FairFund y genera JSON
  sync-abi           Copia el ABI al directorio del frontend
  update-env <addr>  Actualiza .env.local con la dirección proporcionada
  deploy-and-sync    Despliega, sincroniza ABI y actualiza .env.local automáticamente
  help               Muestra esta ayuda

Variables importantes (se pueden sobrescribir):
  ANVIL_CMD, ANVIL_ARGS, NEXT_WORKDIR, NEXT_CMD, NEXT_ARGS,
  RPC_URL, CHAIN_ID, BROADCAST, ABI_TARGET_DIR, NEXT_ENV_FILE,
  SUPPORTED_TOKENS_JSON.
EOF
}

main() {
    local cmd="${1:-help}"
    shift || true

    case "${cmd}" in
    restart-services)
        restart_services
        ;;
    restart-anvil)
        restart_anvil
        ;;
    restart-next)
        restart_next
        ;;
    deploy)
        run_deploy
        ;;
    sync-abi)
        sync_abi
        ;;
    update-env)
        if [[ $# -lt 1 ]]; then
            log "Se requiere dirección de contrato para update-env."
            exit 1
        fi
        update_next_env "$1"
        ;;
    deploy-and-sync)
        deploy_and_sync
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
