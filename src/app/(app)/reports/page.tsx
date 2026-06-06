import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/currencies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportFilters } from "./report-filters";

export default async function ReportsPage() {
  const session = await requireSession();

  const whereClause =
    session.role === "EMPLOYEE" ? { userId: session.id } : {};

  const [categories, projects, expensesByStatus] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
    prisma.expense.groupBy({
      by: ["status"],
      where: whereClause,
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const statusSummary = expensesByStatus.map((s) => ({
    status: s.status,
    count: s._count,
    total: s._sum.amount || 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Generate and export expense reports
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statusSummary.map((s) => (
          <Card key={s.status}>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {s.status}
              </p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(s.total, "USD")}
              </p>
              <p className="text-sm text-muted-foreground">
                {s.count} expense{s.count !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Report</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportFilters
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            projects={projects.map((p) => ({ id: p.id, name: p.name }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
