# 🏗️ Etapa 1 — Diseño Técnico y Preparación

## 1. Resumen

La etapa de diseño técnico define la arquitectura objetivo de FairFund, los componentes que la integran y las convenciones necesarias para iniciar el desarrollo con bases sólidas. También establece la estructura del repositorio y los pasos de preparación de entorno, dejando listo el terreno para implementar el smart contract (Etapa 2).

## 2. Arquitectura general

- **Capa On-chain**
  - Contrato `FairFund.sol` desplegado en redes EVM (Anvil → Sepolia → Mainnet).
  - Reutiliza utilidades de OpenZeppelin (propietario, guardas de reentrancy, Pausable).
  - Eventos extensivos para indexación (`ProjectCreated`, `ContributionAdded`, `FundsWithdrawn`, `RefundProcessed`, `Paused`, `Unpaused`, `TokenAllowed`, `TokenRemoved`).
- **Capa de Indexación (opcional)**
  - Subgrafo en The Graph para hooks de lectura eficiente (`Projects`, `Contributions`, `CampaignStats`).
- **Capa Frontend**
  - Next.js 15 (App Router), Ethers v6, React Query, Zustand (estado local).
  - Integración directa con contrato y cache de datos provenientes del subgrafo.
- **Automatización DevOps**
  - Scripts Foundry + shell para despliegues, reinicios de Anvil/Next.js, sincronización de ABI y variables de entorno.
  - GitHub Actions para lint, pruebas (smart contract + frontend) y simulaciones de despliegue.

### Diagrama textual de componentes

```
[User Wallet] --(tx)--> [FairFund.sol] --(events)--> [The Graph] --(queries)--> [Next.js App]
     |                                                              ^
     +----(sign)----> [Next.js App] --(RPC calls)--> [Anvil/Sepolia RPC] 

[Automation Scripts] --(deploy)--> [FairFund.sol] --(ABI export)--> [Next.js App/.env.local]
```

## 3. Modelo de datos del contrato

### Estructuras
- `Project`: creador, token aceptado, título, descripción hash (para reducir gas opcional), goal, deadline, totalRaised, withdrawn, active, pausedByCreator, feeApplied.
- `Contribution`: amount, refunded, timestamp opcional.

### Mapeos
- `projects[projectId] → Project`.
- `contributions[projectId][backer] → Contribution`.
- `allowedTokens[tokenAddress] → TokenConfig` (estructura con `decimals`, `symbol`, `feeBpsOverride`).
- `creatorProjects[creator] → uint256[]` para listados directos (considerar límites de gas con arrays dinámicos).

### Variables adicionales
- `platformFeeBps` (fee global).
- `feeVault` (dirección de acumulación para owner).
- `projectCount`, `paused` (sistema global).

## 4. Interfaz pública y eventos

| Categoría | Funciones | Revert reasons | Eventos |
|-----------|-----------|----------------|---------|
| Gobierno | `allowToken`, `removeToken`, `setPlatformFee`, `pause`, `unpause`, `withdrawFees` | `TokenAlreadyAllowed`, `TokenNotAllowed`, `FeeTooHigh`, `Unauthorized` | `TokenAllowed`, `TokenRemoved`, `PlatformFeeUpdated`, `Paused`, `Unpaused`, `FeesWithdrawn` |
| Gestión campañas | `createProject`, `cancelProject`, `toggleProjectPause` | `InvalidToken`, `InvalidGoal`, `InvalidDeadline`, `ProjectNotActive`, `ProjectAlreadyCompleted`, `Unauthorized` | `ProjectCreated`, `ProjectCancelled`, `ProjectPaused`, `ProjectResumed` |
| Aportes | `fundProject`, `refund`, `batchRefund` (opcional) | `ProjectNotActive`, `DeadlineReached`, `GoalReached`, `ContributionZero`, `AlreadyRefunded` | `ContributionAdded`, `RefundProcessed` |
| Retiro creador | `withdrawFunds` | `GoalNotReached`, `DeadlineNotMet`, `AlreadyWithdrawn` | `FundsWithdrawn` |
| Lectura | `getProject`, `getProjects(offset, limit)`, `getContributions(projectId, offset, limit)` | — | — |

### Errores personalizados (ejemplos)
- `error Unauthorized(address caller);`
- `error InvalidDeadline(uint256 provided, uint256 min);`
- `error TokenNotAllowed(address token);`
- `error GoalNotReached(uint256 raised, uint256 goal);`

## 5. Seguridad y guardas

- `ReentrancyGuard` aplicado en funciones de transferencia (`fundProject`, `refund`, `withdrawFunds`, `withdrawFees`).
- `Pausable` para detener todas las funciones críticas.
- Verificación estricta de deadlines (`block.timestamp < project.deadline`).
- Control de comisiones y montos usando `SafeMath` implícito de Solidity 0.8.x (overflow checked).
- Validación de `allowance` y `balance` antes de `transferFrom`.
- Logs y revert reasons consistentes para facilitar auditorías.

## 6. Preparación de entorno

### Requisitos de sistema
- Node.js 20.x (archivo `.nvmrc` con `20`).
- pnpm 9.x (gestor recomendado).
- Foundry última versión estable (`foundryup`).
- OpenSSL/Bash para scripts.

### Pasos iniciales
1. Instalar Node/pnpm (`corepack enable pnpm@9`).
2. Ejecutar `foundryup`.
3. Crear archivo `.env.example` en raíz del frontend y backend (ver sección 8).
4. Configurar hooks de git (`.husky/`) con `pre-commit` → `pnpm lint` + `pnpm test --filter=contract`.

## 7. Estructura del repositorio (monorepo)

```
.
├── docs/                       # Documentación del proyecto
├── smart-contract/             # Proyecto Foundry
│   ├── contracts/
│   │   └── FairFund.sol
│   ├── script/
│   ├── test/
│   ├── lib/
│   └── foundry.toml
├── web-fairfund/               # Frontend Next.js
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   ├── scripts/
│   └── package.json
├── scripts/                    # Shell scripts de automatización
│   ├── restart_services.sh
│   ├── deploy_contract.sh
│   └── sync_abi.sh
├── .github/workflows/          # Pipelines CI/CD
├── .husky/
├── .env.example                # Variables compartidas (plantilla)
└── README.md
```

## 8. Variables de entorno

### `.env` (raíz / automatización)
- `RPC_URL_LOCAL=http://127.0.0.1:8545`
- `RPC_URL_SEPOLIA=...`
- `PRIVATE_KEY_DEPLOYER=...`
- `CHAIN_ID_LOCAL=31337`
- `CHAIN_ID_SEPOLIA=11155111`

### `web-fairfund/.env.local`
- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_FAIRFUND_ADDRESS`
- `NEXT_PUBLIC_CHAIN_ID`
- `NEXT_PUBLIC_SUPPORTED_TOKENS` (JSON serializado)

### `smart-contract/.env` (Foundry)
- `ETH_RPC_URL`
- `PRIVATE_KEY`
- `ETHERSCAN_API_KEY` (para verificaciones futuras)

> Los scripts de Etapa 3 deberán sincronizar `FAIRFUND_ADDRESS` y ABI hacia `web-fairfund`.

## 9. Definición de pipelines CI (borrador)

- **`ci.yml`**
  1. `setup` → instalar pnpm, Node 20, Foundry.
  2. `lint` → `pnpm lint` en frontend, `forge fmt --check`.
  3. `test` → `forge test`, `pnpm test` (frontend unit).
  4. `security` → ejecutar Slither (container) y Mythril opcional.
- **`deploy-preview.yml`**
  - Disparar manualmente: despliega a Anvil en contenedor, genera ABI, publica artefactos en workflow.

## 10. Definición de tareas para Etapa 2

1. Inicializar proyecto Foundry dentro de `smart-contract/`.
2. Implementar contrato `FairFund.sol` según especificaciones anteriores.
3. Configurar pruebas en Foundry (`test/FairFund.t.sol`) y preparar dataset inicial.
4. Escribir scripts de despliegue (`script/DeployFairFund.s.sol`).
5. Documentar README específico del contrato con instrucciones de uso.

---

> Con este diseño técnico, estamos listos para iniciar **Etapa 2 — Desarrollo del Smart Contract**, enfocándonos en la implementación on-chain y su batería de pruebas.


