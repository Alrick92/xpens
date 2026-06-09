import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/currencies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen } from "lucide-react";
import { NewProjectDialog } from "./new-project-dialog";

export default async function ProjectsPage() {
  await requireSession();

  const projects = await prisma.project.findMany({
    include: {
      _count: { select: { expenses: true } },
      expenses: { select: { amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-xs text-muted-foreground">
            Organize expenses by project or client
          </p>
        </div>
        <NewProjectDialog />
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-xl bg-muted p-3 mb-3">
              <FolderOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold">No projects yet</p>
            <p className="text-xs text-muted-foreground mt-1 text-center max-w-xs">
              Create your first project to start organizing expenses.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const totalSpent = project.expenses.reduce(
              (sum, e) => sum + e.amount,
              0
            );
            const budgetUsed = project.budget
              ? (totalSpent / project.budget) * 100
              : null;

            return (
              <Card key={project.id} className="border border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant={project.isActive ? "default" : "secondary"}>
                      {project.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expenses</span>
                    <span className="font-medium">{project._count.expenses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Spent</span>
                    <span className="font-medium">
                      {formatCurrency(totalSpent, project.currency)}
                    </span>
                  </div>
                  {project.budget && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-medium">
                          {formatCurrency(project.budget, project.currency)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Budget Used</span>
                          <span>{budgetUsed?.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              (budgetUsed || 0) > 90
                                ? "bg-destructive"
                                : (budgetUsed || 0) > 70
                                  ? "bg-yellow-500"
                                  : "bg-primary"
                            }`}
                            style={{
                              width: `${Math.min(budgetUsed || 0, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
