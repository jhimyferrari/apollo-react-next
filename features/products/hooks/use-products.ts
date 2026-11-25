"use client";

import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productService, type ProductListParams } from "../services/product.service";
import { parseApiError } from "@/lib/api/errors";
import { useProductLookup } from "@/features/lookups/hooks/use-lookups";
import type { StoreProductRequest, UpdateProductRequest } from "../types";

export { useProductLookup };

export function useProducts(params?: ProductListParams) {
  return useQuery({
    queryKey: ["products", params ?? {}],
    queryFn: () => productService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreProductRequest) => productService.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["lookups", "products"] });
      toast.success(res?.message || "Produto cadastrado com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      if (!parsed.isValidationError) {
        toast.error(parsed.message || "Erro ao cadastrar produto.");
      }
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      diff,
    }: {
      id: string;
      diff: Partial<UpdateProductRequest>;
    }) => productService.update(id, diff),
    onSuccess: async (_data, variables) => {
      queryClient.removeQueries({
        queryKey: ["products", variables.id],
        exact: true,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["lookups", "products"] }),
      ]);
      toast.success("Produto atualizado com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      if (!parsed.isValidationError) {
        toast.error(parsed.message || "Erro ao atualizar produto.");
      }
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["lookups", "products"] });
      toast.success("Produto removido com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error(parsed.message || "Erro ao excluir produto.");
    },
  });
}
