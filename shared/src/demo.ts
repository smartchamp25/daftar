import { attendanceRate, describePayment, formatEgp, unpaidStudents } from "./logic.js";
import type { AttendanceRecord, Group, Payment, Session, Student, Tutor } from "./types.js";

// ---- Fake data -------------------------------------------------------------

const tutor: Tutor = { id: "t1", name: "Mr. Hany", phone: "01000000001" };

const group: Group = {
  id: "g1",
  tutorId: tutor.id,
  subject: "Physics",
  grade: "sec3",
  weekdays: ["tue", "sat"],
  monthlyFeePiasters: 350_00,
};

const students: Student[] = [
  { id: "st1", groupId: group.id, name: "Omar", parentPhone: "01011111111" },
  { id: "st2", groupId: group.id, name: "Mariam", parentPhone: "01022222222" },
  { id: "st3", groupId: group.id, name: "Youssef", parentPhone: "01033333333" },
  { id: "st4", groupId: group.id, name: "Nour", parentPhone: "01044444444" },
];

// Tuesdays and Saturdays in November 2026.
const sessions: Session[] = [
  { id: "se1", groupId: group.id, date: "2026-11-03" },
  { id: "se2", groupId: group.id, date: "2026-11-07" },
  { id: "se3", groupId: group.id, date: "2026-11-10" },
  { id: "se4", groupId: group.id, date: "2026-11-14" },
];

const attendance: AttendanceRecord[] = [
  // Omar: never misses. Expect 100%.
  { sessionId: "se1", studentId: "st1", status: "present" },
  { sessionId: "se2", studentId: "st1", status: "present" },
  { sessionId: "se3", studentId: "st1", status: "late" },
  { sessionId: "se4", studentId: "st1", status: "present" },
  // Mariam: one absence, one excused. Expect 2 of 3 = 67%.
  { sessionId: "se1", studentId: "st2", status: "present" },
  { sessionId: "se2", studentId: "st2", status: "absent" },
  { sessionId: "se3", studentId: "st2", status: "excused" },
  { sessionId: "se4", studentId: "st2", status: "present" },
  // Youssef: missed the first two. Expect 2 of 4 = 50%.
  { sessionId: "se1", studentId: "st3", status: "absent" },
  { sessionId: "se2", studentId: "st3", status: "absent" },
  { sessionId: "se3", studentId: "st3", status: "present" },
  { sessionId: "se4", studentId: "st3", status: "late" },
  // Nour: excused all month, so nothing countable. Expect 0%.
  { sessionId: "se1", studentId: "st4", status: "excused" },
  { sessionId: "se2", studentId: "st4", status: "excused" },
  { sessionId: "se3", studentId: "st4", status: "excused" },
  { sessionId: "se4", studentId: "st4", status: "excused" },
];

const payments: Payment[] = [
  { id: "p1", studentId: "st1", month: "2026-11", amountPiasters: 350_00, status: "paid", method: "instapay", paidOn: "2026-11-03" },
  { id: "p2", studentId: "st2", month: "2026-11", amountPiasters: 350_00, status: "paid", method: "cash", paidOn: "2026-11-07" },
  { id: "p3", studentId: "st3", month: "2026-11", amountPiasters: 350_00, status: "unpaid" },
  // Nour paid October, but nothing yet for November.
  { id: "p4", studentId: "st4", month: "2026-10", amountPiasters: 350_00, status: "paid", method: "vodafone_cash", paidOn: "2026-10-04" },
];

// ---- Run the logic ---------------------------------------------------------

const month = "2026-11";

console.log(`${tutor.name}: ${group.subject} (${group.grade}), ${group.weekdays.join(" + ")}, ${formatEgp(group.monthlyFeePiasters)}/month`);
// A 10% sibling discount on EGP 275 is EGP 247.50: exact in piasters, no float rounding.
console.log(`10% off EGP 275: ${formatEgp(275_00 - (275_00 * 10) / 100)}`);
console.log(`${sessions.length} sessions in ${month}\n`);

console.log("Attendance rate:");
for (const student of students) {
  const records = attendance.filter((r) => r.studentId === student.id);
  const percent = Math.round(attendanceRate(records) * 100);
  console.log(`  ${student.name.padEnd(8)} ${percent}%`);
}
console.log(`  (no records) ${attendanceRate([])}`);

console.log(`\nNot paid for ${month}:`);
for (const student of unpaidStudents(students, payments, month)) {
  console.log(`  ${student.name} (parent: ${student.parentPhone})`);
}

console.log("\nPayments:");
for (const payment of payments) {
  const name = students.find((s) => s.id === payment.studentId)?.name ?? "?";
  console.log(`  ${name.padEnd(8)} ${describePayment(payment)}`);
}

// ---- Lines that must NOT compile -------------------------------------------
// Uncomment one at a time and run `npm run typecheck` to watch the type checker
// catch it. (`npx tsx` does not type-check, it only strips the types and runs.)

// 1. Typo in an attendance status:
// const typo: AttendanceRecord = { sessionId: "se1", studentId: "st1", status: "presnet" };

// 2. A paid payment with no method:
// const noMethod: Payment = { id: "p9", studentId: "st1", month: "2026-11", amountPiasters: 350_00, status: "paid", paidOn: "2026-11-14" };

// 3. A student with no name:
// const noName: Student = { id: "st9", groupId: "g1", parentPhone: "01099999999" };
