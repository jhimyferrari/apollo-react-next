import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { PermissionGuard } from "@/components/common/permission-guard";
import { PurchasesSummaryReportView } from "@/features/reports/components/order-summary-report";

export const metadata: Metadata = {
  title: "Relatório de Compras | Apollo System",
  description: "Resumo de compras com totais, ticket médio e distribuição por status e pagamento",
};

export default function PurchasesSummaryReportViewPage() {
  return (
    <PermissionGuard
      permission="purchase-order.view"
      title="Relatório Restrito"
      description="Você não possui permissão para acessar este relatório."
    >
      <div className="space-y-6">
        <PageHeader title="Relatório de Compras" description="Resumo de compras com totais, ticket médio e distribuição por status e pagamento" />
        <PurchasesSummaryReportView />
      </div>
    </PermissionGuard>
  );
}
