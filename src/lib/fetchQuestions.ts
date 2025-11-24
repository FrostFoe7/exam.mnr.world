export interface Question {
  id?: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5?: string;
  answer: string;
  explanation?: string;
  type: string;
  section: string;
  file_id?: number;
}
export async function fetchQuestions(
  fileId?: string | number,
): Promise<Question[]> {
  // Use GET /api/fetch-questions?file_id= to avoid CORS and keep behavior consistent
  try {
    const url = fileId
      ? `/api/fetch-questions?file_id=${encodeURIComponent(String(fileId))}`
      : "/api/fetch-questions";

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API Error ${res.status}: ${text}`);
    }

    const payload = await res.json();

    // The API may return either { success: true, data: { questions: [...] } } (GET)
    // or { success: true, questions: [...] } (POST/back-compat). Normalize both.
    let rawQuestions: any[] = [];
    if (payload && payload.success) {
      if (payload.data && Array.isArray(payload.data.questions))
        rawQuestions = payload.data.questions;
      else if (Array.isArray(payload.questions))
        rawQuestions = payload.questions;
      else if (Array.isArray(payload)) rawQuestions = payload; // defensive
    } else if (Array.isArray(payload)) {
      rawQuestions = payload;
    } else {
      throw new Error("Unexpected API response shape");
    }

    // Attempt to coerce payload items into our Question type shape
    const transformed: Question[] = rawQuestions.map((q: any) => ({
      id: q.id ?? q.uid ?? undefined,
      question: q.question || q.question_text || "",
      option1: q.option1 ?? "",
      option2: q.option2 ?? "",
      option3: q.option3 ?? "",
      option4: q.option4 ?? "",
      option5: q.option5 ?? "",
      answer: q.answer ?? q.correct ?? "",
      explanation: q.explanation ?? "",
      type: q.type ?? "",
      section: q.section ?? "",
      file_id: q.file_id ?? undefined,
    }));

    return transformed;
  } catch (error) {
    // Bubble up a useful error for callers
    if (error instanceof Error) throw error;
    throw new Error(String(error));
  }
}
