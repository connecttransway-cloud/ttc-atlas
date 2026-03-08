import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="grid w-full max-w-5xl gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[36px] border border-white/60 bg-[linear-gradient(135deg,#ffffff_0%,#f4f5f7_100%)] p-8 shadow-elevated md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">TTC Atlas</p>
          <h1 className="mt-6 max-w-xl text-5xl font-semibold tracking-tight text-ink">
            India finance operations, designed for fast month-end.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Import the bank statement, review transactions, run payroll, generate payslips, and deliver a clean CA export from one calm workspace.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["Bank import", "Deduplicate rows, apply saved rules, and review exceptions."],
              ["Payroll", "Deterministic PF, PT, TDS, adjustments, approvals, and lock."],
              ["CA export", "ZIP package with CSVs, PDFs, and supporting documents."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-[24px] border border-border bg-white/80 p-5">
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <Card className="rounded-[36px] border-white/60">
          <CardHeader>
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-accent-soft text-accent">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl">Secure sign in</CardTitle>
            <CardDescription>Use Supabase Auth with Google or email magic link for your internal operators and CA users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginForm />
            <Button asChild variant="ghost" className="w-full justify-between">
              <Link href="/dashboard">
                Demo mode fallback
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-sm leading-6 text-muted">
              Supabase Auth is wired for magic link and Google OAuth. If env vars are absent, the app still falls back to demo mode for local design review.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
