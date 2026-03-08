import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-[linear-gradient(135deg,#17212b_0%,#253240_100%)] text-white shadow-[0_14px_28px_rgba(23,33,43,0.16)] hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(23,33,43,0.2)]",
        secondary:
          "border border-border/80 bg-white/72 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] hover:border-border-strong hover:bg-white/92",
        ghost: "text-muted-foreground hover:bg-white/50 hover:text-ink",
        accent:
          "border border-transparent bg-[linear-gradient(135deg,#1f6d68_0%,#194f4b_100%)] text-white shadow-[0_14px_28px_rgba(31,109,104,0.2)] hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(31,109,104,0.24)]",
        destructive: "bg-danger text-white hover:bg-danger/90",
      },
      size: {
        sm: "h-9 px-3.5",
        default: "h-11 px-4.5",
        lg: "h-12 px-5.5",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});

Button.displayName = "Button";

export { Button, buttonVariants };
