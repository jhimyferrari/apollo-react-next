"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  FolderTree,
  Users,
  Briefcase,
  Truck,
  ShoppingCart,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigationItems: NavGroup[] = [
  {
    title: "Principal",
    items: [
      {
        name: "Visão Geral",
        href: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Catálogo & Estoque",
    items: [
      {
        name: "Produtos",
        href: "/products",
        icon: Package,
        permission: "product.view",
      },
      {
        name: "Marcas",
        href: "/brands",
        icon: Tags,
        permission: "brand.view",
      },
      {
        name: "Categorias",
        href: "/categories",
        icon: FolderTree,
        permission: "category.view",
      },
    ],
  },
  {
    title: "Operações & Pedidos",
    items: [
      {
        name: "Pedidos de Venda",
        href: "/sales-orders",
        icon: ShoppingCart,
        permission: "sales-order.view",
      },
      {
        name: "Pedidos de Compra",
        href: "/purchase-orders",
        icon: ShoppingBag,
        permission: "purchase-order.view",
      },
    ],
  },
  {
    title: "Parceiros Comerciais",
    items: [
      {
        name: "Clientes",
        href: "/clients",
        icon: Users,
        permission: "client.view",
      },
      {
        name: "Vendedores",
        href: "/sellers",
        icon: Briefcase,
        permission: "seller.view",
      },
      {
        name: "Fornecedores",
        href: "/suppliers",
        icon: Truck,
        permission: "supplier.view",
      },
    ],
  },
  {
    title: "Administração",
    items: [
      {
        name: "Usuários",
        href: "/users",
        icon: ShieldCheck,
        permission: "user.view",
      },
    ],
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { can } = usePermissions();

  // Filtra itens e grupos com base nas permissões do usuário
  const filteredGroups = navigationItems
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.permission || can(item.permission)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside
      className={cn(
        "w-64 border-r border-border bg-card flex flex-col shrink-0 h-screen sticky top-0",
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-border gap-3">
        <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-base shadow-sm">
          A
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-foreground">
            Apollo System
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            Empresa Ativa
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {filteredGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 mb-2">
              {group.title}
            </h4>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-border/80 text-xs text-muted-foreground flex items-center justify-between">
        <span>Apollo System v0.1</span>
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    </aside>
  );
}
