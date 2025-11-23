import { NextRequest, NextResponse } from "next/server";

const CSV_API_BASE = (process.env.NEXT_PUBLIC_CSV_API_BASE_URL || "https://csv.mnr.world").replace(/\/$/, "") + "/api";
const API_KEY = process.env.NEXT_PUBLIC_CSV_API_KEY;
if (!API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_CSV_API_KEY in environment");
}

/**
 * POST /api/delete-question
 * 
 * Delete a question by uid
 * 
 * Body (JSON):
 * {
 *   "uid": 1
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid } = body;

    console.log("[DELETE-QUESTION] Request:", { uid });

    if (!uid) {
      return NextResponse.json(
        { success: false, message: "Missing required field: uid" },
        { status: 400 }
      );
    }

    const csvApiUrl = `${CSV_API_BASE}/delete.php`;

    console.log("[DELETE-QUESTION] Sending to CSV API:", csvApiUrl);

    const response = await fetch(csvApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Course-MNR-World-Backend/1.0",
      },
      body: JSON.stringify({
        key: API_KEY,
        uid: uid,
      }),
    });

    const responseData = await response.json();

    console.log("[DELETE-QUESTION] Response status:", response.status);
    console.log("[DELETE-QUESTION] Response data:", responseData);

    if (!response.ok || !responseData.success) {
      const errorMessage = responseData.message || `API Error: ${response.status}`;
      console.error("[DELETE-QUESTION] Error:", errorMessage);

      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: responseData.message || "Question deleted successfully",
      data: responseData.data,
    });
  } catch (error) {
    console.error("[DELETE-QUESTION] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
