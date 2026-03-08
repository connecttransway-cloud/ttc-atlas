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
    <Card className="rounded-[24px]">
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <CardTitle className="mt-2 text-2xl">{formatCompactCurrency(value)}</CardTitle>
        </div>
        <div className="rounded-2xl border border-border bg-surface-subtle p-2 text-muted">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </CardHeader>
      {delta ? <CardContent className="pt-0 text-sm text-muted-foreground">{delta}</CardContent> : null}
    </Card>
  );
}
