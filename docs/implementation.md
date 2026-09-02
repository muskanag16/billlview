# BillFlow Implementation Plan

This document breaks down the end-to-end development of the BillFlow SaaS into six actionable phases. This strategy integrates Next.js (frontend), FastAPI (backend), and PostgreSQL (database) to meet the 48-hour build requirements.

---

## Phase 1: Project Initialization & Infrastructure
**Goal:** Get the foundational architecture and database running.

1. **Frontend Setup**
   - Initialize Next.js (`apps/web`).
   - Install and configure Tailwind CSS.
   - Establish the basic route groups (`(public)`, `(auth)`, `(dashboard)`, `public/invoice/[token]`).
2. **Backend Setup**
   - Initialize FastAPI (`apps/api`).
   - Configure environment variables and basic server settings.
3. **Database Infrastructure**
   - Set up PostgreSQL connection strings.
   - Configure the chosen ORM (e.g., SQLAlchemy/SQLModel).
   - Implement database migrations (e.g., via Alembic) using the schema defined in `docs/db.md`.
   - Integrate the `db/seed/demo_seed.sql` script into a reproducible startup script.

---

## Phase 2: Authentication & Core Setup
**Goal:** Secure the application and implement user isolation.

1. **Backend Authentication**
   - Implement secure password hashing (e.g., using `passlib` and bcrypt).
   - Build endpoints for Sign Up, Log In, and Log Out.
   - Implement authentication token generation (JWT) and validation dependencies.
2. **Frontend Authentication UI**
   - Build the `(auth)` pages (Sign up, Log in).
   - Implement frontend session state management.
3. **Tenant Isolation**
   - Enforce strict tenant isolation logic in backend repositories (all queries must be scoped to `user_id`).
   - Set up core error handling (e.g., generic HTTP exceptions for `Unauthorized` or `Not Found`).

---

## Phase 3: Business Settings & Client Management
**Goal:** Allow users to configure their studio and manage their clients.

1. **Business Settings**
   - Build backend CRUD services and endpoints for `business_settings`.
   - Create a frontend UI form for editing business settings (name, currency, prefix).
   - Implement a mock upload or URL input for the logo.
2. **Client Management**
   - Build backend CRUD endpoints for `clients`.
   - Create frontend UI for adding, editing, deleting, and listing clients.
   - Ensure loading, empty, and error states are handled in the UI.

---

## Phase 4: Invoice Core & Management
**Goal:** Enable the core value proposition—creating and tracking invoices.

1. **Domain Logic**
   - Implement backend domain logic for precise invoice calculation (`quantity × rate`, taxes, discounts) using decimal arithmetic.
2. **Invoice Endpoints**
   - Build backend endpoints for creating, updating, and listing invoices.
   - Implement server-side search, status filtering, and client filtering on the list endpoint.
3. **Frontend Invoice Forms**
   - Build the Invoice creation/edit form supporting dynamic line items.
   - Build the Invoice list page with sorting, filtering, and pagination UI.

---

## Phase 5: Public Invoice Flow & Utilities
**Goal:** Enable clients to view and "pay" invoices without logging in.

1. **Public Tokens**
   - Ensure secure public token generation upon invoice creation.
   - Create a backend endpoint to fetch an invoice by its `public_token` (no authentication required).
2. **Public View UI**
   - Build the unauthenticated frontend route `public/invoice/[token]`.
   - Add PDF rendering/download capabilities (via the browser print dialog or a dedicated backend service).
3. **Simulated Payment & Status**
   - Implement a simulated payment endpoint (a mock "Pay Now" action) that updates the invoice status to `paid`.
   - Implement an automated status resolution so that unpaid invoices past their `due_date` naturally display as `overdue`.

---

## Phase 6: Dashboard, Polish & Deployment
**Goal:** Finish the product experience, test, and ship.

1. **Dashboard**
   - Build a Dashboard API to aggregate financial metrics (total earned, outstanding, overdue) and recent invoices.
   - Build the Dashboard frontend overview to display these metrics.
2. **Polish & UX**
   - Perform a thorough UI review ensuring responsiveness (mobile-first), smooth transitions, loading states, and polished empty states.
3. **Testing**
   - Write critical regression tests focusing heavily on tenant isolation and precise financial calculations.
4. **Deployment**
   - Prepare the application for hosting.
   - Configure production environment variables.
   - Ensure the repository `README.md` includes clear setup instructions and demo credentials as required by the technical assessment.
