import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center border border-border">
          <FileQuestion className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Página não encontrada
          </h1>
          <p className="text-sm text-muted-foreground">
            O recurso ou endereço que você tentou acessar não existe ou foi movido.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Painel Principal
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

