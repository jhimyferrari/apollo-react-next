"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, Save, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFieldError } from "@/components/common/form-field-error";
import { AddressList } from "@/features/addresses/components/address-list";
import { supplierSchema, type SupplierFormData } from "../schemas/supplier.schema";
import { useCreateSupplier, useUpdateSupplier } from "../hooks/use-suppliers";
import { maskDocument, maskPhone, cleanDocument, onlyDigits } from "@/lib/masks";
import { calculateDiff } from "@/lib/diff";
import { parseApiError, applyApiValidationErrors } from "@/lib/api/errors";
import type { SupplierResource, UpdateSupplierRequest } from "../types";

interface SupplierFormProps {
  initialData?: SupplierResource;
}

export function SupplierForm({ initialData }: SupplierFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      document: initialData?.document ? maskDocument(initialData.document) : "",
      legal_name: initialData?.legal_name || "",
      trade_name: initialData?.trade_name || "",
      state_registration: initialData?.state_registration || "",
      email: initialData?.email || "",
      phone: initialData?.phone ? maskPhone(initialData.phone) : "",
    },
  });

  const documentValue = watch("document");
  const phoneValue = watch("phone");

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (formData: SupplierFormData) => {
    try {
      const sanitizedDoc = cleanDocument(formData.document);
      const sanitizedPhone = formData.phone ? onlyDigits(formData.phone) : null;

      if (isEditing && initialData) {
        const currentPayload: UpdateSupplierRequest = {
          document: sanitizedDoc,
          legal_name: formData.legal_name.trim(),
          trade_name: formData.trade_name.trim(),
          state_registration: formData.state_registration?.trim() || null,
          email: formData.email?.trim() || null,
          phone: sanitizedPhone,
        };

        const originalPayload: UpdateSupplierRequest = {
          document: cleanDocument(initialData.document),
          legal_name: initialData.legal_name,
          trade_name: initialData.trade_name,
          state_registration: initialData.state_registration || null,
          email: initialData.email || null,
          phone: initialData.phone ? onlyDigits(initialData.phone) : null,
        };

        const diff = calculateDiff(originalPayload, currentPayload);

        if (Object.keys(diff).length > 0) {
          await updateMutation.mutateAsync({
            id: initialData.id,
            data: diff,
          });
        }
      } else {
        const res = await createMutation.mutateAsync({
          document: sanitizedDoc,
          legal_name: formData.legal_name.trim(),
          trade_name: formData.trade_name.trim(),
          state_registration: formData.state_registration?.trim() || null,
          email: formData.email?.trim() || null,
          phone: sanitizedPhone,
        });

        if (res?.data?.id) {
          router.push(`/suppliers/${res.data.id}`);
          return;
        }
      }

      router.push("/suppliers");
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.isValidationError) {
        applyApiValidationErrors(parsed, setError);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Documento (CPF ou CNPJ Alfanumérico) */}
          <div className="space-y-2">
            <Label htmlFor="document" className="text-sm font-medium">
              CPF ou CNPJ <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="document"
                placeholder="00.000.000/0000-00 ou 000.000.000-00"
                className="pl-9"
                value={documentValue}
                onChange={(e) => {
                  setValue("document", maskDocument(e.target.value), {
                    shouldValidate: true,
                  });
                }}
                disabled={isSubmitting}
                autoFocus={!isEditing}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Suporta CPF e CNPJ Alfanumérico.
            </p>
            <FormFieldError error={errors.document} />
          </div>

          {/* Inscrição Estadual */}
          <div className="space-y-2">
            <Label htmlFor="state_registration" className="text-sm font-medium">
              Inscrição Estadual (IE)
            </Label>
            <Input
              id="state_registration"
              placeholder="Isento ou número da IE"
              {...register("state_registration")}
              disabled={isSubmitting}
            />
            <FormFieldError error={errors.state_registration} />
          </div>

          {/* Razão Social / Nome Completo */}
          <div className="space-y-2">
            <Label htmlFor="legal_name" className="text-sm font-medium">
              Razão Social / Nome Completo <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="legal_name"
                placeholder="Ex.: Distribuidora de Peças Ltda"
                className="pl-9"
                {...register("legal_name")}
                disabled={isSubmitting}
              />
            </div>
            <FormFieldError error={errors.legal_name} />
          </div>

          {/* Nome Fantasia / Apelido */}
          <div className="space-y-2">
            <Label htmlFor="trade_name" className="text-sm font-medium">
              Nome Fantasia / Apelido <span className="text-destructive">*</span>
            </Label>
            <Input
              id="trade_name"
              placeholder="Ex.: AutoPeças Brasil"
              {...register("trade_name")}
              disabled={isSubmitting}
            />
            <FormFieldError error={errors.trade_name} />
          </div>

          {/* E-mail */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              E-mail de Contato
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="vendas@fornecedor.com.br"
              {...register("email")}
              disabled={isSubmitting}
            />
            <FormFieldError error={errors.email} />
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Telefone / WhatsApp
            </Label>
            <Input
              id="phone"
              placeholder="(00) 00000-0000"
              value={phoneValue || ""}
              onChange={(e) => {
                setValue("phone", maskPhone(e.target.value), {
                  shouldValidate: true,
                });
              }}
              disabled={isSubmitting}
            />
            <FormFieldError error={errors.phone} />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button asChild variant="outline" type="button" disabled={isSubmitting}>
            <Link href="/suppliers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar à Lista
            </Link>
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Atualizar Fornecedor" : "Cadastrar Fornecedor"}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Seção de Endereços */}
      {isEditing && initialData && (
        <div className="pt-6 border-t border-border">
          <AddressList ownerType="suppliers" ownerId={initialData.id} />
        </div>
      )}
    </div>
  );
}
