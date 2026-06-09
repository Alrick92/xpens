"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  createCategoryAction,
  deleteCategoryAction,
} from "@/app/actions/categories";

interface CategoryManagerProps {
  categories: { id: string; name: string; isDefault: boolean }[];
  isAdmin: boolean;
}

const PAGE_SIZE = 10;

export function CategoryManager({ categories, isAdmin }: CategoryManagerProps) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(categories.length / PAGE_SIZE);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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
        {paginatedCategories.map((cat) => (
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
