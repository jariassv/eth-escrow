# 🚀 FairFund — Crowdfunding Descentralizado con Escrow

<div align="center">

**Plataforma de crowdfunding transparente y segura basada en blockchain, con soporte multi-token ERC20 y reembolsos automáticos.**

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue.svg)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black.svg)](https://nextjs.org/)
[![Foundry](https://img.shields.io/badge/Foundry-Latest-orange.svg)](https://book.getfoundry.sh/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Tecnologías](#-tecnologías)
- [Documentación](#-documentación)
- [Contribución](#-contribución)

---

## 🎯 Descripción

**FairFund** es una aplicación descentralizada (DApp) que permite crear y financiar proyectos de manera segura mediante un sistema de **escrow inteligente**. Los fondos quedan bloqueados en el contrato hasta que se cumple una condición verificable (meta de financiamiento alcanzada dentro del plazo establecido).

### ¿Por qué FairFund?

- ✅ **Transparencia total**: Todas las transacciones son públicas y auditables en la blockchain
- 🔒 **Seguridad**: Fondos bloqueados en un contrato inteligente hasta cumplir condiciones
- 💰 **Multi-token**: Soporte para múltiples tokens ERC20 previamente autorizados
- 🔄 **Reembolsos automáticos**: Si la meta no se alcanza, los contribuidores pueden retirar sus fondos
- ⚡ **Sin intermediarios**: Eliminación de terceros de confianza mediante smart contracts

---

## ✨ Características

### Smart Contract (`FairFund.sol`)
- ✅ Gestión de proyectos con meta, deadline y token aceptado
- ✅ Sistema de escrow para bloqueo seguro de fondos
- ✅ Autorización de tokens ERC20 por el owner
- ✅ Reembolsos automáticos si la meta no se alcanza
- ✅ Retiro de fondos por el creador al alcanzar la meta
- ✅ Protección contra reentrancy y pausa de emergencia
- ✅ Comisiones configurables para la plataforma

### Frontend Web (`web-fairfund`)
- 🎨 Interfaz moderna y minimalista con TailwindCSS
- 📱 Diseño completamente responsivo
- 🔌 Integración Web3 con MetaMask y ethers.js v6
- 📊 Dashboard personal con métricas y historial
- 🎯 Visualización de progreso en tiempo real
- 🔔 Notificaciones de estado de transacciones

---

## 🏗️ Arquitectura

El proyecto está dividido en dos componentes principales:

```
FairFund/
├── smart-contract/     # Contrato inteligente (Solidity + Foundry)
├── web-fairfund/       # Frontend web (Next.js + TypeScript)
├── scripts/            # Scripts de automatización
├── config/             # Configuración y ejemplos
└── docs/               # Documentación técnica
```

### Flujo de Funcionamiento

1. **Owner** autoriza tokens ERC20 válidos en el contrato
2. **Creador** crea un proyecto definiendo token, meta y deadline
3. **Contribuidores** depositan tokens ERC20 en el proyecto
4. **Sistema de Escrow** bloquea los fondos hasta cumplir condiciones
5. **Resultado**:
   - ✅ Meta alcanzada → Creador puede retirar fondos
   - ❌ Meta no alcanzada → Contribuidores pueden solicitar reembolso

---

## 📦 Requisitos

### Desarrollo Local

- **Node.js** 20.x o superior
- **pnpm** 8.x o superior (`npm install -g pnpm`)
- **Foundry** (para smart contracts)
  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```
- **Python 3** (para scripts de conversión de decimales)
- **Git**

### Opcional

- **MetaMask** o wallet compatible con Ethereum
- **Anvil** (incluido en Foundry) para blockchain local

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd 04-ESCROW
```

### 2. Configurar variables de entorno

```bash
cp config/env.example .env
```

Edita `.env` con tus valores:

```env
# Blockchain
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=31337

# Claves privadas (para desarrollo local)
PRIVATE_KEY_DEPLOYER=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
FAIRFUND_OWNER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Configuración del contrato
FAIRFUND_OWNER=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
FAIRFUND_FEE_VAULT=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
FAIRFUND_PLATFORM_FEE_BPS=500

# Tokens a desplegar automáticamente
TOKEN_DEPLOY_JSON='[{"name":"Mock USD","symbol":"MUSD","initialSupply":"1000000","decimals":18,"feeBps":0}]'
```

### 3. Instalar dependencias

```bash
# Smart Contract
cd smart-contract
forge install

# Frontend
cd ../web-fairfund
pnpm install
```

---

## ⚙️ Configuración

### Script de Gestión Automatizada

El proyecto incluye un script de gestión que automatiza el despliegue y sincronización:

```bash
./scripts/fairfund-manager.sh [comando]
```

**Comandos disponibles:**

| Comando | Descripción |
|---------|-------------|
| `start-anvil` | Inicia Anvil (blockchain local) |
| `stop-anvil` | Detiene Anvil |
| `start-next` | Inicia servidor Next.js |
| `stop-next` | Detiene servidor Next.js |
| `deploy-and-sync` | Despliega contrato y sincroniza ABI/env |
| `restart-all` | Reinicia todos los servicios y despliega |

### Despliegue Manual

#### Smart Contract

```bash
cd smart-contract

# Compilar
forge build

# Ejecutar tests
forge test

# Desplegar (requiere variables de entorno)
forge script script/DeployFairFund.s.sol:DeployFairFund \
  --rpc-url $RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY_DEPLOYER
```

#### Frontend

```bash
cd web-fairfund

# Desarrollo
pnpm dev

# Producción
pnpm build
pnpm start
```

---

## 💻 Uso

### 1. Iniciar el entorno de desarrollo

```bash
./scripts/fairfund-manager.sh restart-all
```

Este comando:
- ✅ Inicia Anvil (blockchain local)
- ✅ Despliega el contrato FairFund
- ✅ Despliega tokens mock configurados
- ✅ Sincroniza ABI y variables de entorno
- ✅ Inicia el servidor Next.js

### 2. Acceder a la aplicación

Abre tu navegador en: **http://localhost:3000**

### 3. Conectar wallet

1. Instala MetaMask en tu navegador
2. Importa una cuenta de Anvil (claves privadas en `.env`)
3. Conecta MetaMask a la red local (http://127.0.0.1:8545)
4. Haz clic en "Conectar wallet" en la aplicación

### 4. Crear un proyecto

1. Navega a **"Crear proyecto"**
2. Completa el formulario:
   - Título y descripción
   - Token ERC20 a aceptar
   - Meta de financiamiento
   - Fecha límite (deadline)
3. Confirma la transacción en MetaMask

### 5. Contribuir a un proyecto

1. Navega a un proyecto desde la página principal
2. Selecciona el token y cantidad
3. Aprueba el token (si es la primera vez)
4. Confirma la transacción de contribución

### Scripts Adicionales

#### Mintear tokens

```bash
./scripts/mint-token.sh <token_address> <recipient_address> <amount>
```

Ejemplo:
```bash
./scripts/mint-token.sh 0x5FbDB2315678afecb367f032d93F642f64180aa3 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 10000
```

#### Consultar balances

```bash
./scripts/wallet-balances.sh [wallet_address]
```

---

## 📁 Estructura del Proyecto

```
.
├── smart-contract/          # Contrato inteligente
│   ├── src/
│   │   └── FairFund.sol    # Contrato principal
│   ├── test/
│   │   └── FairFund.t.sol  # Tests unitarios
│   ├── script/
│   │   ├── DeployFairFund.s.sol
│   │   └── DeployMockToken.s.sol
│   └── foundry.toml
│
├── web-fairfund/            # Frontend Next.js
│   ├── src/
│   │   ├── app/            # Rutas App Router
│   │   ├── components/     # Componentes React
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilidades y config
│   │   └── stores/         # Estado global (Zustand)
│   └── package.json
│
├── scripts/                 # Scripts de automatización
│   ├── fairfund-manager.sh # Gestión principal
│   ├── mint-token.sh       # Minteo de tokens
│   └── wallet-balances.sh  # Consulta de balances
│
├── config/                  # Configuración
│   └── env.example         # Ejemplo de variables
│
└── docs/                    # Documentación
    ├── FairFund_Project_Documentation.md
    └── Etapa_*.md          # Documentación por etapas
```

---

## 🛠️ Scripts Disponibles

### Smart Contract

```bash
cd smart-contract

forge build          # Compilar contratos
forge test           # Ejecutar tests
forge fmt            # Formatear código
forge coverage       # Cobertura de código
```

### Frontend

```bash
cd web-fairfund

pnpm dev             # Servidor de desarrollo
pnpm build           # Compilación de producción
pnpm start           # Servidor de producción
pnpm lint            # Linter
```

### Scripts de Gestión

```bash
./scripts/fairfund-manager.sh restart-all    # Reiniciar todo
./scripts/mint-token.sh <args>               # Mintear tokens
./scripts/wallet-balances.sh [address]       # Ver balances
```

---

## 🧪 Tecnologías

### Smart Contract
- **Solidity** 0.8.24
- **Foundry** (Forge, Cast, Anvil)
- **OpenZeppelin Contracts** v5.0.1
  - Ownable
  - ReentrancyGuard
  - Pausable
  - SafeERC20

### Frontend
- **Next.js** 16.0 (App Router)
- **React** 19.2
- **TypeScript** 5.x
- **Ethers.js** v6.15
- **TailwindCSS** v4
- **shadcn/ui** (componentes UI)
- **React Query** (@tanstack/react-query)
- **Zustand** (gestión de estado)
- **React Hook Form** + **Zod** (formularios)

### DevOps
- **Anvil** (blockchain local)
- **Bash** (scripts de automatización)
- **Python 3** (utilidades de conversión)

---

## 📚 Documentación

La documentación completa del proyecto se encuentra en el directorio `docs/`:

- **[FairFund_Project_Documentation.md](docs/FairFund_Project_Documentation.md)** - Documentación general
- **[Etapa_0_Descubrimiento.md](docs/Etapa_0_Descubrimiento.md)** - Análisis inicial
- **[Etapa_1_Diseno_Tecnico.md](docs/Etapa_1_Diseno_Tecnico.md)** - Diseño técnico
- **[Etapa_2_Desarrollo_Contrato.md](docs/Etapa_2_Desarrollo_Contrato.md)** - Desarrollo del contrato
- **[Etapa_3_Automatizacion.md](docs/Etapa_3_Automatizacion.md)** - Automatización
- **[Etapa_4_Frontend.md](docs/Etapa_4_Frontend.md)** - Desarrollo frontend
- **[Etapa_5_Integracion.md](docs/Etapa_5_Integracion.md)** - Integración
- **[Etapa_6_Interacciones.md](docs/Etapa_6_Interacciones.md)** - Interacciones Web3
- **[Etapa_7_WalletAcciones.md](docs/Etapa_7_WalletAcciones.md)** - Acciones de wallet

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Sigue las convenciones de código existentes
- Añade tests para nuevas funcionalidades
- Actualiza la documentación según sea necesario
- Asegúrate de que todos los tests pasen antes de hacer PR

---

