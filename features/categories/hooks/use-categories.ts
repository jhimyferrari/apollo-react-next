"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryService } from "../services/category.service";
import { parseApiError } from "@/lib/api/errors";
import type { StoreCategoryRequest, UpdateCategoryRequest } from "../types";

export function useCategories(page = 1) {
  return useQuery({
    queryKey: ["categories", page],
    queryFn: () => categoryService.list({ page }),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
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
      toast.success("Categoria excluída com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error(parsed.message || "Erro ao excluir categoria.");
    },
  });
}
