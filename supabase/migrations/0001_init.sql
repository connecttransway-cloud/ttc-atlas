create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'finance_operator', 'payroll_operator', 'ca_readonly');
create type public.employee_status as enum ('active', 'inactive');
create type public.payroll_status as enum ('draft', 'reviewed', 'approved', 'locked');
create type public.invoice_status as enum ('draft', 'sent', 'paid');
create type public.transaction_direction as enum ('credit', 'debit');
create type public.transaction_review_status as enum ('unreviewed', 'reviewed', 'matched');
create type public.transaction_type as enum (
  'intercompany_funding',
  'salary',
  'freelancer_payment',
  'office_expense',
  'reimbursement',
  'bank_charge',
  'invoice_receipt',
  'other'
);
create type public.document_kind as enum ('statement', 'invoice', 'expense_proof', 'payslip', 'other');
create type public.vendor_kind as enum ('vendor', 'freelancer');
create type public.adjustment_kind as enum ('bonus', 'reimbursement', 'advance_recovery', 'manual_deduction', 'incentive');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  trade_name text not null,
  gstin text,
  pan text,
  pf_registration_number text,
  address text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id),
  full_name text not null,
  email text not null unique,
  role public.app_role not null default 'finance_operator',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  key text not null,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, key)
);

create table public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  bank_name text not null,
  account_name text not null,
  account_number_masked text not null,
  ifsc text not null,
  currency_code text not null default 'INR',
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  name text not null,
  code text not null,
  type text not null check (type in ('income', 'expense', 'payroll', 'transfer')),
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, code)
);

create table public.bank_imports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  bank_account_id uuid not null references public.bank_accounts(id),
  source_filename text not null,
  storage_path text not null,
  imported_by uuid not null references public.profiles(id),
  import_month date not null,
  row_count integer not null default 0,
  deduplicated_count integer not null default 0,
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  employee_code text not null,
  full_name text not null,
  email text not null,
  phone text,
  designation text not null,
  department text not null,
  location text not null,
  join_date date not null,
  leave_date date,
  pan text not null,
  uan text,
  pf_eligible boolean not null default false,
  bank_account_name text not null,
  bank_account_number_masked text not null,
  bank_ifsc text not null,
  status public.employee_status not null default 'active',
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, employee_code),
  unique (company_id, email)
);

create table public.salary_structures (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  employee_id uuid not null references public.employees(id),
  effective_date date not null,
  monthly_basic numeric(12,2) not null default 0,
  hra numeric(12,2) not null default 0,
  special_allowance numeric(12,2) not null default 0,
  fixed_allowance numeric(12,2) not null default 0,
  other_fixed_earnings numeric(12,2) not null default 0,
  employee_pf_enabled boolean not null default true,
  employer_pf_enabled boolean not null default true,
  professional_tax_enabled boolean not null default true,
  tds_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  name text not null,
  kind public.vendor_kind not null,
  email text,
  phone text,
  gstin text,
  pan text,
  default_category_id uuid references public.categories(id),
  tds_applicable boolean not null default false,
  active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  invoice_number text not null,
  issue_date date not null,
  due_date date not null,
  customer_name text not null,
  customer_address text not null,
  gstin text,
  notes text,
  subtotal numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null default 0,
  grand_total numeric(12,2) not null default 0,
  status public.invoice_status not null default 'draft',
  pdf_document_id uuid,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, invoice_number)
);

create table public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric(12,2) not null default 1,
  rate numeric(12,2) not null default 0,
  tax_percent numeric(5,2) not null default 0,
  sort_order integer not null default 0
);

create table public.bank_transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  bank_account_id uuid not null references public.bank_accounts(id),
  bank_import_id uuid not null references public.bank_imports(id),
  posted_at date not null,
  narration text not null,
  normalized_narration text not null,
  reference_number text not null,
  direction public.transaction_direction not null,
  amount numeric(12,2) not null,
  balance numeric(12,2) not null default 0,
  counterparty_name text,
  transaction_type public.transaction_type not null default 'other',
  category_id uuid references public.categories(id),
  gst_flag boolean not null default false,
  tds_flag boolean not null default false,
  review_status public.transaction_review_status not null default 'unreviewed',
  notes text,
  internal_memo text,
  employee_id uuid references public.employees(id),
  vendor_id uuid references public.vendors(id),
  invoice_id uuid references public.invoices(id),
  duplicate_fingerprint text not null,
  split_parent_id uuid references public.bank_transactions(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, duplicate_fingerprint)
);

create table public.saved_rules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  name text not null,
  narration_pattern text not null,
  transaction_type public.transaction_type not null,
  category_id uuid references public.categories(id),
  gst_flag boolean not null default false,
  tds_flag boolean not null default false,
  linked_employee_id uuid references public.employees(id),
  linked_vendor_id uuid references public.vendors(id),
  priority integer not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.payroll_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  payroll_month date not null,
  status public.payroll_status not null default 'draft',
  total_employees integer not null default 0,
  total_gross numeric(12,2) not null default 0,
  total_net numeric(12,2) not null default 0,
  total_employer_cost numeric(12,2) not null default 0,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  locked_at timestamptz,
  locked_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, payroll_month)
);

create table public.payroll_adjustments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  employee_id uuid not null references public.employees(id),
  payroll_month date not null,
  kind public.adjustment_kind not null,
  label text not null,
  amount numeric(12,2) not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.payroll_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  payroll_run_id uuid not null references public.payroll_runs(id) on delete cascade,
  employee_id uuid not null references public.employees(id),
  payroll_month date not null,
  paid_days numeric(6,2) not null,
  lop_days numeric(6,2) not null default 0,
  gross_pay numeric(12,2) not null,
  employee_pf numeric(12,2) not null default 0,
  employer_pf numeric(12,2) not null default 0,
  professional_tax numeric(12,2) not null default 0,
  tds numeric(12,2) not null default 0,
  other_deductions numeric(12,2) not null default 0,
  reimbursements numeric(12,2) not null default 0,
  net_pay numeric(12,2) not null,
  calc_snapshot jsonb not null,
  payslip_document_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (payroll_run_id, employee_id)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  document_kind public.document_kind not null,
  file_name text not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  linked_entity text not null,
  linked_id uuid not null,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  actor_profile_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  diff_summary text,
  diff jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.invoices add constraint invoices_pdf_document_fk foreign key (pdf_document_id) references public.documents(id);
alter table public.payroll_items add constraint payroll_items_payslip_document_fk foreign key (payslip_document_id) references public.documents(id);

create index idx_profiles_company_id on public.profiles(company_id);
create index idx_settings_company_key on public.settings(company_id, key);
create index idx_bank_imports_company_month on public.bank_imports(company_id, import_month);
create index idx_bank_transactions_review on public.bank_transactions(company_id, review_status, posted_at desc);
create index idx_bank_transactions_links on public.bank_transactions(employee_id, vendor_id, invoice_id);
create index idx_employees_company_status on public.employees(company_id, status);
create index idx_salary_structures_employee_effective on public.salary_structures(employee_id, effective_date desc);
create index idx_payroll_runs_month on public.payroll_runs(company_id, payroll_month desc);
create index idx_payroll_items_month on public.payroll_items(company_id, payroll_month);
create index idx_payroll_adjustments_month on public.payroll_adjustments(company_id, payroll_month);
create index idx_documents_link on public.documents(company_id, linked_entity, linked_id);
create index idx_audit_logs_company_time on public.audit_logs(company_id, created_at desc);

create trigger set_companies_updated_at before update on public.companies for each row execute procedure public.set_updated_at();
create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger set_settings_updated_at before update on public.settings for each row execute procedure public.set_updated_at();
create trigger set_bank_accounts_updated_at before update on public.bank_accounts for each row execute procedure public.set_updated_at();
create trigger set_categories_updated_at before update on public.categories for each row execute procedure public.set_updated_at();
create trigger set_bank_imports_updated_at before update on public.bank_imports for each row execute procedure public.set_updated_at();
create trigger set_employees_updated_at before update on public.employees for each row execute procedure public.set_updated_at();
create trigger set_salary_structures_updated_at before update on public.salary_structures for each row execute procedure public.set_updated_at();
create trigger set_vendors_updated_at before update on public.vendors for each row execute procedure public.set_updated_at();
create trigger set_invoices_updated_at before update on public.invoices for each row execute procedure public.set_updated_at();
create trigger set_bank_transactions_updated_at before update on public.bank_transactions for each row execute procedure public.set_updated_at();
create trigger set_saved_rules_updated_at before update on public.saved_rules for each row execute procedure public.set_updated_at();
create trigger set_payroll_runs_updated_at before update on public.payroll_runs for each row execute procedure public.set_updated_at();
create trigger set_payroll_adjustments_updated_at before update on public.payroll_adjustments for each row execute procedure public.set_updated_at();
create trigger set_payroll_items_updated_at before update on public.payroll_items for each row execute procedure public.set_updated_at();

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.categories enable row level security;
alter table public.bank_imports enable row level security;
alter table public.bank_transactions enable row level security;
alter table public.employees enable row level security;
alter table public.salary_structures enable row level security;
alter table public.vendors enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.saved_rules enable row level security;
alter table public.payroll_runs enable row level security;
alter table public.payroll_adjustments enable row level security;
alter table public.payroll_items enable row level security;
alter table public.documents enable row level security;
alter table public.audit_logs enable row level security;

create policy "company members can read company" on public.companies
for select using (id in (select company_id from public.profiles where id = auth.uid()));

create policy "profiles self and admins read" on public.profiles
for select using (company_id in (select company_id from public.profiles where id = auth.uid()));

create policy "admins manage profiles" on public.profiles
for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');

create policy "members can read scoped tables" on public.settings for select using (company_id in (select company_id from public.profiles where id = auth.uid()));
create policy "members can read bank accounts" on public.bank_accounts for select using (company_id in (select company_id from public.profiles where id = auth.uid()));
create policy "members can read categories" on public.categories for select using (company_id in (select company_id from public.profiles where id = auth.uid()));
create policy "members can read imports" on public.bank_imports for select using (company_id in (select company_id from public.profiles where id = auth.uid()));
create policy "members can read transactions" on public.bank_transactions for select using (company_id in (select company_id from public.profiles where id = auth.uid()));
create policy "members can read employees" on public.employees for select using (company_id in (select company_id from public.profiles where id = auth.uid()));
create policy "members can read salary structures" on public.salary_structures for select using (company_id in (select company_id from public.profiles where id = auth.uid()));
create policy "members can read vendors" on public.vendors for select using (company_id in (select company_id from public.profiles where id = auth.uid()));
create policy "members can read invoices" on public.invoices for select using (company_id in (select company_id from public.profiles where id = auth.uid()));
create policy "members can read invoice items" on public.invoice_line_items for select using (invoice_id in (select id from public.invoices where company_id in (select company_id from public.profiles where id = auth.uid())));
create policy "members can read rules" on public.saved_rules for select using (company_id in (select company_id from public.profiles where id = auth.uid()));
create policy "members can read payroll runs" on public.payroll_runs for select using (company_id in (select company_id from public.profiles where id = auth.uid()));
create policy "members can read payroll adjustments" on public.payroll_adjustments for select using (company_id in (select company_id from public.profiles where id = auth.uid()));
create policy "members can read payroll items" on public.payroll_items for select using (company_id in (select company_id from public.profiles where id = auth.uid()));
create policy "members can read documents" on public.documents for select using (company_id in (select company_id from public.profiles where id = auth.uid()));
create policy "members can read audit logs" on public.audit_logs for select using (company_id in (select company_id from public.profiles where id = auth.uid()));

create policy "finance and admin manage operations" on public.settings for all using (public.current_app_role() in ('admin', 'finance_operator')) with check (public.current_app_role() in ('admin', 'finance_operator'));
create policy "finance and admin manage bank accounts" on public.bank_accounts for all using (public.current_app_role() in ('admin', 'finance_operator')) with check (public.current_app_role() in ('admin', 'finance_operator'));
create policy "finance and admin manage categories" on public.categories for all using (public.current_app_role() in ('admin', 'finance_operator')) with check (public.current_app_role() in ('admin', 'finance_operator'));
create policy "finance and admin manage imports" on public.bank_imports for all using (public.current_app_role() in ('admin', 'finance_operator')) with check (public.current_app_role() in ('admin', 'finance_operator'));
create policy "finance and admin manage transactions" on public.bank_transactions for all using (public.current_app_role() in ('admin', 'finance_operator')) with check (public.current_app_role() in ('admin', 'finance_operator'));
create policy "finance and admin manage vendors" on public.vendors for all using (public.current_app_role() in ('admin', 'finance_operator')) with check (public.current_app_role() in ('admin', 'finance_operator'));
create policy "finance and admin manage invoices" on public.invoices for all using (public.current_app_role() in ('admin', 'finance_operator')) with check (public.current_app_role() in ('admin', 'finance_operator'));
create policy "finance and admin manage invoice items" on public.invoice_line_items for all using (public.current_app_role() in ('admin', 'finance_operator')) with check (public.current_app_role() in ('admin', 'finance_operator'));
create policy "finance and admin manage rules" on public.saved_rules for all using (public.current_app_role() in ('admin', 'finance_operator')) with check (public.current_app_role() in ('admin', 'finance_operator'));
create policy "payroll and admin manage employees" on public.employees for all using (public.current_app_role() in ('admin', 'payroll_operator')) with check (public.current_app_role() in ('admin', 'payroll_operator'));
create policy "payroll and admin manage salary structures" on public.salary_structures for all using (public.current_app_role() in ('admin', 'payroll_operator')) with check (public.current_app_role() in ('admin', 'payroll_operator'));
create policy "payroll and admin manage payroll runs" on public.payroll_runs for all using (public.current_app_role() in ('admin', 'payroll_operator')) with check (public.current_app_role() in ('admin', 'payroll_operator'));
create policy "payroll and admin manage payroll adjustments" on public.payroll_adjustments for all using (public.current_app_role() in ('admin', 'payroll_operator')) with check (public.current_app_role() in ('admin', 'payroll_operator'));
create policy "payroll and admin manage payroll items" on public.payroll_items for all using (public.current_app_role() in ('admin', 'payroll_operator')) with check (public.current_app_role() in ('admin', 'payroll_operator'));
create policy "operations upload documents" on public.documents for all using (public.current_app_role() in ('admin', 'finance_operator', 'payroll_operator')) with check (public.current_app_role() in ('admin', 'finance_operator', 'payroll_operator'));
create policy "operations write audit logs" on public.audit_logs for insert with check (public.current_app_role() in ('admin', 'finance_operator', 'payroll_operator'));
