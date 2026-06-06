"use client";

import Link from "next/link";
import { Search, Bell, HelpCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopBar() {
  return (
    <header className="h-16 flex justify-between items-center px-8 border-b border-border bg-background sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transactions, projects..."
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <button className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
          <HelpCircle className="h-5 w-5" />
        </button>
        <Link href="/expenses/new" className="ml-2">
          <Button size="sm" className="gap-1.5 text-sm">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </Link>
      </div>
    </header>
  );
}
