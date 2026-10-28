import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { PaginationMeta } from "@/lib/api/types";

interface DataTablePaginationProps {
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function DataTablePagination({
  meta,
  onPageChange,
  isLoading = false,
}: DataTablePaginationProps) {
  if (!meta || meta.total === 0) {
    return null;
  }

  const { current_page, last_page, total, from, to } = meta;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      <div className="text-sm text-muted-foreground">
        Exibindo{" "}
        <span className="font-medium text-foreground">
          {from ?? 0}
        </span>{" "}
        a{" "}
        <span className="font-medium text-foreground">
          {to ?? 0}
        </span>{" "}
        de{" "}
        <span className="font-medium text-foreground">
          {total}
        </span>{" "}
        resultados
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={current_page <= 1 || isLoading}
          title="Primeira página"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page <= 1 || isLoading}
          title="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-xs sm:text-sm font-medium px-2">
          Página {current_page} de {last_page}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page >= last_page || isLoading}
          title="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(last_page)}
          disabled={current_page >= last_page || isLoading}
          title="Última página"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
