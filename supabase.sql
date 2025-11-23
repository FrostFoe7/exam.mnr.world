-- Enable the uuid-ossp extension to generate UUIDs
create extension if not exists "uuid-ossp" with schema extensions;

-- Create the table for storing user data
-- WARNING: Storing passwords in plaintext ('pass' column) is a major security risk.
-- It is highly recommended to hash passwords before storing them.
create table users (
  uid uuid default extensions.uuid_generate_v4() not null primary key,
  name text,
  roll text unique,
  pass text,
  enrolled_batches uuid[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add a GIN index to the enrolled_batches column
CREATE INDEX idx_users_enrolled_batches ON users USING GIN (enrolled_batches);

-- Create a user-defined type for admin roles
create type admin_role as enum ('admin', 'moderator');

-- Create the table for storing admin user data
-- WARNING: Storing passwords in plaintext ('password' column) is a major security risk.
-- It is highly recommended to hash passwords before storing them.
create table admins (
  uid uuid default extensions.uuid_generate_v4() not null primary key,
  username text unique,
  password text,
  role admin_role,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the table for storing batches
create table batches (
  id uuid default extensions.uuid_generate_v4() not null primary key,
  name text not null,
  description text,
  icon_url text,
  status text default 'live' check (status in ('live', 'end')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the table for storing exams
create table exams (
  id uuid default extensions.uuid_generate_v4() not null primary key,
  name text not null,
  batch_id uuid not null references batches(id) on delete cascade,
  duration_minutes integer default 120,
  negative_marks_per_wrong numeric(4, 2) default 0.50,
  file_id uuid, -- Added to link to external question file
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the table for storing questions
create table questions (
  id uuid default extensions.uuid_generate_v4() not null primary key,
  exam_id uuid not null references exams(id) on delete cascade,
  question text not null,
  options jsonb not null,
  answer integer not null,
  explanation text,
  type text,
  section text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the table for storing student exam results
create table student_exams (
  id uuid default extensions.uuid_generate_v4() not null primary key,
  exam_id uuid not null references exams(id) on delete cascade,
  student_id uuid not null references users(uid) on delete cascade,
  score numeric(5, 2),
  correct_answers integer default 0,
  wrong_answers integer default 0,
  unattempted integer default 0,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for better query performance
CREATE INDEX idx_exams_batch_id ON exams(batch_id);
CREATE INDEX idx_student_exams_student_id ON student_exams(student_id);
CREATE INDEX idx_student_exams_exam_id ON student_exams(exam_id);
CREATE INDEX idx_student_exams_student_exam ON student_exams(student_id, exam_id);
CREATE INDEX idx_questions_exam_id ON questions(exam_id);