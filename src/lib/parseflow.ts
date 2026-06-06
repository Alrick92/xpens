const PARSEFLOW_API_URL =
  process.env.PARSEFLOW_API_URL || "https://parseflow.dev/api/v1";

export interface ParseFlowResult {
  id: string;
  status: "success" | "partial" | "failed";
  document_type: "invoice" | "receipt" | "contract" | "other";
  vendor: string | null;
  vendor_address: string | null;
  invoice_number: string | null;
  date: string | null;
  due_date: string | null;
  total: number | null;
  subtotal: number | null;
  tax: number | null;
  currency: string | null;
  line_items:
    | {
        description: string;
        quantity: number | null;
        unit_price: number | null;
        amount: number;
      }[]
    | null;
  raw_text: string | null;
  confidence: number;
  processing_ms: number;
  model_used: string;
}

export async function parseDocument(file: File): Promise<ParseFlowResult> {
  const apiKey = process.env.PARSEFLOW_API_KEY;
  if (!apiKey) {
    throw new Error("PARSEFLOW_API_KEY is not configured");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${PARSEFLOW_API_URL}/extract`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(
      `ParseFlow API error (${response.status}): ${error.error || "Unknown error"}`
    );
  }

  return response.json();
}

export async function checkUsage(): Promise<{
  parses_used: number;
  parses_quota: number;
  parses_remaining: number;
  plan: string;
}> {
  const apiKey = process.env.PARSEFLOW_API_KEY;
  if (!apiKey) {
    throw new Error("PARSEFLOW_API_KEY is not configured");
  }

  const response = await fetch(`${PARSEFLOW_API_URL}/usage`, {
    headers: { "X-API-Key": apiKey },
  });

  if (!response.ok) {
    throw new Error(`ParseFlow usage check failed: ${response.status}`);
  }

  return response.json();
}
