import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Base path for building page URLs (e.g. "/expenses"). */
  basePath?: string;
  /** URL param name for the page number. Defaults to "page". */
  pageParam?: string;
  /** For client-side pagination, use onChange instead of Link navigation. */
  onChange?: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  pageParam = "page",
  onChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;
  const prevHref = basePath ? `${basePath}?${pageParam}=${prevPage}` : "#";
  const nextHref = basePath ? `${basePath}?${pageParam}=${nextPage}` : "#";

  const linkClasses = cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 gap-1 text-xs");

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {currentPage <= 1 ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            disabled
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
        ) : onChange ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => onChange(prevPage)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
        ) : (
          <Link href={prevHref} className={linkClasses}>
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Link>
        )}
        {currentPage >= totalPages ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            disabled
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        ) : onChange ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => onChange(nextPage)}
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Link href={nextHref} className={linkClasses}>
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
