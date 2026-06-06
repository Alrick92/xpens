import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";

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
      <div className="flex-1 md:ml-64 flex flex-col bg-background">
        <TopBar />
        <main className="flex-1">
          <div className="p-6 pt-16 md:p-8 md:pt-8 max-w-[1280px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
