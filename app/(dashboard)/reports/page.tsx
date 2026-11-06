"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  DollarSign,
  LineChart,
  Package,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import {
  useSalesSummaryReport,
  usePurchasesSummaryReport,
} from "@/features/reports/hooks/use-reports";
import {
  ReportNav,
  StatCard,
} from "@/features/reports/components/report-shared";

const REPORT_CARDS = [
  {
    title: "Resumo Geral de Vendas",
    description:
      "Acompanhe o faturamento consolidado, ticket médio, volume de itens e a distribuição financeira por status e pagamento.",
    href: "/reports/sales/summary",
    icon: LineChart,
    permission: "sales-order.view",
    badge: "Comercial",
    highlights: ["Ticket Médio", "Por Status", "Por Pagamento", "Filtro por Cliente/Vendedor"],
  },
  {
    title: "Vendas por Produto (Curva de Receita)",
    description:
      "Ranking dos produtos mais comercializados por faturamento, volume físico vendido ou quantidade de pedidos.",
    href: "/reports/sales/by-product",
    icon: Package,
    permission: "sales-order.view",
    badge: "Catálogo & Giro",
    highlights: ["Ranking de SKUs", "% do Faturamento", "Preço Médio", "Filtro por Marca/Categoria"],
  },
  {
    title: "Desempenho de Vendas por Vendedor",
    description:
      "Avalie a performance individual da equipe comercial, ticket médio por representante e participação percentual na receita.",
    href: "/reports/sales/by-seller",
    icon: Briefcase,
    permission: "sales-order.view",
    badge: "Equipe Comercial",
    highlights: ["Ranking de Vendedores", "Share de Receita (%)", "Ticket Médio", "Total de Pedidos"],
  },
  {
    title: "Resumo Geral de Compras",
    description:
      "Controle o volume financeiro de aquisições junto a fornecedores, custo médio por ordem de compra e status de pagamento.",
    href: "/reports/purchases/summary",
    icon: ShoppingBag,
    permission: "purchase-order.view",
    badge: "Suprimentos",
    highlights: ["Total Comprado", "Custo Médio", "Status de Pagamento", "Filtro por Fornecedor"],
  },
];

export default function ReportsIndexPage() {
  const { can } = usePermissions();
  const canSales = can("sales-order.view");
  const canPurchases = can("purchase-order.view");

  const available = REPORT_CARDS.filter((r) => can(r.permission));

  const salesSummary = useSalesSummaryReport({ per_page: 1 }, canSales);
  const purchasesSummary = usePurchasesSummaryReport({ per_page: 1 }, canPurchases);

  const salesTotals = salesSummary.data?.totals;
  const purchasesTotals = purchasesSummary.data?.totals;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Central de Relatórios"
        description="Indicadores gerenciais, rankings de desempenho comercial e análise financeira de vendas e compras"
      />

      {available.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Nenhum relatório disponível para o seu perfil"
          description="Você precisa de permissão de leitura em Pedidos de Venda ou Pedidos de Compra para acessar os relatórios gerenciais."
        />
      ) : (
        <>
          <ReportNav />

          {/* Panorama Rápido (KPIs Consolidados de Pedidos Confirmados) */}
          {(canSales || canPurchases) && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {canSales && (
                <>
                  <StatCard
                    title="Vendas Confirmadas"
                    value={salesTotals?.total_amount_formatted ?? "R$ 0,00"}
                    hint={`${salesTotals?.orders_count ?? 0} pedidos confirmados`}
                    icon={DollarSign}
                    accent="emerald"
                  />
                  <StatCard
                    title="Ticket Médio (Vendas)"
                    value={salesTotals?.average_ticket_formatted ?? "R$ 0,00"}
                    hint="Média por pedido de venda confirmado"
                    icon={TrendingUp}
                    accent="primary"
                  />
                </>
              )}
              {canPurchases && (
                <>
                  <StatCard
                    title="Compras Confirmadas"
                    value={purchasesTotals?.total_amount_formatted ?? "R$ 0,00"}
                    hint={`${purchasesTotals?.orders_count ?? 0} ordens de compra confirmadas`}
                    icon={ShoppingCart}
                    accent="amber"
                  />
                  <StatCard
                    title="Ticket Médio (Compras)"
                    value={purchasesTotals?.average_ticket_formatted ?? "R$ 0,00"}
                    hint="Média por ordem de compra confirmada"
                    icon={ShoppingBag}
                    accent="sky"
                  />
                </>
              )}
            </div>
          )}

          {/* Cards de Módulos de Relatório */}
          <div className="grid gap-4 md:grid-cols-2">
            {available.map((r) => {
              const Icon = r.icon;
              return (
                <Link key={r.href} href={r.href} className="group block">
                  <Card className="h-full py-5 transition-all group-hover:border-primary/60 group-hover:shadow-md">
                    <CardContent className="px-5 flex flex-col justify-between h-full gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {r.title}
                            </h3>
                            <Badge variant="secondary" className="text-[10px]">
                              {r.badge}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {r.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60">
                        <div className="flex flex-wrap gap-1.5">
                          {r.highlights.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-[10px] font-normal text-muted-foreground"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <span className="inline-flex items-center text-xs font-medium text-primary shrink-0 group-hover:translate-x-0.5 transition-transform">
                          Abrir
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
