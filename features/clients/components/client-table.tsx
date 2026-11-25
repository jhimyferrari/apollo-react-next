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
import { useClients, useDeleteClient } from "../hooks/use-clients";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { MoreHorizontal, Edit, Trash2, Plus, AlertCircle, Users } from "lucide-react";
import type { ClientResource } from "../types";

type ClientSortKey = "number" | "legal_name" | "document" | "status";

const CLIENT_SORT_OPTIONS: Array<{ value: ClientSortKey; label: string }> = [
  { value: "number", label: "Código (#)" },
  { value: "legal_name", label: "Nome / Razão" },
  { value: "document", label: "CPF / CNPJ" },
  { value: "status", label: "Status" },
];

export function ClientTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortState, setSortState] = useState<SortState<ClientSortKey> | null>(
    null
  );
  const [appliedFilters, setAppliedFilters] = useState<{
    search: string;
    status: string;
    sortState: SortState<ClientSortKey> | null;
  }>({ search: "", status: "all", sortState: null });
  const [clientToDelete, setClientToDelete] = useState<ClientResource | null>(null);

  const { can } = usePermissions();
  const canView = can("client.view");
  const canCreate = can("client.create");
  const canEdit = can("client.update");
  const canDelete = can("client.delete");
  const hasActions = canEdit || canDelete;

  const { data, isLoading, isFetching, isError, error, refetch } = useClients({
    page,
    search: appliedFilters.search,
    status: appliedFilters.status,
    sort_by: appliedFilters.sortState?.key,
    sort_direction: appliedFilters.sortState?.direction,
  });
  const deleteMutation = useDeleteClient();

  const clients = useMemo(() => data?.data || [], [data]);
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
      key as ClientSortKey
    );
    setSortState(nextSort);
    setAppliedFilters((prev) => ({ ...prev, sortState: nextSort }));
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    try {
      await deleteMutation.mutateAsync(clientToDelete.id);
      setClientToDelete(null);
      if (clients.length === 1 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      }
    } catch {
      // Erro tratado no hook
    }
  };

  if (!canView) {
    return (
      <div className="rounded-lg border border-border bg-card/60 p-8 text-center my-6">
        <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <h3 className="font-semibold text-foreground">
          Visualização não permitida
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Você não possui permissão para visualizar a listagem de clientes.
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
          Não foi possível carregar a lista de clientes
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

  if (clients.length === 0 && !hasAppliedFilters && page === 1 && (meta?.total ?? 0) === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum cliente cadastrado"
        description="Cadastre clientes para emitir pedidos de venda e gerenciar parceiros comerciais."
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/clients/new">
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Cliente
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
        sortOptions={CLIENT_SORT_OPTIONS}
        sortState={sortState}
        onSortKeyChange={(key) =>
          setSortState(
            key ? { key: key as ClientSortKey, direction: sortState?.direction ?? "asc" } : null
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
        filteredCount={clients.length}
        totalCount={meta?.total ?? clients.length}
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
                label="Cliente (Razão / Fantasia)"
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
            {clients.length === 0 ? (
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
                      <p>Nenhum cliente encontrado com os filtros atuais.</p>
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
              clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{client.number}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {client.legal_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {client.trade_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {maskDocument(client.document)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs text-muted-foreground">
                    <span>{client.email || "-"}</span>
                    <span>{client.phone ? maskPhone(client.phone) : ""}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={client.status === "active" ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {client.status === "inactive" ? "Inativo" : "Ativo"}
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
                              href={`/clients/${client.id}`}
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
                            onClick={() => setClientToDelete(client)}
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
        open={Boolean(clientToDelete)}
        onOpenChange={(open) => !open && setClientToDelete(null)}
        title="Excluir Cliente"
        description={`Tem certeza que deseja excluir o cliente "${clientToDelete?.legal_name}"? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir Cliente"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
