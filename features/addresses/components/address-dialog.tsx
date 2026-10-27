"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFieldError } from "@/components/common/form-field-error";
import { addressSchema, type AddressFormData } from "../schemas/address.schema";
import { useCreateAddress, useUpdateAddress } from "../hooks/use-addresses";
import type { AddressOwnerType } from "../services/address.service";
import type { AddressResource } from "../types";
import { maskCEP, onlyDigits } from "@/lib/masks";
import { parseApiError, applyApiValidationErrors } from "@/lib/api/errors";
import { Loader2, MapPin } from "lucide-react";

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerType: AddressOwnerType;
  ownerId: string;
  initialData?: AddressResource | null;
}

export function AddressDialog({
  open,
  onOpenChange,
  ownerType,
  ownerId,
  initialData,
}: AddressDialogProps) {
  const isEditing = Boolean(initialData);

  const createMutation = useCreateAddress(ownerType, ownerId);
  const updateMutation = useUpdateAddress(ownerType, ownerId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: "",
      number: "",
      neighborhood: "",
      complement: "",
      cep: "",
      city_ibge_code: "",
    },
  });

  const cepValue = watch("cep");

  useEffect(() => {
    if (initialData) {
      reset({
        street: initialData.street || "",
        number: initialData.number || "",
        neighborhood: initialData.neighborhood || "",
        complement: initialData.complement || "",
        cep: maskCEP(initialData.cep || ""),
        city_ibge_code: String(initialData.city_ibge_code || ""),
      });
    } else {
      reset({
        street: "",
        number: "",
        neighborhood: "",
        complement: "",
        cep: "",
        city_ibge_code: "",
      });
    }
  }, [initialData, reset, open]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (data: AddressFormData) => {
    try {
      const payload = {
        street: data.street.trim(),
        number: data.number.trim(),
        neighborhood: data.neighborhood.trim(),
        complement: data.complement?.trim() || null,
        cep: onlyDigits(data.cep),
        city_ibge_code: data.city_ibge_code.trim(),
      };

      if (isEditing && initialData) {
        await updateMutation.mutateAsync({
          addressId: initialData.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      onOpenChange(false);
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.isValidationError) {
        applyApiValidationErrors(parsed, setError);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? "Editar Endereço" : "Novo Endereço"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Preencha os dados do endereço de entrega ou faturamento.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* CEP e Cidade IBGE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cep" className="text-sm font-medium">
                CEP <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cep"
                placeholder="00000-000"
                value={cepValue}
                onChange={(e) => {
                  setValue("cep", maskCEP(e.target.value), {
                    shouldValidate: true,
                  });
                }}
                disabled={isSubmitting}
              />
              <FormFieldError error={errors.cep} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city_ibge_code" className="text-sm font-medium">
                Cód. IBGE Município <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city_ibge_code"
                placeholder="Ex.: 3550308 (SP)"
                {...register("city_ibge_code")}
                disabled={isSubmitting}
              />
              <FormFieldError error={errors.city_ibge_code} />
            </div>
          </div>

          {/* Rua e Número */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="street" className="text-sm font-medium">
                Logradouro / Rua <span className="text-destructive">*</span>
              </Label>
              <Input
                id="street"
                placeholder="Ex.: Av. Paulista"
                {...register("street")}
                disabled={isSubmitting}
              />
              <FormFieldError error={errors.street} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number" className="text-sm font-medium">
                Número <span className="text-destructive">*</span>
              </Label>
              <Input
                id="number"
                placeholder="1000"
                {...register("number")}
                disabled={isSubmitting}
              />
              <FormFieldError error={errors.number} />
            </div>
          </div>

          {/* Bairro e Complemento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="neighborhood" className="text-sm font-medium">
                Bairro <span className="text-destructive">*</span>
              </Label>
              <Input
                id="neighborhood"
                placeholder="Centro, Bela Vista..."
                {...register("neighborhood")}
                disabled={isSubmitting}
              />
              <FormFieldError error={errors.neighborhood} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complement" className="text-sm font-medium">
                Complemento
              </Label>
              <Input
                id="complement"
                placeholder="Sala 402, Bloco B..."
                {...register("complement")}
                disabled={isSubmitting}
              />
              <FormFieldError error={errors.complement} />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : isEditing ? (
                "Atualizar Endereço"
              ) : (
                "Salvar Endereço"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
