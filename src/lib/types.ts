export type User = {
  uid: string;
  name: string;
  roll: string;
  pass?: string;
  enrolled_batches: string[];
  created_at: string;
};

export type Admin = {
  uid: string;
  username: string;
  role: "admin" | "moderator";
  created_at: string;
};

export type Batch = {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  status?: "live" | "end";
  created_at: string;
};

export type Exam = {
  id: string;
  name: string;
  batch_id: string;
  created_at: string;
  questions?: Question[];
  duration_minutes?: number;
  negative_marks_per_wrong?: number;
};

export type Question = {
  id?: string;
  uid?: number; // Deprecated, use id
  file_id?: string; // Added for new API
  exam_id?: string;
  question: string;
  questions?: string;
  options: string[] | Record<string, string>;
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  option5?: string;
  answer: number | string;
  correct?: string;
  explanation: string | null;
  type: string | null;
  section: string | null;
  order_index?: number | string; // Added
  created_at?: string;
};

export type StudentExam = {
  id?: string;
  exam_id: string;
  student_id: string;
  score: number;
  submitted_at?: string;
};
