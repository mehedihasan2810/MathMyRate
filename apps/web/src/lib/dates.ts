/** Formats an ISO calendar date ("2026-09-15") for readers, in UTC so the day never shifts. */
export function formatReadableDate(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(isoDate))
    throw new RangeError(`Not an ISO calendar date: ${isoDate}`);

  return new Date(`${isoDate}T00:00:00.000Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
