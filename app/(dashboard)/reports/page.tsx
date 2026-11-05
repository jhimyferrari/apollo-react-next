"use client";

import Link from "next/link";
import { BarChart3, Package, Briefcase, ShoppingBag, LineChart } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { usePermissions } from "@/features/auth/hooks/use-permissions";

const reports = [
  {
    title: "Relatório de Vendas",
    description: "Totais, ticket médio e distribuição por status e pagamento.",
    href: "/reports/sales/summary",
    icon: LineChart,
    permission: "sales-order.view",
  },
  {
    title: "Vendas por Produto",
    description: "Ranking de produtos por quantidade, preço médio e valor.",
    href: "/reports/sales/by-product",
    icon: Package,
    permission: "sales-order.view",
  },
  {
    title: "Vendas por Vendedor",
    description: "Desempenho e participação de cada vendedor no total.",
    href: "/reports/sales/by-seller",
    icon: Briefcase,
    permission: "sales-order.view",
  },
  {
    title: "Relatório de Compras",
    description: "Totais, ticket médio e distribuição das compras.",
    href: "/reports/purchases/summary",
    icon: ShoppingBag,
    permission: "purchase-order.view",
  },
];

export default function ReportsIndexPage() {
  const { can } = usePermissions();
  const available = reports.filter((r) => can(r.permission));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Análises gerenciais de vendas e compras da organização"
      />
      {available.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Nenhum relatório disponível"
          description="Você não possui permissão para visualizar relatórios."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {available.map((r) => (
            <Link key={r.href} href={r.href} className="group">
              <Card className="py-5 transition-colors group-hover:border-primary/50">
                <CardContent className="px-5 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <r.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{r.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
