"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { registerAction } from "@/app/actions/auth";
import { Loader2, ScanLine, Users, BarChart3 } from "lucide-react";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const password = formData.get("password") as string;
    const confirm = formData.get("confirmPassword") as string;
    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    const result = await registerAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/auth-bg.jpg"
          alt="Financial dashboard on laptop"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#4a5a3e]/70 via-[#5c6b4f]/60 to-[#3a4a2e]/75" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Xpen<span className="text-white/70">S</span>
            </h1>
            <p className="text-sm text-white/50 mt-1">Smart Expense Management</p>
          </div>
          <div>
            <h2 className="text-4xl font-bold leading-tight">
              Your expenses,
              <br />
              <span className="text-white/80">organized.</span>
            </h2>
            <p className="mt-4 text-base text-white/60 max-w-sm leading-relaxed">
              Join teams already saving hours on expense management with AI-powered automation.
            </p>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-white/70">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10">
                  <ScanLine className="h-4 w-4" />
                </div>
                <span className="text-sm">AI receipt scanning with ParseFlow</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-sm">Team workflows & approval chains</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <span className="text-sm">Real-time analytics & reports</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-white/30">
            Photo by{" "}
            <a href="https://unsplash.com/@carlheyerdahl" className="underline" target="_blank" rel="noopener noreferrer">
              Carl Heyerdahl
            </a>{" "}
            on Unsplash
          </p>
        </div>
      </div>
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 bg-background">
        <Card className="w-full max-w-md border-0 shadow-none">
          <CardHeader className="text-center pb-2">
            <div className="lg:hidden mb-4">
              <h1 className="text-2xl font-bold text-primary">
                Xpen<span className="text-primary/60">S</span>
              </h1>
            </div>
            <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
            <CardDescription>Start tracking expenses with XpenS</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required className="h-11" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="8+ characters" required minLength={8} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repeat" required minLength={8} className="h-11" />
                </div>
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
