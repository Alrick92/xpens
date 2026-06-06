import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Receipt, BarChart3, Users, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              X
            </div>
            <span className="text-xl font-bold tracking-tight">XpenS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Simplify your expenses
            <br />
            <span className="text-muted-foreground">with XpenS</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            AI-powered expense tracking for freelancers, teams, and businesses.
            Scan receipts, track expenses, manage approvals, and generate
            reports — all in one place.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                <Zap className="h-4 w-4" />
                Start Tracking Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t bg-muted/50 py-20">
          <div className="container mx-auto px-6">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={Receipt}
                title="AI Receipt Scanning"
                description="Upload a receipt photo or PDF and let AI extract merchant, amount, tax, and line items automatically."
              />
              <FeatureCard
                icon={BarChart3}
                title="Expense Reports"
                description="Generate detailed reports by date, category, or project. Export to CSV for accounting."
              />
              <FeatureCard
                icon={Users}
                title="Team Management"
                description="Invite team members, assign roles, and manage expense approvals in one shared workspace."
              />
              <FeatureCard
                icon={Zap}
                title="Multi-Currency"
                description="Track expenses in 20+ currencies. Perfect for international teams and freelancers."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} XpenS. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
