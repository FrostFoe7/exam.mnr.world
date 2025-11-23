import { NextRequest, NextResponse } from "next/server";

const CSV_API_BASE = (process.env.NEXT_PUBLIC_CSV_API_BASE_URL || "https://csv.mnr.world").replace(/\/$/, "") + "/api";
const API_KEY = process.env.NEXT_PUBLIC_CSV_API_KEY;
if (!API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_CSV_API_KEY in environment");
}

/**
 * POST /api/update-question
 * 
 * Update single or multiple fields in a question
 * 
 * Body (JSON):
 * {
 *   "uid": 1,
 *   "field": "question",
 *   "value": "Updated question text"
 * }
 * 
 * Or for multiple fields:
 * {
 *   "uid": 1,
 *   "updates": {
 *     "question": "New question",
 *     "correct": "A"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, field, value, updates } = body;

    console.log("[UPDATE-QUESTION] Request body:", { uid, field, value: value ? String(value).substring(0, 50) : undefined, updates });

    if (!uid) {
      return NextResponse.json(
        { success: false, message: "Missing required field: uid" },
        { status: 400 }
      );
    }

    const csvApiUrl = `${CSV_API_BASE}/update.php`;
    const payload: any = {
      key: API_KEY,
      uid: uid,
    };

    if (updates) {
      // Multiple fields update
      payload.updates = updates;
    } else if (field && value !== undefined) {
      // Single field update
      payload.field = field;
      payload.value = value;
    } else {
      return NextResponse.json(
        { success: false, message: "Missing update parameters (field/value or updates)" },
        { status: 400 }
      );
    }

    console.log("[UPDATE-QUESTION] Sending to CSV API:", csvApiUrl);

    const response = await fetch(csvApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Course-MNR-World-Backend/1.0",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    console.log("[UPDATE-QUESTION] Response status:", response.status);
    console.log("[UPDATE-QUESTION] Response data:", responseData);

    if (!response.ok || !responseData.success) {
      const errorMessage = responseData.message || `API Error: ${response.status}`;
      console.error("[UPDATE-QUESTION] Error:", errorMessage);

      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: responseData.message || "Question updated successfully",
      data: responseData.data,
    });
  } catch (error) {
    console.error("[UPDATE-QUESTION] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
