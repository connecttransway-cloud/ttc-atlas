"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { Download, Lock, PlayCircle } from "lucide-react";
import { lockPayrollRunAction, recalculatePayrollRunAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export function PayrollActions({ month, canLock }: { month: string; canLock: boolean }) {
  const router = useRouter();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        disabled={isRecalculating || isLocking}
        onClick={() => {
          setIsRecalculating(true);
          startTransition(async () => {
            const result = await recalculatePayrollRunAction(month);
            setIsRecalculating(false);
            if (!result.ok) {
              toast.error(result.message);
              return;
            }
            toast.success(result.message);
            router.refresh();
          });
        }}
      >
        <PlayCircle className="h-4 w-4" />
        {isRecalculating ? "Recalculating..." : "Recalculate"}
      </Button>
      <Button asChild variant="secondary">
        <a href={`/api/exports/ca/${month}`}>
          <Download className="h-4 w-4" />
          Bank sheet
        </a>
      </Button>
      <Button
        disabled={!canLock || isLocking || isRecalculating}
        onClick={() => {
          setIsLocking(true);
          startTransition(async () => {
            const result = await lockPayrollRunAction(month);
            setIsLocking(false);
            if (!result.ok) {
              toast.error(result.message);
              return;
            }
            toast.success(result.message);
            router.refresh();
          });
        }}
      >
        <Lock className="h-4 w-4" />
        {isLocking ? "Locking..." : "Lock month"}
      </Button>
    </>
  );
}
