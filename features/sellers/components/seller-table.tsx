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
import { Badge } from "@/components/ui/badge";
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
import { maskDocument, maskPhone } from "@/lib/masks";
import { toggleSortState, type SortState } from "@/lib/table-utils";
import { useSellers, useDeleteSeller } from "../hooks/use-sellers";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { MoreHorizontal, Edit, Trash2, Plus, AlertCircle, Briefcase } from "lucide-react";
import type { SellerResource } from "../types";

type SellerSortKey = "number" | "legal_name" | "document" | "status";

const SELLER_SORT_OPTIONS: Array<{ value: SellerSortKey; label: string }> = [
  { value: "number", label: "Código (#)" },
  { value: "legal_name", label: "Nome / Razão" },
  { value: "document", label: "CPF / CNPJ" },
  { value: "status", label: "Status" },
];

export function SellerTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortState, setSortState] = useState<SortState<SellerSortKey> | null>(
    null
  );
  const [appliedFilters, setAppliedFilters] = useState<{
    search: string;
    status: string;
    sortState: SortState<SellerSortKey> | null;
  }>({ search: "", status: "all", sortState: null });
  const [sellerToDelete, setSellerToDelete] = useState<SellerResource | null>(null);

  const { can } = usePermissions();
  const canView = can("seller.view");
  const canCreate = can("seller.create");
  const canEdit = can("seller.update");
  const canDelete = can("seller.delete");
  const hasActions = canEdit || canDelete;

  const { data, isLoading, isFetching, isError, error, refetch } = useSellers({
    page,
    search: appliedFilters.search,
    status: appliedFilters.status,
    sort_by: appliedFilters.sortState?.key,
    sort_direction: appliedFilters.sortState?.direction,
  });
  const deleteMutation = useDeleteSeller();

  const sellers = useMemo(() => data?.data || [], [data]);
  const meta = data?.meta;

  const hasDraftFilters =
    search.trim() !== "" || statusFilter !== "all" || sortState !== null;
  const hasAppliedFilters =
    appliedFilters.search.trim() !== "" ||
    appliedFilters.status !== "all" ||
    appliedFilters.sortState !== null;
  const hasActiveFilters = hasDraftFilters || hasAppliedFilters;

  const handleApplyFilters = () => {
    const isSame =
      appliedFilters.search === search &&
      appliedFilters.status === statusFilter &&
      appliedFilters.sortState?.key === sortState?.key &&
      appliedFilters.sortState?.direction === sortState?.direction;

    if (isSame && page === 1) {
      void refetch();
      return;
    }

    setAppliedFilters({ search, status: statusFilter, sortState });
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortState(null);
    setAppliedFilters({ search: "", status: "all", sortState: null });
    setPage(1);
  };

  const handleHeaderSort = (key: string) => {
    const nextSort = toggleSortState(
      appliedFilters.sortState,
      key as SellerSortKey
    );
    setSortState(nextSort);
    setAppliedFilters((prev) => ({ ...prev, sortState: nextSort }));
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!sellerToDelete) return;
    try {
      await deleteMutation.mutateAsync(sellerToDelete.id);
      setSellerToDelete(null);
      if (sellers.length === 1 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      }
    } catch {
      // Erro tratado no hook
    }
  };

  if (!canView) {
    return (
      <div className="rounded-lg border border-border bg-card/60 p-8 text-center my-6">
        <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <h3 className="font-semibold text-foreground">
          Visualização não permitida
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Você não possui permissão para visualizar a listagem de vendedores.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <TableSkeleton rows={8} cols={hasActions ? 6 : 5} />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center my-6">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <h3 className="font-semibold text-destructive">
          Não foi possível carregar a equipe de vendedores
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

  if (sellers.length === 0 && !hasAppliedFilters && page === 1 && (meta?.total ?? 0) === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Nenhum vendedor cadastrado"
        description="Cadastre vendedores para vinculá-los aos pedidos de venda e gerenciar sua equipe."
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/sellers/new">
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Vendedor
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
        searchPlaceholder="Buscar por nome, fantasia, código, CPF/CNPJ ou contato..."
        filters={[
          {
            id: "status",
            label: "Status",
            value: statusFilter,
            allLabel: "Todos os status",
            options: [
              { value: "active", label: "Ativo" },
              { value: "inactive", label: "Inativo" },
            ],
            onChange: setStatusFilter,
          },
        ]}
        sortOptions={SELLER_SORT_OPTIONS}
        sortState={sortState}
        onSortKeyChange={(key) =>
          setSortState(
            key ? { key: key as SellerSortKey, direction: sortState?.direction ?? "asc" } : null
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
        filteredCount={sellers.length}
        totalCount={meta?.total ?? sellers.length}
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
                label="Vendedor (Razão / Fantasia)"
                sortKey="legal_name"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
              />
              <SortableTableHead
                label="CPF / CNPJ"
                sortKey="document"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
              />
              <TableHead>Contato</TableHead>
              <SortableTableHead
                label="Status"
                sortKey="status"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
                className="w-24"
              />
              {hasActions && (
                <TableHead className="w-16 text-center">Ações</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sellers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={hasActions ? 6 : 5}
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
                      <p>Nenhum vendedor encontrado com os filtros atuais.</p>
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
              sellers.map((seller) => (
              <TableRow key={seller.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{seller.number}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {seller.legal_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {seller.trade_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {maskDocument(seller.document)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs text-muted-foreground">
                    <span>{seller.email || "-"}</span>
                    <span>{seller.phone ? maskPhone(seller.phone) : ""}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={seller.status === "active" ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {seller.status === "inactive" ? "Inativo" : "Ativo"}
                  </Badge>
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
                              href={`/sellers/${seller.id}`}
                              className="cursor-pointer flex items-center"
                            >
                              <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                              Editar / Endereços
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {canEdit && canDelete && <DropdownMenuSeparator />}
                        {canDelete && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => setSellerToDelete(seller)}
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
        open={Boolean(sellerToDelete)}
        onOpenChange={(open) => !open && setSellerToDelete(null)}
        title="Excluir Vendedor"
        description={`Tem certeza que deseja excluir o vendedor "${sellerToDelete?.legal_name}"? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir Vendedor"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
