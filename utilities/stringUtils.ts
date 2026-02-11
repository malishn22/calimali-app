/**
 * Capitalizes the first letter of each word and lowercases the rest.
 * e.g. "PULL UP BAR" -> "Pull Up Bar"
 */
export function capitalizeWords(s: string): string {
  return (s ?? "")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
