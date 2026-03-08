/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type { AppRole, Profile } from "@/lib/types/domain";

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const db = supabase as any;

  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) return null;

  const admin = ((await createServiceRoleClient()) ?? supabase) as any;

  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    role: profile.role,
  };
}

export async function requireProfile() {
  const profile = await getCurrentProfile();
  if (!profile && hasSupabaseEnv()) {
    redirect("/login");
  }

  return profile;
}

export function assertRole(role: AppRole | AppRole[], actual: AppRole) {
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(actual)) {
    throw new Error("Unauthorized");
  }
}
