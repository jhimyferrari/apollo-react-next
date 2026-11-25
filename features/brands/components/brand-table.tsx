"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import {
  DataTableToolbar,
  SortableTableHead,
} from "@/components/common/data-table-toolbar";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { formatDate } from "@/lib/formatters";
import { toggleSortState, type SortState } from "@/lib/table-utils";
import { useBrands, useDeleteBrand } from "../hooks/use-brands";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { MoreHorizontal, Edit, Trash2, Plus, AlertCircle, Tags } from "lucide-react";
import type { BrandResource } from "../types";

type BrandSortKey = "number" | "name" | "created_at";

const BRAND_SORT_OPTIONS: Array<{ value: BrandSortKey; label: string }> = [
  { value: "number", label: "Código (#)" },
  { value: "name", label: "Nome da Marca" },
  { value: "created_at", label: "Criado em" },
];

export function BrandTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortState, setSortState] = useState<SortState<BrandSortKey> | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<{
    search: string;
    sortState: SortState<BrandSortKey> | null;
  }>({ search: "", sortState: null });
  const [brandToDelete, setBrandToDelete] = useState<BrandResource | null>(null);

  const { can } = usePermissions();
  const canView = can("brand.view");
  const canCreate = can("brand.create");
  const canEdit = can("brand.update");
  const canDelete = can("brand.delete");
  const hasActions = canEdit || canDelete;

  const { data, isLoading, isFetching, isError, error, refetch } = useBrands({
    page,
    search: appliedFilters.search,
    sort_by: appliedFilters.sortState?.key,
    sort_direction: appliedFilters.sortState?.direction,
  });
  const deleteMutation = useDeleteBrand();

  const brands = useMemo(() => data?.data || [], [data]);
  const meta = data?.meta;

  const hasDraftFilters = search.trim() !== "" || sortState !== null;
  const hasAppliedFilters =
    appliedFilters.search.trim() !== "" || appliedFilters.sortState !== null;
  const hasActiveFilters = hasDraftFilters || hasAppliedFilters;

  const handleApplyFilters = () => {
    const isSame =
      appliedFilters.search === search &&
      appliedFilters.sortState?.key === sortState?.key &&
      appliedFilters.sortState?.direction === sortState?.direction;

    if (isSame && page === 1) {
      void refetch();
      return;
    }

    setAppliedFilters({ search, sortState });
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearch("");
    setSortState(null);
    setAppliedFilters({ search: "", sortState: null });
    setPage(1);
  };

  const handleHeaderSort = (key: string) => {
    const nextSort = toggleSortState(
      appliedFilters.sortState,
      key as BrandSortKey
    );
    setSortState(nextSort);
    setAppliedFilters((prev) => ({ ...prev, sortState: nextSort }));
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return;
    try {
      await deleteMutation.mutateAsync(brandToDelete.id);
      setBrandToDelete(null);
      if (brands.length === 1 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      }
    } catch {
      // Erro tratado no hook
    }
  };

  if (!canView) {
    return (
      <div className="rounded-lg border border-border bg-card/60 p-8 text-center my-6">
        <Tags className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <h3 className="font-semibold text-foreground">
          Visualização não permitida
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Você não possui permissão para visualizar a listagem de marcas.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <TableSkeleton rows={6} cols={hasActions ? 5 : 4} />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center my-6">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <h3 className="font-semibold text-destructive">
          Não foi possível carregar as marcas
        </h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          {error?.message || "Erro de comunicação com a API."}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (brands.length === 0 && !hasAppliedFilters && page === 1 && (meta?.total ?? 0) === 0) {
    return (
      <EmptyState
        icon={Tags}
        title="Nenhuma marca cadastrada"
        description="Cadastre marcas para organizar e categorizar os produtos do seu catálogo."
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/brands/new">
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Marca
              </Link>
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, código ou descrição..."
        sortOptions={BRAND_SORT_OPTIONS}
        sortState={sortState}
        onSortKeyChange={(key) =>
          setSortState(
            key ? { key: key as BrandSortKey, direction: sortState?.direction ?? "asc" } : null
          )
        }
        onSortDirectionToggle={() =>
          setSortState((prev) =>
            prev
              ? { ...prev, direction: prev.direction === "asc" ? "desc" : "asc" }
              : null
          )
        }
        onSubmit={handleApplyFilters}
        onClearAll={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
        isFetching={isFetching && !isLoading}
        filteredCount={brands.length}
        totalCount={meta?.total ?? brands.length}
      />

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                label="#"
                sortKey="number"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
                className="w-16"
              />
              <SortableTableHead
                label="Nome da Marca"
                sortKey="name"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
              />
              <TableHead>Descrição</TableHead>
              <SortableTableHead
                label="Criado em"
                sortKey="created_at"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
                className="w-36"
              />
              {hasActions && (
                <TableHead className="w-16 text-center">Ações</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={hasActions ? 5 : 4}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {page > 1 && meta && meta.total > 0 ? (
                    <>
                      <p>Nenhum registro nesta página.</p>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => setPage(Math.max(1, meta.last_page))}
                        className="mt-1"
                      >
                        Ir para a última página
                      </Button>
                    </>
                  ) : (
                    <>
                      <p>Nenhuma marca encontrada com os filtros atuais.</p>
                      {hasAppliedFilters && (
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={clearAllFilters}
                          className="mt-1"
                        >
                          Limpar filtros
                        </Button>
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{brand.number}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {brand.name}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                  {brand.description || "-"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(brand.created_at)}
                </TableCell>
                {hasActions && (
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Opções</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        {canEdit && (
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/brands/${brand.id}`}
                              className="cursor-pointer flex items-center"
                            >
                              <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {canEdit && canDelete && <DropdownMenuSeparator />}
                        {canDelete && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => setBrandToDelete(brand)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && (
        <DataTablePagination
          meta={meta}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}

      <ConfirmDialog
        open={Boolean(brandToDelete)}
        onOpenChange={(open) => !open && setBrandToDelete(null)}
        title="Excluir Marca"
        description={`Tem certeza que deseja excluir a marca "${brandToDelete?.name}"? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir Marca"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
