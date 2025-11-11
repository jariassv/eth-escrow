# ✅ Etapa 7 — Acciones del Creador y Métricas

## 1. Objetivo

Completar el flujo principal de interacción para usuarios (backers) y creadores:

- Aportes con manejo automático de `approve` + validaciones.
- Reembolsos para campañas fallidas/canceladas.
- Retiro de fondos para creadores una vez financiadas.
- Paneles con métricas y resúmenes rápidos (landing y dashboard).

## 2. Cambios técnicos

### Hook `useProjectActions`
- Encapsula `fundProject`, `refund` y `withdrawFunds`.
- Gestiona estados (`pending/success/error`) y mensajes para la UI.
- Revalida queries de React Query (`useProjects`, `useProject`) tras cada acción.
- Revisa allowance ERC20 (`approve` si hace falta) y saldo disponible.

### `ProjectDetailClient`
- Formulario de aporte con `react-hook-form` + `zod`.
- Cards independientes para aporte, reembolso y retiro.
- Lógica condicional: retiro sólo visible para el creador mientras `status === funded` y `withdrawn === false`.

### Métricas/UI
- `ProjectList` muestra totales de campañas (activas/financiadas/fallidas) y tokens permitidos.
- `Dashboard` agrega resumen de campañas propias y CTA de conexión.

## 3. Requisitos previos
- `NEXT_PUBLIC_SUPPORTED_TOKENS` debe incluir los tokens autorizados (símbolo + address).
- El owner del contrato tiene que ejecutar `allowToken(address)` para cada token listado.
- La wallet del usuario debe contar con saldo del token y ETH para fees.

## 4. Pruebas rápidas sugeridas
1. Arrancar Anvil + script de despliegue (`fairfund-manager.sh deploy-and-sync`).
2. Usar una cuenta para lanzar campaña (ver etapa anterior).
3. Con otra cuenta:
   - Aprobar y aportar.
   - Verificar feedback de éxito y actualización del listado.
4. Cambiar fecha/estado para testear `refund` (simular deadline o cancelar campaña).
5. Con la cuenta creadora, retirar fondos tras alcanzada la meta.

## 5. Próximos pasos
- Registrar historial de aportes usando eventos `ContributionAdded`.
- Habilitar retiro parcial/múltiple (si se decide ampliar la lógica on-chain).
- Incluir toasts/notificaciones globales y logs en dashboard.
- Añadir pruebas E2E para `fund`, `refund` y `withdraw`.

---

> Cambios incluidos en los commits `feat: enable funding and refunds in project detail` y `feat: enhance dashboard metrics` sobre `develop`.
