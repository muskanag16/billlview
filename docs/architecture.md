# BillFlow Architecture

## 1. Scope

BillFlow is an invoicing SaaS for freelancers and small studios. The
assessment requires authentication, client management, invoice
management, public invoice/payment access, dashboard reporting, business
settings, responsive UX, PostgreSQL migrations/seed data, and deployment
as a live website. fileciteturn0file0L8-L28
fileciteturn0file0L31-L37

## 2. Technology Decisions

  Layer              Decision
  ------------------ ------------------------------
  Web                Next.js + React + TypeScript
  Styling            Tailwind CSS
  API                FastAPI + Python
  Database           PostgreSQL
  API style          REST/JSON
  Database changes   Versioned migrations
  Deployment         Any suitable cloud provider
  Payment            Test/simulated payment

The assessment permits either FastAPI or Next.js route handlers; this
design uses FastAPI to keep HTTP, business logic, and persistence
responsibilities clearly separated. fileciteturn0file0L14-L19

## 3. High-Level Architecture

``` text
Browser
  │ HTTPS
  ▼
Next.js Web App
  │ REST/JSON
  ▼
FastAPI API
  ├── Auth / Authorization
  ├── Application Services
  └── Repositories
          │
          ▼
      PostgreSQL

FastAPI Services ──► Email Provider
                  ──► PDF Generator
                  └─► Test Payment
```

The browser never connects directly to PostgreSQL.

## 4. Repository Structure

``` text
billflow/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   └── api/
│       ├── app/
│       │   ├── api/
│       │   ├── core/
│       │   ├── models/
│       │   ├── repositories/
│       │   ├── schemas/
│       │   └── services/
│       └── tests/
├── db/
│   ├── migrations/
│   └── seed/
├── scripts/
├── docs/
├── architecture.md
├── CODING_RULE.md
└── README.md
```

## 5. Frontend Structure

``` text
app/
├── (public)/                  # Landing/public pages
├── (auth)/                    # Sign-up/login
├── (dashboard)/               # Authenticated product
└── public/invoice/[token]/    # Client-facing invoice
```

`components/` contains reusable UI. Organize larger areas by feature:

``` text
components/
├── ui/
├── clients/
├── invoices/
└── dashboard/
```

`lib/api/` contains typed API functions. Components should not contain
arbitrary raw API calls.

## 6. Backend Layers

``` text
Request
  ↓
FastAPI Router
  ↓
Pydantic Schema
  ↓
Application Service
  ↓
Repository
  ↓
PostgreSQL
```

**Router:** HTTP concerns only.\
**Schema:** request/response validation.\
**Service:** business rules and workflows.\
**Repository:** database access.\
**Model:** persistence representation.\
**Core:** configuration, authentication, security, and shared
infrastructure.

## 7. Domain Model

``` text
User
 ├── 1:1 BusinessSettings
 ├── 1:N Client
 └── 1:N Invoice

Client
 └── 1:N Invoice

Invoice
 └── 1:N InvoiceItem
```

Core fields:

-   `User`: id, email, password_hash, timestamps.
-   `BusinessSettings`: user_id, business_name, logo_url, currency,
    invoice_number_prefix.
-   `Client`: user_id, name, email, company, address, phone.
-   `Invoice`: user_id, client_id, invoice_number, issue_date, due_date,
    notes, status, subtotal, tax, discount, total, public_token,
    timestamps.
-   `InvoiceItem`: invoice_id, description, quantity, rate, line_total.

Use decimal/numeric values for money.

## 8. Authentication and Tenant Isolation

Passwords must be securely hashed. Every private request identifies the
current user.

All user-owned queries must include ownership scope:

``` text
find invoice where
  invoice.id = requested_id
  AND invoice.user_id = current_user.id
```

The same rule applies to clients and related resources.

Never authorize access using only a record ID.

## 9. Invoice Rules

The backend is the source of truth for calculations.

``` text
line_total = quantity × rate
subtotal   = sum(line_total)
total      = subtotal + tax - discount
```

The exact tax/discount semantics must be represented explicitly in the
implementation.

Supported statuses are:

``` text
draft → sent → paid
           └── overdue
```

An unpaid invoice whose due date has passed is displayed as overdue
automatically. A paid invoice cannot be overdue.
fileciteturn0file0L24-L27 fileciteturn0file0L35-L37

## 10. Public Invoice Flow

``` text
Owner creates invoice
      ↓
Generate high-entropy public token
      ↓
Email/share link
      ↓
/public/invoice/{token}
      ↓
Client views without login
      ↓
Test/simulated payment
      ↓
Invoice marked paid
```

The public token, not a sequential database ID, is the access mechanism.
The assessment explicitly requires unauthenticated public invoice
viewing and allows simulated payment. fileciteturn0file0L31-L33

## 11. Invoice List and Dashboard

Invoice list API must perform search, status/client filtering, and
sorting on the server.

Example:

``` text
GET /api/v1/invoices
  ?search=
  &status=
  &client_id=
  &sort_by=
  &sort_order=
  &page=
  &page_size=
```

Dashboard API should return total earned, outstanding, overdue, recent
invoices, and income-over-time data. fileciteturn0file0L27-L28
fileciteturn0file0L34-L35

## 12. PDF, Email, and Settings

Keep integrations behind dedicated services:

``` text
InvoiceService
 ├── EmailService
 └── PdfService
```

Business settings are owned by the user and must affect
generated/displayed invoices: business name, logo, currency, and invoice
number prefix. fileciteturn0file0L35-L35

## 13. Database

PostgreSQL is the persistence source of truth.

Required practices:

-   Versioned migrations.
-   Foreign keys.
-   Unique constraints.
-   Indexes for common invoice filters/lookups.
-   Unique public tokens.
-   User-scoped invoice numbering.
-   Seed data that creates a usable demo account and invoice.

The assessment explicitly requires migrations that build the database
from empty and a demo seed script. fileciteturn0file0L38-L45

## 14. API Error Contract

Use a consistent shape:

``` json
{
  "error": {
    "code": "INVOICE_NOT_FOUND",
    "message": "Invoice was not found."
  }
}
```

Do not expose stack traces, SQL, password hashes, tokens, or secrets.

## 15. UX and Reliability

Every major screen must support:

``` text
Loading → Empty → Data
             ↘
              Error
```

The UI must be responsive on phones and feel like a real product.
fileciteturn0file0L36-L37

## 16. Testing Priorities

Prioritize:

-   Authentication.
-   User/tenant isolation.
-   Client CRUD.
-   Invoice calculations.
-   Invoice filtering.
-   Overdue logic.
-   Public invoice access.
-   Simulated payment.
-   Dashboard totals.

A regression test must prevent one user from reading another user's
clients or invoices.

## 17. Security and Configuration

-   HTTPS in production.
-   Secure password hashing.
-   Secure session/token handling.
-   Backend validation and authorization.
-   High-entropy public tokens.
-   Environment variables for secrets.
-   No real keys committed to Git.
-   Restrictive CORS.
-   Validated logo uploads.
-   Safe error responses.

The assessment explicitly says no real keys may be committed.
fileciteturn0file0L43-L45

## 18. Deployment

``` text
User
 ↓
Next.js deployment
 ↓
FastAPI deployment
 ↓
PostgreSQL
```

Required delivery includes a live URL, demo login details, a pre-created
invoice/public link, repository access, README, migrations/seed, and a
short screen recording. fileciteturn0file0L38-L46

## 19. Architectural Rules

1.  Backend owns authorization and final financial calculations.
2.  Routers remain thin.
3.  Services contain business workflows.
4.  Repositories contain persistence logic.
5.  Public invoices use tokens.
6.  Invoice filtering is server-side.
7.  Money uses decimal arithmetic.
8.  Features follow the repository structure in `CODING_RULE.md`.
9.  **No source/code file may exceed 200 lines. If it would exceed 200
    lines, split it by responsibility before merging.**
10. Loading, empty, error, and responsive states are required.
