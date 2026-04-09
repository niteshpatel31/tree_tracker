# 🌳 Dot-Explorer — Tree Monitoring System

A full-stack tree plantation and monitoring platform built for India's forest conservation efforts. Track plantations, detect deforestation using satellite NDVI data, log IoT sensor readings, run AI-based image analysis, and maintain blockchain-style tamper-proof audit trails.

---

## 🏗️ System Architecture & Logic Flow

### 1. Context & Data Flow (DFD)

**Level 0 (Context Diagram):**
```mermaid
flowchart LR
    Citizen([Citizen]) <--> |Tree Data, Reports| System((Tree Monitoring\nSystem))
    Officer([Forest Officer]) <--> |Verification, Updates| System
    Admin([Admin]) <--> |System Configuration| System
    IoT([IoT / Satellite Systems]) --> |Telemetry, NDVI Scans| System
```

**Level 1 (Sub-processes):**
```mermaid
flowchart TD
    Citizen([Citizen])
    Officer([Forest Officer])
    IoT([IoT / Satellite Systems])

    P1((1.0\nUser Auth &\nManagement))
    P2((2.0\nTree Planting &\nTracking))
    P3((3.0\nIssue Reporting &\nMonitoring))
    P4((4.0\nDashboard &\nAnalytics))

    D1[(D1: User DB)]
    D2[(D2: Tree DB)]
    D3[(D3: Report DB)]

    Citizen --> |Credentials| P1
    Officer --> |Credentials| P1
    P1 <--> |Verify/Store| D1
    
    Citizen --> |Plant Tree Request| P2
    Officer --> |Verify Tree status| P2
    P2 <--> |Store/Update Tree Data| D2

    Citizen --> |Submit Issue Report| P3
    IoT --> |Health Telemetry| P3
    P3 <--> |Log Issues & Telemetry| D3

    D2 --> |Aggregated Data| P4
    D3 --> |Report Analytics| P4
    P4 --> |Stats View| Citizen
    P4 --> |Insights View| Officer
```

### 2. Implementation Tech Stack

```mermaid
flowchart TD
    Client(["React 19 Frontend\n(Vite, Tailwind, Maps)"])
    API(["Node.js API Server\n(Express 5, Zod)"])
    DB[(PostgreSQL\nDatabase)]
    
    Client <-->|HTTP/REST / OpenAPI| API
    API <-->|Drizzle ORM Queries| DB
```

### 3. Tree Plantation Flow (Sequence)

```mermaid
sequenceDiagram
    actor Citizen
    participant Client as React App
    participant API as Express API
    participant DB as PostgreSQL
    
    Citizen->>Client: Enters Tree Details (Location, Species)
    Client->>API: POST /api/trees
    API->>API: Validate input logic (Zod)
    API->>API: Generate Unique Tree Code
    API->>DB: INSERT INTO trees
    DB-->>API: Returns new Tree ID
    API-->>Client: Success Response & Tree Code
    Client-->>Citizen: Displays "Tree Planted" success & Code
```

### 4. Use Case Interactions

```mermaid
flowchart LR
    subgraph Actors
        Citizen(["👤 Citizen"])
        Officer(["👮 Forest Officer"])
        Admin(["🛠️ System Admin"])
    end

    subgraph Tree Monitoring System
        UC1(Register / Login)
        UC2(Plant & Register Tree)
        UC3(View Tree Locations Map)
        UC4(Submit Tree Health Report)
        UC5(Verify Planted Trees)
        UC6(Monitor IoT Data & Alerts)
        UC7(Manage Users & Roles)
        UC8(View Dashboard Analytics)
    end

    Citizen --- UC1
    Citizen --- UC2
    Citizen --- UC3
    Citizen --- UC4
    Citizen --- UC8

    Officer --- UC1
    Officer --- UC3
    Officer --- UC5
    Officer --- UC6
    Officer --- UC8

    Admin --- UC1
    Admin --- UC7
    Admin --- UC8
```

### 5. Database Schema (ERD)

```mermaid
erDiagram
    USERS ||--o| CITIZENS : "is a"
    USERS ||--o| FOREST_OFFICERS : "is a"
    TREES ||--o{ REPORTS : "receives"
    CITIZENS ||--o{ REPORTS : "files"

    USERS {
        int id PK
        string email
        string password_hash
        string role
        timestamp created_at
    }

    CITIZENS {
        int id PK
        int user_id FK
        string name
        string phone
        text address
        timestamp created_at
    }

    FOREST_OFFICERS {
        int id PK
        int user_id FK
        string name
        string badge_number
        string state
        string district
        timestamp created_at
    }

    TREES {
        int id PK
        string tree_code UK
        string state
        string district
        decimal latitude
        decimal longitude
        string species
        string status
        string survival_status
        date plantation_date
    }

    REPORTS {
        int id PK
        int tree_id FK
        string report_type
        text description
        string reported_by
        string status
        timestamp created_at
    }
```

---

## 🚀 Prerequisites

Before starting, make sure you have the following installed:

| Tool          | Version   | Install Guide |
|---------------|-----------|---------------|
| **Node.js**   | ≥ 18.x    | [nodejs.org](https://nodejs.org/) |
| **pnpm**      | ≥ 8.x     | `npm install -g pnpm` |
| **PostgreSQL**| ≥ 14.x    | [postgresql.org](https://www.postgresql.org/download/) |

---

## 🛠️ Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Dot-Explorer.git
cd Dot-Explorer
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up PostgreSQL Database

```bash
node setup-db.mjs
```
*(Alternatively, create the `tree_monitor` database manually via `psql`)*

### 4. Push Database Schema (Drizzle)

```bash
pnpm db:push
```

### 5. Start Development

```bash
# Start both backend and frontend concurrently
pnpm dev
```

---

## 🔧 Common Commands

```bash
pnpm install        # Install dependencies
pnpm dev            # Start development (backend + frontend)
pnpm dev:backend    # Start only backend
pnpm dev:frontend   # Start only frontend
pnpm build          # Build workspace
pnpm typecheck      # Type check all packages
pnpm db:push        # Push database schema
```

---

## 📝 License

MIT
