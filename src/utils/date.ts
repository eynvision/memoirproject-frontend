/**
 * Human date formatting for the whole app.
 * "5 Dec 2025" — never numeric-only dates like 12/5/25, which are ambiguous
 * across regions. Tabular figures are applied at the call site via the
 * `tabular-nums` utility so columns of dates align.
 */

const formatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  return formatter.format(date);
}