CREATE TABLE tutors (
  id   text PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE groups (
  id                   text    PRIMARY KEY,
  tutor_id             text    NOT NULL REFERENCES tutors(id),
  subject              text    NOT NULL,
  monthly_fee_piasters integer NOT NULL CHECK (monthly_fee_piasters >= 0)
);

CREATE TABLE students (
  id           text PRIMARY KEY,
  group_id     text NOT NULL REFERENCES groups(id),
  name         text NOT NULL,
  parent_phone text NOT NULL,
  left_on      date
);

-- One class meeting of one group on one date.
CREATE TABLE sessions (
  id       text PRIMARY KEY,
  group_id text NOT NULL REFERENCES groups(id),
  held_on  date NOT NULL
);

CREATE TABLE attendance (
  session_id text NOT NULL REFERENCES sessions(id),
  student_id text NOT NULL REFERENCES students(id),
  status     text NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  PRIMARY KEY (session_id, student_id)
);

-- Money a parent actually paid. What a student owes is not stored: it is
-- calculated from the group's monthly fee minus the payments for that month.
CREATE TABLE payments (
  id              text    PRIMARY KEY,
  student_id      text    NOT NULL REFERENCES students(id),
  -- 'YYYY-MM' with a real month (01-12), so '2026-11' passes and 'Nov 2026',
  -- '2026-13', and '2026-1' are rejected.
  month           text    NOT NULL CHECK (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  amount_piasters integer NOT NULL CHECK (amount_piasters > 0),
  method          text    NOT NULL CHECK (method IN ('cash', 'instapay', 'vodafone_cash')),
  paid_on         date    NOT NULL
);
