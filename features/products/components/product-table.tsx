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
  type TableFilterConfig,
} from "@/components/common/data-table-toolbar";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { MoneyDisplay } from "@/components/common/money-display";
import { formatQuantity } from "@/lib/formatters";
import { maskNCM } from "@/lib/masks";
import { toggleSortState, type SortState } from "@/lib/table-utils";
import { useProducts, useDeleteProduct } from "../hooks/use-products";
import { useBrandLookup, useCategoryLookup } from "@/features/lookups/hooks/use-lookups";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { MoreHorizontal, Edit, Trash2, Plus, AlertCircle, Package } from "lucide-react";
import type { ProductResource } from "../types";

type ProductSortKey =
  | "number"
  | "name"
  | "unit"
  | "stock_quantity"
  | "cost_price"
  | "sale_price"
  | "status";

const PRODUCT_SORT_OPTIONS: Array<{ value: ProductSortKey; label: string }> = [
  { value: "number", label: "Código (#)" },
  { value: "name", label: "Nome" },
  { value: "unit", label: "Unidade" },
  { value: "stock_quantity", label: "Estoque" },
  { value: "cost_price", label: "Preço de Custo" },
  { value: "sale_price", label: "Preço de Venda" },
  { value: "status", label: "Status" },
];

export function ProductTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortState, setSortState] = useState<SortState<ProductSortKey> | null>(
    null
  );
  const [appliedFilters, setAppliedFilters] = useState<{
    search: string;
    status: string;
    brandId: string;
    categoryId: string;
    sortState: SortState<ProductSortKey> | null;
  }>({
    search: "",
    status: "all",
    brandId: "all",
    categoryId: "all",
    sortState: null,
  });
  const [productToDelete, setProductToDelete] = useState<ProductResource | null>(null);

  const { can } = usePermissions();
  const canView = can("product.view");
  const canCreate = can("product.create");
  const canEdit = can("product.update");
  const canDelete = can("product.delete");
  const hasActions = canEdit || canDelete;

  const canBrandLookup = can(
    ["brand.view", "product.create", "product.update"],
    "any"
  );
  const canCategoryLookup = can(
    ["category.view", "product.create", "product.update"],
    "any"
  );

  const { data: brandsLookupData } = useBrandLookup(
    undefined,
    canView && canBrandLookup
  );
  const { data: categoriesLookupData } = useCategoryLookup(
    undefined,
    canView && canCategoryLookup
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useProducts({
    page,
    search: appliedFilters.search,
    status: appliedFilters.status,
    brand_id: appliedFilters.brandId,
    category_id: appliedFilters.categoryId,
    sort_by: appliedFilters.sortState?.key,
    sort_direction: appliedFilters.sortState?.direction,
  });
  const deleteMutation = useDeleteProduct();

  const products = useMemo(() => data?.data || [], [data]);
  const meta = data?.meta;

  const brandOptions = useMemo(() => {
    const opts = (brandsLookupData?.data || [])
      .map((b) => ({ value: b.id, label: b.name }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
    opts.push({ value: "none", label: "Sem marca" });
    return opts;
  }, [brandsLookupData]);

  const categoryOptions = useMemo(() => {
    return (categoriesLookupData?.data || [])
      .map((c) => ({ value: c.id, label: c.name }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [categoriesLookupData]);

  const hasDraftFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    brandFilter !== "all" ||
    categoryFilter !== "all" ||
    sortState !== null;

  const hasAppliedFilters =
    appliedFilters.search.trim() !== "" ||
    appliedFilters.status !== "all" ||
    appliedFilters.brandId !== "all" ||
    appliedFilters.categoryId !== "all" ||
    appliedFilters.sortState !== null;

  const hasActiveFilters = hasDraftFilters || hasAppliedFilters;

  const handleApplyFilters = () => {
    const isSame =
      appliedFilters.search === search &&
      appliedFilters.status === statusFilter &&
      appliedFilters.brandId === brandFilter &&
      appliedFilters.categoryId === categoryFilter &&
      appliedFilters.sortState?.key === sortState?.key &&
      appliedFilters.sortState?.direction === sortState?.direction;

    if (isSame && page === 1) {
      void refetch();
      return;
    }

    setAppliedFilters({
      search,
      status: statusFilter,
      brandId: brandFilter,
      categoryId: categoryFilter,
      sortState,
    });
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setBrandFilter("all");
    setCategoryFilter("all");
    setSortState(null);
    setAppliedFilters({
      search: "",
      status: "all",
      brandId: "all",
      categoryId: "all",
      sortState: null,
    });
    setPage(1);
  };

  const handleHeaderSort = (key: string) => {
    const nextSort = toggleSortState(
      appliedFilters.sortState,
      key as ProductSortKey
    );
    setSortState(nextSort);
    setAppliedFilters((prev) => ({ ...prev, sortState: nextSort }));
    setPage(1);
  };

  const filters: TableFilterConfig[] = [
    {
      id: "status",
      label: "Status",
      value: statusFilter,
      allLabel: "Todos os status",
      options: [
        { value: "active", label: "Ativo" },
        { value: "inactive", label: "Inativo" },
        { value: "discontinued", label: "Descontinuado" },
      ],
      onChange: setStatusFilter,
    },
    ...(canBrandLookup
      ? [
          {
            id: "brand",
            label: "Marca",
            value: brandFilter,
            allLabel: "Todas as marcas",
            options: brandOptions,
            onChange: setBrandFilter,
          },
        ]
      : []),
    ...(canCategoryLookup && categoryOptions.length > 0
      ? [
          {
            id: "category",
            label: "Categoria",
            value: categoryFilter,
            allLabel: "Todas as categorias",
            options: categoryOptions,
            onChange: setCategoryFilter,
          },
        ]
      : []),
  ];

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      await deleteMutation.mutateAsync(productToDelete.id);
      setProductToDelete(null);
      if (products.length === 1 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      }
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
    return <TableSkeleton rows={8} cols={hasActions ? 9 : 8} />;
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

  if (products.length === 0 && !hasAppliedFilters && page === 1 && (meta?.total ?? 0) === 0) {
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
      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, código, NCM, EAN, marca ou categoria..."
        filters={filters}
        sortOptions={PRODUCT_SORT_OPTIONS}
        sortState={sortState}
        onSortKeyChange={(key) =>
          setSortState(
            key ? { key: key as ProductSortKey, direction: sortState?.direction ?? "asc" } : null
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
        filteredCount={products.length}
        totalCount={meta?.total ?? products.length}
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
                label="Produto"
                sortKey="name"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
              />
              <SortableTableHead
                label="Unidade"
                sortKey="unit"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
                className="w-24"
              />
              <SortableTableHead
                label="Estoque"
                sortKey="stock_quantity"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
                align="right"
              />
              <SortableTableHead
                label="Custo"
                sortKey="cost_price"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
                align="right"
              />
              <SortableTableHead
                label="Venda"
                sortKey="sale_price"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
                align="right"
              />
              <TableHead>Marca / Categorias</TableHead>
              <SortableTableHead
                label="Status"
                sortKey="status"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
                className="w-28"
              />
              {hasActions && (
                <TableHead className="w-16 text-center">Ações</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={hasActions ? 9 : 8}
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
                      <p>Nenhum produto encontrado com os filtros atuais.</p>
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
              products.map((product) => {
              // Extrai string monetária segura sem conversão para float
              const costPriceStr =
                typeof product.cost_price === "object" && product.cost_price !== null
                  ? String((product.cost_price as Record<string, unknown>).amount || "0")
                  : String(product.cost_price || "0");
              const salePriceStr =
                typeof product.sale_price === "object" && product.sale_price !== null
                  ? String((product.sale_price as Record<string, unknown>).amount|| "0")
                  : String(product.sale_price || "0");

              const rawStock =
                typeof product.stock_quantity === "object" && product.stock_quantity !== null
                  ? String((product.stock_quantity as Record<string, unknown>).amount ?? "0")
                  : product.stock_quantity;
              const stockQtyStr =
                rawStock !== null && rawStock !== undefined
                  ? formatQuantity(rawStock)
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
                          NCM: {maskNCM(product.ncm.code)}
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

                  <TableCell>
                    <Badge
                      variant={
                        product.status === "active"
                          ? "default"
                          : product.status === "discontinued"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {product.status === "inactive"
                        ? "Inativo"
                        : product.status === "discontinued"
                        ? "Descontinuado"
                        : "Ativo"}
                    </Badge>
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
            })
            )}
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
