import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/currencies";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApprovalButtons } from "./approval-buttons";

export default async function ApprovalsPage() {
  const session = await requireSession();

  if (session.role !== "ADMIN" && session.role !== "MANAGER") {
    redirect("/dashboard");
  }

  const pendingExpenses = await prisma.expense.findMany({
    where: { status: "SUBMITTED" },
    include: { user: true, category: true, project: true },
    orderBy: { createdAt: "asc" },
  });

  const recentDecisions = await prisma.expense.findMany({
    where: {
      approvedById: session.id,
      status: { in: ["APPROVED", "REJECTED", "REIMBURSED"] },
    },
    include: { user: true, category: true },
    orderBy: { approvedAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve expense submissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Pending Approval ({pendingExpenses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingExpenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No expenses pending approval
            </p>
          ) : (
            <div className="space-y-4">
              {pendingExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{expense.description}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {expense.date.toLocaleDateString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        &middot; by {expense.user.name}
                      </span>
                      {expense.merchant && (
                        <span className="text-sm text-muted-foreground">
                          &middot; {expense.merchant}
                        </span>
                      )}
                      {expense.category && (
                        <Badge variant="secondary" className="text-xs">
                          {expense.category.name}
                        </Badge>
                      )}
                    </div>
                    {expense.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        {expense.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold">
                      {formatCurrency(expense.amount, expense.currency)}
                    </p>
                  </div>
                  <ApprovalButtons expenseId={expense.id} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {recentDecisions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDecisions.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium text-sm">{expense.description}</p>
                    <span className="text-xs text-muted-foreground">
                      {expense.user.name} &middot;{" "}
                      {expense.approvedAt?.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">
                      {formatCurrency(expense.amount, expense.currency)}
                    </span>
                    <Badge
                      variant={
                        expense.status === "APPROVED" || expense.status === "REIMBURSED"
                          ? "default"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {expense.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
