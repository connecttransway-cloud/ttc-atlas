import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-3xl border border-border bg-white px-4 py-3 text-sm text-ink shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none transition placeholder:text-muted focus:border-border-strong focus:ring-4 focus:ring-black/3 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
