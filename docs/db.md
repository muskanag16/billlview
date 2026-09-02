# Database Schema

This document details the database schema for the BillFlow application, aligned with the constraints in `architecture.md` and `CODING_RULE.md`. 

The primary database is **PostgreSQL**.

## Global Standards
- All tables and columns use `snake_case`.
- Money values are stored as `DECIMAL(12, 2)` to avoid binary floating-point errors.
- Time fields use `TIMESTAMP WITH TIME ZONE`.
- Every table has an `id` UUID primary key.
- A high-entropy public token is utilized for public invoice access instead of IDs.

---

## Tables

### 1. `users`
Stores authenticated users of the platform (freelancers and small studio owners).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique identifier. |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | User's email address. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Securely hashed password. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | Record creation timestamp. |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | Record update timestamp. |

### 2. `business_settings`
Global invoice settings for a specific user.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique identifier. |
| `user_id` | `UUID` | `FOREIGN KEY` to `users(id) ON DELETE CASCADE`, `UNIQUE` | 1:1 relation to user. |
| `business_name` | `VARCHAR(255)` | `NULL` | The user's business name. |
| `logo_url` | `VARCHAR(255)` | `NULL` | Validated URL to uploaded logo. |
| `currency` | `VARCHAR(3)` | `DEFAULT 'USD'` | Three-letter currency code. |
| `invoice_number_prefix`| `VARCHAR(50)` | `NULL` | Prefix for generated invoices. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | Record creation timestamp. |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | Record update timestamp. |

### 3. `clients`
Clients added by the users.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique identifier. |
| `user_id` | `UUID` | `FOREIGN KEY` to `users(id) ON DELETE CASCADE`, `NOT NULL` | Owner of the client. |
| `name` | `VARCHAR(255)` | `NOT NULL` | Client's full name. |
| `email` | `VARCHAR(255)` | `NULL` | Client's email address. |
| `company` | `VARCHAR(255)` | `NULL` | Client's company name. |
| `address` | `TEXT` | `NULL` | Physical or billing address. |
| `phone` | `VARCHAR(50)` | `NULL` | Client's phone number. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | Record creation timestamp. |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | Record update timestamp. |

*Index: `user_id` for enforcing tenant isolation during reads.*

### 4. `invoices`
Invoices generated for clients.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique identifier. |
| `user_id` | `UUID` | `FOREIGN KEY` to `users(id) ON DELETE CASCADE`, `NOT NULL` | Owner of the invoice. |
| `client_id` | `UUID` | `FOREIGN KEY` to `clients(id) ON DELETE RESTRICT`, `NOT NULL` | Associated client. |
| `invoice_number` | `VARCHAR(100)` | `NOT NULL` | Number/identifier. |
| `issue_date` | `DATE` | `NOT NULL` | Date the invoice is issued. |
| `due_date` | `DATE` | `NOT NULL` | Deadline for payment. |
| `notes` | `TEXT` | `NULL` | Additional terms or notes. |
| `status` | `VARCHAR(50)` | `NOT NULL` | `draft`, `sent`, `paid`. (*Note: `overdue` is computed on the fly based on due date & unpaid status*). |
| `subtotal` | `DECIMAL(12, 2)` | `DEFAULT 0` | Sum of all line items. |
| `tax` | `DECIMAL(12, 2)` | `DEFAULT 0` | Absolute tax amount. |
| `discount` | `DECIMAL(12, 2)` | `DEFAULT 0` | Absolute discount amount. |
| `total` | `DECIMAL(12, 2)` | `DEFAULT 0` | Final total: `subtotal + tax - discount`. |
| `public_token` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | High-entropy token for sharing. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | Record creation timestamp. |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | Record update timestamp. |

*Constraints:* 
- `UNIQUE(user_id, invoice_number)`: Prevents duplicate invoice numbers for the same user.
- *Indexes:* `status`, `client_id`, `user_id`, and `issue_date` for efficient server-side filtering/sorting.

### 5. `invoice_items`
Line items associated with a specific invoice.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique identifier. |
| `invoice_id` | `UUID` | `FOREIGN KEY` to `invoices(id) ON DELETE CASCADE`, `NOT NULL` | Parent invoice. |
| `description` | `TEXT` | `NOT NULL` | Line item description. |
| `quantity` | `DECIMAL(10, 2)` | `NOT NULL` | Decimal quantity (e.g., hours). |
| `rate` | `DECIMAL(12, 2)` | `NOT NULL` | Unit rate/price. |
| `line_total` | `DECIMAL(12, 2)` | `NOT NULL` | Computed as `quantity * rate`. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | Record creation timestamp. |

---

## Data Retrieval Rules
1. **Tenant Isolation**: Every `SELECT`, `UPDATE`, or `DELETE` query against `clients`, `invoices`, or `business_settings` **MUST** include an ownership clause (`WHERE user_id = current_user.id`).
2. **Public Invoices**: Unauthenticated invoice access must query strictly by `public_token`, never by `id`.
3. **Calculations**: All financial fields (`line_total`, `subtotal`, `total`) are calculated on the backend. Frontend values must not be trusted.
