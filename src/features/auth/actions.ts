"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp, hashIp } from "@/lib/utils/request";

export type LoginState = { error?: string; email?: string };

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password").max(128),
  next: z.string().optional(),
});

/** Only allow same-site admin paths as post-login destinations (prevents open redirects). */
function safeNext(value: string | undefined): string {
  return value && /^\/admin(\/[\w\-/]*)?$/.test(value) ? value : "/admin";
}

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });
  const email = String(formData.get("email") ?? "");
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, email };

  const requestHeaders = await headers();
  const limit = await rateLimit(`login:${hashIp(getClientIp(requestHeaders))}`, RATE_LIMITS.login);
  if (!limit.allowed) return { error: "Too many sign-in attempts. Please wait a few minutes.", email };

  // Only administrators may hold a session. Same message as a bad password to avoid account enumeration.
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() }, select: { role: true } });
  if (user?.role !== "admin") return { error: "Incorrect email or password.", email };

  try {
    await auth.api.signInEmail({
      body: { email: parsed.data.email, password: parsed.data.password },
      headers: requestHeaders,
    });
  } catch (error) {
    if (error instanceof APIError) return { error: "Incorrect email or password.", email };
    console.error("[auth] sign-in failed", error);
    return { error: "Sign-in is unavailable right now. Please try again.", email };
  }
  redirect(safeNext(parsed.data.next));
}

export async function logoutAction(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
