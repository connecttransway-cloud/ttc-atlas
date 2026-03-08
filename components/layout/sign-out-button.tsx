import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action="/api/auth/logout" method="post">
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className={cn(
          "w-full justify-between rounded-2xl border border-white/10 bg-white/6 text-white hover:bg-white/12 hover:text-white",
          className,
        )}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </form>
  );
}
