import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  ShoppingBag,
  Users,
  Briefcase,
  Truck,
  Plus,
  ArrowRight,
  TrendingUp,
  Tags,
} from "lucide-react";

export default function DashboardHomePage() {
  const quickActions = [
    {
      title: "Novo Pedido de Venda",
      description: "Cadastrar pedido para cliente com vendedor responsável",
      href: "/sales-orders/new",
      icon: ShoppingCart,
      color: "text-emerald-500",
    },
    {
      title: "Novo Produto",
      description: "Cadastrar item no catálogo com preços e NCM",
      href: "/products/new",
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "Novo Pedido de Compra",
      description: "Emitir ordem de compra para fornecedor",
      href: "/purchase-orders/new",
      icon: ShoppingBag,
      color: "text-purple-500",
    },
    {
      title: "Novo Cliente",
      description: "Cadastrar cliente com documentos e múltiplos endereços",
      href: "/clients/new",
      icon: Users,
      color: "text-amber-500",
    },
  ];

  const modules = [
    {
      title: "Catálogo de Produtos",
      description: "Gestão completa de preços, unidades, NCM, marcas e categorias",
      href: "/products",
      icon: Package,
    },
    {
      title: "Pedidos de Venda",
      description: "Ordens comerciais com confirmação, cancelamento e reabertura",
      href: "/sales-orders",
      icon: ShoppingCart,
    },
    {
      title: "Pedidos de Compra",
      description: "Suprimentos e ordens de compra emitidas para fornecedores",
      href: "/purchase-orders",
      icon: ShoppingBag,
    },
    {
      title: "Clientes & Endereços",
      description: "Base cadastral com múltiplos endereços e endereço padrão",
      href: "/clients",
      icon: Users,
    },
    {
      title: "Vendedores",
      description: "Equipe comercial, documentos e endereços vinculados",
      href: "/sellers",
      icon: Briefcase,
    },
    {
      title: "Fornecedores",
      description: "Parceiros de compras, documentos e endereços",
      href: "/suppliers",
      icon: Truck,
    },
    {
      title: "Marcas",
      description: "Gestão e cadastro de marcas de produtos",
      href: "/brands",
      icon: Tags,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Painel de Controle"
        description="Visão geral e atalhos rápidos das operações do Apollo System"
      />

      {/* Ações Rápidas */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.href}
                className="hover:border-foreground/20 transition-all hover:shadow-md bg-card/60"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between">
                    <Icon className={`h-5 w-5 ${action.color}`} />
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base font-semibold mt-3">
                    {action.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <Button asChild size="sm" variant="ghost" className="w-full justify-between mt-2 text-xs">
                    <Link href={action.href}>
                      Iniciar Cadastro
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Módulos do Sistema */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Módulos Operacionais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.href} href={mod.href} className="group">
                <Card className="h-full hover:border-foreground/30 transition-all hover:shadow-md bg-card group-hover:bg-accent/40">
                  <CardHeader className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                    <CardTitle className="text-base font-semibold mt-4">
                      {mod.title}
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      {mod.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
