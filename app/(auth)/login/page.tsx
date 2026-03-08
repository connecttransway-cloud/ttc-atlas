import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, FileSpreadsheet, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const profile = await getCurrentProfile();
  if (profile) {
    redirect("/dashboard");
  }

  const stats = [
    { value: "15-30 min", label: "Target month-end close" },
    { value: "1 account", label: "India operating cash view" },
    { value: "PDF + ZIP", label: "Payslips, invoices, CA pack" },
  ];

  const features: Array<{ icon: LucideIcon; title: string; text: string }> = [
    { icon: BadgeIndianRupee, title: "Bank import", text: "Normalize CSVs, deduplicate rows, and clear review items quickly." },
    { icon: Sparkles, title: "Payroll", text: "Deterministic PF, PT, TDS, adjustments, approvals, and lock." },
    { icon: FileSpreadsheet, title: "CA export", text: "Monthly ZIP package with CSVs, PDFs, and supporting documents." },
  ];

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="grid w-full max-w-6xl gap-6 md:grid-cols-[1.16fr_0.84fr]">
        <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(145deg,#17212b_0%,#1d2732_38%,#21413f_100%)] p-8 text-white shadow-[0_32px_90px_rgba(15,19,25,0.24)] md:p-12">
          <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(103,163,155,0.25),transparent_58%)]" />
          <div className="absolute -right-20 top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(208,170,114,0.18)_0%,transparent_62%)]" />
          <div className="relative">
            <Badge className="border-white/10 bg-white/10 text-white" variant="default">
              TTC Atlas
            </Badge>
            <h1 className="mt-6 max-w-2xl text-5xl font-semibold tracking-[-0.05em] text-white md:text-6xl">
              Finance operations that feel calm, fast, and board-ready.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/72">
              Import the bank statement, review transactions, run payroll, generate payslips, and deliver a clean CA export from one calm workspace.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/7 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-semibold tracking-[-0.04em] text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-white/58">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-[28px] border border-white/10 bg-white/7 p-5 backdrop-blur-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-white/10 text-white">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-white">{feature.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">{feature.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/7 p-5 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">Operator flow</p>
              <p className="mt-3 text-base leading-7 text-white/76">
                Review the statement, verify payroll, export documents, and share the CA pack without getting buried in a general ledger product.
              </p>
            </div>
          </div>
        </section>

        <Card className="rounded-[40px] border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(255,251,246,0.96)_100%)] shadow-elevated">
          <CardHeader className="pb-4">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-accent-soft text-accent">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-3">
              <CardTitle className="text-3xl tracking-[-0.04em]">Secure sign in</CardTitle>
              <Badge variant="accent">Internal</Badge>
            </div>
            <CardDescription className="max-w-md leading-7">
              Use Supabase Auth email and password for finance operators, payroll operators, and read-only CA access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-[26px] border border-border/80 bg-white/60 p-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-ink">Access designed for a small, trusted team</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Admin, finance operator, payroll operator, and CA read-only permissions all map cleanly to the same workspace.
                </p>
              </div>
            </div>
            <LoginForm error={error} />
            {!hasSupabaseEnv() ? (
              <Button asChild variant="secondary" className="w-full justify-between">
                <Link href="/dashboard">
                  Demo mode fallback
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
            <p className="text-sm leading-6 text-muted">
              The app uses secure server-side auth checks for protected routes, role-aware data access, and document protection through Supabase Storage.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
