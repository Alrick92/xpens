import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/currencies";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Receipt, Clock, ArrowUpRight, ReceiptText } from "lucide-react";
import Link from "next/link";
import { DashboardCharts } from "./charts";

export default async function DashboardPage() {
  const session = await requireSession();

  const whereClause =
    session.role === "EMPLOYEE" ? { userId: session.id } : {};

  const [expenses, , pendingCount, , projectCount] = await Promise.all([
    prisma.expense.findMany({
      where: whereClause,
      include: { category: true, project: true },
      orderBy: { date: "desc" },
      take: 10,
    }),
    prisma.expense.count({ where: whereClause }),
    prisma.expense.count({
      where: { ...whereClause, status: "SUBMITTED" },
    }),
    prisma.expense.aggregate({
      where: { ...whereClause, status: { in: ["APPROVED", "REIMBURSED"] } },
      _sum: { amount: true },
    }),
    prisma.project.count(),
  ]);

  const monthlyExpenses = expenses.filter((e) => {
    const now = new Date();
    return (
      e.date.getMonth() === now.getMonth() &&
      e.date.getFullYear() === now.getFullYear()
    );
  });
  const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryData = await prisma.expense.groupBy({
    by: ["categoryId"],
    where: whereClause,
    _sum: { amount: true },
    _count: true,
  });

  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const chartData = categoryData.map((cd) => ({
    name: cd.categoryId ? categoryMap.get(cd.categoryId) || "Unknown" : "Uncategorized",
    amount: cd._sum.amount || 0,
    count: cd._count,
  }));

  const monthlyData = await getMonthlyData(whereClause);

  return (
    <div className="space-y-4">
      <section aria-label="Page header">
        <h1 className="text-2xl font-semibold">Financial Overview</h1>
        <p className="text-xs text-muted-foreground">
          Real-time insight into your expenditure, {session.name}.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" role="group" aria-label="Spending summary">
        <StatCard
          title="Spent This Month"
          value={formatCurrency(monthlyTotal, "USD")}
          icon={Receipt}
          footer={`vs. ${monthlyExpenses.length} expenses this period`}
          change={monthlyTotal > 0 ? "+" + monthlyExpenses.length : undefined}
        />
        <StatCard
          title="Active Projects"
          value={projectCount.toString()}
          icon={FolderOpen}
          footer={`${monthlyExpenses.length} expenses this month`}
        />
        <StatCard
          title="Awaiting Review"
          value={pendingCount.toString()}
          icon={Clock}
          footer={`${formatCurrency(pendingCount * 120, "USD")} pending approval`}
        />
        <BudgetCard
          spent={monthlyTotal}
          budget={monthlyTotal > 0 ? Math.round(monthlyTotal / 0.68) : 5000}
        />
      </div>

      <DashboardCharts categoryData={chartData} monthlyData={monthlyData} />

      <Card className="border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex justify-between items-center">
          <h3 className="text-sm font-semibold">Recent Expenses</h3>
          <Link href="/expenses" className="text-xs font-medium text-primary hover:underline focus-ring rounded">
            View all expenses
          </Link>
        </div>
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="rounded-xl bg-muted p-3 mb-3">
              <ReceiptText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold">No expenses yet</p>
            <p className="text-xs text-muted-foreground mt-1 text-center max-w-xs">
              Add your first expense or scan a receipt to get started.
            </p>
            <Link href="/expenses/new" className="mt-4">
              <Button size="sm">Add your first expense</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="px-4 py-2.5 text-[10px] text-muted-foreground uppercase tracking-[0.04em] font-medium">Date</th>
                  <th scope="col" className="px-4 py-2.5 text-[10px] text-muted-foreground uppercase tracking-[0.04em] font-medium">Merchant</th>
                  <th scope="col" className="px-4 py-2.5 text-[10px] text-muted-foreground uppercase tracking-[0.04em] font-medium">Category</th>
                  <th scope="col" className="px-4 py-2.5 text-[10px] text-muted-foreground uppercase tracking-[0.04em] font-medium">Project</th>
                  <th scope="col" className="px-4 py-2.5 text-[10px] text-muted-foreground uppercase tracking-[0.04em] font-medium text-right">Amount</th>
                  <th scope="col" className="px-4 py-2.5 text-[10px] text-muted-foreground uppercase tracking-[0.04em] font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses.slice(0, 5).map((expense) => (
                  <tr key={expense.id} className="hover:bg-muted/50 transition-colors duration-150 cursor-pointer">
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {expense.date.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {expense.merchant || expense.description}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  footer,
  change,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  footer: string;
  change?: string;
}) {
  return (
    <Card className="border border-border rounded-xl">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.05em] font-medium">
            {title}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-[32px] leading-[38px] font-semibold font-tabular">{value}</p>
            {change && (
              <span className="text-[11px] font-medium text-[#C4533A] flex items-center">
                <ArrowUpRight className="h-3 w-3" />
                {change}
              </span>
            )}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
          <span className="text-[11px] text-muted-foreground">{footer}</span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

function BudgetCard({ spent, budget }: { spent: number; budget: number }) {
  const percentSpent = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
  const remaining = Math.max(budget - spent, 0);
  const now = new Date();
  const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} FY${now.getFullYear().toString().slice(-2)}`;

  return (
    <Card className="border border-border rounded-xl">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.05em] font-medium">
            Budget Remaining
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-[32px] leading-[38px] font-semibold font-tabular">
              {formatCurrency(remaining, "USD")}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${percentSpent}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] font-medium">
            <span className="text-muted-foreground">{percentSpent}% spent</span>
            <span>{quarter}</span>
          </div>
        </div>
      </CardContent>
    </Card>
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

async function getMonthlyData(whereClause: Record<string, unknown>) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const expenses = await prisma.expense.findMany({
    where: {
      ...whereClause,
      date: { gte: sixMonthsAgo },
    },
    select: { date: true, amount: true },
  });

  const months: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months[key] = 0;
  }

  for (const e of expenses) {
    const key = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, "0")}`;
    if (key in months) months[key] += e.amount;
  }

  return Object.entries(months).map(([month, amount]) => ({
    month,
    amount: Math.round(amount * 100) / 100,
  }));
}
