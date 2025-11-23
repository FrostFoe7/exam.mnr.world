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
  async fetchQuestions(fileId?: number): Promise<ApiResponse> {
    let endpoint = "/fetch-questions";
    if (fileId) {
      endpoint += `?file_id=${fileId}`;
    }
    return apiCall(endpoint);
  },

  /**
   * Update question field(s)
   */
  async updateQuestion(
    uid: number,
    field?: string,
    value?: any,
    updates?: Record<string, any>
  ): Promise<ApiResponse> {
    const body: any = { uid };

    if (updates) {
      body.updates = updates;
    } else if (field) {
      body.field = field;
      body.value = value;
    }

    return apiCall("/update-question", { method: "POST", body });
  },

  /**
   * Delete question
   */
  async deleteQuestion(uid: number): Promise<ApiResponse> {
    return apiCall("/delete-question", {
      method: "POST",
      body: { uid },
    });
  },

  /**
   * Create question
   */
  async createQuestion(fileId: number, questionData: any): Promise<ApiResponse> {
    return apiCall("/create-question", {
      method: "POST",
      body: {
        file_id: fileId,
        ...questionData,
      },
    });
  },

  /**
   * Bulk operations
   */
  async bulkDelete(uids: number[]): Promise<ApiResponse> {
    return apiCall("/bulk-questions", {
      method: "POST",
      body: {
        operation: "delete",
        uids,
      },
    });
  },

  async bulkUpdate(
    updates: Array<{ uid: number; field: string; value: any }>
  ): Promise<ApiResponse> {
    return apiCall("/bulk-questions", {
      method: "POST",
      body: {
        operation: "update",
        updates,
      },
    });
  },

  async bulkCreate(fileId: number, questions: any[]): Promise<ApiResponse> {
    return apiCall("/bulk-questions", {
      method: "POST",
      body: {
        operation: "create",
        file_id: fileId,
        questions,
      },
    });
  },

  /**
   * Reorder questions
   */
  async reorderQuestions(fileId: number, order: number[]): Promise<ApiResponse> {
    return apiCall("/bulk-questions", {
      method: "POST",
      body: {
        operation: "reorder",
        file_id: fileId,
        order,
      },
    });
  },

  /**
   * Upload CSV file
   */
  async uploadCsv(file: File, description?: string): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append("file", file);
    if (description) {
      formData.append("description", description);
    }

    console.log(`[API-CLIENT] POST /upload-csv`, file.name);

    try {
      const response = await fetch(`${API_BASE}/upload-csv`, {
        method: "POST",
        body: formData,
      });

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
  },
};

export default csvApi;
