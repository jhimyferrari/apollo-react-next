"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { maskDocument, maskPhone } from "@/lib/masks";
import { useClients, useDeleteClient } from "../hooks/use-clients";
import { MoreHorizontal, Edit, Trash2, Plus, AlertCircle, Users } from "lucide-react";
import type { ClientResource } from "../types";

export function ClientTable() {
  const [page, setPage] = useState(1);
  const [clientToDelete, setClientToDelete] = useState<ClientResource | null>(null);

  const { data, isLoading, isError, error, refetch } = useClients(page);
  const deleteMutation = useDeleteClient();

  const clients = data?.data || [];
  const meta = data?.meta;

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    try {
      await deleteMutation.mutateAsync(clientToDelete.id);
      setClientToDelete(null);
    } catch {
      // Erro tratado no hook
    }
  };

  if (isLoading) {
    return <TableSkeleton rows={8} cols={6} />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center my-6">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <h3 className="font-semibold text-destructive">
          Não foi possível carregar a lista de clientes
        </h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          {error?.message || "Erro de comunicação com a API."}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum cliente cadastrado"
        description="Cadastre clientes para emitir pedidos de venda e gerenciar parceiros comerciais."
        action={
          <Button asChild>
            <Link href="/clients/new">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Cliente
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Cliente (Razão / Fantasia)</TableHead>
              <TableHead>CPF / CNPJ</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-16 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{client.number}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {client.legal_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {client.trade_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {maskDocument(client.document)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs text-muted-foreground">
                    <span>{client.email || "-"}</span>
                    <span>{client.phone ? maskPhone(client.phone) : ""}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={client.status === "active" ? "default" : "secondary"}
                    className="capitalize text-[10px]"
                  >
                    {client.status || "Ativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Opções</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/clients/${client.id}`}
                          className="cursor-pointer flex items-center"
                        >
                          <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                          Editar / Endereços
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => setClientToDelete(client)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {meta && (
        <DataTablePagination
          meta={meta}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}

      <ConfirmDialog
        open={Boolean(clientToDelete)}
        onOpenChange={(open) => !open && setClientToDelete(null)}
        title="Excluir Cliente"
        description={`Tem certeza que deseja excluir o cliente "${clientToDelete?.legal_name}"? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir Cliente"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
