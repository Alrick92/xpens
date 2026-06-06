import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";
import { CategoryManager } from "./category-manager";
import { TeamMembers } from "./team-members";

export default async function SettingsPage() {
  const session = await requireSession();

  const [user, categories, users] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    session.role === "ADMIN"
      ? prisma.user.findMany({
          select: { id: true, name: true, email: true, role: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve([]),
  ]);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and workspace
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            userId={user.id}
            name={user.name}
            email={user.email}
            defaultCurrency={user.defaultCurrency}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryManager
            categories={categories.map((c) => ({
              id: c.id,
              name: c.name,
              isDefault: c.isDefault,
            }))}
            isAdmin={session.role === "ADMIN"}
          />
        </CardContent>
      </Card>

      {session.role === "ADMIN" && users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamMembers
              users={users.map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                createdAt: u.createdAt.toISOString(),
              }))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
