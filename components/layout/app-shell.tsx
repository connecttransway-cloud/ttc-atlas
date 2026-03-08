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
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-6 p-4 md:grid-cols-[280px_1fr] md:p-6">
        <aside className="surface-panel hidden rounded-[32px] border border-white/60 p-4 md:flex md:flex-col">
          <div className="flex items-center gap-3 rounded-[26px] border border-border bg-white px-4 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-ink text-sm font-semibold text-white">TA</div>
            <div>
              <p className="text-sm font-semibold text-ink">TTC Atlas</p>
              <p className="text-xs text-muted">India finance operations</p>
            </div>
          </div>

          <nav className="mt-6 flex-1 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    active ? "bg-white text-ink shadow-sm" : "text-muted-foreground hover:bg-white/70 hover:text-ink",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="rounded-[24px] border border-border bg-white p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{profile.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-ink">{profile.fullName}</p>
                <p className="text-xs capitalize text-muted">{profile.role.replaceAll("_", " ")}</p>
              </div>
            </div>
            <div className="mt-4">
              <SignOutButton />
            </div>
          </div>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
