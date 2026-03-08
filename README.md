# TTC Atlas

Focused internal finance + payroll operations software for a single India office. The product is optimized for a fast monthly close:

1. Import the bank statement
2. Review and categorize transactions
3. Run payroll
4. Generate payslips
5. Review vendor and office expense payouts
6. Generate the Chartered Accountant export package

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- shadcn-style UI primitives in `components/ui`
- Supabase Auth + Postgres + Storage
- React Hook Form + Zod
- Route handlers for import, PDF, and export generation
- `@react-pdf/renderer` for invoices and payslips
- JSZip for CA export packaging

## Product Overview

This app is intentionally not a generic accounting suite. It is a single-company internal tool for India office finance and payroll operations. The data model stays clean enough to grow, but the UX is deliberately constrained to the handful of workflows that matter every month.

Core modules:

- Authentication and role-based access
- Dashboard
- Bank imports and transaction review
- Employee master
- Salary structures
- Payroll run engine
- Payslip PDFs
- Vendor and freelancer management
- Invoice generator
- Document management
- CA export center
- Audit logs
- Settings

## Architecture

### Application layers

- `app/`
  Next.js App Router pages and route handlers
- `components/`
  UI primitives, layout shell, and module-level client forms
- `lib/data/`
  Query layer. Currently demo-backed, structured so Supabase fetchers can replace it directly
- `lib/payroll/`
  Deterministic payroll calculation engine
- `lib/bank/`
  CSV normalization and deduplication logic
- `lib/pdf/`
  PDF templates and rendering helpers
- `lib/exports/`
  ZIP package builder for CA exports
- `lib/validation/`
  Zod schemas for all major forms
- `supabase/`
  SQL migration, seeds, and storage policies

### Auth and security design

- Supabase Auth is the identity layer
- Role source of truth is `public.profiles.role`
- Server-side authorization should check role before every write
- RLS is enabled on all business tables
- `ca_readonly` gets read-only access across finance/payroll scope
- Storage buckets are private; access is intended through authenticated requests or signed URLs

### Domain decisions

- Single-company setup in v1
- One India bank account initially
- CSV import first
- Deterministic payroll formulas only
- No double-entry accounting system
- Payroll month can be locked after approval
- Calculation snapshot is preserved per payroll item

## Database Schema

Primary tables:

- `companies`
- `profiles`
- `settings`
- `bank_accounts`
- `categories`
- `bank_imports`
- `bank_transactions`
- `employees`
- `salary_structures`
- `vendors`
- `invoices`
- `invoice_line_items`
- `saved_rules`
- `payroll_runs`
- `payroll_adjustments`
- `payroll_items`
- `documents`
- `audit_logs`

Schema implementation:

- [supabase/migrations/0001_init.sql](/C:/Users/Jatin/Desktop/TTC%20Atlas/supabase/migrations/0001_init.sql)
- [supabase/seed.sql](/C:/Users/Jatin/Desktop/TTC%20Atlas/supabase/seed.sql)
- [supabase/storage.sql](/C:/Users/Jatin/Desktop/TTC%20Atlas/supabase/storage.sql)

## Storage Design

Buckets:

- `statements`
  Original imported bank CSVs
- `documents`
  Expense proofs and supporting attachments
- `payslips`
  Generated payslip PDFs
- `invoices`
  Generated invoice PDFs

Suggested key layout:

- `statements/YYYY-MM/source-file.csv`
- `documents/YYYY-MM/entity-id/file.ext`
- `payslips/YYYY-MM/employee-code.pdf`
- `invoices/YYYY-MM/invoice-number.pdf`

## Payroll Engine

Implementation:

- [lib/payroll/engine.ts](/C:/Users/Jatin/Desktop/TTC%20Atlas/lib/payroll/engine.ts)

Current deterministic rules:

- Proration by `paidDays / daysInMonth`
- PF base capped at `15000`
- Employee PF = 12% of PF base when enabled and employee eligible
- Employer PF = 12% of PF base when enabled and employee eligible
- Professional tax default = `200`
- Approximate TDS tiering:
  - `0` up to `50,000`
  - `8%` over `50,000` up to `100,000`
  - `10%` above `100,000`
- Bonus and incentive increase gross pay
- Reimbursements increase net pay but are tracked separately
- Advance recovery and manual deductions reduce net pay

The formula set is deliberately maintainable and easy to inspect. If your CA needs more exact TDS behavior, replace the `calculateApproximateTds` function with your final slab logic without touching the rest of the engine.

## Bank Import Parsing

Implementation:

- [lib/bank/parser.ts](/C:/Users/Jatin/Desktop/TTC%20Atlas/lib/bank/parser.ts)
- [app/api/bank/import/route.ts](/C:/Users/Jatin/Desktop/TTC%20Atlas/app/api/bank/import/route.ts)

Behavior:

- CSV header parsing with Papa Parse
- Column mapping support
- Date normalization
- Credit/debit inference
- Duplicate fingerprinting on date + ref + amount + normalized narration
- Lightweight transaction type inference

## PDF Generation

Implementation:

- [lib/pdf/templates.tsx](/C:/Users/Jatin/Desktop/TTC%20Atlas/lib/pdf/templates.tsx)
- [lib/pdf/render.tsx](/C:/Users/Jatin/Desktop/TTC%20Atlas/lib/pdf/render.tsx)
- [app/api/payroll/payslip/[itemId]/route.ts](/C:/Users/Jatin/Desktop/TTC%20Atlas/app/api/payroll/payslip/%5BitemId%5D/route.ts)
- [app/api/invoices/[invoiceId]/pdf/route.ts](/C:/Users/Jatin/Desktop/TTC%20Atlas/app/api/invoices/%5BinvoiceId%5D/pdf/route.ts)

## CA Export ZIP Generation

Implementation:

- [lib/exports/ca-export.ts](/C:/Users/Jatin/Desktop/TTC%20Atlas/lib/exports/ca-export.ts)
- [app/api/exports/ca/[month]/route.ts](/C:/Users/Jatin/Desktop/TTC%20Atlas/app/api/exports/ca/%5Bmonth%5D/route.ts)

Included in the ZIP:

- Bank transactions CSV
- Payroll register CSV
- Employee master CSV
- Vendor payments CSV equivalent through vendor master
- Invoice register CSV
- Monthly summary CSV
- Payslip PDFs
- Invoice PDFs

## Pages

- `/login`
- `/dashboard`
- `/bank`
- `/employees`
- `/payroll`
- `/vendors`
- `/invoices`
- `/documents`
- `/exports`
- `/audit`
- `/settings`

## Key Files

- App shell: [components/layout/app-shell.tsx](/C:/Users/Jatin/Desktop/TTC%20Atlas/components/layout/app-shell.tsx)
- Dashboard: [app/(app)/dashboard/page.tsx](/C:/Users/Jatin/Desktop/TTC%20Atlas/app/%28app%29/dashboard/page.tsx)
- Bank review: [app/(app)/bank/page.tsx](/C:/Users/Jatin/Desktop/TTC%20Atlas/app/%28app%29/bank/page.tsx)
- Employees: [app/(app)/employees/page.tsx](/C:/Users/Jatin/Desktop/TTC%20Atlas/app/%28app%29/employees/page.tsx)
- Payroll: [app/(app)/payroll/page.tsx](/C:/Users/Jatin/Desktop/TTC%20Atlas/app/%28app%29/payroll/page.tsx)
- Vendors: [app/(app)/vendors/page.tsx](/C:/Users/Jatin/Desktop/TTC%20Atlas/app/%28app%29/vendors/page.tsx)
- Invoices: [app/(app)/invoices/page.tsx](/C:/Users/Jatin/Desktop/TTC%20Atlas/app/%28app%29/invoices/page.tsx)
- Validation: [lib/validation/schemas.ts](/C:/Users/Jatin/Desktop/TTC%20Atlas/lib/validation/schemas.ts)

## Environment Variables

Copy [`.env.example`](/C:/Users/Jatin/Desktop/TTC%20Atlas/.env.example) to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

1. Create a new Supabase project.
2. Run [supabase/migrations/0001_init.sql](/C:/Users/Jatin/Desktop/TTC%20Atlas/supabase/migrations/0001_init.sql).
3. Run [supabase/storage.sql](/C:/Users/Jatin/Desktop/TTC%20Atlas/supabase/storage.sql).
4. Optionally run [supabase/seed.sql](/C:/Users/Jatin/Desktop/TTC%20Atlas/supabase/seed.sql).
5. Configure auth providers for internal users.
6. Add env vars in Vercel.

## Vercel Deployment Notes

- Set all Supabase environment variables in the Vercel project
- Use Node.js runtime for PDF and ZIP generation routes
- Keep storage buckets private
- Use signed URLs or server-streamed responses for restricted file access
- Add your app URL to Supabase Auth redirect URLs

## Recommended Final File Tree

```text
app/
  (auth)/login/page.tsx
  (app)/
    layout.tsx
    dashboard/page.tsx
    bank/page.tsx
    employees/page.tsx
    payroll/page.tsx
    vendors/page.tsx
    invoices/page.tsx
    documents/page.tsx
    exports/page.tsx
    audit/page.tsx
    settings/page.tsx
  api/
    bank/import/route.ts
    payroll/payslip/[itemId]/route.ts
    invoices/[invoiceId]/pdf/route.ts
    exports/ca/[month]/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  bank/bank-import-form.tsx
  employees/employee-form.tsx
  invoices/invoice-form.tsx
  layout/app-shell.tsx
  shared/
  ui/
lib/
  auth/permissions.ts
  bank/parser.ts
  data/
  exports/ca-export.ts
  payroll/engine.ts
  pdf/
  supabase/
  types/domain.ts
  validation/schemas.ts
supabase/
  migrations/0001_init.sql
  seed.sql
  storage.sql
```

## Exact Implementation Order For This Codebase

1. Run Supabase SQL migration and storage policy scripts.
2. Connect env vars locally and on Vercel.
3. Replace demo-backed query functions in [lib/data/queries.ts](/C:/Users/Jatin/Desktop/TTC%20Atlas/lib/data/queries.ts) with real Supabase reads.
4. Add server actions or route handlers for create/update flows on employees, vendors, invoices, bank review, and payroll approval.
5. Persist generated invoice and payslip PDFs into Supabase Storage and store resulting `documents` rows.
6. Add signed URL delivery and strict auth checks around file access.
7. Add audit log inserts for every mutating action.
8. Add test coverage around payroll formulas and bank deduplication.

## Assumptions

- Single company in v1
- Single India operating bank account in v1
- CSV statement import only in v1
- PT modeled as a fixed `200` default
- TDS logic is simplified and should be replaced with your final CA-approved formula
- Demo data is used for UI scaffolding until Supabase queries are wired in
- Route handlers currently generate files on demand rather than persisting every artifact to storage
