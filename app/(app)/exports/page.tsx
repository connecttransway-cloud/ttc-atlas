import { Archive, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/queries";
import { formatMonth } from "@/lib/utils";

export default async function ExportsPage() {
  const data = await getDashboardData();
  const month = data.payrollRuns[0]?.month ?? new Date().toISOString().slice(0, 7);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CA export center"
        title={`Accountant package for ${formatMonth(month)}`}
        description="One click generates a ZIP with bank CSVs, payroll register, employee master, invoices, payslips, and monthly summary."
        actions={
          <Button asChild>
            <a href={`/api/exports/ca/${month}`}>
              <Download className="h-4 w-4" />
              Download ZIP
            </a>
          </Button>
        }
      />

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {[
          "bank-transactions.csv",
          "payroll-register.csv",
          "employees.csv",
          "invoice-register.csv",
          "monthly-summary.csv",
          "payslips/*.pdf",
          "invoices/*.pdf",
          "supporting-documents/*",
        ].map((item) => (
          <Card key={item}>
            <CardHeader>
              <div className="w-fit rounded-2xl bg-accent-soft p-2 text-accent">
                <Archive className="h-4 w-4" />
              </div>
              <CardTitle className="mt-3 text-base">{item}</CardTitle>
              <CardDescription>Included in generated export package</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
