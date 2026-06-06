"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { updateProfileAction } from "@/app/actions/auth";
import { CURRENCY_INFO } from "@/lib/currencies";
import type { Currency } from "@prisma/client";

interface ProfileFormProps {
  userId: string;
  name: string;
  email: string;
  defaultCurrency: Currency;
}

export function ProfileForm({
  userId,
  name: initialName,
  email,
  defaultCurrency: initialCurrency,
}: ProfileFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.set("userId", userId);
    const result = await updateProfileAction(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Profile updated");
    }
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled className="bg-muted" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={initialName} required />
      </div>
      <div className="space-y-2">
        <Label>Default Currency</Label>
        <Select name="defaultCurrency" defaultValue={initialCurrency}>
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
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}
