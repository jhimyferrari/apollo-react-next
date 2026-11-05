"use client";

import React, { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFieldError } from "@/components/common/form-field-error";
import { addressSchema, type AddressFormData } from "../schemas/address.schema";
import { useCreateAddress, useUpdateAddress } from "../hooks/use-addresses";
import type { AddressOwnerType } from "../services/address.service";
import type { AddressResource, UpdateAddressRequest } from "../types";
import {
  UFS,
  getCitiesByUf,
  resolveAddressUfIbgeCode,
} from "../utils/locations";
import { maskCEP, onlyDigits } from "@/lib/masks";
import { calculateDiff } from "@/lib/diff";
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
    control,
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
      uf_ibge_code: "",
      city_ibge_code: "",
      is_default: false,
    },
  });

  const cepValue = useWatch({ control, name: "cep" });
  const ufValue = useWatch({ control, name: "uf_ibge_code" });
  const cityIbgeValue = useWatch({ control, name: "city_ibge_code" });
  const isDefaultValue = useWatch({ control, name: "is_default" });

  const citiesForSelectedUf = useMemo(
    () => getCitiesByUf(ufValue),
    [ufValue]
  );

  useEffect(() => {
    if (initialData) {
      const resolvedUf = resolveAddressUfIbgeCode(initialData);
      const resolvedCityIbge = String(
        initialData.city?.ibge_code || initialData.city_ibge_code || ""
      ).trim();

      reset({
        street: initialData.street || "",
        number: initialData.number || "",
        neighborhood: initialData.neighborhood || "",
        complement: initialData.complement || "",
        cep: maskCEP(initialData.cep || ""),
        uf_ibge_code: resolvedUf,
        city_ibge_code: resolvedCityIbge,
        is_default: Boolean(initialData.is_default),
      });
    } else {
      reset({
        street: "",
        number: "",
        neighborhood: "",
        complement: "",
        cep: "",
        uf_ibge_code: "",
        city_ibge_code: "",
        is_default: false,
      });
    }
  }, [initialData, reset, open]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleUfChange = (newUfCode: string) => {
    setValue("uf_ibge_code", newUfCode, { shouldValidate: true });
    if (cityIbgeValue && !cityIbgeValue.startsWith(newUfCode)) {
      setValue("city_ibge_code", "", { shouldValidate: false });
    }
  };

  const handleCityChange = (newCityIbgeCode: string) => {
    setValue("city_ibge_code", newCityIbgeCode, { shouldValidate: true });
  };

  const onSubmit = async (data: AddressFormData) => {
    try {
      const payload = {
        street: data.street.trim(),
        number: data.number.trim(),
        neighborhood: data.neighborhood.trim(),
        complement: data.complement?.trim() || null,
        cep: onlyDigits(data.cep),
        city_ibge_code: data.city_ibge_code.trim(),
        is_default: Boolean(data.is_default),
      };

      if (isEditing && initialData) {
        const originalPayload: UpdateAddressRequest = {
          street: initialData.street,
          number: initialData.number,
          neighborhood: initialData.neighborhood,
          complement: initialData.complement || null,
          cep: onlyDigits(initialData.cep),
          city_ibge_code: String(
            initialData.city?.ibge_code || initialData.city_ibge_code
          ),
          is_default: Boolean(initialData.is_default),
        };

        const diff = calculateDiff(originalPayload, payload);

        if (Object.keys(diff).length === 0) {
          onOpenChange(false);
          return;
        }

        await updateMutation.mutateAsync({
          addressId: initialData.id,
          data: diff,
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
          {/* CEP e UF */}
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
              <Label htmlFor="uf_ibge_code" className="text-sm font-medium">
                UF (Estado) <span className="text-destructive">*</span>
              </Label>
              <Select
                value={ufValue || undefined}
                onValueChange={handleUfChange}
                disabled={isSubmitting}
              >
                <SelectTrigger id="uf_ibge_code">
                  <SelectValue placeholder="Selecione a UF" />
                </SelectTrigger>
                <SelectContent>
                  {UFS.map((uf) => (
                    <SelectItem key={uf.ibge_code} value={String(uf.ibge_code)}>
                      {uf.abbreviation} - {uf.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormFieldError error={errors.uf_ibge_code} />
            </div>
          </div>

          {/* Cidade / Município (envia o código IBGE por baixo dos panos) */}
          <div className="space-y-2">
            <Label htmlFor="city_ibge_code" className="text-sm font-medium">
              Cidade / Município <span className="text-destructive">*</span>
            </Label>
            <Select
              key={ufValue || "no-uf"}
              value={cityIbgeValue || undefined}
              onValueChange={handleCityChange}
              disabled={isSubmitting || !ufValue}
            >
              <SelectTrigger id="city_ibge_code">
                <SelectValue
                  placeholder={
                    !ufValue
                      ? "Selecione a UF primeiro"
                      : "Selecione a cidade"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {citiesForSelectedUf.map((city) => (
                  <SelectItem key={city.ibge_code} value={city.ibge_code}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormFieldError error={errors.city_ibge_code} />
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

          {/* Endereço Padrão */}
          <label className="flex items-center gap-2.5 pt-1 text-xs font-medium text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(isDefaultValue)}
              onChange={(e) => setValue("is_default", e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <span>Definir como endereço padrão</span>
          </label>

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
