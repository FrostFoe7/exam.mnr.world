import { NextRequest, NextResponse } from "next/server";

const CSV_API_BASE = (process.env.NEXT_PUBLIC_CSV_API_BASE_URL || "https://csv.mnr.world").replace(/\/$/, "") + "/api";
const API_KEY = process.env.NEXT_PUBLIC_CSV_API_KEY;
if (!API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_CSV_API_KEY in environment");
}

/**
 * POST /api/bulk-questions
 * 
 * Bulk operations: delete, update, or create multiple questions
 * 
 * Bulk Delete:
 * {
 *   "operation": "delete",
 *   "uids": [1, 2, 3]
 * }
 * 
 * Bulk Update:
 * {
 *   "operation": "update",
 *   "updates": [
 *     {"uid": 1, "field": "category", "value": "Math"},
 *     {"uid": 2, "field": "category", "value": "Math"}
 *   ]
 * }
 * 
 * Bulk Create:
 * {
 *   "operation": "create",
 *   "file_id": 1,
 *   "questions": [
 *     {"question": "Q1?", "option1": "A", "correct": "A"},
 *     {"question": "Q2?", "option1": "B", "correct": "B"}
 *   ]
 * }
 * 
 * Reorder:
 * {
 *   "operation": "reorder",
 *   "file_id": 1,
 *   "order": [5, 3, 1, 2, 4]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation } = body;

    console.log("[BULK-QUESTIONS] Operation:", operation);

    if (!operation) {
      return NextResponse.json(
        { success: false, message: "Missing required field: operation" },
        { status: 400 }
      );
    }

    let csvApiUrl = `${CSV_API_BASE}/bulk.php`;
    
    // Route reorder operation to reorder.php
    if (operation === 'reorder') {
      csvApiUrl = `${CSV_API_BASE}/reorder.php`;
    }

    const payload = {
      key: API_KEY,
      ...body,
    };

    console.log("[BULK-QUESTIONS] Sending to CSV API:", csvApiUrl, { operation });

    const response = await fetch(csvApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Course-MNR-World-Backend/1.0",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    console.log("[BULK-QUESTIONS] Response status:", response.status);
    console.log("[BULK-QUESTIONS] Response data:", responseData);

    if (!response.ok || !responseData.success) {
      const errorMessage = responseData.message || `API Error: ${response.status}`;
      console.error("[BULK-QUESTIONS] Error:", errorMessage);

      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: responseData.message || `Bulk ${operation} operation completed`,
      data: responseData.data,
    });
  } catch (error) {
    console.error("[BULK-QUESTIONS] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
