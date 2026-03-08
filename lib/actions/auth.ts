"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

const loginSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(1, "Password is required."),
});

export interface LoginActionState {
  error: string | null;
}

export async function loginAction(_: LoginActionState, formData: FormData): Promise<LoginActionState> {
  if (!hasSupabaseEnv()) {
    return { error: "Supabase environment variables are missing." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid login details." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: "Supabase is unavailable." };
  }

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    return { error: error?.message ?? "Invalid email or password." };
  }

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", data.user.id).maybeSingle();
  if (!profile) {
    await supabase.auth.signOut();
    return { error: "Your account is not linked to a TTC Atlas profile yet." };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase?.auth.signOut();
  redirect("/login");
}
