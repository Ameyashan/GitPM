/** Matches onboarding and check-username API rules. */
export function isValidUsername(username: string): boolean {
  return /^[a-z0-9_-]{3,30}$/.test(username);
}

/**
 * URL-safe slug from a display name (lowercase, hyphens, no leading/trailing hyphen).
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Ensures a slug is unique against a set of existing slugs (same algorithm as
 * {@link findUniqueSlug} in the projects API, without hitting the database).
 */
export function generateUniqueSlug(baseSlug: string, takenSlugs: ReadonlySet<string>): string {
  let slug = baseSlug;
  let attempt = 1;

  while (takenSlugs.has(slug)) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  return slug;
}
