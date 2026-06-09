import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/currencies";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Receipt as ReceiptIcon } from "lucide-react";
import Link from "next/link";
import { ExpenseActions } from "./expense-actions";
import { Pagination } from "@/components/pagination";

const PAGE_SIZE = 10;

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));

  const whereClause =
    session.role === "EMPLOYEE" ? { userId: session.id } : {};

  const [expenses, totalCount] = await Promise.all([
    prisma.expense.findMany({
      where: whereClause,
      include: { category: true, project: true, user: true, lineItems: true },
      orderBy: { date: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.expense.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Expenses</h1>
          <p className="text-xs text-muted-foreground">
            {totalCount} expense{totalCount !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/expenses/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </Link>
      </div>

      {totalCount === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-xl bg-muted p-3 mb-3">
              <ReceiptIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold">No expenses yet</p>
            <p className="text-xs text-muted-foreground mt-1 text-center max-w-xs">
              Add your first expense or scan a receipt to get started.
            </p>
            <Link href="/expenses/new" className="mt-4">
              <Button size="sm">Add your first expense</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">All Expenses</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="px-4 py-2.5 text-[10px] text-muted-foreground uppercase tracking-[0.04em] font-medium">Date</th>
                  <th scope="col" className="px-4 py-2.5 text-[10px] text-muted-foreground uppercase tracking-[0.04em] font-medium">Description</th>
                  <th scope="col" className="px-4 py-2.5 text-[10px] text-muted-foreground uppercase tracking-[0.04em] font-medium">Category</th>
                  <th scope="col" className="px-4 py-2.5 text-[10px] text-muted-foreground uppercase tracking-[0.04em] font-medium">Project</th>
                  <th scope="col" className="px-4 py-2.5 text-[10px] text-muted-foreground uppercase tracking-[0.04em] font-medium text-right">Amount</th>
                  <th scope="col" className="px-4 py-2.5 text-[10px] text-muted-foreground uppercase tracking-[0.04em] font-medium">Status</th>
                  <th scope="col" className="px-4 py-2.5 text-[10px] text-muted-foreground uppercase tracking-[0.04em] font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-muted/50 transition-colors duration-150 group">
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {expense.date.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium">{expense.description}</span>
                      {expense.merchant && (
                        <span className="block text-[11px] text-muted-foreground">{expense.merchant}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {expense.category?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {expense.project?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold font-mono font-tabular whitespace-nowrap text-right">
                      {formatCurrency(expense.amount, expense.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={expense.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
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
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/expenses" />
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-muted/60 text-muted-foreground",
    SUBMITTED: "bg-[#FBE379]/15 text-[#8B7A20]",
    APPROVED: "bg-[#6B7C5E]/15 text-[#6B7C5E]",
    REJECTED: "bg-[#C4533A]/15 text-[#C4533A]",
    REIMBURSED: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.03em] ${styles[status] || styles.DRAFT}`}>
      {status.toLowerCase()}
    </span>
  );
}
