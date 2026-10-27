"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { brandService } from "../services/brand.service";
import { parseApiError } from "@/lib/api/errors";
import type { StoreBrandRequest, UpdateBrandRequest } from "../types";

export function useBrands(page = 1) {
  return useQuery({
    queryKey: ["brands", page],
    queryFn: () => brandService.list({ page }),
  });
}

export function useBrand(id?: string) {
  return useQuery({
    queryKey: ["brands", id],
    queryFn: () => brandService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreBrandRequest) => brandService.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success(res?.message || "Marca criada com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      if (!parsed.isValidationError) {
        toast.error(parsed.message || "Erro ao criar marca.");
      }
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateBrandRequest> }) =>
      brandService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Marca atualizada com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      if (!parsed.isValidationError) {
        toast.error(parsed.message || "Erro ao atualizar marca.");
      }
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => brandService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Marca excluída com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error(parsed.message || "Erro ao excluir marca.");
    },
  });
}
