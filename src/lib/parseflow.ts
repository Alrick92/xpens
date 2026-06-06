const PARSEFLOW_API_URL =
  process.env.PARSEFLOW_API_URL || "https://parseflow.dev/api/v1";

interface ParseFlowApiResponse {
  id: string;
  status: "completed" | "processing" | "failed";
  documentType: string;
  confidence: number;
  data: {
    type?: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    dueDate?: string;
    vendor?: { name?: string; email?: string; address?: string };
    customer?: { name?: string };
    lineItems?: {
      description: string;
      quantity?: number;
      unitPrice?: number;
      amount: number;
    }[];
    subtotal?: number;
    taxAmount?: number;
    taxRate?: number;
    total?: number;
    currency?: string;
    merchant?: string;
    paymentMethod?: string;
    items?: {
      description: string;
      quantity?: number;
      unitPrice?: number;
      amount: number;
    }[];
    date?: string;
  };
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    pageCount?: number;
    language?: string;
  };
  processingTimeMs: number;
}

export interface ParseFlowResult {
  id: string;
  status: "completed" | "processing" | "failed";
  document_type: string;
  vendor: string | null;
  date: string | null;
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
  confidence: number;
  processing_ms: number;
}

function mapApiResponse(raw: ParseFlowApiResponse): ParseFlowResult {
  const d = raw.data;
  const items = d.lineItems ?? d.items ?? null;

  return {
    id: raw.id,
    status: raw.status,
    document_type: raw.documentType ?? d.type ?? "unknown",
    vendor: d.vendor?.name ?? d.merchant ?? null,
    date: d.invoiceDate ?? d.date ?? null,
    total: d.total ?? null,
    subtotal: d.subtotal ?? null,
    tax: d.taxAmount ?? null,
    currency: d.currency ?? null,
    line_items: items
      ? items.map((item) => ({
          description: item.description,
          quantity: item.quantity ?? null,
          unit_price: item.unitPrice ?? null,
          amount: item.amount,
        }))
      : null,
    confidence: raw.confidence,
    processing_ms: raw.processingTimeMs,
  };
}

export async function parseDocument(
  file: File,
  documentType: string = "receipt"
): Promise<ParseFlowResult> {
  const apiKey = process.env.PARSEFLOW_API_KEY;
  if (!apiKey) {
    throw new Error("PARSEFLOW_API_KEY is not configured");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("document_type", documentType);

  const response = await fetch(`${PARSEFLOW_API_URL}/extract`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      `ParseFlow API error (${response.status}): ${error.error || "Unknown error"}`
    );
  }

  const raw: ParseFlowApiResponse = await response.json();

  if (raw.status === "failed") {
    throw new Error("ParseFlow could not extract data from this document");
  }

  return mapApiResponse(raw);
}

export async function getExtractionResult(
  extractionId: string
): Promise<ParseFlowResult> {
  const apiKey = process.env.PARSEFLOW_API_KEY;
  if (!apiKey) {
    throw new Error("PARSEFLOW_API_KEY is not configured");
  }

  const response = await fetch(
    `${PARSEFLOW_API_URL}/documents/${extractionId}`,
    { headers: { "X-API-Key": apiKey } }
  );

  if (!response.ok) {
    throw new Error(`ParseFlow lookup failed: ${response.status}`);
  }

  const raw: ParseFlowApiResponse = await response.json();
  return mapApiResponse(raw);
}
