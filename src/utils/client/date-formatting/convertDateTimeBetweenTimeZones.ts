import { DateTime } from "luxon";

/**
 * Converts a given date and time from one UTC offset timezone to another,
 * and returns the converted date in "yyyy-MM-dd" format.
 *
 * @param fromTimeZone - Source timezone (e.g., "UTC+06:00")
 * @param toTimeZone - Target timezone (e.g., "UTC+02:00")
 * @param dateStr - ISO date string (e.g., "2025-05-13T18:00:00.000+00:00")
 * @param timeStr - Time string (e.g., "11:00 PM")
 * @returns Converted date string in "yyyy-MM-dd" format
 */
export function convertDateTimeBetweenTimeZones(
  fromTimeZone: string,
  toTimeZone: string,
  dateStr: string,
  timeStr: string
): string {
  if (!dateStr || !timeStr) {
    return "";
  }

  const normalizedFromZone = normalizeUtcOffset(fromTimeZone);
  const normalizedToZone = normalizeUtcOffset(toTimeZone);

  // Step 1: Convert ISO dateStr to source timezone
  const dateInFromZone = DateTime.fromISO(dateStr, { zone: "utc" }).setZone(normalizedFromZone);

  // Step 2: Extract date part (yyyy-MM-dd)
  const datePart = dateInFromZone.toFormat("yyyy-MM-dd");

  // Step 3: Combine datePart with time string (like "11:00 PM")
  const combinedDateTime = `${datePart} ${timeStr}`;

  // Step 4: Parse the combined string as a datetime in the source timezone
  const sourceDateTime = DateTime.fromFormat(
    combinedDateTime,
    "yyyy-MM-dd hh:mm a",
    { zone: normalizedFromZone }
  );

  if (!sourceDateTime.isValid) {
    console.error(sourceDateTime.invalidExplanation || "Invalid datetime format");
    throw new Error("Invalid source date-time parsing.");
  }

  // Step 5: Convert to target timezone
  const targetDateTime = sourceDateTime.setZone(normalizedToZone);

  // Step 6: Return the converted date in desired format
  return targetDateTime.toFormat("yyyy-MM-dd");
}

/**
 * Normalizes a UTC offset string from "UTC+06:00" to "UTC+6"
 * which Luxon can understand.
 *
 * @param offset - The UTC offset string (e.g., "UTC+06:00")
 * @returns Normalized timezone string (e.g., "UTC+6")
 */
function normalizeUtcOffset(offset: string): string {
  return offset.replace(":00", "").replace("UTC", "UTC");
}