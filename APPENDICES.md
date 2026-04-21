# Appendices

## Appendix A: System API Specification (OpenAPI Summary)

The Tree Tracker system implements a RESTful API built on Node.js using Express 5 and Zod for schema validation. The API is version 0.1.0 and is unified under the `/api` prefix.

### Key Endpoint Groups:

**1. Tree Management (`/api/trees`)**
- `GET /trees`: List trees, filterable by state, district, status, and year.
- `POST /trees`: Register a new tree plantation event (requires geolocation, species, etc.).
- `GET /trees/{id}`: Detailed view of a specific tree.
- `PATCH /trees/{id}`: Update tree health/status (e.g., from `planted` to `cut`, survival updates).
- `DELETE /trees/{id}`: Permanently delete a tree record.

**2. Event Reporting (`/api/reports`)**
- `GET /reports`: List all system reports.
- `POST /reports`: Submit a tree event report (`plantation`, `cutting`, `survival_check`, `illegal_cutting`).
- `PATCH /reports/{id}/action`: Forest officer endpoint to verify or reject user-submitted reports.

**3. Analytics & Dashboard (`/api/dashboard`)**
- `GET /dashboard/stats`: Platform-level aggregate statistics (Total trees, carbon credits, survival rates).
- `GET /dashboard/state-stats`: Tree distributions mapped by state.
- `GET /dashboard/year-stats`: Year-over-year comparison of tree plantations and losses.

**4. Admin & Users (`/api/admin/users`)**
- `POST /admin/users`: Create citizens or officers.
- `PUT /admin/users/{id}`: Full user updates including role manipulation and verification status.

---

## Appendix B: Database Schema Initialization

The system leverages a PostgreSQL database (`tree_monitor`). Base tables are seeded automatically or via Drizzle ORM pushing.

### Core Tables Generated DDL

```sql
CREATE TABLE IF NOT EXISTS trees (
  id SERIAL PRIMARY KEY,
  tree_code VARCHAR(50) UNIQUE NOT NULL,
  state VARCHAR(100) NOT NULL,
  state_code VARCHAR(10) NOT NULL,
  district VARCHAR(100) NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  species VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'planted',
  survival_status VARCHAR(20) DEFAULT 'healthy',
  plantation_date DATE NOT NULL,
  carbon_credits DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  tree_id INTEGER,
  report_type VARCHAR(50) NOT NULL,
  description TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  reported_by VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forest_officers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  name VARCHAR(255) NOT NULL,
  badge_number VARCHAR(50) UNIQUE,
  state VARCHAR(100),
  district VARCHAR(100),
  phone VARCHAR(20),
  otp_secret VARCHAR(255),
  otp_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Appendix C: Pre-Seeded Test Data (Forest Officers)

For evaluation and testing purposes, the backend seeds authenticated `forest_officer` profiles across various states. They are pre-configured with `verified` standing.

| Name          | Email Address                    | Employee ID | State       | Role                 |
| ------------- | -------------------------------- | ----------- | ----------- | -------------------- |
| Ravi Shankar  | `ravi.shankar@treetrack.gov.in`  | MH-OFF-001  | Maharashtra | Chief Conservator    |
| Anjali Desai  | `anjali.desai@treetrack.gov.in`  | GJ-OFF-042  | Gujarat     | Field Officer        |
| Mohan Kumar   | `mohan.kumar@treetrack.gov.in`   | KA-OFF-108  | Karnataka   | District Supervisor  |

**Universal Test Password:** `Password123!`

---

## Appendix D: Development Startup Workflow (`startup.sh`)

To avoid manual step configurations during deployment, the project tracks an explicit initialization map executed via Bash.

1. **Port Cleanup:** Forcefully releases typical blocking ports (`5000`, `7134`) via `lsof`.
2. **Backend Daemon:** Switches out to `backend/`, fetches packages using `pnpm`, builds, and runs the API in the background.
3. **Frontend Thread:** Switches out to `frontend/`, resolves TS/Vite packages using `pnpm`, and attaches the client instance to port `7134`.
4. **Clean Exit Trap:** An `EXIT` interrupt listener (`SIGINT`) hooks any keyboard exits (CTRL+C) and properly cleans up background spawned node processes.
