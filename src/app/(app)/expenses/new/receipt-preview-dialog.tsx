"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Sparkles } from "lucide-react";

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

interface ReceiptPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  fileName: string;
  fileType: string;
  parsedData: ParsedData;
  onConfirm: (edited: ParsedData) => void;
}

export function ReceiptPreviewDialog({
  open,
  onOpenChange,
  fileUrl,
  fileName,
  fileType,
  parsedData,
  onConfirm,
}: ReceiptPreviewDialogProps) {
  const [vendor, setVendor] = useState(parsedData.vendor || "");
  const [total, setTotal] = useState(parsedData.total?.toString() || "");
  const [subtotal, setSubtotal] = useState(parsedData.subtotal?.toString() || "");
  const [tax, setTax] = useState(parsedData.tax?.toString() || "");
  const [date, setDate] = useState(parsedData.date || "");
  const [currency, setCurrency] = useState(parsedData.currency || "USD");

  function handleConfirm() {
    const edited: ParsedData = {
      ...parsedData,
      vendor: vendor || null,
      total: total ? parseFloat(total) : null,
      subtotal: subtotal ? parseFloat(subtotal) : null,
      tax: tax ? parseFloat(tax) : null,
      date: date || null,
      currency: currency || null,
    };
    onConfirm(edited);
  }

  const isImage = fileType.startsWith("image/");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Review Extracted Data
          </DialogTitle>
          <DialogDescription>
            Verify and edit the extracted fields before saving. {fileName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
          {/* Left: Receipt preview */}
          <div className="overflow-auto rounded-lg border bg-muted/30 flex items-start justify-center p-2 min-h-[300px] max-h-[60vh]">
            {isImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={fileUrl}
                alt={`Receipt: ${fileName}`}
                className="max-w-full h-auto object-contain rounded"
              />
            ) : (
              <iframe
                src={fileUrl}
                title={`Receipt: ${fileName}`}
                className="w-full h-full min-h-[300px] rounded"
              />
            )}
          </div>

          {/* Right: Extracted fields */}
          <div className="overflow-auto space-y-3 pr-1 max-h-[60vh]">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {Math.round(parsedData.confidence * 100)}% confidence
              </Badge>
              <Badge variant="outline" className="text-xs">
                {parsedData.document_type}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="preview-vendor" className="text-xs">Merchant / Vendor</Label>
                <Input
                  id="preview-vendor"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="Vendor name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="preview-total" className="text-xs">Total</Label>
                  <Input
                    id="preview-total"
                    type="number"
                    step="0.01"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="preview-currency" className="text-xs">Currency</Label>
                  <Input
                    id="preview-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="USD"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="preview-subtotal" className="text-xs">Subtotal</Label>
                  <Input
                    id="preview-subtotal"
                    type="number"
                    step="0.01"
                    value={subtotal}
                    onChange={(e) => setSubtotal(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="preview-tax" className="text-xs">Tax</Label>
                  <Input
                    id="preview-tax"
                    type="number"
                    step="0.01"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="preview-date" className="text-xs">Date</Label>
                <Input
                  id="preview-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            {parsedData.line_items && parsedData.line_items.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium mb-2">Line Items ({parsedData.line_items.length})</p>
                  <div className="space-y-1">
                    {parsedData.line_items.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-xs rounded px-2 py-1.5 bg-muted/50"
                      >
                        <span className="truncate">{item.description}</span>
                        <span className="font-medium ml-2 shrink-0">
                          ${item.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="gap-1.5">
            <Check className="h-4 w-4" />
            Apply & Fill Form
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
