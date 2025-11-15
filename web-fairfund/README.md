# 🌐 Web FairFund — Frontend Next.js

<div align="center">

**Interfaz web moderna y responsiva para la plataforma de crowdfunding descentralizado FairFund**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-v6.15-orange.svg)](https://docs.ethers.org/)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Tecnologías](#-tecnologías)
- [Variables de Entorno](#-variables-de-entorno)
- [Scripts](#-scripts)

---

## 🎯 Descripción

**Web FairFund** es la interfaz de usuario de la plataforma FairFund, construida con Next.js 16 (App Router) y diseñada para ofrecer una experiencia de usuario moderna, intuitiva y completamente funcional para interactuar con el contrato inteligente FairFund.

### Características Principales

- 🎨 **Diseño Minimalista**: Interfaz limpia y profesional con TailwindCSS
- 📱 **Totalmente Responsivo**: Optimizado para desktop, tablet y móvil
- 🔌 **Integración Web3**: Conexión con MetaMask y otras wallets compatibles
- ⚡ **Rendimiento Optimizado**: Server-side rendering y optimizaciones de Next.js
- 🔄 **Estado en Tiempo Real**: Actualización automática de datos mediante React Query
- 🎭 **Animaciones Suaves**: Transiciones fluidas con Framer Motion

---

## ✨ Características

### Páginas Principales

| Página | Ruta | Descripción |
|--------|------|-------------|
| **Landing** | `/` | Página principal con hero section y carrusel de proyectos activos |
| **Crear Proyecto** | `/create` | Formulario para crear nuevos proyectos de crowdfunding |
| **Detalle de Proyecto** | `/project/[id]` | Vista detallada con acciones de financiamiento, reembolso y retiro |
| **Dashboard** | `/dashboard` | Panel personal con métricas, balances y historial de contribuciones |

### Funcionalidades Web3

- ✅ Conexión/desconexión de wallet (MetaMask)
- ✅ Lectura de datos del contrato (proyectos, balances, contribuciones)
- ✅ Escritura de transacciones (crear proyecto, financiar, reembolsar, retirar)
- ✅ Aprobación de tokens ERC20
- ✅ Manejo de estados de transacciones (pending, success, error)
- ✅ Notificaciones de estado con mensajes amigables

### Componentes Principales

- **Layout**: Navbar, Footer, Providers (Web3, React Query)
- **Projects**: Lista de proyectos, tarjetas de proyecto, detalle
- **Web3**: Botón de wallet, hooks personalizados
- **UI**: Componentes reutilizables (Button, Card, etc.)

---

## 📦 Requisitos

- **Node.js** 20.x o superior
- **pnpm** 8.x o superior
  ```bash
  npm install -g pnpm
  ```
- **MetaMask** o wallet compatible con Ethereum (para interacción)
- Variables de entorno configuradas (ver [Configuración](#-configuración))

---

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd web-fairfund
pnpm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz de `web-fairfund/`:

```env
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_FAIRFUND_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_SUPPORTED_TOKENS=[{"symbol":"MUSD","address":"0x...","decimals":18}]
```

> **Nota**: El script `fairfund-manager.sh` del proyecto raíz puede generar automáticamente este archivo después del despliegue del contrato.

### 3. Verificar ABI del contrato

Asegúrate de que el archivo `lib/abi/FairFund.json` existe y contiene el ABI del contrato. Este archivo se sincroniza automáticamente con el script de gestión.

---

## ⚙️ Configuración

### Variables de Entorno Públicas

Todas las variables deben tener el prefijo `NEXT_PUBLIC_` para estar disponibles en el cliente:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_RPC_URL` | URL del nodo RPC | `http://127.0.0.1:8545` |
| `NEXT_PUBLIC_CHAIN_ID` | ID de la cadena | `31337` (Anvil) |
| `NEXT_PUBLIC_FAIRFUND_ADDRESS` | Dirección del contrato | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| `NEXT_PUBLIC_SUPPORTED_TOKENS` | JSON con tokens soportados | `[{"symbol":"MUSD","address":"0x...","decimals":18}]` |

### Formato de `NEXT_PUBLIC_SUPPORTED_TOKENS`

```json
[
  {
    "symbol": "MUSD",
    "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "decimals": 18
  },
  {
    "symbol": "MEUR",
    "address": "0x...",
    "decimals": 18
  }
]
```

---

## 💻 Uso

### Desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Producción

```bash
# Compilar
pnpm build

# Iniciar servidor de producción
pnpm start
```

### Linting

```bash
pnpm lint
```

---

## 📁 Estructura del Proyecto

```
web-fairfund/
├── src/
│   ├── app/                    # App Router (Next.js 16)
│   │   ├── layout.tsx         # Layout raíz
│   │   ├── page.tsx           # Página principal (/)
│   │   ├── create/            # Crear proyecto
│   │   ├── dashboard/         # Dashboard personal
│   │   ├── project/[id]/      # Detalle de proyecto
│   │   ├── providers.tsx      # Providers (React Query, etc.)
│   │   └── globals.css        # Estilos globales
│   │
│   ├── components/            # Componentes React
│   │   ├── layout/           # Navbar, Footer
│   │   ├── projects/         # Lista, tarjetas, detalle
│   │   ├── web3/             # WalletButton, etc.
│   │   └── ui/               # Componentes UI reutilizables
│   │
│   ├── hooks/                # Custom hooks
│   │   ├── useWallet.ts      # Gestión de wallet
│   │   ├── useFairFundContract.ts
│   │   ├── useProjects.ts
│   │   ├── useProject.ts
│   │   ├── useProjectActions.ts
│   │   ├── useWalletBalances.ts
│   │   └── useContributionHistory.ts
│   │
│   ├── lib/                  # Utilidades y configuración
│   │   ├── abi/              # ABI del contrato
│   │   ├── env.ts            # Validación de variables de entorno
│   │   ├── token-metadata.ts # Metadata de tokens ERC20
│   │   └── utils.ts          # Utilidades generales
│   │
│   ├── stores/               # Estado global (Zustand)
│   │   └── wallet-store.ts
│   │
│   └── types/                # Tipos TypeScript
│       └── project.ts
│
├── public/                   # Archivos estáticos
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.js
```

---

## 🛠️ Tecnologías

### Core

- **[Next.js 16](https://nextjs.org/)** - Framework React con App Router
- **[React 19.2](https://react.dev/)** - Biblioteca UI
- **[TypeScript 5.x](https://www.typescriptlang.org/)** - Tipado estático

### Web3

- **[Ethers.js v6](https://docs.ethers.org/)** - Interacción con blockchain
- Integración directa con `window.ethereum` (MetaMask)

### UI/UX

- **[TailwindCSS v4](https://tailwindcss.com/)** - Framework CSS utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI accesibles
- **[Framer Motion](https://www.framer.com/motion/)** - Animaciones (si se requiere)

### Estado y Datos

- **[React Query](https://tanstack.com/query)** - Gestión de estado del servidor y caché
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Estado global ligero
- **[React Hook Form](https://react-hook-form.com/)** - Gestión de formularios
- **[Zod](https://zod.dev/)** - Validación de esquemas

### Desarrollo

- **[ESLint](https://eslint.org/)** - Linter
- **[TypeScript](https://www.typescriptlang.org/)** - Type checking

---

## 🔌 Variables de Entorno

### Configuración Automática

El script `fairfund-manager.sh` del proyecto raíz puede configurar automáticamente las variables de entorno después del despliegue:

```bash
./scripts/fairfund-manager.sh deploy-and-sync
```

### Configuración Manual

Crea `.env.local` con:

```env
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_FAIRFUND_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_SUPPORTED_TOKENS=[{"symbol":"MUSD","address":"0x...","decimals":18}]
```

---

## 📝 Scripts

```bash
pnpm dev          # Servidor de desarrollo (http://localhost:3000)
pnpm build        # Compilación de producción
pnpm start        # Servidor de producción
pnpm lint         # Ejecutar linter
```

---

## 🎨 Diseño

### Paleta de Colores

El proyecto utiliza variables CSS personalizadas para temas claro y oscuro:

- **Primario**: Azul índigo (`--primary`)
- **Acento**: Celeste (`--accent`)
- **Superficie**: Blanco/oscuro con transparencia
- **Bordes**: Sutil con efecto glassmorphism

### Componentes UI

- **Cards**: Efecto glassmorphism con backdrop-blur
- **Botones**: Gradientes y sombras suaves
- **Formularios**: Validación en tiempo real con mensajes claros
- **Navegación**: Sticky navbar con animaciones

---

## 🔄 Flujo de Conexión Web3

1. Usuario hace clic en "Conectar wallet"
2. `useWallet` detecta `window.ethereum`
3. Solicita conexión a la cuenta
4. Estado se guarda en Zustand (`wallet-store`)
5. `useFairFundContract` inicializa el contrato con ethers.js
6. Componentes consumen hooks para leer/escribir datos

### Hooks Principales

- **`useWallet`**: Gestión de conexión y estado de wallet
- **`useFairFundContract`**: Instancia del contrato (lectura/escritura)
- **`useProjects`**: Lista de proyectos (React Query)
- **`useProject`**: Detalle de un proyecto
- **`useProjectActions`**: Acciones (fund, refund, withdraw)
- **`useWalletBalances`**: Balances de tokens
- **`useContributionHistory`**: Historial de contribuciones

---

## 🐛 Troubleshooting

### Error: "Contract not found"

- Verifica que `NEXT_PUBLIC_FAIRFUND_ADDRESS` esté correcto
- Asegúrate de que el contrato esté desplegado en la red especificada

### Error: "Token not allowed"

- Verifica que el token esté en `NEXT_PUBLIC_SUPPORTED_TOKENS`
- Confirma que el owner haya autorizado el token en el contrato

### Error: "RPC connection failed"

- Verifica que Anvil esté corriendo (si es desarrollo local)
- Revisa `NEXT_PUBLIC_RPC_URL` y `NEXT_PUBLIC_CHAIN_ID`

### Wallet no se conecta

- Asegúrate de tener MetaMask instalado
- Verifica que la red esté configurada correctamente
- Revisa la consola del navegador para errores

---

## 📚 Recursos

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Ethers.js](https://docs.ethers.org/)
- [Documentación de React Query](https://tanstack.com/query/latest)
- [Documentación del proyecto raíz](../README.md)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

<div align="center">

**Parte del ecosistema FairFund** 🚀

</div>
