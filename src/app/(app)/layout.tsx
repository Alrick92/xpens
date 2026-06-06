import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={session.name} userRole={session.role} />
      <main className="flex-1 md:ml-64 bg-background">
        <div className="container mx-auto p-6 pt-16 md:p-8 md:pt-8">{children}</div>
      </main>
    </div>
  );
}
