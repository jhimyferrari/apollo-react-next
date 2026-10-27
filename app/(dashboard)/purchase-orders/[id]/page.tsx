"use client";

import React, { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { FormSkeleton } from "@/components/common/loading-skeleton";
import { PurchaseOrderDetails } from "@/features/purchase-orders/components/purchase-order-details";
import { usePurchaseOrder } from "@/features/purchase-orders/hooks/use-purchase-orders";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function ViewPurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { data, isLoading, isError, error, refetch } = usePurchaseOrder(id);
  const order = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Pedido de Compra"
          description="Carregando detalhes do pedido de compra..."
        />
        <div className="rounded-lg border border-border bg-card p-6">
          <FormSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="space-y-6">
        <PageHeader title="Pedido não encontrado" />
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h3 className="font-semibold text-destructive text-lg">
            Não foi possível carregar o pedido de compra
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            {error?.message || "O registro solicitado não existe ou foi removido."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/purchase-orders">
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
        title={`Pedido de Compra #${order.number}`}
        description={`Fornecedor: ${order.supplier?.legal_name || "N/A"}`}
      />

      <PurchaseOrderDetails order={order} />
    </div>
  );
}
