// Domain types for Daftar. Shared by the server and the web app.
//
// Conventions:
// - Ids are plain strings.
// - Dates are ISO strings: a day is "2026-11-14", a month is "2026-11".
// - Money is a whole number of Egyptian pounds (EGP). Fees are never fractional,
//   and integers avoid floating-point rounding surprises.

export type Id = string;

/** Egyptian secondary school years: first, second, and third secondary. */
export type Grade = "sec1" | "sec2" | "sec3";

/** The Egyptian week starts on Saturday. */
export type Weekday = "sat" | "sun" | "mon" | "tue" | "wed" | "thu" | "fri";

export type AttendanceStatus = "present" | "late" | "absent" | "excused";

export type PaymentMethod = "cash" | "instapay" | "vodafone_cash";

export interface Tutor {
  id: Id;
  name: string;
  phone: string;
}

export interface Group {
  id: Id;
  tutorId: Id;
  subject: string;
  grade: Grade;
  /** The days of the week this group meets. */
  weekdays: Weekday[];
  monthlyFeeEgp: number;
}

export interface Student {
  id: Id;
  groupId: Id;
  name: string;
  parentPhone: string;
}

/** One meeting of one group on one date. */
export interface Session {
  id: Id;
  groupId: Id;
  /** "YYYY-MM-DD" */
  date: string;
}

export interface AttendanceRecord {
  sessionId: Id;
  studentId: Id;
  status: AttendanceStatus;
}

interface PaymentBase {
  id: Id;
  studentId: Id;
  /** The month this payment covers, "YYYY-MM". */
  month: string;
  amountEgp: number;
}

export interface PaidPayment extends PaymentBase {
  status: "paid";
  method: PaymentMethod;
  /** "YYYY-MM-DD" */
  paidOn: string;
}

export interface UnpaidPayment extends PaymentBase {
  status: "unpaid";
}

/**
 * A discriminated union on `status`: once you check `p.status === "paid"`,
 * TypeScript knows `p.method` and `p.paidOn` exist. An unpaid payment has
 * no method, so a "paid" payment without one cannot be written.
 */
export type Payment = PaidPayment | UnpaidPayment;
