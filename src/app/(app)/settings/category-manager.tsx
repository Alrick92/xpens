"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2 } from "lucide-react";
import {
  createCategoryAction,
  deleteCategoryAction,
} from "@/app/actions/categories";

interface CategoryManagerProps {
  categories: { id: string; name: string; isDefault: boolean }[];
  isAdmin: boolean;
}

export function CategoryManager({ categories, isAdmin }: CategoryManagerProps) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    const formData = new FormData();
    formData.set("name", newName.trim());
    const result = await createCategoryAction(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Category added");
      setNewName("");
      router.refresh();
    }
    setAdding(false);
  }

  async function handleDelete(categoryId: string) {
    const result = await deleteCategoryAction(categoryId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Category deleted");
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
        />
        <Button onClick={handleAdd} disabled={adding} className="gap-2 shrink-0">
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-lg border px-4 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{cat.name}</span>
              {cat.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  Default
                </Badge>
              )}
            </div>
            {isAdmin && !cat.isDefault && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(cat.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No categories yet. Add one above.
          </p>
        )}
      </div>
    </div>
  );
}
