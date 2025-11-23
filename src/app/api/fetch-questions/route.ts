import { NextRequest, NextResponse } from "next/server";

const CSV_API_ENTRY =
  (process.env.NEXT_PUBLIC_CSV_API_BASE_URL || "https://csv.mnr.world").replace(
    /\/$/,
    "",
  ) + "/api/index.php";
const API_KEY = process.env.NEXT_PUBLIC_CSV_API_KEY || "";
if (!API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_CSV_API_KEY in environment");
}

// Shape returned by new PHP API questions endpoint
interface RawQuestion {
  id: string; // UUID
  file_id: string;
  question_text: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5: string;
  answer: string;
  explanation: string;
  type: string;
  section: string;
  order_index: string;
  created_at: string;
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("file_id");

    console.log(
      `[FETCH-QUESTIONS] Request received. file_id: ${fileId || "N/A"}`,
    );

    let url = `${CSV_API_ENTRY}?route=questions&token=${encodeURIComponent(API_KEY)}`;
    if (fileId) {
      url += `&file_id=${encodeURIComponent(fileId)}`;
    }

    console.log("[FETCH-QUESTIONS] Forwarding to PHP API:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Course-MNR-World-Backend/2.0",
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[FETCH-QUESTIONS] Non-OK:", response.status, errorBody);
      return NextResponse.json(
        { success: false, message: `API fetch failed (${response.status})` },
        { status: response.status },
      );
    }

    const raw = await response.json();
    if (!Array.isArray(raw)) {
      return NextResponse.json(
        { success: false, message: "Unexpected API response shape" },
        { status: 502 },
      );
    }

    const transformed = raw.map((q: RawQuestion) => ({
      id: q.id,
      file_id: q.file_id,
      question: q.question_text || "",
      question_text: q.question_text || "",
      options: [q.option1, q.option2, q.option3, q.option4, q.option5].filter(
        (o) => o && o.trim() !== "",
      ),
      option1: q.option1,
      option2: q.option2,
      option3: q.option3,
      option4: q.option4,
      option5: q.option5,
      correct: q.answer, // legacy front-end expects 'correct'
      answer: q.answer,
      explanation: q.explanation || "",
      type: q.type,
      section: q.section,
      order_index: q.order_index,
      created_at: q.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: { questions: transformed, total: transformed.length },
    });
  } catch (error) {
    console.error("[FETCH-QUESTIONS] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

// Support POST for backward compatibility
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { file_id } = body;

    let url = `${CSV_API_ENTRY}?route=questions&token=${encodeURIComponent(API_KEY)}`;
    if (file_id) {
      url += `&file_id=${encodeURIComponent(file_id)}`;
    }

    console.log("[FETCH-QUESTIONS-POST] Fetching from:", url);
    const response = await fetch(url, {
      headers: { "User-Agent": "Course-MNR-World-Backend/2.0" },
    });
    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: `Failed (${response.status})` },
        { status: response.status },
      );
    }
    const raw = await response.json();
    if (!Array.isArray(raw)) {
      return NextResponse.json(
        { success: false, message: "Unexpected API shape" },
        { status: 502 },
      );
    }
    const transformed = raw.map((q: RawQuestion) => ({
      id: q.id,
      file_id: q.file_id,
      question: q.question_text || "",
      options: [q.option1, q.option2, q.option3, q.option4, q.option5].filter(
        (o) => o && o.trim() !== "",
      ),
      correct: q.answer,
      explanation: q.explanation || "",
      type: q.type,
      section: q.section,
      order_index: q.order_index,
      created_at: q.created_at,
    }));
    return NextResponse.json({ success: true, questions: transformed });
  } catch (error) {
    console.error("[FETCH-QUESTIONS-POST] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
