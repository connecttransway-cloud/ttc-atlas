import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/types/database";
import { hasSupabaseEnv, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

function redirectToLogin(request: Request, error: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return redirectToLogin(request, "Supabase is not configured.");
  }

  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return redirectToLogin(request, "Email and password are required.");
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.headers.get("cookie")?.split(/; */).filter(Boolean).map((entry) => {
          const index = entry.indexOf("=");
          return {
            name: decodeURIComponent(entry.slice(0, index)),
            value: decodeURIComponent(entry.slice(index + 1)),
          };
        }) ?? [];
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirectToLogin(request, "Invalid email or password.");
  }

  return response;
}
