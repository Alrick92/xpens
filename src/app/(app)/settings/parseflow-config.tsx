"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { updateParseFlowConfigAction } from "@/app/actions/settings";

interface ParseFlowConfigProps {
  apiKey: string;
  apiUrl: string;
  source: "database" | "environment";
}

export function ParseFlowConfig({
  apiKey: initialApiKey,
  apiUrl: initialApiUrl,
  source,
}: ParseFlowConfigProps) {
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [apiUrl, setApiUrl] = useState(initialApiUrl);
  const [showKey, setShowKey] = useState(false);

  function maskKey(key: string): string {
    if (!key) return "";
    if (key.length <= 8) return "••••••••";
    return key.slice(0, 4) + "••••••••" + key.slice(-4);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await updateParseFlowConfigAction(apiKey, apiUrl);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("ParseFlow configuration updated");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant={source === "database" ? "default" : "outline"} className="text-xs">
          {source === "database" ? "Saved in app" : "From environment"}
        </Badge>
        {!initialApiKey && (
          <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
            Not configured
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="parseflow-key">API Key</Label>
        <div className="relative">
          <Input
            id="parseflow-key"
            type={showKey ? "text" : "password"}
            value={showKey ? apiKey : maskKey(apiKey)}
            onChange={(e) => {
              setApiKey(e.target.value);
              if (!showKey) setShowKey(true);
            }}
            onFocus={() => {
              if (!showKey) {
                setShowKey(true);
              }
            }}
            placeholder="pf_live_your_key_here"
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Get your key at{" "}
          <a href="https://parseflow.dev" target="_blank" rel="noopener noreferrer" className="underline">
            parseflow.dev
          </a>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="parseflow-url">API URL</Label>
        <Input
          id="parseflow-url"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="https://parseflow.dev/api/v1"
        />
        <p className="text-xs text-muted-foreground">
          Default: https://parseflow.dev/api/v1
        </p>
      </div>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Configuration
      </Button>
    </form>
  );
}
