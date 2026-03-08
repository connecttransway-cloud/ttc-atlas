import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-border/80 bg-white/72 px-3.5 text-sm text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_8px_18px_rgba(28,23,17,0.04)] outline-none transition placeholder:text-muted focus:border-accent/40 focus:bg-white focus:ring-4 focus:ring-accent-softer disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
