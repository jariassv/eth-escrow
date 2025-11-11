# 🔁 Etapa 6 — Flujos de Aporte y Reembolso

## 1. Objetivo

Habilitar en la interfaz los flujos clave de interacción con el contrato `FairFund`: aportar fondos y solicitar reembolsos cuando aplique. También se documentan los requisitos de allowance y las validaciones aplicadas en el cliente.

## 2. Componentes y hooks

- **`useProjectActions`** (`src/hooks/useProjectActions.ts`)
  - Gestiona allowance (`approve`) y comando `fundProject`.
  - Verifica saldo `balanceOf` y sincroniza React Query (`useProject`, `useProjects`).
  - Expone estados `fundStatus`, `refundStatus` y mensajes amigables.
- **`ProjectDetailClient`**
  - Formulario con `react-hook-form` + `zod` para validar el monto.
  - Botón de reembolso habilitado sólo si la wallet está conectada.
  - Visualización de feedback (éxito/error) y loader mientras se espera la transacción.

## 3. Permisos y allowances

1. Antes de aportar, el usuario debe conceder `approve` al contrato FairFund.
2. El hook revisa `allowance` y, si es insuficiente, emite la transacción `approve` automáticamente.
3. Se consulta el balance del usuario (`balanceOf`) para evitar errores por falta de fondos antes de enviar la transacción principal.

> Nota: si el token tiene políticas especiales (permit/permit2), será necesario ampliar el flujo para soportarlas manualmente.

## 4. Validaciones del formulario

- **Monto**: número positivo, distinto de cero.
- **Duración / token**: ya validados en la etapa anterior (`create` form).
- Se bloquea el formulario mientras corre la transacción y se limpian campos tras completar el aporte.

## 5. Requerimientos de entorno

- `NEXT_PUBLIC_SUPPORTED_TOKENS` debe incluir el token que se usará.
- La cuenta deployer (owner de FairFund) debe haber autorizado el token (`allowToken`).
- Asegurarse de que la wallet tenga saldo del token y ETH para gas en la red correspondiente.

## 6. Próximos pasos

- Agregar listado de contribuciones por usuario (eventos `ContributionAdded`).
- Habilitar reembolsos múltiples y acciones para el creador (withdraw).
- Incorporar notificaciones (toasts) y seguimiento en tiempo real (listeners de eventos o polling) para reflejar cambios sin recargar.
- Añadir pruebas E2E que cubran `approve + fund` y `refund`.

---

> Todos los cambios se encuentran registrados en el commit `feat: enable funding and refunds in project detail` sobre la rama `develop`.
