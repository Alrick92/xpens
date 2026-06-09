import { NextRequest, NextResponse } from "next/server";
import { getActiveSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/currencies";

export async function GET(request: NextRequest) {
  const session = await getActiveSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") || "csv";
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const projectId = searchParams.get("projectId");
  const categoryId = searchParams.get("categoryId");

  const where: Record<string, unknown> = {};

  if (session.role === "EMPLOYEE") {
    where.userId = session.id;
  }
  if (status && status !== "all") where.status = status;
  if (projectId && projectId !== "all") where.projectId = projectId;
  if (categoryId && categoryId !== "all") where.categoryId = categoryId;
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, Date>).gte = new Date(from);
    if (to) (where.date as Record<string, Date>).lte = new Date(to);
  }

  const expenses = await prisma.expense.findMany({
    where,
    include: { category: true, project: true, user: true },
    orderBy: { date: "desc" },
  });

  if (format === "csv") {
    const header =
      "Date,Description,Merchant,Amount,Currency,Category,Project,Status,Submitted By\n";
    const esc = (s: string) => s.replace(/"/g, '""');
    const rows = expenses
      .map(
        (e) =>
          `${e.date.toISOString().split("T")[0]},"${esc(e.description)}","${esc(e.merchant || "")}",${e.amount},${e.currency},"${esc(e.category?.name || "")}","${esc(e.project?.name || "")}",${e.status},"${esc(e.user.name)}"`
      )
      .join("\n");

    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="xpens-report-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  const totalsByCategory: Record<string, number> = {};
  let grandTotal = 0;

  for (const e of expenses) {
    const cat = e.category?.name || "Uncategorized";
    totalsByCategory[cat] = (totalsByCategory[cat] || 0) + e.amount;
    grandTotal += e.amount;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    totalExpenses: expenses.length,
    grandTotal: formatCurrency(grandTotal, "USD"),
    byCategory: totalsByCategory,
    expenses: expenses.map((e) => ({
      date: e.date.toISOString().split("T")[0],
      description: e.description,
      merchant: e.merchant,
      amount: formatCurrency(e.amount, e.currency),
      category: e.category?.name,
      project: e.project?.name,
      status: e.status,
      submittedBy: e.user.name,
    })),
  };

  return NextResponse.json(report);
}
