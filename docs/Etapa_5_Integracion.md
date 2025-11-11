# 🔗 Etapa 5 — Integración On-chain

## 1. Objetivo

Conectar el frontend `web-fairfund` con el contrato `FairFund.sol`, reemplazando datos mock y preparando el flujo de lectura/escritura para las próximas iteraciones.

## 2. Cambios principales

- **Obtener ABI real**: se sincronizó `web-fairfund/lib/abi/FairFund.json` con la salida de Foundry (`forge build`).
- **Hooks React Query**
  - `useProjects` → llama a `projectCount` y `getProjects` para construir `ProjectSummary`.
  - `useProject` → consulta `getProject` para vistas de detalle.
  - Normalización de direcciones (`ethers/getAddress`) y formateo de montos (`formatUnits`).
- **Metadatos ERC20**: helper `getTokenMetadata` (ABI mínimo) para leer símbolo y decimales de cada token autorizado.
- **Estado global**: `useFairFundContract` ahora expone `runner`/`readOnlyProvider`, intentando fallback automáticamente a `JsonRpcProvider` cuando el usuario no está conectado.
- **UI dinámica**
  - `/` consume `useProjects` (progress bar, mensajes de estado, skeletons).
  - `/project/[id]` renderiza `ProjectDetailClient` con estados de carga/errores.
  - `/dashboard` y `/create` verifican el estado de la wallet y muestran CTA de conexión.
- **Formulario de creación**
  - Integración con `react-hook-form` + `zod` para validar campos.
  - Envío de transacción `createProject` (bloqueado hasta conectar wallet).
  - Conversión automática de montos (`parseUnits`) y duración en segundos.

## 3. Requisitos de entorno

Asegúrate de sincronizar el contrato con el frontend:

```bash
forge build
./scripts/fairfund-manager.sh deploy-and-sync
```

Esto copia el ABI actualizado y registra `NEXT_PUBLIC_FAIRFUND_ADDRESS` en `web-fairfund/.env.local`. También se añadió `web-fairfund/.env.example` como plantilla.
- Define los tokens permitidos en `NEXT_PUBLIC_SUPPORTED_TOKENS` (JSON). Ejemplo:

```env
NEXT_PUBLIC_SUPPORTED_TOKENS=[{"symbol":"DAI","address":"0x..."}]
```

## 4. Flujo actual

- Listado: lectura on-chain en tiempo real (React Query).
- Detalle: derivado de la misma fuente + totales de reembolso.
- Dashboard: filtra campañas según la wallet conectada (pendiente historial de aportes via eventos).
- Crear campaña: formulario con inputs bloqueados hasta que la wallet esté conectada (la escritura se implementará en la siguiente etapa).

## 5. Próximos pasos sugeridos

1. Añadir formularios con validaciones (`react-hook-form` + `zod`) y llamadas a `createProject`.
2. Implementar aporte/reembolso desde la UI (con notificaciones y manejo de transacciones).
3. Indexar contribuciones vía eventos (`ContributionAdded`, `RefundProcessed`) para poblar el dashboard.
4. Incorporar toasts y componentes shadcn/ui para feedback.
5. Preparar pruebas E2E (Playwright) que validen el flujo completo.

---

> Con esta integración el frontend deja de depender de mocks y queda alineado con el contrato desplegado, listo para habilitar interacciones de escritura y métricas de aportes.


