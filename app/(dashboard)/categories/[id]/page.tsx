"use client";

import React, { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { FormSkeleton } from "@/components/common/loading-skeleton";
import { CategoryForm } from "@/features/categories/components/category-form";
import { useCategory } from "@/features/categories/hooks/use-categories";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { data, isLoading, isError, error, refetch } = useCategory(id);
  const category = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Editar Categoria"
          description="Carregando dados da categoria..."
        />
        <div className="rounded-lg border border-border bg-card p-6">
          <FormSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !category) {
    return (
      <div className="space-y-6">
        <PageHeader title="Categoria não encontrada" />
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h3 className="font-semibold text-destructive text-lg">
            Não foi possível carregar a categoria
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            {error?.message || "O item solicitado não existe ou foi removido."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/categories">
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
    <div className="space-y-6">
      <PageHeader
        title={`Editar Categoria: ${category.name}`}
        description={`Código #${category.number} • Atualize as informações desejadas`}
      />

      <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
        <CategoryForm initialData={category} />
      </div>
    </div>
  );
}
