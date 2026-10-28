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
import { MoreHorizontal, Edit, Trash2, Plus, AlertCircle, FolderTree } from "lucide-react";
import type { CategoryResource } from "../types";

export function CategoryTable() {
  const [page, setPage] = useState(1);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryResource | null>(null);

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

  if (isLoading) {
    return <TableSkeleton rows={6} cols={5} />;
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
          <Button asChild>
            <Link href="/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Categoria
            </Link>
          </Button>
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
              <TableHead className="w-16 text-center">Ações</TableHead>
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/categories/${category.id}`}
                          className="cursor-pointer flex items-center"
                        >
                          <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => setCategoryToDelete(category)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
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
