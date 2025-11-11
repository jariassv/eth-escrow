# ⚙️ Etapa 2 — Desarrollo del Smart Contract

## 1. Objetivo

Implementar el contrato inteligente `FairFund.sol`, su batería inicial de pruebas y los scripts de despliegue, dejando listo el paquete on-chain para integrarlo con las capas superiores.

## 2. Alcance desarrollado

- **Contrato principal**: `smart-contract/src/FairFund.sol`
  - Gestión de campañas con soporte para múltiples tokens ERC20 autorizados.
  - Control de comisiones (`platformFeeBps` con override por token) y envío automático al `feeVault`.
  - Ciclo completo de campaña: creación, pausa/reactivación por el creador, cancelación, aportes, retiro y reembolsos.
  - Reembolsos protegidos contra reentrancy siguiendo el patrón *checks-effects-interactions* antes de transferir tokens.
  - Salvaguardas: `Pausable`, `ReentrancyGuard`, validación de deadlines, montos y estados.
  - Eventos exhaustivos para indexación (`ProjectCreated`, `ContributionAdded`, `FundsWithdrawn`, etc.).
  - Capa de lectura optimizada (`getProject`, `getProjects`, `computeClaimable`, `getContribution`).
- **Manejo de tokens permitidos** con estructura `TokenConfig` (override de fee opcional).
- **Custom errors** para revert precisos y gas-efficient.

## 3. Pruebas y calidad

- `smart-contract/test/FairFund.t.sol`
  - Casos cubiertos: creación, fondeo, retiro con comisión, reembolso por campaña fallida, cancelación antes de recibir fondos, bloqueo por deadline y pausas globales.
  - Uso de `MockERC20` (`test/mocks/MockERC20.sol`) para simular tokens.
- Comando ejecutado: `forge test` ✅
- Cobertura sugerida: ejecutar `forge coverage` en próximas iteraciones para métricas cuantitativas.

## 4. Automatización y scripts

- `script/DeployFairFund.s.sol`
  - Lee variables de entorno (`PRIVATE_KEY_DEPLOYER`, `FAIRFUND_OWNER`, `FAIRFUND_FEE_VAULT`, `FAIRFUND_PLATFORM_FEE_BPS`).
  - Emite la dirección desplegada vía `console.log`.
  - Preparado para flujos Anvil/Sepolia con `--broadcast`.

## 5. Configuración y dependencias

- `foundry.toml` actualizado: `solc` 0.8.24, remappings a OpenZeppelin y forge-std, formato estándar.
- Dependencia instalada: `openzeppelin-contracts@v5.0.1`.
- `smart-contract/README.md` renovado con instrucciones de build, test y despliegue.

## 6. Riesgos pendientes / próximos pasos

- Evaluar límites y costos de gas en campañas masivas (optimizar estructuras si fuese necesario).
- Agregar pruebas de fuzzing y escenarios multi-backers simultáneos.
- Definir política exacta de `duration` mínima/máxima en documentación funcional.
- Preparar fixtures de datos y seeds para etapa de automatización (scripts Etapa 3).
- Documentar explícitamente que, una vez alcanzada la meta, el creador puede retirar fondos incluso antes del deadline (comportamiento esperado del MVP).

---

> Etapa 2 completada: el contrato FairFund está implementado, probado y documentado. Próximo foco: **Etapa 3 — Scripts y automatización DevOps** para integrar despliegues, reinicios de servicios y sincronización de ABI/env.


