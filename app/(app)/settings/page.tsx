import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/queries";

export default async function SettingsPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Company, banking, and payroll defaults"
        description="Single-company setup keeps the app operationally simple, but the schema remains audit-friendly and extensible."
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{data.company.legalName}</CardTitle>
            <CardDescription>Primary company record used on payslips, invoices, and export metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>{data.company.address}</p>
            <p>GSTIN: {data.company.gstin}</p>
            <p>PAN: {data.company.pan}</p>
            <p>PF registration: {data.company.pfRegistrationNumber}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{data.bankAccount.bankName}</CardTitle>
            <CardDescription>Single India bank account for funding, payroll, and operating expenses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Account: {data.bankAccount.accountName}</p>
            <p>Number: {data.bankAccount.accountNumberMasked}</p>
            <p>IFSC: {data.bankAccount.ifsc}</p>
            <Badge variant="accent">{data.bankAccount.currency}</Badge>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
