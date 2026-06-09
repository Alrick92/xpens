"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Send, Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  deleteExpenseAction,
  submitExpenseAction,
} from "@/app/actions/expenses";
import { useRouter } from "next/navigation";
import type { Role, ExpenseStatus } from "@prisma/client";

interface ExpenseActionsProps {
  expenseId: string;
  status: ExpenseStatus;
  isOwner: boolean;
  userRole: Role;
}

export function ExpenseActions({
  expenseId,
  status,
  isOwner,
  userRole,
}: ExpenseActionsProps) {
  const router = useRouter();

  const canEdit = isOwner && status === "DRAFT";
  const canSubmit = isOwner && status === "DRAFT";
  const canDelete =
    (isOwner && (status === "DRAFT" || status === "REJECTED")) ||
    userRole === "ADMIN";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canEdit && (
          <DropdownMenuItem
            onClick={() => router.push(`/expenses/${expenseId}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {canSubmit && (
          <DropdownMenuItem
            onClick={async () => {
              const result = await submitExpenseAction(expenseId);
              if (result.error) {
                toast.error(result.error);
              } else {
                toast.success("Expense submitted for approval");
                router.refresh();
              }
            }}
          >
            <Send className="mr-2 h-4 w-4" />
            Submit for Approval
          </DropdownMenuItem>
        )}
        {canDelete && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={async () => {
              const result = await deleteExpenseAction(expenseId);
              if (result.error) {
                toast.error(result.error);
              } else {
                toast.success("Expense deleted");
                router.refresh();
              }
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
