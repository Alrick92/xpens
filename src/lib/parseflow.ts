import { prisma } from "@/lib/db";

const PARSEFLOW_API_URL_DEFAULT = "https://parseflow.dev/api/v1";

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

async function getApiKey(): Promise<string> {
  const dbSetting = await prisma.appSetting.findUnique({
    where: { key: "parseflow_api_key" },
  });
  if (dbSetting?.value) return dbSetting.value;

  const envKey = process.env.PARSEFLOW_API_KEY;
  if (envKey) return envKey;

  throw new Error("PARSEFLOW_API_KEY is not configured");
}

async function getApiUrl(): Promise<string> {
  const dbSetting = await prisma.appSetting.findUnique({
    where: { key: "parseflow_api_url" },
  });
  if (dbSetting?.value) return dbSetting.value;

  return process.env.PARSEFLOW_API_URL || PARSEFLOW_API_URL_DEFAULT;
}

export async function parseDocument(file: File): Promise<ParseFlowResult> {
  const apiKey = await getApiKey();
  const apiUrl = await getApiUrl();

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${apiUrl}/extract`, {
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
  const apiKey = await getApiKey();
  const apiUrl = await getApiUrl();

  const response = await fetch(`${apiUrl}/usage`, {
    headers: { "X-API-Key": apiKey },
  });

  if (!response.ok) {
    throw new Error(`ParseFlow usage check failed: ${response.status}`);
  }

  return response.json();
}

export async function getParseFlowConfig(): Promise<{
  apiKey: string;
  apiUrl: string;
  source: "database" | "environment";
}> {
  const dbKey = await prisma.appSetting.findUnique({
    where: { key: "parseflow_api_key" },
  });
  const dbUrl = await prisma.appSetting.findUnique({
    where: { key: "parseflow_api_url" },
  });

  return {
    apiKey: dbKey?.value || process.env.PARSEFLOW_API_KEY || "",
    apiUrl: dbUrl?.value || process.env.PARSEFLOW_API_URL || PARSEFLOW_API_URL_DEFAULT,
    source: dbKey?.value ? "database" : "environment",
  };
}
