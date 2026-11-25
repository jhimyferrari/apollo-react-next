"use client";

import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryService, type CategoryListParams } from "../services/category.service";
import { parseApiError } from "@/lib/api/errors";
import { useCategoryLookup } from "@/features/lookups/hooks/use-lookups";
import type { StoreCategoryRequest, UpdateCategoryRequest } from "../types";

export { useCategoryLookup };

export function useCategories(params?: CategoryListParams) {
  return useQuery({
    queryKey: ["categories", params ?? {}],
    queryFn: () => categoryService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCategory(id?: string) {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: () => categoryService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreCategoryRequest) => categoryService.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["lookups", "categories"] });
      toast.success(res?.message || "Categoria criada com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      if (!parsed.isValidationError) {
        toast.error(parsed.message || "Erro ao criar categoria.");
      }
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<UpdateCategoryRequest>;
    }) => categoryService.update(id, data),
    onSuccess: async (_data, variables) => {
      queryClient.removeQueries({
        queryKey: ["categories", variables.id],
        exact: true,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
        queryClient.invalidateQueries({ queryKey: ["lookups", "categories"] }),
      ]);
      toast.success("Categoria atualizada com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      if (!parsed.isValidationError) {
        toast.error(parsed.message || "Erro ao atualizar categoria.");
      }
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["lookups", "categories"] });
      toast.success("Categoria excluída com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error(parsed.message || "Erro ao excluir categoria.");
    },
  });
}
