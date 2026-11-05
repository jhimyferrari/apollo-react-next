import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { PermissionGuard } from "@/components/common/permission-guard";
import { SalesBySellerReportView } from "@/features/reports/components/sales-by-seller-report";

export const metadata: Metadata = {
  title: "Vendas por Vendedor | Apollo System",
  description: "Desempenho comercial por vendedor com participação no total vendido",
};

export default function SalesBySellerReportViewPage() {
  return (
    <PermissionGuard
      permission="sales-order.view"
      title="Relatório Restrito"
      description="Você não possui permissão para acessar este relatório."
    >
      <div className="space-y-6">
        <PageHeader title="Vendas por Vendedor" description="Desempenho comercial por vendedor com participação no total vendido" />
        <SalesBySellerReportView />
      </div>
    </PermissionGuard>
  );
}
