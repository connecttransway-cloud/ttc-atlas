"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function LoginForm({ error }: { error?: string }) {
  const action = "/api/auth/login";

  return (
    <form action={action} method="post" className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input id="email" name="email" type="email" placeholder="finance@company.com" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="Enter your password" autoComplete="current-password" required />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button className="w-full justify-between" type="submit" variant="accent">
        Sign in
        <ArrowRight className="h-4 w-4" />
      </Button>
      <p className="text-xs leading-6 text-muted">
        Email and password sign-in is enabled for operators and CA users through Supabase Auth.
      </p>
    </form>
  );
}
