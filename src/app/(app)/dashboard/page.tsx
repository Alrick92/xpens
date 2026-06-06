import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/currencies";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Receipt, Clock, ArrowUpRight } from "lucide-react";
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
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold">Financial Overview</h1>
        <p className="text-muted-foreground">
          Real-time insight into your expenditure, {session.name}.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Spent This Month"
          value={formatCurrency(monthlyTotal, "USD")}
          icon={Receipt}
          footer={`vs. ${monthlyExpenses.length} expenses this period`}
          change={monthlyTotal > 0 ? "+" + monthlyExpenses.length : undefined}
        />
        <StatCard
          title="Active Projects"
          value={projectCount.toString()}
          icon={DollarSign}
          footer={`${monthlyExpenses.length} expenses this month`}
        />
        <StatCard
          title="Pending Receipts"
          value={pendingCount.toString()}
          icon={Clock}
          footer={`${formatCurrency(pendingCount * 120, "USD")} awaiting approval`}
        />
        <BudgetCard
          spent={monthlyTotal}
          budget={monthlyTotal > 0 ? Math.round(monthlyTotal / 0.68) : 5000}
        />
      </div>

      <DashboardCharts categoryData={chartData} monthlyData={monthlyData} />

      <Card className="border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="font-medium">Recent Expenses</h3>
          <Link href="/expenses" className="text-sm font-medium text-primary hover:underline">
            View All History
          </Link>
        </div>
        {expenses.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No expenses yet. Start by adding your first expense.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="px-6 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Date</th>
                  <th className="px-6 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Merchant</th>
                  <th className="px-6 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Category</th>
                  <th className="px-6 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Project</th>
                  <th className="px-6 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Amount</th>
                  <th className="px-6 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses.slice(0, 5).map((expense) => (
                  <tr key={expense.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {expense.date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {expense.merchant || expense.description}
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
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {title}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-[30px] leading-9 font-semibold">{value}</p>
            {change && (
              <span className="text-xs font-medium text-red-500 flex items-center">
                <ArrowUpRight className="h-3 w-3" />
                {change}
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{footer}</span>
          <Icon className="h-5 w-5 text-muted-foreground" />
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
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Remaining Budget
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-[30px] leading-9 font-semibold">
              {formatCurrency(remaining, "USD")}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div
              className="bg-foreground h-full rounded-full transition-all duration-500"
              style={{ width: `${percentSpent}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs font-medium">
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
