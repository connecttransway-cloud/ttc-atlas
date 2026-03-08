"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/sonner";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleMagicLink() {
    const supabase = createClient();
    if (!supabase) {
      toast.error("Supabase env vars are missing.");
      return;
    }

    setIsPending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/dashboard`,
      },
    });
    setIsPending(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Magic link sent", {
      description: "Check your inbox to sign in.",
    });
  }

  async function handleGoogle() {
    const supabase = createClient();
    if (!supabase) {
      toast.error("Supabase env vars are missing.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="space-y-4">
      <Input type="email" placeholder="finance@company.com" value={email} onChange={(event) => setEmail(event.target.value)} />
      <Button className="w-full justify-between" disabled={!email || isPending} onClick={handleMagicLink}>
        {isPending ? "Sending..." : "Send magic link"}
        <ArrowRight className="h-4 w-4" />
      </Button>
      <Button className="w-full" variant="secondary" onClick={handleGoogle}>
        Continue with Google
      </Button>
    </div>
  );
}
