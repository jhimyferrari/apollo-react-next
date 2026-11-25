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
import { formatDate } from "@/lib/formatters";
import { toggleSortState, type SortState } from "@/lib/table-utils";
import { useUsers, useDeleteUser } from "../hooks/use-users";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { ChangeOwnPasswordDialog } from "./change-own-password-dialog";
import {
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  Trash2,
  Plus,
  AlertCircle,
  Users,
  KeyRound,
} from "lucide-react";
import type { UserResource } from "../types";

type UserSortKey = "name" | "email" | "permissions" | "created_at";

const USER_SORT_OPTIONS: Array<{ value: UserSortKey; label: string }> = [
  { value: "name", label: "Nome" },
  { value: "email", label: "E-mail" },
  { value: "permissions", label: "Permissões" },
  { value: "created_at", label: "Cadastro" },
];

function isUserAdmin(user: UserResource): boolean {
  return (
    Boolean(user.is_administrator) ||
    Boolean(user.permissions?.some((p) => p.name.startsWith("user.")))
  );
}

export function UserTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [profileFilter, setProfileFilter] = useState("all");
  const [sortState, setSortState] = useState<SortState<UserSortKey> | null>(
    null
  );
  const [appliedFilters, setAppliedFilters] = useState<{
    search: string;
    profile: string;
    sortState: SortState<UserSortKey> | null;
  }>({ search: "", profile: "all", sortState: null });
  const [userToDelete, setUserToDelete] = useState<UserResource | null>(null);
  const [showOwnPasswordDialog, setShowOwnPasswordDialog] = useState(false);

  const { user: currentUser } = useAuth();

  const { can } = usePermissions();
  const canView = can("user.view");
  const canCreate = can("user.create");
  const canEdit = can("user.update");
  const canDelete = can("user.delete");
  const hasActions = canEdit || canDelete;

  const { data, isLoading, isFetching, isError, error, refetch } = useUsers({
    page,
    search: appliedFilters.search,
    profile: appliedFilters.profile,
    sort_by: appliedFilters.sortState?.key,
    sort_direction: appliedFilters.sortState?.direction,
  });
  const deleteMutation = useDeleteUser();

  const users = useMemo(() => data?.data || [], [data]);
  const meta = data?.meta;

  const hasDraftFilters =
    search.trim() !== "" || profileFilter !== "all" || sortState !== null;
  const hasAppliedFilters =
    appliedFilters.search.trim() !== "" ||
    appliedFilters.profile !== "all" ||
    appliedFilters.sortState !== null;
  const hasActiveFilters = hasDraftFilters || hasAppliedFilters;

  const handleApplyFilters = () => {
    const isSame =
      appliedFilters.search === search &&
      appliedFilters.profile === profileFilter &&
      appliedFilters.sortState?.key === sortState?.key &&
      appliedFilters.sortState?.direction === sortState?.direction;

    if (isSame && page === 1) {
      void refetch();
      return;
    }

    setAppliedFilters({ search, profile: profileFilter, sortState });
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearch("");
    setProfileFilter("all");
    setSortState(null);
    setAppliedFilters({ search: "", profile: "all", sortState: null });
    setPage(1);
  };

  const handleHeaderSort = (key: string) => {
    const nextSort = toggleSortState(
      appliedFilters.sortState,
      key as UserSortKey
    );
    setSortState(nextSort);
    setAppliedFilters((prev) => ({ ...prev, sortState: nextSort }));
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await deleteMutation.mutateAsync(userToDelete.id);
      setUserToDelete(null);
      if (users.length === 1 && page > 1) {
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
          Você não possui permissão para visualizar a listagem de usuários.
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
          Não foi possível carregar os usuários
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

  if (users.length === 0 && !hasAppliedFilters && page === 1 && (meta?.total ?? 0) === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum usuário cadastrado"
        description="Cadastre operadores e administradores para gerenciar o acesso ao sistema."
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/users/new">
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Usuário
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
        searchPlaceholder="Buscar por nome ou e-mail..."
        filters={[
          {
            id: "profile",
            label: "Perfil",
            value: profileFilter,
            allLabel: "Todos os perfis",
            options: [
              { value: "admin", label: "Administradores" },
              { value: "operator", label: "Operadores" },
            ],
            onChange: setProfileFilter,
          },
        ]}
        sortOptions={USER_SORT_OPTIONS}
        sortState={sortState}
        onSortKeyChange={(key) =>
          setSortState(
            key ? { key: key as UserSortKey, direction: sortState?.direction ?? "asc" } : null
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
        filteredCount={users.length}
        totalCount={meta?.total ?? users.length}
      />

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                label="Nome"
                sortKey="name"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
              />
              <SortableTableHead
                label="E-mail"
                sortKey="email"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
              />
              <SortableTableHead
                label="Permissões"
                sortKey="permissions"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
              />
              <SortableTableHead
                label="Cadastro"
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
            {users.length === 0 ? (
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
                      <p>Nenhum usuário encontrado com os filtros atuais.</p>
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
              users.map((user) => {
              const permCount = user.permissions?.length || 0;
              const isAdmin = isUserAdmin(user);
              const isSelf = Boolean(currentUser?.id && user.id === currentUser.id);
              const showRowActions =
                (canEdit && (isSelf || !isAdmin)) ||
                (canDelete && !isAdmin && !isSelf);

              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-foreground">
                    <span>{user.name}</span>
                    {isSelf && (
                      <Badge variant="secondary" className="ml-2 text-[10px]">
                        Você
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <Badge variant="default" className="text-xs">
                        <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                        Administrador
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <ShieldCheck className="mr-1 h-3.5 w-3.5 text-primary" />
                        {permCount} {permCount === 1 ? "permissão" : "permissões"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(user.created_at)}
                  </TableCell>
                  {hasActions && (
                    <TableCell className="text-center">
                      {/* Próprio usuário acessa alteração da própria senha; administradores não podem ser excluídos */}
                      {showRowActions && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Opções</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          {canEdit &&
                            (isSelf ? (
                              <DropdownMenuItem
                                className="cursor-pointer flex items-center"
                                onClick={() => setShowOwnPasswordDialog(true)}
                              >
                                <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />
                                Alterar Minha Senha
                              </DropdownMenuItem>
                            ) : !isAdmin ? (
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/users/${user.id}`}
                                  className="cursor-pointer flex items-center"
                                >
                                  <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                                  Editar Usuário
                                </Link>
                              </DropdownMenuItem>
                            ) : null)}
                          {canEdit && canDelete && !isAdmin && !isSelf && <DropdownMenuSeparator />}
                          {canDelete && !isAdmin && !isSelf && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => setUserToDelete(user)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })
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
        open={Boolean(userToDelete)}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        title="Excluir Usuário"
        description={`Tem certeza que deseja excluir o usuário "${userToDelete?.name}"? Esta ação revogará todo o acesso ao sistema.`}
        confirmLabel="Excluir Usuário"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />

      <ChangeOwnPasswordDialog
        open={showOwnPasswordDialog}
        onOpenChange={setShowOwnPasswordDialog}
      />
    </div>
  );
}
