import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { NewExpenseForm } from "./form";

export default async function NewExpensePage() {
  await requireSession();

  const [categories, projects] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Expense</h1>
        <p className="text-muted-foreground">
          Upload a receipt to auto-fill or enter details manually
        </p>
      </div>
      <NewExpenseForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        projects={projects.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
