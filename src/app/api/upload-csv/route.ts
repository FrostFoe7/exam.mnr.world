import { NextRequest, NextResponse } from "next/server";

const CSV_API_BASE = (process.env.NEXT_PUBLIC_CSV_API_BASE_URL || "https://csv.mnr.world").replace(/\/$/, "") + "/api";
const API_KEY = process.env.NEXT_PUBLIC_CSV_API_KEY;
if (!API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_CSV_API_KEY in environment");
}

/**
 * POST /api/upload-csv
 * 
 * Upload a CSV file to the PHP API
 * 
 * Form Data:
 * - file: File (CSV file)
 * - description: string (optional)
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "File uploaded successfully",
 *   "data": {
 *     "file_id": 1,
 *     "filename": "questions.csv",
 *     "description": "Exam questions",
 *     "row_count": 150,
 *     "size_kb": 125.50,
 *     "headers": ["question", "option1", "option2", ...]
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const description = formData.get("description") as string || "";

    console.log("[UPLOAD-CSV] File received:", {
      name: (file as any)?.name,
      size: (file as any)?.size,
      type: (file as any)?.type,
    });

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Missing file" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json(
        { success: false, message: "File must be a CSV file" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Create FormData for PHP API
    const uploadFormData = new FormData();
    uploadFormData.append("key", API_KEY);
    uploadFormData.append("file", file);
    uploadFormData.append("description", description);

    console.log("[UPLOAD-CSV] Sending to PHP API:", `${CSV_API_BASE}/upload.php`);

    // Upload to PHP API
    const response = await fetch(`${CSV_API_BASE}/upload.php`, {
      method: "POST",
      headers: {
        "User-Agent": "Course-MNR-World-Backend/1.0",
      },
      body: uploadFormData,
    });

    const responseData = await response.json();

    console.log("[UPLOAD-CSV] Response status:", response.status);
    console.log("[UPLOAD-CSV] Response data:", responseData);

    if (!response.ok || !responseData.success) {
      const errorMessage = responseData.message || `API Error: ${response.status}`;
      console.error("[UPLOAD-CSV] Error:", errorMessage);

      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: responseData.message || "File uploaded successfully",
        data: responseData.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[UPLOAD-CSV] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
