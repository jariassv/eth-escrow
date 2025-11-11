# 📍 Plan de Trabajo — Proyecto FairFund (Escrow Crowdfunding)

## 1. Evaluación de la documentación existente

- **Cobertura actual adecuada**
  - Objetivo general y motivación del uso de escrow.
  - Descripción de actores, permisos básicos y flujo principal de aportes/retiros.
  - Tecnologías objetivo para smart contract y frontend.
  - Idea de UI/UX y división de carpetas propuesta.
- **Aspectos sin detallar o ausentes**
  - Supuestos de negocio: comisiones del owner, límites de campañas, políticas de cancelación/pausa.
  - Gestión de errores: mensajes personalizados, razones de revert, estados edge (deadline = 0, goal = 0, doble funding).
  - Seguridad avanzada: mitigación de front-running, validaciones de allowance, protección contra griefing (spam de proyectos).
  - Gobierno/operación: actualizaciones del contrato, migraciones, quién gestiona upgrades.
  - Estrategia de pruebas integrales: coverage, fuzzing, escenarios multi-token, pruebas de eventos.
  - Automatización DevOps: despliegue continuo, versionado del ABI, sincronización con el frontend.
  - Configuración de entorno (`.env`, variables por red, claves privadas), scripts de bootstrap, seeds.
  - Seguimiento analytics/monitoring (The Graph, alertas, dashboards).
  - Documentación de APIs/SDK para terceros o integración mobile futura.

## 2. Alcance y supuestos iniciales

1. Primer release orientado a un MVP funcional en red local/testnet (Anvil, Sepolia).
2. Soporte para múltiples tokens ERC20 aprobados por el owner; no se incluye minting.
3. Owner percibe una comisión opcional sobre cada campaña (porcentaje configurable).
4. Proyecto debe ser compatible con Next.js 15 (App Router) y Ethers.js v6.
5. Integración con MetaMask y cualquier wallet compatible con inyección `window.ethereum`.
6. El frontend convivirá con un backend ligero (opcional) únicamente para servir metadatos estáticos o caching (pendiente de validación).

## 3. Roadmap por etapas

### Etapa 0 — Descubrimiento y alineación (1-2 días)
- Taller con stakeholders para validar supuestos de negocio y casos límite.
- Definir requisitos no funcionales: seguridad, rendimiento, límites de gas, escalabilidad.
- Establecer convenciones de repositorio, versiones de herramientas (Foundry, Node, pnpm).
- Entregable: especificación funcional revisada y lista de historias priorizadas.

### Etapa 1 — Diseño técnico y preparación (2-3 días)
- Diagramar arquitectura detallada (componentes on-chain/off-chain, flujos de datos).
- Definir modelo de datos del contrato (`structs`, mappings, estados permitidos).
- Diseñar esquema de eventos y firma de funciones públicas.
- Crear checklist de seguridad y pruebas.
- Configurar repositorio monorepo (smart contract + frontend) con toolchain base.
- Entregable: documentación técnica, plantillas iniciales y configuración CI mínima (lint/test).

### Etapa 2 — Desarrollo del Smart Contract (4-6 días)
- Implementar contrato `FairFund.sol` con:
  - Registro y validación de tokens permitidos.
  - Gestión de campañas (creación, pausado, cancelación, finalización).
  - Lógica de comisión (opcional) y retirada segura de fondos.
  - Eventos exhaustivos para facilitar indexación.
  - Modificadores de seguridad (`nonReentrant`, `onlyOwner`, `whenNotPaused` si aplica).
- Implementar biblioteca modular para reutilizar lógica (por ejemplo, manejo de fechas).
- Cobertura de pruebas en Foundry/Hardhat:
  - Tests unitarios y de integración, fuzzing en funciones críticas.
  - Tests negativos (errores esperados, revert reasons).
- Entregable: contrato auditado internamente, documentación de funciones y despliegue en Anvil.

### Etapa 3 — Scripts y automatización DevOps (2-3 días)
- Crear scripts Foundry para despliegue en Anvil y Sepolia.
- Desarrollar script shell/Node para:
  - Reinicio controlado de Anvil y Next.js.
  - Despliegue del contrato, verificación, y actualización automática del ABI.
  - Sincronización de variables en `.env.local`/`.env` (direcciones de contrato, chainId, RPC).
- Configurar pipeline CI/CD (GitHub Actions o similar) para lint, test y despliegues controlados.
- Entregable: carpeta `scripts/` completa, guía operativa y documentación del flujo.

### Etapa 4 — Frontend Web3 (5-7 días)
- Setup de proyecto Next.js 15 con TailwindCSS y shadcn/ui.
- Crear módulos reutilizables (`lib/ethersProvider`, hooks `useFairFundContract`, `useWallet`).
- Implementar páginas principales (`/`, `/project/[id]`, `/create`, `/dashboard`).
- Integrar componentes UI (formularios con validaciones, tablas, progress bars).
- Manejo de estado (React Query/Zustand) para sincronizar datos on-chain y cache.
- Implementar internacionalización básica (ES/EN) si se requiere.
- Entregable: frontend funcional conectado a la red local con mocks de datos y contratos reales.

### Etapa 5 — Integración, pruebas end-to-end y optimización (3-4 días)
- Ejecutar pruebas E2E (Playwright/Cypress) para flujos críticos.
- Validar eventos sincronizados y actualización de datos en tiempo real.
- Medir rendimiento (tiempos de carga, tamaño de bundle) y optimizar.
- Revisar accesibilidad (WCAG AA) y UX con usuarios internos.
- Entregable: informe de pruebas, fixes de bugs y checklist de lanzamiento completado.

### Etapa 6 — Preparación de lanzamiento y documentación (2-3 días)
- Redactar manual de usuario, guía de contribución y runbooks operativos.
- Preparar scripts de migración y despliegue final en testnet/mainnet (según alcance).
- Configurar monitoreo (The Graph opcional, Sentry, logs).
- Entregable: Release Candidate con documentación completa y plan de soporte post-lanzamiento.

## 4. Entregables clave

1. **Contrato inteligente** con cobertura de pruebas ≥ 90% y checklist de seguridad.
2. **Frontend Next.js** modular, con capas `hooks`, `components`, `lib` bien aisladas.
3. **Scripts de automatización** (despliegue, reinicio de servicios, sync de `.env`).
4. **Documentación**: manual funcional, guía técnica, pasos de despliegue, plan de pruebas.
5. **Infraestructura CI/CD** básica con pipelines de lint + test + despliegue controlado.

## 5. Riesgos y mitigaciones iniciales

- **Requisitos cambiantes** → Mantener backlog priorizado y sesiones de revisión semanal.
- **Dependencias externas (wallets/RPC)** → Definir fallback providers y manejo de errores UI.
- **Seguridad on-chain** → Revisiones cruzadas, uso de herramientas (Slither, Mythril) y auditoría externa si se escala.
- **Sincronización contrato-frontend** → Versionar ABI y usar script de actualización automática.
- **Escalabilidad de datos** → Evaluar indexador (The Graph) y caching server-side.

---

> Este plan sirve como guía inicial. Cada etapa debe incluir checkpoints formales para validar entregables, ajustar alcance y priorizar funcionalidades de mayor impacto.


