import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/currencies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "outline",
    SUBMITTED: "secondary",
    APPROVED: "default",
    REJECTED: "destructive",
    REIMBURSED: "default",
  };

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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-lg font-medium">No expenses yet</p>
            <p className="text-muted-foreground mt-1">
              Add your first expense or scan a receipt to get started
            </p>
            <Link href="/expenses/new" className="mt-4">
              <Button>Add Your First Expense</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {expense.description}
                      </p>
                      {expense.parseConfidence !== null && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          AI {Math.round(expense.parseConfidence * 100)}%
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {expense.date.toLocaleDateString()}
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
                      {expense.project && (
                        <Badge variant="outline" className="text-xs">
                          {expense.project.name}
                        </Badge>
                      )}
                      {session.role !== "EMPLOYEE" && (
                        <span className="text-xs text-muted-foreground">
                          by {expense.user.name}
                        </span>
                      )}
                    </div>
                    {expense.lineItems.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {expense.lineItems.length} line item
                        {expense.lineItems.length !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold">
                      {formatCurrency(expense.amount, expense.currency)}
                    </p>
                    <Badge
                      variant={statusColors[expense.status] || "outline"}
                      className="text-xs mt-1"
                    >
                      {expense.status.toLowerCase()}
                    </Badge>
                  </div>
                  <ExpenseActions
                    expenseId={expense.id}
                    status={expense.status}
                    isOwner={expense.userId === session.id}
                    userRole={session.role}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
