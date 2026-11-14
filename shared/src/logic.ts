import type { AttendanceRecord } from "./types.js";

/**
 * The share of sessions attended, from 0 to 1.
 * Present and late count as attended. Excused sessions are left out entirely.
 * With no countable sessions, the rate is 0.
 */
export function attendanceRate(records: AttendanceRecord[]): number {
  let countable = 0;
  let attended = 0;

  for (const record of records) {
    if (record.status === "excused") continue;
    countable++;
    if (record.status === "present" || record.status === "late") attended++;
  }

  return countable === 0 ? 0 : attended / countable;
}
