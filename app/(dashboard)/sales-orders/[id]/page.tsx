"use client";

import React, { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { FormSkeleton } from "@/components/common/loading-skeleton";
import { SalesOrderDetails } from "@/features/sales-orders/components/sales-order-details";
import { useSalesOrder } from "@/features/sales-orders/hooks/use-sales-orders";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function ViewSalesOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { data, isLoading, isError, error, refetch } = useSalesOrder(id);
  const order = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Pedido de Venda"
          description="Carregando detalhes do pedido..."
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
            Não foi possível carregar o pedido de venda
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            {error?.message || "O registro solicitado não existe ou foi removido."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/sales-orders">
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
        title={`Pedido de Venda #${order.number}`}
        description={`Cliente: ${order.client?.legal_name || "N/A"}`}
      />

      <SalesOrderDetails order={order} />
    </div>
  );
}
