## FairFund — Smart Contract

Proyecto Foundry para el contrato `FairFund` (crowdfunding con escrow y soporte multi-token ERC20).

### Requisitos

- Node.js 20.x (para scripts auxiliares)
- Foundry (`curl -L https://foundry.paradigm.xyz | bash` y `foundryup`)

### Dependencias clave

- [openzeppelin-contracts v5.0.1](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [forge-std](https://github.com/foundry-rs/forge-std)

### Scripts útiles

- **Compilar:** `forge build`
- **Formatear:** `forge fmt`
- **Pruebas:** `forge test`
- **Cobertura opcional:** `forge coverage`

### Variables de entorno

El script de despliegue (`script/DeployFairFund.s.sol`) espera:

```env
PRIVATE_KEY_DEPLOYER=<clave privada en decimal>
FAIRFUND_OWNER=<dirección que será owner>
FAIRFUND_FEE_VAULT=<dirección del vault de comisiones>
FAIRFUND_PLATFORM_FEE_BPS=500
```

### Despliegue

```bash
forge script script/DeployFairFund.s.sol:DeployFairFund \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

> Ajusta los flags según la red (omitimos `--verify` para Anvil). El script imprime la dirección final en consola.

### Directorios

- `src/` — contrato principal `FairFund.sol`.
- `script/` — scripts de despliegue de Foundry.
- `test/` — pruebas unitarias y mocks.

Consulta la documentación general en `../docs/` para entender el flujo funcional y las etapas del proyecto.

