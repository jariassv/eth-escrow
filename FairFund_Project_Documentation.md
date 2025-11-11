# 📘 Proyecto FairFund — Crowdfunding con Escrow en Blockchain

## 🎯 Objetivo del Proyecto
Desarrollar una aplicación descentralizada (**DApp**) llamada **FairFund**, basada en un contrato inteligente de tipo **escrow**, que permite financiar proyectos de manera segura. Los fondos quedan bloqueados hasta que se cumple una condición verificable (meta de financiamiento alcanzada dentro del plazo).

---

## 🏗️ Arquitectura General

El sistema se compone de **dos proyectos principales**:

### 1. Smart Contract — `FairFund`
- **Lenguaje:** Solidity
- **Framework:** Foundry
- **Pruebas:** Mocha + Chai
- **Red:** Anvil / Ethereum / compatible con EVM (Sepolia para Test Net)

### 2. Frontend Web — `web-fairfund`
- **Framework:** Next.js (App Router)
- **Integración Web3:** ethers.js (sin wagmi)
- **Estilo:** TailwindCSS + shadcn/ui
- **Objetivo:** Interfaz moderna, responsiva y fácil de usar

---

## 👥 Roles y Permisos

| Rol | Descripción | Acciones permitidas |
|------|--------------|--------------------|
| **Owner** | Creador del contrato | - Autorizar tokens ERC20 válidos<br>- Configurar parámetros globales<br>- Retirar comisiones acumuladas |
| **Project Creator** | Usuario que crea un proyecto | - Crear campañas<br>- Definir token aceptado, meta y deadline<br>- Consultar aportes<br>- Retirar fondos si se cumple la meta |
| **Backer** | Usuario que apoya una campaña | - Depositar tokens ERC20<br>- Retirar fondos si la campaña falla<br>- Consultar su historial de aportes |

---

## 💰 Lógica de Escrow

1. Los **backers** depositan tokens ERC20 en el contrato.
2. Los fondos quedan **bloqueados (custodia)** en el contrato.
3. Si la meta (`goal`) se alcanza **antes del deadline**, el creador puede retirar los fondos.
4. Si no se alcanza la meta al vencer el plazo, los backers pueden **retirar su aporte**.

---

## 🧠 Manejo de Tokens ERC20

- El contrato soporta **múltiples tokens ERC20** aprobados por el Owner.
- Cada campaña define qué token acepta.
- El escrow controla la transferencia con `IERC20.transferFrom()` y `IERC20.transfer()`.
- Solo se permiten tokens previamente autorizados para evitar riesgos de contratos maliciosos.

---

## 🔐 Funciones del Smart Contract `FairFund.sol`

```solidity
contract FairFund {
    // Estructuras
    struct Project {
        address creator;
        address tokenAddress;
        string title;
        string description;
        uint256 goal;
        uint256 deadline;
        uint256 totalRaised;
        bool withdrawn;
        bool active;
    }

    struct Contribution {
        uint256 amount;
        bool refunded;
    }

    // Mapeos
    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(address => Contribution)) public contributions;
    mapping(address => bool) public allowedTokens;

    // Contadores
    uint256 public projectCount;

    // Eventos
    event ProjectCreated(uint256 indexed id, address indexed creator);
    event Funded(uint256 indexed id, address indexed backer, uint256 amount);
    event Withdrawn(uint256 indexed id, address indexed creator);
    event Refunded(uint256 indexed id, address indexed backer);

    // Funciones principales
    function allowToken(address token) external onlyOwner;
    function createProject(address token, string memory title, string memory desc, uint256 goal, uint256 duration) external;
    function fundProject(uint256 id, uint256 amount) external;
    function withdrawFunds(uint256 id) external;
    function refund(uint256 id) external;
    function getProject(uint256 id) external view returns (Project memory);
    function getProjects(uint256 offset, uint256 limit) external view returns (Project[] memory);
}
```

---

## 🧪 Pruebas Unitarias (Hardhat / Mocha / Chai)

### Casos principales
1. ✅ Crear un proyecto correctamente.
2. ❌ Rechazar tokens no autorizados.
3. ✅ Permitir múltiples aportes de distintos usuarios.
4. ✅ Reembolso si no se cumple la meta.
5. ✅ Retiro de fondos por el creador al alcanzar meta.
6. ❌ Impedir retiro doble.
7. ✅ Paginación y consulta de proyectos.
8. ✅ Validación de límites de tiempo (deadline).
9. ✅ Validación de permisos (soloOwner).

---

## 💻 Frontend `web-fairfund`

### Tecnologías
- **Next.js 15 (App Router)**
- **Ethers.js v6**
- **TailwindCSS + shadcn/ui**
- **Framer Motion (animaciones suaves)**

### Páginas principales
| Página | Descripción |
|---------|--------------|
| `/` | Listado de proyectos activos (paginado) |
| `/project/[id]` | Detalle del proyecto (meta, progreso, aportes) |
| `/create` | Formulario para crear nueva campaña |
| `/dashboard` | Historial de aportes del usuario |

### Funcionalidades Web3
- Conexión con MetaMask
- Lectura y escritura del contrato (ethers.js)
- Actualización automática de datos vía eventos
- Validaciones con mensajes amigables (ej: “Meta alcanzada 🎉”, “Plazo vencido ⏳”)
- Notificaciones con toast (shadcn)

---

## 🔍 Indexación y Paginación

- Los proyectos se listan con función `getProjects(offset, limit)`.
- El front utiliza *lazy loading* e *infinite scroll*.
- Los eventos `ProjectCreated` y `Funded` se indexan con *The Graph* (opcional).

---

## ⚠️ Validaciones y Seguridad

- Prevención de reentrancy (`nonReentrant`).
- Verificación de deadlines.
- Verificación de fondos suficientes.
- Validación de tokens permitidos.
- Lógica de reembolso única por usuario.
- Control de doble retiro.

---

## 🎨 UI/UX

- Diseño moderno tipo crowdfunding (estilo Kickstarter).
- Progreso de meta visual (barra de porcentaje).
- Botones claros: **“Aportar”, “Retirar”, “Reembolsar”**.
- Alertas visuales para errores o éxito.
- Adaptado a móviles y tablets.

---

## 🧩 Organización de Carpetas

```
FairFund/
├── smart-contract/
│   ├── contracts/
│   │   └── FairFund.sol
│   ├── test/
│   │   └── FairFund.test.js
│   ├── scripts/
│
└── web-fairfund/
    ├── app/
    │   ├── page.tsx
    │   ├── create/
    │   ├── project/[id]/
    │   └── dashboard/
    ├── components/
    ├── hooks/
    ├── lib/
    └── package.json
```

---

## 🧭 Conclusión

**FairFund** aplica de forma pura el concepto de *escrow*:  
los fondos quedan retenidos hasta que una condición medible (meta alcanzada antes del deadline) se cumple.  
La solución permite practicar integración completa entre Solidity, pruebas unitarias, y una interfaz Web3 moderna con Next.js + ethers.js.

---

© 2025 — Proyecto propuesto por IA para desarrollo completo Web3
