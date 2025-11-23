/**
 * CSV API Client - All requests go through Next.js backend to avoid CORS issues
 * This is especially important for Netlify deployment
 */

interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

const API_BASE = "/api";

async function apiCall<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body } = options;

  console.log(`[API-CLIENT] ${method} ${endpoint}`, body || "");

  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, fetchOptions);

    if (!response.ok) {
      const error = await response.text();
      console.error(`[API-CLIENT] Error ${response.status}:`, error);
      return {
        success: false,
        message: `HTTP ${response.status}: ${error}`,
      };
    }

    const data = await response.json();
    console.log(`[API-CLIENT] Response:`, data);
    return data;
  } catch (error) {
    console.error(`[API-CLIENT] Error:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export const csvApi = {
  /**
   * Fetch questions
   */
  async fetchQuestions(fileId?: string | number): Promise<ApiResponse> {
    let endpoint = "/fetch-questions";
    if (fileId) {
      endpoint += `?file_id=${fileId}`;
    }
    return apiCall(endpoint);
  },

  /**
   * Upload CSV file
   */
  async uploadCsv(file: File, description?: string): Promise<ApiResponse> {
    // ...existing code...
    const formData = new FormData();
    formData.append("file", file);
    if (description) {
      formData.append("description", description);
    }

    console.log(`[API-CLIENT] POST /upload-csv`, file.name);
    // Note: This route was removed from Next.js. 
    // This method should now point to the PHP API directly or be removed if not used by client.
    // For now, we'll leave it but it will likely fail if the route is gone.
    // Assuming the user handles uploads via PHP app directly.
    return { success: false, message: "Upload via PHP App Dashboard" };
  },
};

export default csvApi;
