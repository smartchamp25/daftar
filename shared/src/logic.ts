import type { AttendanceRecord, Payment, PaymentMethod, Student } from "./types.js";

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

/**
 * Formats piasters as pounds for display: 35000 → "EGP 350", 24750 → "EGP 247.50".
 * This is the only place money is converted out of piasters.
 */
export function formatEgp(piasters: number): string {
  const sign = piasters < 0 ? "-" : "";
  const abs = Math.abs(piasters);
  const pounds = Math.floor(abs / 100);
  const rest = abs % 100;
  return rest === 0
    ? `${sign}EGP ${pounds}`
    : `${sign}EGP ${pounds}.${String(rest).padStart(2, "0")}`;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "cash",
  instapay: "InstaPay",
  vodafone_cash: "Vodafone Cash",
};

/** A one-line, human-readable summary of a payment. */
export function describePayment(p: Payment): string {
  switch (p.status) {
    case "paid":
      return `Paid ${formatEgp(p.amountPiasters)} by ${METHOD_LABELS[p.method]}`;
    case "unpaid":
      return `Owes ${formatEgp(p.amountPiasters)} for ${p.month}`;
    default: {
      // If a new status is added to Payment and not handled above,
      // `p` is no longer `never` here and this line stops compiling.
      const unhandled: never = p;
      throw new Error(`Unhandled payment: ${JSON.stringify(unhandled)}`);
    }
  }
}
