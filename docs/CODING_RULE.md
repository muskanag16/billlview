# BillFlow --- CODING_RULE.md

## 1. Purpose

This file is the single source of truth for folder structure, naming
conventions, code organization, and the 200-line file-size rule.

## 2. Mandatory 200-Line Rule

**Every hand-written source/code file must contain 200 lines or fewer.**

If a file would exceed 200 lines:

1.  Stop adding code to that file.
2.  Identify separate responsibilities.
3.  Extract them into focused modules/components.
4.  Update imports/tests.
5.  Re-check the line count before merge.

Do not bypass the rule with minified code, generated-looking code, or
extremely long lines.

Preferred split examples:

``` text
InvoiceForm.tsx
├── InvoiceClientSelect.tsx
├── InvoiceItemsEditor.tsx
└── InvoiceTotals.tsx
```

``` text
invoice_service.py
├── invoice_calculator.py
├── invoice_status.py
└── invoice_number.py
```

Split by responsibility, not arbitrary `part1`, `part2` files.

## 3. Repository Structure

``` text
billflow/
├── apps/
│   ├── web/
│   │   ├── app/                # Routes/pages/layouts
│   │   ├── components/         # Reusable UI
│   │   ├── hooks/              # React hooks
│   │   ├── lib/                # API clients/utilities
│   │   └── types/              # Frontend types
│   └── api/
│       ├── app/
│       │   ├── api/            # HTTP routers
│       │   ├── core/           # Config/security/auth
│       │   ├── models/          # DB models
│       │   ├── repositories/    # DB operations
│       │   ├── schemas/         # Request/response schemas
│       │   └── services/        # Business logic
│       └── tests/
├── db/
│   ├── migrations/
│   └── seed/
├── scripts/
└── docs/
```

## 4. Frontend Folder Rules

### `app/`

Contains route-specific pages, layouts, loading UI, and error UI.

Use:

``` text
(public)/
(auth)/
(dashboard)/
public/invoice/[token]/
```

### `components/`

Reusable UI only. Organize by feature:

``` text
components/
├── ui/
├── clients/
├── invoices/
└── dashboard/
```

### `lib/`

API clients, formatters, validation helpers, and framework-independent
utilities.

### `hooks/`

Reusable React hooks only. Every hook starts with `use`.

## 5. Backend Folder Rules

  Folder            Responsibility
  ----------------- ----------------------------------
  `api/`            HTTP routing and status codes
  `core/`           Configuration, auth, security
  `models/`         Database/ORM entities
  `schemas/`        Pydantic request/response models
  `services/`       Business rules/workflows
  `repositories/`   Database access
  `tests/`          Automated tests

Routers must not contain complex business logic.

Repositories must not contain UI, email, PDF, or HTTP response logic.

## 6. TypeScript / React Naming

  Item             Rule                Example
  ---------------- ------------------- --------------------
  Component        PascalCase          `InvoiceForm.tsx`
  Hook             camelCase + `use`   `useInvoice.ts`
  Function         camelCase           `calculateTotal()`
  Variable         camelCase           `invoiceTotal`
  Type/interface   PascalCase          `Invoice`
  Constant         UPPER_SNAKE_CASE    `MAX_FILE_SIZE`
  Route folder     lowercase           `invoices/`
  Dynamic route    `[name]`            `[invoiceId]/`

Avoid unnecessary abbreviations.

## 7. Python Naming

  Item          Rule                   Example
  ------------- ---------------------- ------------------------
  File/module   snake_case             `invoice_service.py`
  Function      snake_case             `calculate_total()`
  Variable      snake_case             `invoice_total`
  Class         PascalCase             `InvoiceService`
  Constant      UPPER_SNAKE_CASE       `MAX_PAGE_SIZE`
  Schema        PascalCase             `InvoiceCreate`
  Exception     PascalCase + `Error`   `InvoiceNotFoundError`

## 8. Database Naming

Use PostgreSQL `snake_case`.

``` text
users
business_settings
invoice_items
invoice_number
public_token
created_at
updated_at
```

Use:

``` text
id
user_id
client_id
invoice_id
```

Use explicit foreign keys, uniqueness constraints, and indexes.

## 9. API Naming

Use plural resource names:

``` text
GET    /api/v1/clients
POST   /api/v1/clients
GET    /api/v1/clients/{client_id}
PATCH  /api/v1/clients/{client_id}
DELETE /api/v1/clients/{client_id}

GET    /api/v1/invoices
POST   /api/v1/invoices
GET    /api/v1/invoices/{invoice_id}
PATCH  /api/v1/invoices/{invoice_id}
```

Public invoice page:

``` text
/public/invoice/{token}
```

Use consistent `snake_case` query parameters.

## 10. Component Rules

Components must:

-   Have one clear responsibility.
-   Use typed props.
-   Keep JSX readable.
-   Extract complex sections into child components.
-   Avoid direct database access.
-   Avoid business calculations that belong to the backend.
-   Handle owned loading/empty/error states.
-   Remain accessible and responsive.

If a component approaches 200 lines, split it.

## 11. Service Rules

Services contain business behavior:

``` text
InvoiceService.create_invoice()
InvoiceService.mark_paid()
InvoiceService.calculate_totals()
```

Services must not return HTTP responses.

Services must validate ownership before changing user-owned data.

## 12. Repository Rules

Repositories contain persistence operations:

``` text
InvoiceRepository.get_for_user()
InvoiceRepository.list()
InvoiceRepository.create()
InvoiceRepository.update()
InvoiceRepository.delete()
```

Repositories should not decide UI behavior or HTTP status codes.

## 13. Validation Rules

Validate at boundaries:

``` text
Request
  ↓
Schema validation
  ↓
Service validation
  ↓
Repository
```

Frontend validation is for UX; backend validation is authoritative.

Never trust browser-supplied totals, ownership IDs, payment amounts, or
privileged status changes.

## 14. Money and Date Rules

-   Use decimal/numeric values for money.
-   Never use binary floating point as the financial source of truth.
-   Define rounding rules explicitly.
-   Keep currency formatting in a dedicated formatter.
-   Store and handle dates consistently.
-   Do not manipulate dates with fragile string operations.

## 15. Authentication Rules

Every private endpoint must identify the current user.

Every user-owned query must enforce ownership.

Preferred:

``` text
repository.get_for_user(invoice_id, current_user.id)
```

Avoid:

``` text
repository.get(invoice_id)
```

Public invoice access uses the high-entropy public token.

## 16. Error Rules

Use domain errors where useful:

``` text
InvoiceNotFoundError
UnauthorizedResourceError
InvalidInvoiceStateError
```

Map domain errors to HTTP responses in the API layer.

Never expose stack traces, SQL, password hashes, tokens, or environment
variables.

## 17. Import Rules

Organize imports consistently:

``` text
1. External packages
2. Internal absolute imports
3. Relative imports
```

Remove unused imports and avoid circular dependencies.

If modules depend on each other, extract their shared abstraction into a
lower-level module.

## 18. Test Rules

Tests must cover critical behavior:

-   Authentication.
-   Tenant isolation.
-   Client CRUD.
-   Invoice calculations.
-   Invoice filtering.
-   Overdue logic.
-   Public invoice access.
-   Simulated payment.
-   Dashboard totals.

Name tests by behavior:

``` text
test_user_cannot_read_another_users_invoice
test_unpaid_invoice_becomes_overdue_after_due_date
test_invoice_total_includes_tax_and_discount
```

## 19. Comments

Write code that explains itself.

Comments should explain **why**, not restate **what**.

Good:

``` text
# Decimal prevents binary floating-point currency errors.
```

Avoid comments such as:

``` text
# Add two numbers.
total = a + b
```

Document non-obvious business rules and public interfaces.

## 20. Git Rules

Use focused commits:

``` text
feat: add invoice creation
fix: enforce invoice ownership
refactor: split invoice form components
test: cover overdue invoice logic
```

Before merge:

``` text
□ Formatter passes
□ Linter passes
□ Tests pass
□ No source file exceeds 200 lines
□ No secrets committed
□ Migrations included
□ Seed works from empty DB
□ Loading/empty/error states checked
□ Mobile layout checked
```

## 21. New Feature Checklist

For every feature:

1.  Identify the domain responsibility.
2.  Put code in the correct layer.
3.  Follow naming conventions.
4.  Add validation and authorization.
5.  Add critical tests.
6.  Add loading/empty/error UI.
7.  Check the 200-line limit.
8.  Update documentation when setup or architecture changes.

**The 200-line limit is a design constraint: split a file rather than
allowing it to grow beyond the limit.**
