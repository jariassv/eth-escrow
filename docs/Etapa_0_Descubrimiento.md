# 🧭 Etapa 0 — Descubrimiento y Alineación

## 1. Resumen ejecutivo

La etapa de descubrimiento define el marco de trabajo del proyecto **FairFund**, alineando expectativas de negocio, alcance técnico y criterios de éxito antes de iniciar la implementación. Este documento consolida los acuerdos preliminares, lista los riesgos visibles y deja preparada la información necesaria para arrancar con la etapa de diseño técnico.

## 2. Supuestos y decisiones de negocio

- **Modelo de ingresos**: el owner podrá configurar una comisión porcentual opcional sobre los montos recaudados por campaña.
- **Cobertura de tokens**: solo se admitirán tokens ERC20 previamente autorizados por el owner; no se implementará minteo interno.
- **Campañas**: cada campaña tiene meta (`goal`) y deadline definidos al crearse; no podrá ampliarse el plazo una vez iniciada.
- **Cancelación/pausa**: el owner podrá pausar todas las campañas en caso de incidentes; el creador podrá cancelar antes de recibir aportes.
- **Gobernanza**: no se contempla actualización del contrato (no upgradeable). Si se requiere, se desplegará una nueva versión.
- **Comisiones de red**: se asume que los usuarios cubrirán el gas necesario para interactuar.

### Temas pendientes de confirmación

- Límite máximo de campañas activas por usuario.
- Política de comisiones para campañas fallidas (¿se cobra?).
- Necesidad de soporte multilenguaje completo en el MVP.
- Inclusión de verificación KYC/AML para creadores.

## 3. Requisitos funcionales clave

1. Registro de campañas con título, descripción, meta, deadline y token aceptado.
2. Depósitos de fondos mediante `allowance + transferFrom`.
3. Lógica de retiro para el creador al alcanzar la meta antes del deadline.
4. Reembolso individual para backers cuando la campaña falla o se cancela.
5. Autorización de tokens por parte del owner.
6. Consulta de proyectos con paginación y filtros básicos (estado, token).
7. Emisión de eventos para toda acción relevante (`ProjectCreated`, `Funded`, `Withdrawn`, `Refunded`, `Paused`, etc.).

## 4. Requisitos no funcionales (RNF)

- **Seguridad**: proteger contra reentrancy, double-spend, griefing y validaciones de allowance; usar Slither/Mythril en CI.
- **Disponibilidad**: DApp debe manejar desconexiones de wallet y mostrar estados de sincronización; fallback RPC (Infura/Alchemy + backup local).
- **Performance**: llamadas on-chain optimizadas; uso de `view`/`pure` donde aplique; reducir almacenamiento redundante.
- **Escalabilidad**: posibilidad de indexar datos mediante The Graph desde el inicio.
- **Accesibilidad**: cumplir lineamientos WCAG AA en componentes críticos y soporte para dispositivos móviles.
- **Observabilidad**: logging estructurado en frontend y monitoreo de eventos para detectar fallos.

## 5. Herramientas y stack acordado

| Dominio | Herramientas | Notas |
|---------|--------------|-------|
| Smart Contract | Solidity 0.8.x, Foundry (forge/cast), OpenZeppelin | Pruebas unitarias + fuzz |
| Frontend | Next.js 15, TypeScript, TailwindCSS, shadcn/ui, React Query | Ethers.js v6 para Web3 |
| Automatización | Shell scripts, Foundry scripts, GitHub Actions (CI) | Sincronización ABI/env |
| Infra local | Anvil (bundle local), MetaMask | Soporte opcional para Sepolia |
| Calidad | ESLint, Prettier, Husky (pre-commit), Slither, Mythril, Playwright | Integrados en pipeline |

## 6. Riesgos y dependencias

- **Dependencia de providers externos**: definir fallback y manejo de rate limits.
- **Cambios regulatorios/KYC**: si se requiere, impactará diseño de UI/UX y almacenamiento de datos.
- **Complejidad multi-token**: mantener lista de tokens autorizados y sus metadatos actualizados.
- **Alineación UX**: riesgo de sobrecargar el MVP con funcionalidades no priorizadas.
- **Falta de indexador opcional**: sin The Graph, la experiencia de listados puede degradarse; contemplar cache en frontend.

## 7. Historias de usuario priorizadas (backlog inicial)

| Prioridad | Historia | Criterios de aceptación |
|-----------|---------|--------------------------|
| Alta | Como owner, quiero autorizar un token ERC20 para que sea usado en campañas. | Token validado, evento emitido, sólo owner puede llamarla. |
| Alta | Como creador, quiero registrar una campaña con meta y deadline para recibir aportes. | Validaciones de token permitido, meta > 0, deadline futuro, campaña activa. |
| Alta | Como backer, quiero aportar fondos a una campaña activa usando mi wallet. | `transferFrom` exitoso, registro en contribuciones, evento `Funded`. |
| Alta | Como backer, quiero recuperar mi aporte si la campaña falla. | Sólo disponible después del deadline sin meta alcanzada; reentrancy protegido. |
| Media | Como creador, quiero retirar los fondos cuando la meta se cumple antes del deadline. | Control de retiro único, comisiones aplicadas si existen. |
| Media | Como usuario, quiero ver el listado de campañas con progreso y estado. | Paginación, filtros básicos, datos actualizados sin recargar. |
| Baja | Como owner, quiero pausar el sistema en caso de vulnerabilidad. | Todas las funciones críticas quedan bloqueadas, evento `Paused`. |

## 8. Preguntas abiertas

1. ¿Se requieren métricas analíticas (por ejemplo, Google Analytics, PostHog) desde el MVP?
2. ¿Habrá integración con otros canales (API REST, móvil) que debamos anticipar?
3. ¿Necesitamos manejar distintos niveles de comisión según el tipo de campaña?
4. ¿Se establecerá un programa de recompensas/bonificaciones para backers tempranos?

## 9. Checklist de salida de la etapa

- [x] Supuestos de negocio iniciales documentados.
- [x] Requisitos funcionales y no funcionales definidos.
- [x] Stack tecnológico acordado y versiones objetivo listadas.
- [x] Identificación preliminar de riesgos y dependencias.
- [x] Backlog inicial priorizado con historias de usuario clave.
- [ ] Resolución de preguntas abiertas (se traslada a la etapa de diseño).
- [ ] Firma de conformidad por stakeholders (pendiente de reunión de validación).

---

> Con esta información, el equipo puede iniciar la **Etapa 1 — Diseño técnico y preparación**, avanzando en la definición de arquitectura detallada y configuración del repositorio monorepo.


