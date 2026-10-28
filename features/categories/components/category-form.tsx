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
import { categorySchema, type CategoryFormData } from "../schemas/category.schema";
import { useCreateCategory, useUpdateCategory } from "../hooks/use-categories";
import { calculateDiff } from "@/lib/diff";
import { parseApiError, applyApiValidationErrors } from "@/lib/api/errors";
import type { CategoryResource, UpdateCategoryRequest } from "../types";

interface CategoryFormProps {
  initialData?: CategoryResource;
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (formData: CategoryFormData) => {
    try {
      if (isEditing && initialData) {
        const currentPayload: UpdateCategoryRequest = {
          name: formData.name.trim(),
          description: formData.description?.trim() || "",
        };

        const originalPayload: UpdateCategoryRequest = {
          name: initialData.name,
          description: initialData.description || "",
        };

        const diff = calculateDiff(originalPayload, currentPayload);

        if (Object.keys(diff).length === 0) {
          router.push("/categories");
          return;
        }

        await updateMutation.mutateAsync({
          id: initialData.id,
          data: diff,
        });
      } else {
        await createMutation.mutateAsync({
          name: formData.name.trim(),
          description: formData.description?.trim() || "",
        });
      }

      router.push("/categories");
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
            Nome da Categoria <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Ex.: Informática, Eletrônicos, Móveis..."
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
            placeholder="Breve descrição da categoria..."
            {...register("description")}
            disabled={isSubmitting}
          />
          <FormFieldError error={errors.description} />
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button asChild variant="outline" type="button" disabled={isSubmitting}>
          <Link href="/categories">
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
              {isEditing ? "Atualizar Categoria" : "Cadastrar Categoria"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
