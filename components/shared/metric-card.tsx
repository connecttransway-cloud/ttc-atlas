import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactCurrency } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number;
  delta?: string;
}

export function MetricCard({ label, value, delta }: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden rounded-[28px]">
      <div className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,rgba(31,109,104,0)_0%,rgba(31,109,104,0.35)_48%,rgba(31,109,104,0)_100%)]" />
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <p className="inline-flex rounded-full border border-border/70 bg-white/65 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
          <CardTitle className="mt-4 text-3xl tracking-[-0.03em]">{formatCompactCurrency(value)}</CardTitle>
        </div>
        <div className="rounded-[20px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(247,241,232,0.88)_100%)] p-2.5 text-accent shadow-[0_10px_20px_rgba(31,109,104,0.08)]">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </CardHeader>
      {delta ? <CardContent className="pt-0 text-sm leading-6 text-muted-foreground">{delta}</CardContent> : null}
    </Card>
  );
}
