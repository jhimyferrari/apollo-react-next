"use client";

import React, { useState } from "react";
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
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { formatDate } from "@/lib/formatters";
import { useCategories, useDeleteCategory } from "../hooks/use-categories";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { MoreHorizontal, Edit, Trash2, Plus, AlertCircle, FolderTree } from "lucide-react";
import type { CategoryResource } from "../types";

export function CategoryTable() {
  const [page, setPage] = useState(1);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryResource | null>(null);

  const { can } = usePermissions();
  const canView = can("category.view");
  const canCreate = can("category.create");
  const canEdit = can("category.update");
  const canDelete = can("category.delete");
  const hasActions = canEdit || canDelete;

  const { data, isLoading, isError, error, refetch } = useCategories(page);
  const deleteMutation = useDeleteCategory();

  const categories = data?.data || [];
  const meta = data?.meta;

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteMutation.mutateAsync(categoryToDelete.id);
      setCategoryToDelete(null);
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

  if (categories.length === 0) {
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
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Nome da Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-36">Criado em</TableHead>
              {hasActions && (
                <TableHead className="w-16 text-center">Ações</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
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
            ))}
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
