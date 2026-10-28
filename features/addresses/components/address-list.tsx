"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { AddressDialog } from "./address-dialog";
import {
  useAddresses,
  useSetDefaultAddress,
  useDeleteAddress,
} from "../hooks/use-addresses";
import type { AddressOwnerType } from "../services/address.service";
import type { AddressResource } from "../types";
import { maskCEP } from "@/lib/masks";
import { MapPin, Plus, Star, Edit, Trash2, Home } from "lucide-react";

interface AddressListProps {
  ownerType: AddressOwnerType;
  ownerId: string;
}

export function AddressList({ ownerType, ownerId }: AddressListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<AddressResource | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<AddressResource | null>(null);

  const { data, isLoading } = useAddresses(ownerType, ownerId);
  const setDefaultMutation = useSetDefaultAddress(ownerType, ownerId);
  const deleteMutation = useDeleteAddress(ownerType, ownerId);

  const addresses = data?.data || [];

  const handleOpenNew = () => {
    setAddressToEdit(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (addr: AddressResource) => {
    setAddressToEdit(addr);
    setDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;
    try {
      await deleteMutation.mutateAsync(addressToDelete.id);
      setAddressToDelete(null);
    } catch {
      // Erro tratado no hook
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await setDefaultMutation.mutateAsync(addressId);
    } catch {
      // Erro tratado no hook
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Home className="h-4 w-4 text-primary" />
            Endereços Cadastrados
          </h3>
          <p className="text-xs text-muted-foreground">
            Gerencie múltiplos endereços de entrega, faturamento e filiais
          </p>
        </div>
        <Button size="sm" onClick={handleOpenNew}>
          <Plus className="mr-2 h-3.5 w-3.5" />
          Adicionar Endereço
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-28 rounded-lg bg-muted/40 animate-pulse border border-border" />
          <div className="h-28 rounded-lg bg-muted/40 animate-pulse border border-border" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center bg-card/40">
          <MapPin className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">
            Nenhum endereço cadastrado
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">
            Adicione um endereço para permitir emissão de pedidos e entregas.
          </p>
          <Button size="sm" variant="outline" onClick={handleOpenNew}>
            <Plus className="mr-2 h-3.5 w-3.5" />
            Cadastrar Primeiro Endereço
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              className={`relative border transition-all ${
                addr.is_default
                  ? "border-primary/50 bg-primary/5 shadow-xs"
                  : "border-border hover:border-foreground/20"
              }`}
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">
                    CEP {maskCEP(addr.cep)}
                  </span>
                </div>
                {addr.is_default && (
                  <Badge variant="default" className="text-[10px] px-2 py-0">
                    Padrão
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                <div className="text-sm font-medium text-foreground">
                  {addr.street}, {addr.number}
                </div>
                <div className="text-xs text-muted-foreground">
                  {addr.neighborhood}
                  {addr.complement ? ` • ${addr.complement}` : ""}
                </div>
                <div className="text-[11px] text-muted-foreground/80">
                  Cód. IBGE: {addr.city_ibge_code}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  {!addr.is_default ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
                      onClick={() => handleSetDefault(addr.id)}
                      disabled={setDefaultMutation.isPending}
                    >
                      <Star className="mr-1 h-3.5 w-3.5" />
                      Definir como Padrão
                    </Button>
                  ) : (
                    <span />
                  )}

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => handleOpenEdit(addr)}
                      title="Editar endereço"
                    >
                      <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => setAddressToDelete(addr)}
                      title="Remover endereço"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddressDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ownerType={ownerType}
        ownerId={ownerId}
        initialData={addressToEdit}
      />

      <ConfirmDialog
        open={Boolean(addressToDelete)}
        onOpenChange={(open) => !open && setAddressToDelete(null)}
        title="Remover Endereço"
        description="Tem certeza que deseja remover este endereço? Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
