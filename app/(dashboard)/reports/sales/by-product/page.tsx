import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { PermissionGuard } from "@/components/common/permission-guard";
import { SalesByProductReportView } from "@/features/reports/components/sales-by-product-report";

export const metadata: Metadata = {
  title: "Vendas por Produto | Apollo System",
  description: "Ranking de produtos vendidos com quantidade, preço médio e valor total",
};

export default function SalesByProductReportViewPage() {
  return (
    <PermissionGuard
      permission="sales-order.view"
      title="Relatório Restrito"
      description="Você não possui permissão para acessar este relatório."
    >
      <div className="space-y-6">
        <PageHeader title="Vendas por Produto" description="Ranking de produtos vendidos com quantidade, preço médio e valor total" />
        <SalesByProductReportView />
      </div>
    </PermissionGuard>
  );
}
