import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";
import { Wordmark } from "@/components/layout/wordmark";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Wordmark className="text-4xl" />
          <p className="mt-3 text-sm text-muted">Studio sign-in</p>
        </div>
        <div className="border border-line bg-paper-raised p-6 sm:p-8">
          <Suspense fallback={<LoginForm />}>
            <LoginFormWithNext searchParams={searchParams} />
          </Suspense>
        </div>
        <p className="mt-8 text-center text-sm">
          <Link href="/" className="text-muted hover:text-ink">
            ← Back to the site
          </Link>
        </p>
      </div>
    </main>
  );
}

async function LoginFormWithNext({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { next } = await searchParams;
  return <LoginForm next={typeof next === "string" ? next : undefined} />;
}
