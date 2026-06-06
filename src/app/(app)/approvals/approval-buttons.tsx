"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { approveExpenseAction } from "@/app/actions/expenses";

export function ApprovalButtons({ expenseId }: { expenseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handleAction(status: "APPROVED" | "REJECTED") {
    setLoading(status === "APPROVED" ? "approve" : "reject");
    const result = await approveExpenseAction(expenseId, status);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        status === "APPROVED" ? "Expense approved" : "Expense rejected"
      );
      router.refresh();
    }
    setLoading(null);
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button
        size="sm"
        variant="outline"
        className="text-destructive border-destructive/30 hover:bg-destructive/10"
        disabled={loading !== null}
        onClick={() => handleAction("REJECTED")}
      >
        {loading === "reject" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </Button>
      <Button
        size="sm"
        disabled={loading !== null}
        onClick={() => handleAction("APPROVED")}
      >
        {loading === "approve" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4 mr-1" />
        )}
        Approve
      </Button>
    </div>
  );
}
