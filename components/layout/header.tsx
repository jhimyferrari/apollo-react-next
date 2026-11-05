"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import {
  Package,
  ShoppingCart,
  ShoppingBag,
  Users,
  Briefcase,
  Truck,
  Tags,
  FolderTree,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  products: "Produtos",
  brands: "Marcas",
  categories: "Categorias",
  "sales-orders": "Pedidos de Venda",
  "purchase-orders": "Pedidos de Compra",
  clients: "Clientes",
  sellers: "Vendedores",
  suppliers: "Fornecedores",
  users: "Usuários",
  new: "Novo Cadastro",
};

function formatBreadcrumb(pathname: string): string {
  if (pathname === "/") return "Visão Geral";
  const segments = pathname.split("/").filter(Boolean);
  const first = ROUTE_LABELS[segments[0]] || segments[0].replace(/-/g, " ");
  if (segments.length === 1) return first;
  if (segments[1] === "new") return `${first} / Novo`;
  return `${first} / Detalhes`;
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { can } = usePermissions();

  const mobileNavLinks = [
    { name: "Visão Geral", href: "/", icon: LayoutDashboard },
    { name: "Produtos", href: "/products", icon: Package, permission: "product.view" },
    { name: "Marcas", href: "/brands", icon: Tags, permission: "brand.view" },
    { name: "Categorias", href: "/categories", icon: FolderTree, permission: "category.view" },
    { name: "Pedidos de Venda", href: "/sales-orders", icon: ShoppingCart, permission: "sales-order.view" },
    { name: "Pedidos de Compra", href: "/purchase-orders", icon: ShoppingBag, permission: "purchase-order.view" },
    { name: "Clientes", href: "/clients", icon: Users, permission: "client.view" },
    { name: "Vendedores", href: "/sellers", icon: Briefcase, permission: "seller.view" },
    { name: "Fornecedores", href: "/suppliers", icon: Truck, permission: "supplier.view" },
    { name: "Usuários", href: "/users", icon: ShieldCheck, permission: "user.view" },
  ].filter((item) => !item.permission || can(item.permission));

  return (
    <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile Toggle & Logo */}
      <div className="flex items-center gap-3 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <span className="font-bold text-sm tracking-tight">Apollo System</span>
      </div>

      {/* Breadcrumb / Desktop Title placeholder */}
      <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
        <span>Apollo System</span>
        <span>/</span>
        <span className="font-medium text-foreground">
          {formatBreadcrumb(pathname)}
        </span>
      </div>

      {/* Right Actions: Theme Toggle & UserNav */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Alternar tema claro/escuro"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>

        <UserNav />
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-card border-b border-border p-4 shadow-xl space-y-1">
          {mobileNavLinks.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
