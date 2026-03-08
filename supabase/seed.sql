insert into public.companies (id, legal_name, trade_name, gstin, pan, pf_registration_number, address)
values
  ('11111111-1111-1111-1111-111111111111', 'TTC Atlas India Private Limited', 'TTC Atlas', '29ABCDE1234F1Z5', 'ABCDE1234F', 'KNBNG1234567000', '3rd Floor, Indiranagar, Bengaluru, Karnataka 560038');

insert into public.categories (company_id, name, code, type) values
  ('11111111-1111-1111-1111-111111111111', 'Intercompany Funding', 'FUND', 'transfer'),
  ('11111111-1111-1111-1111-111111111111', 'Salary Payment', 'PAY', 'payroll'),
  ('11111111-1111-1111-1111-111111111111', 'Freelancer / Vendor', 'VEN', 'expense'),
  ('11111111-1111-1111-1111-111111111111', 'Office Expense', 'OPEX', 'expense'),
  ('11111111-1111-1111-1111-111111111111', 'Invoice Receipt', 'REC', 'income'),
  ('11111111-1111-1111-1111-111111111111', 'Bank Charges', 'BNK', 'expense');

insert into public.bank_accounts (company_id, bank_name, account_name, account_number_masked, ifsc, currency_code, is_primary)
values
  ('11111111-1111-1111-1111-111111111111', 'HDFC Bank', 'TTC Atlas India Operations', 'XXXXXX4201', 'HDFC0000213', 'INR', true);

insert into public.employees (company_id, employee_code, full_name, email, phone, designation, department, location, join_date, pan, uan, pf_eligible, bank_account_name, bank_account_number_masked, bank_ifsc, status)
values
  ('11111111-1111-1111-1111-111111111111', 'IND-001', 'Riya Nair', 'riya.nair@ttcatlas.com', '+91 9876543210', 'Operations Lead', 'Operations', 'Bengaluru', '2024-04-01', 'AGDPN0001A', '100200300401', true, 'Riya Nair', 'XXXXXX1188', 'HDFC0000213', 'active'),
  ('11111111-1111-1111-1111-111111111111', 'IND-002', 'Kabir Verma', 'kabir.verma@ttcatlas.com', '+91 9988776655', 'Software Engineer', 'Engineering', 'Remote', '2025-06-15', 'ABCPV2222D', null, false, 'Kabir Verma', 'XXXXXX2193', 'ICIC0000088', 'active'),
  ('11111111-1111-1111-1111-111111111111', 'IND-003', 'Neha Kulkarni', 'neha.kulkarni@ttcatlas.com', '+91 9090909090', 'Finance Analyst', 'Finance', 'Bengaluru', '2025-01-10', 'AFWPK4532E', '100200300402', true, 'Neha Kulkarni', 'XXXXXX7878', 'KKBK0000666', 'active');

insert into public.salary_structures (
  company_id,
  employee_id,
  effective_date,
  monthly_basic,
  hra,
  special_allowance,
  fixed_allowance,
  other_fixed_earnings,
  employee_pf_enabled,
  employer_pf_enabled,
  professional_tax_enabled,
  tds_enabled
)
select
  e.company_id,
  e.id,
  seed.effective_date,
  seed.monthly_basic,
  seed.hra,
  seed.special_allowance,
  seed.fixed_allowance,
  seed.other_fixed_earnings,
  seed.employee_pf_enabled,
  seed.employer_pf_enabled,
  seed.professional_tax_enabled,
  seed.tds_enabled
from (
  values
    ('IND-001', '2025-04-01'::date, 45000::numeric, 22500::numeric, 18000::numeric, 7500::numeric, 2000::numeric, true, true, true, true),
    ('IND-002', '2025-06-15'::date, 55000::numeric, 27500::numeric, 32000::numeric, 5000::numeric, 0::numeric, false, false, true, true),
    ('IND-003', '2025-01-10'::date, 38000::numeric, 19000::numeric, 14500::numeric, 4500::numeric, 1500::numeric, true, true, true, true)
) as seed (
  employee_code,
  effective_date,
  monthly_basic,
  hra,
  special_allowance,
  fixed_allowance,
  other_fixed_earnings,
  employee_pf_enabled,
  employer_pf_enabled,
  professional_tax_enabled,
  tds_enabled
)
join public.employees e
  on e.company_id = '11111111-1111-1111-1111-111111111111'
 and e.employee_code = seed.employee_code;

insert into public.vendors (company_id, name, kind, email, phone, pan, tds_applicable, active)
values
  ('11111111-1111-1111-1111-111111111111', 'Arjun Mehta', 'freelancer', 'arjun@freelance.design', '+91 9999999999', 'AASPM1234Q', true, true),
  ('11111111-1111-1111-1111-111111111111', 'Notion Labs India', 'vendor', 'apac-billing@notion.so', null, null, false, true);
