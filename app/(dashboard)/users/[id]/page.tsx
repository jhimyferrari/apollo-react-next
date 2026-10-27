"use client";

import React, { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { FormSkeleton } from "@/components/common/loading-skeleton";
import { UserForm } from "@/features/users/components/user-form";
import { useUser } from "@/features/users/hooks/use-users";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { data, isLoading, isError, error, refetch } = useUser(id);
  const user = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Gerenciar Permissões"
          description="Carregando privilégios do operador..."
        />
        <div className="rounded-lg border border-border bg-card p-6">
          <FormSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="space-y-6">
        <PageHeader title="Usuário não encontrado" />
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h3 className="font-semibold text-destructive text-lg">
            Não foi possível carregar o usuário
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            {error?.message || "O usuário solicitado não existe ou foi removido."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/users">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar à Lista
              </Link>
            </Button>
            <Button onClick={() => refetch()}>Tentar novamente</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Permissões: ${user.name}`}
        description={`${user.email} • Controle de acesso aos 9 módulos do sistema`}
      />

      <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
        <UserForm initialData={user} />
      </div>
    </div>
  );
}
