insert into storage.buckets (id, name, public)
values
  ('statements', 'statements', false),
  ('documents', 'documents', false),
  ('payslips', 'payslips', false),
  ('invoices', 'invoices', false)
on conflict (id) do nothing;

create policy "authenticated users can read private files"
on storage.objects for select
using (bucket_id in ('statements', 'documents', 'payslips', 'invoices') and auth.role() = 'authenticated');

create policy "finance and payroll operators can upload private files"
on storage.objects for insert
with check (
  bucket_id in ('statements', 'documents', 'payslips', 'invoices')
  and exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'finance_operator', 'payroll_operator')
  )
);
