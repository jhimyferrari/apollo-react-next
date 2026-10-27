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
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { MoneyDisplay } from "@/components/common/money-display";
import { useProducts, useDeleteProduct } from "../hooks/use-products";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { MoreHorizontal, Edit, Trash2, Plus, AlertCircle, Package } from "lucide-react";
import type { ProductResource } from "../types";

export function ProductTable() {
  const [page, setPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState<ProductResource | null>(null);

  const { can } = usePermissions();
  const canView = can("product.view");
  const canCreate = can("product.create");
  const canEdit = can("product.update");
  const canDelete = can("product.delete");
  const hasActions = canEdit || canDelete;

  const { data, isLoading, isError, error, refetch } = useProducts(page);
  const deleteMutation = useDeleteProduct();

  const products = data?.data || [];
  const meta = data?.meta;

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      await deleteMutation.mutateAsync(productToDelete.id);
      setProductToDelete(null);
    } catch {
      // Erro tratado no hook
    }
  };

  if (!canView) {
    return (
      <div className="rounded-lg border border-border bg-card/60 p-8 text-center my-6">
        <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <h3 className="font-semibold text-foreground">
          Visualização não permitida
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Você não possui permissão para visualizar o catálogo de produtos.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <TableSkeleton rows={8} cols={hasActions ? 8 : 7} />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center my-6">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <h3 className="font-semibold text-destructive">
          Não foi possível carregar a lista de produtos
        </h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          {error?.message || "Erro de comunicação com o servidor da API."}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Nenhum produto cadastrado"
        description="Comece adicionando seu primeiro produto ao catálogo para movimentar vendas e compras."
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Produto
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
              <TableHead>Produto</TableHead>
              <TableHead className="w-24">Unidade</TableHead>
              <TableHead className="text-right">Estoque</TableHead>
              <TableHead className="text-right">Custo</TableHead>
              <TableHead className="text-right">Venda</TableHead>
              <TableHead>Marca / Categorias</TableHead>
              {hasActions && (
                <TableHead className="w-16 text-center">Ações</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              // Extrai string monetária segura sem conversão para float
              const costPriceStr =
                typeof product.cost_price === "object" && product.cost_price !== null
                  ? String((product.cost_price as Record<string, unknown>).amount || "0")
                  : String(product.cost_price || "0");
              const salePriceStr =
                typeof product.sale_price === "object" && product.sale_price !== null
                  ? String((product.sale_price as Record<string, unknown>).amount|| "0")
                  : String(product.sale_price || "0");

              const stockQtyStr =
                product.stock_quantity !== null && product.stock_quantity !== undefined
                  ? String(product.stock_quantity)
                  : "-";
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{product.number}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {product.name}
                      </span>
                      {product.ncm?.code && (
                        <span className="text-[11px] text-muted-foreground">
                          NCM: {product.ncm.code}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="uppercase font-mono text-[10px]">
                      {product.unit}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right font-medium tabular-nums">
                    {stockQtyStr}
                  </TableCell>

                  <TableCell className="text-right text-muted-foreground">
                    <MoneyDisplay value={costPriceStr} />
                  </TableCell>

                  <TableCell className="text-right font-semibold text-foreground">
                    <MoneyDisplay value={salePriceStr} />
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1">
                      {product.brand ? (
                        <Badge variant="secondary" className="text-[10px]">
                          {product.brand.name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Sem marca
                        </span>
                      )}
                      {product.categories?.map((cat) => (
                        <Badge
                          key={cat.id}
                          variant="outline"
                          className="text-[10px] bg-muted/30"
                        >
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>

                  {hasActions && (
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Ações do produto"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Ações</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          {canEdit && (
                            <DropdownMenuItem asChild className="cursor-pointer">
                              <Link href={`/products/${product.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Produto
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {canEdit && canDelete && <DropdownMenuSeparator />}
                          {canDelete && (
                            <DropdownMenuItem
                              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                              onClick={() => setProductToDelete(product)}
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
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <DataTablePagination
        meta={meta}
        onPageChange={(p) => setPage(p)}
        isLoading={isLoading}
      />

      {/* Confirmação de Exclusão */}
      <ConfirmDialog
        open={Boolean(productToDelete)}
        onOpenChange={(open) => !open && setProductToDelete(null)}
        title="Excluir Produto"
        description={`Tem certeza que deseja remover o produto "${productToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, excluir produto"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
