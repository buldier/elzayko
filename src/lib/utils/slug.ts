const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Converts arbitrary text to a URL-safe slug (ASCII, lowercase, hyphen separated). */
export function slugify(input: string, maxLength = 80): string {
  const slug = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
  return slug;
}

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}

/** Appends `-2`, `-3`… until `isTaken` returns false. */
export async function uniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>,
  maxLength = 80,
): Promise<string> {
  const root = slugify(base, maxLength - 6) || "untitled";
  let candidate = root;
  for (let suffix = 2; await isTaken(candidate); suffix++) {
    candidate = `${root}-${suffix}`;
  }
  return candidate;
}
