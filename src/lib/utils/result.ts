/** Uniform return type for Server Actions and services that can fail for expected reasons. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export function ok<T>(data: T, message?: string): ActionResult<T> {
  return { ok: true, data, message };
}

export function fail(error: string, fieldErrors?: Record<string, string[] | undefined>): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

/** Expected, user-facing failure thrown from services and translated to ActionResult at the edge. */
export class AppError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_FOUND" | "FORBIDDEN" | "UNAUTHORIZED" | "INVALID" | "CONFLICT" | "RATE_LIMITED" = "INVALID",
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AppError";
  }

  get status(): number {
    return codeToStatus(this.code);
  }
}

/** Converts a failed Zod parse into an AppError with per-field messages. */
export function validationError(issues: readonly { path: readonly PropertyKey[]; message: string }[]): AppError {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return new AppError(issues[0]?.message ?? "Invalid input", "INVALID", fieldErrors);
}

/** Translates thrown errors into an ActionResult; unexpected errors are logged and masked. */
export function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof AppError) return fail(error.message, error.fieldErrors);
  console.error(error);
  return fail("Something went wrong. Please try again.");
}

function codeToStatus(code: AppError["code"]): number {
  switch (code) {
    case "NOT_FOUND":
      return 404;
    case "FORBIDDEN":
      return 403;
    case "UNAUTHORIZED":
      return 401;
    case "CONFLICT":
      return 409;
    case "RATE_LIMITED":
      return 429;
    default:
      return 400;
  }
}
