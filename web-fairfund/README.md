## Web FairFund — Frontend Next.js

Interfaz App Router para la dApp FairFund. Incluye estructura modular, integración Web3 con ethers v6 y skeletons para las rutas clave (`/`, `/create`, `/project/[id]`, `/dashboard`).

### Requisitos

- Node.js 20+
- pnpm 8+ (`npm install -g pnpm --prefix ~/.local`)
- Variables de entorno expuestas (ver `config/env.example` en el monorepo y `.env.local` tras ejecutar el script `fairfund-manager.sh`)

### Scripts principales

```bash
pnpm dev          # Servidor local http://localhost:3000
pnpm lint         # Linter (eslint-config-next + reglas propias)
pnpm build        # Compilación de producción
```

### Estructura de carpetas

```
src/
  app/               # Rutas App Router + layout global
  components/        # UI compartida, layout y elementos Web3
  hooks/             # Hooks cliente (wallet, contrato)
  lib/               # Config, ABI helper, utilidades
  stores/            # Estado global con Zustand
  types/             # Tipos compartidos
```

El ABI del contrato se espera en `lib/abi/FairFund.json` (placeholder vacío por ahora). El script `scripts/fairfund-manager.sh deploy-and-sync` del monorepo sobrescribirá este archivo y rellenará `.env.local`.

### Flujo de conexión

- `useWallet` gestiona la conexión con `window.ethereum`, almacena estado en Zustand y expone acciones `connect`/`disconnect`.
- `useFairFundContract` genera el contrato de lectura/escritura usando ethers v6 y las variables públicas del entorno.
- `WalletButton` (en la barra superior) consume el hook y refleja estado (conectado/pendiente/error).

### Próximos pasos

- Sustituir mocks (`src/lib/mocks/projects.ts`) por llamadas reales usando `useFairFundContract` + React Query.
- Integrar componentes shadcn/ui y validaciones de formularios con Zod/React Hook Form.
- Añadir pruebas E2E (Playwright) para flujos críticos.
