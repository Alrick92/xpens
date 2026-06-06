import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/currencies";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Receipt as ReceiptIcon } from "lucide-react";
import Link from "next/link";
import { ExpenseActions } from "./expense-actions";

export default async function ExpensesPage() {
  const session = await requireSession();

  const whereClause =
    session.role === "EMPLOYEE" ? { userId: session.id } : {};

  const [expenses] = await Promise.all([
    prisma.expense.findMany({
      where: whereClause,
      include: { category: true, project: true, user: true, lineItems: true },
      orderBy: { date: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">
            {expenses.length} expense{expenses.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/expenses/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </Link>
      </div>

      {expenses.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="rounded-xl bg-secondary p-3 mb-4">
              <ReceiptIcon className="h-6 w-6 text-secondary-foreground" />
            </div>
            <p className="text-lg font-semibold">No expenses yet</p>
            <p className="text-muted-foreground mt-1 text-center max-w-sm">
              Add your first expense or scan a receipt to get started
            </p>
            <Link href="/expenses/new" className="mt-6">
              <Button>Add Your First Expense</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-medium">All Expenses</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="px-6 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Date</th>
                  <th className="px-6 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Description</th>
                  <th className="px-6 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Category</th>
                  <th className="px-6 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Project</th>
                  <th className="px-6 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Amount</th>
                  <th className="px-6 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Status</th>
                  <th className="px-6 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {expense.date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium">{expense.description}</span>
                      {expense.merchant && (
                        <span className="block text-xs text-muted-foreground">{expense.merchant}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {expense.category?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {expense.project?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold font-mono whitespace-nowrap">
                      {formatCurrency(expense.amount, expense.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={expense.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ExpenseActions
                        expenseId={expense.id}
                        status={expense.status}
                        isOwner={expense.userId === session.id}
                        userRole={session.role}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-muted text-muted-foreground border-border",
    SUBMITTED: "bg-secondary text-secondary-foreground border-border",
    APPROVED: "bg-green-50 text-green-700 border-green-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    REIMBURSED: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${styles[status] || styles.DRAFT}`}>
      {status.toLowerCase()}
    </span>
  );
}
