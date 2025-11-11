# 🔄 Etapa 3 — Scripts y Automatización DevOps

## 1. Objetivo

Automatizar las tareas operativas clave del proyecto FairFund: reinicio de servicios locales (Anvil + Next.js), despliegue del contrato inteligente, sincronización del ABI y actualización de variables de entorno para el frontend.

## 2. Entregables principales

- **Script shell modular** `scripts/fairfund-manager.sh`
  - Comandos disponibles:
    - `restart-services`, `restart-anvil`, `restart-next`
    - `deploy` (ejecuta script Foundry)
    - `sync-abi` (copia ABI al frontend)
    - `update-env <address>` (escribe variables en `.env.local`)
    - `deploy-and-sync` (ejecuta despliegue completo + sync)
  - Funciones reutilizables:
    - Manejo de procesos con PID files (`tmp/`) y logs (`logs/`).
    - Validación de binarios (`forge`, `jq`, `anvil`, `pnpm`).
    - Utilidades para actualizar variables en archivos `.env`.
    - Configuración mediante variables de entorno con defaults controlados.
- **Plantilla de variables** `config/env.example`
  - Punto de partida para `.env` en ambiente local/CI.
  - Reúne parámetros de despliegue, rutas y ajustes de servicios.

## 3. Flujo recomendado

1. Copiar plantilla de entorno:
   ```bash
   cp config/env.example .env
   ```
   Ajustar claves privadas, owner y vault.
2. Exportar variables (o utilizar `direnv`/`dotenv`):
   ```bash
   set -a
   source .env
   set +a
   ```
3. Reiniciar servicios:
   ```bash
   ./scripts/fairfund-manager.sh restart-services
   ```
4. Desplegar y sincronizar:
   ```bash
   ./scripts/fairfund-manager.sh deploy-and-sync
   ```
   - Genera `tmp/deploy-output.json` y actualiza:
     - `web-fairfund/lib/abi/FairFund.json`
     - `web-fairfund/.env.local` (`NEXT_PUBLIC_FAIRFUND_ADDRESS`, `NEXT_PUBLIC_CHAIN_ID`, `NEXT_PUBLIC_RPC_URL`)

## 4. Personalización

Las siguientes variables pueden sobrescribirse previo a ejecutar el script:

| Variable | Descripción | Default |
|----------|-------------|---------|
| `ANVIL_CMD` / `ANVIL_ARGS` | Comando y argumentos para Anvil | `anvil` / `--host 127.0.0.1 --port 8545 --chain-id 31337` |
| `NEXT_WORKDIR` / `NEXT_CMD` / `NEXT_ARGS` | Ubicación y comando para Next.js | `./web-fairfund` / `pnpm` / `dev` |
| `RPC_URL`, `CHAIN_ID`, `BROADCAST` | Parámetros de despliegue Foundry | `http://127.0.0.1:8545`, `31337`, `true` |
| `DEPLOY_SCRIPT` | Script Foundry a ejecutar | `script/DeployFairFund.s.sol:DeployFairFund` |
| `ABI_TARGET_DIR`, `NEXT_ENV_FILE` | Destinos para ABI y `.env.local` | `./web-fairfund/lib/abi`, `./web-fairfund/.env.local` |

> Si `web-fairfund/` no existe todavía, el script omite el reinicio de Next.js y avisa en logs.

## 5. Próximos pasos / mejoras sugeridas

- Integrar script con GitHub Actions para despliegues automáticos en Sepolia.
- Añadir comprobaciones de salud (ping a RPC, verificación de balance del deployer).
- Incorporar soporte para múltiples entornos (`--env staging`, `--env production`) con diferentes archivos `.env`.
- Agregar tareas para limpieza de artefactos y generación de reportes de gas.

---

> Con esta automatización, FairFund queda listo para integrar etapas posteriores (frontend Web3 y CI/CD completo) con mínima fricción operacional.


