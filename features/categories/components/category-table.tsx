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
import { useCategories, useDeleteCategory } from "../hooks/use-categories";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { MoreHorizontal, Edit, Trash2, Plus, AlertCircle, FolderTree } from "lucide-react";
import type { CategoryResource } from "../types";

type CategorySortKey = "number" | "name" | "created_at";

const CATEGORY_SORT_OPTIONS: Array<{ value: CategorySortKey; label: string }> = [
  { value: "number", label: "Código (#)" },
  { value: "name", label: "Nome da Categoria" },
  { value: "created_at", label: "Criado em" },
];

export function CategoryTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortState, setSortState] = useState<SortState<CategorySortKey> | null>(
    null
  );
  const [appliedFilters, setAppliedFilters] = useState<{
    search: string;
    sortState: SortState<CategorySortKey> | null;
  }>({ search: "", sortState: null });
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryResource | null>(null);

  const { can } = usePermissions();
  const canView = can("category.view");
  const canCreate = can("category.create");
  const canEdit = can("category.update");
  const canDelete = can("category.delete");
  const hasActions = canEdit || canDelete;

  const { data, isLoading, isFetching, isError, error, refetch } = useCategories({
    page,
    search: appliedFilters.search,
    sort_by: appliedFilters.sortState?.key,
    sort_direction: appliedFilters.sortState?.direction,
  });
  const deleteMutation = useDeleteCategory();

  const categories = useMemo(() => data?.data || [], [data]);
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
      key as CategorySortKey
    );
    setSortState(nextSort);
    setAppliedFilters((prev) => ({ ...prev, sortState: nextSort }));
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteMutation.mutateAsync(categoryToDelete.id);
      setCategoryToDelete(null);
      if (categories.length === 1 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      }
    } catch {
      // Erro tratado no hook
    }
  };

  if (!canView) {
    return (
      <div className="rounded-lg border border-border bg-card/60 p-8 text-center my-6">
        <FolderTree className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <h3 className="font-semibold text-foreground">
          Visualização não permitida
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Você não possui permissão para visualizar a listagem de categorias.
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
          Não foi possível carregar as categorias
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

  if (categories.length === 0 && !hasAppliedFilters && page === 1 && (meta?.total ?? 0) === 0) {
    return (
      <EmptyState
        icon={FolderTree}
        title="Nenhuma categoria cadastrada"
        description="Crie categorias para classificar os produtos do seu catálogo e facilitar a busca."
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/categories/new">
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Categoria
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
        sortOptions={CATEGORY_SORT_OPTIONS}
        sortState={sortState}
        onSortKeyChange={(key) =>
          setSortState(
            key ? { key: key as CategorySortKey, direction: sortState?.direction ?? "asc" } : null
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
        filteredCount={categories.length}
        totalCount={meta?.total ?? categories.length}
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
                label="Nome da Categoria"
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
            {categories.length === 0 ? (
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
                      <p>Nenhuma categoria encontrada com os filtros atuais.</p>
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
              categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{category.number}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {category.name}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                  {category.description || "-"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(category.created_at)}
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
                              href={`/categories/${category.id}`}
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
                            onClick={() => setCategoryToDelete(category)}
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
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
        title="Excluir Categoria"
        description={`Tem certeza que deseja excluir a categoria "${categoryToDelete?.name}"? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir Categoria"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
