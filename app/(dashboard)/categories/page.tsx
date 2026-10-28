import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { CategoryTable } from "@/features/categories/components/category-table";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Categorias | Apollo System",
  description: "Gerenciamento de categorias do catálogo de produtos",
};

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias de Produtos"
        description="Classifique os itens do catálogo em categorias lógicas"
      >
        <Button asChild>
          <Link href="/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Link>
        </Button>
      </PageHeader>

      <CategoryTable />
    </div>
  );
}
