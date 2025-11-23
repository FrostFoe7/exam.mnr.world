import { NextRequest, NextResponse } from "next/server";

const CSV_API_BASE = (process.env.NEXT_PUBLIC_CSV_API_BASE_URL || "https://csv.mnr.world").replace(/\/$/, "") + "/api";
const API_KEY = process.env.NEXT_PUBLIC_CSV_API_KEY;
if (!API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_CSV_API_KEY in environment");
}

/**
 * POST /api/create-question
 * 
 * Create a new question
 * 
 * Body (JSON):
 * {
 *   "file_id": 1,
 *   "question": "What is 2+2?",
 *   "description": "Basic math",
 *   "option1": "3",
 *   "option2": "4",
 *   "option3": "5",
 *   "option4": "6",
 *   "option5": "7",
 *   "correct": "B",
 *   "explanation": "2+2=4"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { file_id } = body;

    console.log("[CREATE-QUESTION] Request:", { file_id, question: body.question?.substring(0, 50) });

    if (!file_id) {
      return NextResponse.json(
        { success: false, message: "Missing required field: file_id" },
        { status: 400 }
      );
    }

    if (!body.question) {
      return NextResponse.json(
        { success: false, message: "Missing required field: question" },
        { status: 400 }
      );
    }

    const csvApiUrl = `${CSV_API_BASE}/create.php`;
    const payload = {
      key: API_KEY,
      ...body,
    };

    console.log("[CREATE-QUESTION] Sending to CSV API:", csvApiUrl);

    const response = await fetch(csvApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Course-MNR-World-Backend/1.0",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    console.log("[CREATE-QUESTION] Response status:", response.status);
    console.log("[CREATE-QUESTION] Response data:", responseData);

    if (!response.ok || !responseData.success) {
      const errorMessage = responseData.message || `API Error: ${response.status}`;
      console.error("[CREATE-QUESTION] Error:", errorMessage);

      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: responseData.message || "Question created successfully",
      data: responseData.data,
    }, { status: 201 });
  } catch (error) {
    console.error("[CREATE-QUESTION] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
