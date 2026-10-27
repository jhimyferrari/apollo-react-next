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
import { useBrands, useDeleteBrand } from "../hooks/use-brands";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { MoreHorizontal, Edit, Trash2, Plus, AlertCircle, Tags } from "lucide-react";
import type { BrandResource } from "../types";

export function BrandTable() {
  const [page, setPage] = useState(1);
  const [brandToDelete, setBrandToDelete] = useState<BrandResource | null>(null);

  const { can } = usePermissions();
  const canView = can("brand.view");
  const canCreate = can("brand.create");
  const canEdit = can("brand.update");
  const canDelete = can("brand.delete");
  const hasActions = canEdit || canDelete;

  const { data, isLoading, isError, error, refetch } = useBrands(page);
  const deleteMutation = useDeleteBrand();

  const brands = data?.data || [];
  const meta = data?.meta;

  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return;
    try {
      await deleteMutation.mutateAsync(brandToDelete.id);
      setBrandToDelete(null);
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

  if (brands.length === 0) {
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
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Nome da Marca</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-36">Criado em</TableHead>
              {hasActions && (
                <TableHead className="w-16 text-center">Ações</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
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
