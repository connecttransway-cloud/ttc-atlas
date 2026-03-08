import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-3xl border border-border/80 bg-white/72 px-4 py-3 text-sm text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_8px_18px_rgba(28,23,17,0.04)] outline-none transition placeholder:text-muted focus:border-accent/40 focus:bg-white focus:ring-4 focus:ring-accent-softer disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
