"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, Loader2, Sparkles, X, FileText } from "lucide-react";
import { createExpenseAction } from "@/app/actions/expenses";
import { CURRENCY_INFO } from "@/lib/currencies";
import type { Currency } from "@prisma/client";

interface FormProps {
  categories: { id: string; name: string }[];
  projects: { id: string; name: string }[];
}

interface ParsedData {
  vendor: string | null;
  total: number | null;
  subtotal: number | null;
  tax: number | null;
  date: string | null;
  currency: string | null;
  confidence: number;
  line_items:
    | { description: string; quantity: number | null; unit_price: number | null; amount: number }[]
    | null;
  document_type: string;
}

export function NewExpenseForm({ categories, projects }: FormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    filename: string;
  } | null>(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [merchant, setMerchant] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [notes, setNotes] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setParsing(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "Upload failed");
      }

      setUploadedFile({ url: uploadData.url, filename: uploadData.filename });

      const parseFormData = new FormData();
      parseFormData.append("file", file);

      const parseRes = await fetch("/api/parse-receipt", {
        method: "POST",
        body: parseFormData,
      });
      const parseData = await parseRes.json();

      if (parseRes.ok && parseData.success) {
        const d = parseData.data;
        setParsedData(d);

        if (d.vendor) {
          setMerchant(d.vendor);
          setDescription(d.document_type === "receipt" ? `Receipt from ${d.vendor}` : d.vendor);
        }
        if (d.total != null) setAmount(d.total.toString());
        if (d.date) setDate(d.date);
        if (d.currency) {
          const upper = d.currency.toUpperCase();
          if (upper in CURRENCY_INFO) setCurrency(upper as Currency);
        }

        toast.success(
          `Receipt parsed with ${Math.round(d.confidence * 100)}% confidence`
        );
      } else {
        toast.info("Receipt uploaded but parsing failed. Enter details manually.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to process receipt"
      );
    } finally {
      setParsing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/tiff": [".tif", ".tiff"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.set("description", description);
    formData.set("amount", amount);
    formData.set("currency", currency);
    formData.set("date", date);
    if (merchant) formData.set("merchant", merchant);
    if (categoryId) formData.set("categoryId", categoryId);
    if (projectId) formData.set("projectId", projectId);
    if (notes) formData.set("notes", notes);
    if (uploadedFile) {
      formData.set("receiptUrl", uploadedFile.url);
      formData.set("receiptFilename", uploadedFile.filename);
    }
    if (parsedData) {
      formData.set("parseConfidence", parsedData.confidence.toString());
      formData.set("parseRawData", JSON.stringify(parsedData));
      if (parsedData.line_items) {
        formData.set(
          "lineItems",
          JSON.stringify(
            parsedData.line_items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unit_price,
              amount: item.amount,
            }))
          )
        );
      }
    }

    const result = await createExpenseAction(formData);
    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Expense created successfully");
      router.push("/expenses");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border border-border overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            AI Receipt Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          {uploadedFile ? (
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{uploadedFile.filename}</p>
                  {parsedData && (
                    <Badge variant="secondary" className="mt-1">
                      {Math.round(parsedData.confidence * 100)}% confidence
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setUploadedFile(null);
                  setParsedData(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              {parsing ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                  <p className="font-medium">Parsing receipt...</p>
                  <p className="text-sm text-muted-foreground">
                    AI is extracting data from your document
                  </p>
                </>
              ) : (
                <>
                  <div className="rounded-xl bg-secondary p-3 mb-3">
                    <Upload className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <p className="font-medium">
                    Drop a receipt here or click to upload
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    PDF, JPEG, PNG, WebP, or TIFF (max 10MB)
                  </p>
                </>
              )}
            </div>
          )}

          {parsedData && parsedData.line_items && parsedData.line_items.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Extracted Line Items</p>
              <div className="space-y-1">
                {parsedData.line_items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm rounded px-3 py-2 bg-muted/50"
                  >
                    <span className="truncate">{item.description}</span>
                    <span className="font-medium ml-4 shrink-0">
                      ${item.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Expense Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What was this expense for?"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant</Label>
              <Input
                id="merchant"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="Store or vendor name"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={currency}
                onValueChange={(v) => { if (v) setCurrency(v as Currency); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CURRENCY_INFO).map(([code, info]) => (
                    <SelectItem key={code} value={code}>
                      {info.symbol} {code} — {info.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={(v) => setProjectId(v || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((proj) => (
                    <SelectItem key={proj.id} value={proj.id}>
                      {proj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this expense..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Expense
        </Button>
      </div>
    </form>
  );
}
