import type { AttendanceRecord, Group, Id, Payment, PaymentMethod, Student } from "./types.js";

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

/**
 * The students who have not paid their group's full monthly fee for `month` ("YYYY-MM").
 *
 * Adds up every paid payment the student made for that month, so installments
 * count, and compares the total with the group's fee. Unpaid records add nothing.
 *
 * If a student's group can't be found, the fee is unknown, so the student is
 * included. This list exists to surface debts: a false alarm costs the tutor a
 * glance, but a hidden debt costs them money. (Throwing would be worse: one bad
 * record would hide every other student's debt behind a crash.)
 *
 * Known limit: every student is assumed to owe the full group fee. Discounts need
 * per-student charges, which come with the charges/payments split in lesson 4.
 */
export function unpaidStudents(
  students: Student[],
  groups: Group[],
  payments: Payment[],
  month: string,
): Student[] {
  const feeByGroupId = new Map(groups.map((g) => [g.id, g.monthlyFeePiasters]));

  const paidByStudentId = new Map<Id, number>();
  for (const p of payments) {
    if (p.status !== "paid" || p.month !== month) continue;
    paidByStudentId.set(p.studentId, (paidByStudentId.get(p.studentId) ?? 0) + p.amountPiasters);
  }

  return students.filter((s) => {
    const fee = feeByGroupId.get(s.groupId);
    if (fee === undefined) return true;
    return (paidByStudentId.get(s.id) ?? 0) < fee;
  });
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
