import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Receipt, BarChart3, Users, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 h-16 border-b border-border bg-card flex items-center">
        <div className="container mx-auto flex items-center justify-between px-8">
          <h1 className="text-xl font-bold tracking-tight">XpenS</h1>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="text-sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              Simplify your
              <br />
              expense workflow
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              AI-powered expense tracking for teams and businesses. Scan receipts,
              manage approvals, and generate reports — all in one place.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg" className="text-sm">
                  Start Tracking Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border py-20 lg:py-24">
          <div className="container mx-auto px-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
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
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between">
      <div>
        <div className="mb-4 inline-flex rounded-lg bg-secondary p-2.5">
          <Icon className="h-5 w-5 text-secondary-foreground" />
        </div>
        <h3 className="mb-2 font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
