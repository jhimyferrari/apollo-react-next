"use client";

import React, { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { FormSkeleton } from "@/components/common/loading-skeleton";
import { ProductForm } from "@/features/products/components/product-form";
import { useProduct } from "@/features/products/hooks/use-products";
import { PermissionGuard } from "@/components/common/permission-guard";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { data, isLoading, isError, error, refetch } = useProduct(id);
  const product = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Editar Produto"
          description="Carregando dados do produto..."
        />
        <div className="rounded-lg border border-border bg-card p-6">
          <FormSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="space-y-6">
        <PageHeader title="Produto não encontrado" />
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h3 className="font-semibold text-destructive text-lg">
            Não foi possível carregar o produto
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            {error?.message || "O item solicitado não existe ou foi removido."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar à Lista
              </Link>
            </Button>
            <Button onClick={() => refetch()}>Tentar novamente</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard
      permission="product.update"
      title="Edição Não Permitida"
      description="Você não possui permissão para editar os dados deste produto."
    >
      <div className="space-y-6">
        <PageHeader
          title={`Editar: ${product.name}`}
          description={`Código #${product.number} • Atualize apenas os campos desejados`}
        />

        <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
          <ProductForm initialData={product} />
        </div>
      </div>
    </PermissionGuard>
  );
}
