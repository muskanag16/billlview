# BillFlow - Modern Invoicing

A full-stack, tenant-isolated invoicing application built with FastAPI and Next.js.

## Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS, Lucide Icons
- **Backend**: FastAPI, SQLAlchemy, Pydantic, Passlib
- **Database**: PostgreSQL (or SQLite for testing)

## Features
- **Tenant Isolation**: Users only see their own clients, invoices, and settings.
- **Client Management**: Create and manage clients.
- **Invoice Generation**: Create invoices with dynamic line items. Automatic subtotal, tax, and discount calculation.
- **Public Invoices**: Share a secure, unguessable link with clients to view and pay their invoice without needing an account.
- **Dashboard**: Track total earned, outstanding, and overdue amounts.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL (optional, defaults to SQLite for demo)

### Backend Setup
1. `cd apps/api`
2. `python -m venv venv`
3. `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
4. `pip install -r requirements.txt`
5. Create `.env` from `.env.example` (or use defaults)
6. Run migrations (or use the provided `demo_seed.sql`)
7. `uvicorn app.main:app --reload --port 8080`

### Frontend Setup
1. `cd apps/web`
2. `npm install`
3. `npm run dev` (starts on port 3000)

## Demo Credentials
Use these credentials to log in to the pre-seeded demo account (if using `demo_seed.sql`):
- **Email**: `demo@billflow.dev`
- **Password**: `demo1234`

## Testing
Run backend unit tests with `pytest` inside the `apps/api` directory:
```bash
cd apps/api
pytest tests/
```
