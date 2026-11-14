import type { AttendanceRecord, Payment, Student } from "./types.js";

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

/** The students with no paid payment for `month` ("YYYY-MM"). */
export function unpaidStudents(students: Student[], payments: Payment[], month: string): Student[] {
  const paidStudentIds = new Set(
    payments.filter((p) => p.status === "paid" && p.month === month).map((p) => p.studentId),
  );
  return students.filter((s) => !paidStudentIds.has(s.id));
}
