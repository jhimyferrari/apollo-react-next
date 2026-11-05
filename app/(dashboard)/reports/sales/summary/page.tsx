import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { PermissionGuard } from "@/components/common/permission-guard";
import { SalesSummaryReportView } from "@/features/reports/components/order-summary-report";

export const metadata: Metadata = {
  title: "Relatório de Vendas | Apollo System",
  description: "Resumo de vendas com totais, ticket médio e distribuição por status e pagamento",
};

export default function SalesSummaryReportViewPage() {
  return (
    <PermissionGuard
      permission="sales-order.view"
      title="Relatório Restrito"
      description="Você não possui permissão para acessar este relatório."
    >
      <div className="space-y-6">
        <PageHeader title="Relatório de Vendas" description="Resumo de vendas com totais, ticket médio e distribuição por status e pagamento" />
        <SalesSummaryReportView />
      </div>
    </PermissionGuard>
  );
}
