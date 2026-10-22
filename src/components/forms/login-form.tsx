"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { InlineAlert } from "@/components/feedback/states";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { loginAction, type LoginState } from "@/features/auth/actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={formAction} className="space-y-5">
      {state.error && <InlineAlert tone="error">{state.error}</InlineAlert>}
      <input type="hidden" name="next" value={next ?? "/admin"} />
      <Field id="login-email" label="Email">
        <Input id="login-email" name="email" type="email" autoComplete="username" required defaultValue={state.email} autoFocus />
      </Field>
      <Field id="login-password" label="Password">
        <Input id="login-password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
