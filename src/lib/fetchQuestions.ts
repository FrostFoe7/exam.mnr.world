export interface Question {
  uid?: number;
  questions: string;
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

export async function fetchQuestions(fileId: number): Promise<Question[]> {
  try {
    const response = await fetch("/api/fetch-questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const questions: Question[] = await response.json();
    return questions;
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    throw error;
  }
}
