# 🖥️ Etapa 4 — Frontend Web3 (Next.js 15)

## 1. Objetivo

Configurar la base del frontend `web-fairfund` siguiendo la arquitectura definida en la etapa 1: estructura modular, integración con ethers v6 y scaffolding de las páginas principales (`/`, `/create`, `/project/[id]`, `/dashboard`).

## 2. Estructura principal

- **App Router** (`src/app`) con layout global, proveedores y rutas clave.
- **Componentes** (`src/components`)
  - `layout/`: `Navbar`, `Footer`
  - `projects/`: `ProjectCard`, `ProjectList`
  - `ui/`: `Button`, `Card`
  - `web3/`: `WalletButton`
- **Hooks** (`src/hooks`)
  - `useWallet`: administra conexión con MetaMask (ethers v6 + Zustand).
  - `useFairFundContract`: instancia el contrato usando el ABI local y variables de entorno.
- **Stores** (`src/stores`): estado global del wallet.
- **Lib** (`src/lib`)
  - `env.ts`: parseo centralizado de variables públicas.
  - `contracts/fairfund.ts`: helper para crear el contrato.
  - `mocks/projects.ts`: datos temporales para UI.
  - `utils.ts`: utilidades (`cn`).
- **ABI Placeholder** (`lib/abi/FairFund.json`): archivo sobrescrito por los scripts de automatización.

## 3. Dependencias añadidas

| Paquete | Motivo |
|---------|--------|
| `ethers@6` | Interacción con el contrato `FairFund` desde el navegador. |
| `@tanstack/react-query@5` | Manejo de caché y fetching para lecturas on-chain. |
| `zustand@5` | Estado global ligero (wallet y provider activo). |
| `clsx` + `tailwind-merge` | Utilidades de estilos. |

> Se usa Tailwind 4 (incluido en el template oficial Next.js 15), sin configuración adicional.

## 4. Flujo de proveedores

- `src/app/providers.tsx`:
  - Inicializa `QueryClientProvider` con opciones por defecto.
  - Monta `WalletInitializer`, que invoca `useWallet` para gestionar auto-conexión y listeners (`accountsChanged` / `chainChanged`).

## 5. Páginas esqueleto

- `/` — listado de campañas con datos mock (`ProjectList`).
- `/create` — formulario base para lanzar campañas (inputs sin lógica de envío aún).
- `/project/[id]` — detalle con estadísticas y CTA informativo.
- `/dashboard` — resumen de campañas creadas y aportes (mock).

Cada vista incluye copy y enlaces que anticipan la integración con la lógica real (`deploy-and-sync` + ABI actualizado).

## 6. Configuración de entorno

- El frontend espera las variables públicas en `.env.local`:
  - `NEXT_PUBLIC_RPC_URL`
  - `NEXT_PUBLIC_CHAIN_ID`
  - `NEXT_PUBLIC_FAIRFUND_ADDRESS`
- `config/env.example` sirve como plantilla única para backend/frontend. El script `scripts/fairfund-manager.sh deploy-and-sync` actualizará automáticamente `.env.local` y `lib/abi/FairFund.json`.

## 7. Próximos pasos sugeridos

1. Conectar hooks a datos reales (`contract.getProjects`, eventos `ProjectCreated`).
2. Añadir formularios con `react-hook-form` + `zod` y manejar feedback de transacciones.
3. Implementar tabla de historial usando React Query + infinite scroll.
4. Integrar notificaciones (toast) y componentes shadcn/ui.
5. Añadir pruebas E2E (Playwright) para los flujos `crear → fondear → reembolsar`.

---

> La interfaz está lista para conectar con el contrato desplegado y para incorporar los scripts de automatización ya implementados en la etapa 3.


