import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/currencies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Receipt, Clock, CheckCircle } from "lucide-react";
import { DashboardCharts } from "./charts";

export default async function DashboardPage() {
  const session = await requireSession();

  const whereClause =
    session.role === "EMPLOYEE" ? { userId: session.id } : {};

  const [expenses, totalCount, pendingCount, approvedSum] = await Promise.all([
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
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Expenses"
          value={totalCount.toString()}
          icon={Receipt}
          description="All time"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(monthlyTotal, "USD")}
          icon={DollarSign}
          description={`${monthlyExpenses.length} expenses`}
        />
        <StatCard
          title="Pending Approval"
          value={pendingCount.toString()}
          icon={Clock}
          description="Awaiting review"
        />
        <StatCard
          title="Approved Total"
          value={formatCurrency(approvedSum._sum.amount || 0, "USD")}
          icon={CheckCircle}
          description="Approved & reimbursed"
        />
      </div>

      <DashboardCharts categoryData={chartData} monthlyData={monthlyData} />

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No expenses yet. Start by adding your first expense.
            </p>
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 5).map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium">{expense.description}</p>
                    <div className="flex gap-2 mt-1">
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
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(expense.amount, expense.currency)}
                    </p>
                    <StatusBadge status={expense.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "outline",
    SUBMITTED: "secondary",
    APPROVED: "default",
    REJECTED: "destructive",
    REIMBURSED: "default",
  };

  return (
    <Badge variant={variants[status] || "outline"} className="text-xs mt-1">
      {status.toLowerCase()}
    </Badge>
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
