"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";
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

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const mobileNavLinks = [
    { name: "Visão Geral", href: "/", icon: LayoutDashboard },
    { name: "Produtos", href: "/products", icon: Package },
    { name: "Marcas", href: "/brands", icon: Tags },
    { name: "Categorias", href: "/categories", icon: FolderTree },
    { name: "Pedidos de Venda", href: "/sales-orders", icon: ShoppingCart },
    { name: "Pedidos de Compra", href: "/purchase-orders", icon: ShoppingBag },
    { name: "Clientes", href: "/clients", icon: Users },
    { name: "Vendedores", href: "/sellers", icon: Briefcase },
    { name: "Fornecedores", href: "/suppliers", icon: Truck },
    { name: "Usuários", href: "/users", icon: ShieldCheck },
  ];

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
        <span className="font-medium text-foreground capitalize">
          {pathname === "/" ? "Visão Geral" : pathname.replace("/", "").replace(/-/g, " ")}
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
