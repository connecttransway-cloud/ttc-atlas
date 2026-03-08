import Link from "next/link";
import { BanknoteArrowDown, BriefcaseBusiness, Building2, Files, FileSpreadsheet, LayoutDashboard, ReceiptText, Settings2, ShieldCheck, Users2 } from "lucide-react";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types/domain";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bank", label: "Bank", icon: BanknoteArrowDown },
  { href: "/employees", label: "Employees", icon: Users2 },
  { href: "/payroll", label: "Payroll", icon: BriefcaseBusiness },
  { href: "/vendors", label: "Vendors", icon: Building2 },
  { href: "/invoices", label: "Invoices", icon: ReceiptText },
  { href: "/documents", label: "Documents", icon: Files },
  { href: "/exports", label: "CA Export", icon: FileSpreadsheet },
  { href: "/audit", label: "Audit", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function AppShell({ children, currentPath, profile }: { children: React.ReactNode; currentPath: string; profile: Profile }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-5 p-4 md:grid-cols-[300px_1fr] md:p-6">
        <div className="space-y-4 md:hidden">
          <div className="surface-card rounded-[30px] border border-border/80 p-4 shadow-elevated">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#17212b_0%,#1f6d68_100%)] text-sm font-semibold text-white">
                  TA
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">TTC Atlas</p>
                  <p className="text-xs text-muted">India finance operations</p>
                </div>
              </div>
              <Avatar className="h-11 w-11">
                <AvatarFallback className="bg-surface-subtle text-ink">{profile.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>

            <div className="scrollbar-none mt-4 flex gap-2 overflow-x-auto pb-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex min-w-fit items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-sm font-medium transition",
                      active
                        ? "border-transparent bg-[linear-gradient(135deg,#17212b_0%,#1f6d68_100%)] text-white shadow-[0_12px_24px_rgba(23,33,43,0.16)]"
                        : "border-border/80 bg-white/60 text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4">
              <SignOutButton className="border-border/80 bg-white/68 text-ink hover:bg-white hover:text-ink" />
            </div>
          </div>
        </div>

        <aside className="surface-panel hidden rounded-[36px] border border-white/8 p-4 text-white md:flex md:flex-col">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/12 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                TA
              </div>
              <div>
                <p className="text-sm font-semibold text-white">TTC Atlas</p>
                <p className="text-xs text-white/60">India finance operations</p>
              </div>
            </div>
            <div className="mt-5 rounded-[22px] border border-white/8 bg-white/6 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">Workspace</p>
              <p className="mt-2 text-lg font-semibold text-white">Fast month-end, without ERP drag.</p>
              <p className="mt-2 text-sm leading-6 text-white/65">Bank review, payroll, documents, and accountant exports in one quiet operating surface.</p>
            </div>
          </div>

          <nav className="mt-6 flex-1 space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-[22px] px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,rgba(31,109,104,0.34)_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                      : "text-white/65 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-2xl border transition",
                      active ? "border-white/10 bg-white/10" : "border-white/6 bg-transparent group-hover:border-white/10 group-hover:bg-white/5",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="rounded-[28px] border border-white/10 bg-white/6 p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarFallback className="bg-white/12 text-white">{profile.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-white">{profile.fullName}</p>
                <p className="text-xs capitalize text-white/60">{profile.role.replaceAll("_", " ")}</p>
              </div>
            </div>
            <div className="mt-4">
              <SignOutButton />
            </div>
          </div>
        </aside>

        <main className="space-y-6 md:space-y-7">
          <div className="rounded-[32px] border border-white/40 bg-white/20 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            <div className="rounded-[28px] border border-border/60 bg-[rgba(255,251,246,0.64)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] md:px-6 md:py-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
