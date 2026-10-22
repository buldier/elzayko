import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";

export type AdminUser = { id: string; name: string; email: string };

/** Reads and validates the session against the database. Deduplicated per request. */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export function isAdminRole(role: unknown): boolean {
  return role === "admin";
}

/** Returns the admin user or null; never throws. Use in Route Handlers. */
export async function getAdmin(): Promise<AdminUser | null> {
  const session = await getSession();
  if (!session || !isAdminRole((session.user as { role?: unknown }).role)) return null;
  return { id: session.user.id, name: session.user.name, email: session.user.email };
}

/**
 * Authorization gate for admin pages and Server Actions.
 * Redirects to /login when unauthenticated or not an administrator.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  return admin;
}
