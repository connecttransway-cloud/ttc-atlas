import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: string;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, badge, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-5 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl space-y-2">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">{eyebrow}</p> : null}
        <div className="flex items-center gap-3">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink md:text-4xl">{title}</h1>
          {badge ? <Badge variant="accent">{badge}</Badge> : null}
        </div>
        {description ? <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
