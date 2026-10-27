"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFieldError } from "@/components/common/form-field-error";
import { brandSchema, type BrandFormData } from "../schemas/brand.schema";
import { useCreateBrand, useUpdateBrand } from "../hooks/use-brands";
import { calculateDiff } from "@/lib/diff";
import { parseApiError, applyApiValidationErrors } from "@/lib/api/errors";
import type { BrandResource, UpdateBrandRequest } from "../types";

interface BrandFormProps {
  initialData?: BrandResource;
}

export function BrandForm({ initialData }: BrandFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (formData: BrandFormData) => {
    try {
      if (isEditing && initialData) {
        const currentPayload: UpdateBrandRequest = {
          name: formData.name.trim(),
          description: formData.description?.trim() || null,
        };

        const originalPayload: UpdateBrandRequest = {
          name: initialData.name,
          description: initialData.description || null,
        };

        const diff = calculateDiff(originalPayload, currentPayload);

        if (Object.keys(diff).length === 0) {
          router.push("/brands");
          return;
        }

        await updateMutation.mutateAsync({
          id: initialData.id,
          data: diff,
        });
      } else {
        await createMutation.mutateAsync({
          name: formData.name.trim(),
          description: formData.description?.trim() || null,
        });
      }

      router.push("/brands");
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.isValidationError) {
        applyApiValidationErrors(parsed, setError);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl" noValidate>
      <div className="space-y-4">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Nome da Marca <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Ex.: Dell, Nike, Tramontina..."
            {...register("name")}
            disabled={isSubmitting}
            autoFocus
          />
          <FormFieldError error={errors.name} />
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Descrição / Observações
          </Label>
          <Input
            id="description"
            placeholder="Breve descrição ou anotação sobre a marca..."
            {...register("description")}
            disabled={isSubmitting}
          />
          <FormFieldError error={errors.description} />
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button asChild variant="outline" type="button" disabled={isSubmitting}>
          <Link href="/brands">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
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
              {isEditing ? "Atualizar Marca" : "Cadastrar Marca"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
