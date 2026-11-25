"use client";

import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supplierService, type SupplierListParams } from "../services/supplier.service";
import { parseApiError } from "@/lib/api/errors";
import { useSupplierLookup } from "@/features/lookups/hooks/use-lookups";
import type { StoreSupplierRequest, UpdateSupplierRequest } from "../types";

export { useSupplierLookup };

export function useSuppliers(params?: SupplierListParams) {
  return useQuery({
    queryKey: ["suppliers", params ?? {}],
    queryFn: () => supplierService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useSupplier(id?: string) {
  return useQuery({
    queryKey: ["suppliers", id],
    queryFn: () => supplierService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreSupplierRequest) => supplierService.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["lookups", "suppliers"] });
      toast.success(res?.message || "Fornecedor cadastrado com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      if (!parsed.isValidationError) {
        toast.error(parsed.message || "Erro ao cadastrar fornecedor.");
      }
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<UpdateSupplierRequest>;
    }) => supplierService.update(id, data),
    onSuccess: async (_data, variables) => {
      queryClient.removeQueries({
        queryKey: ["suppliers", variables.id],
        exact: true,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
        queryClient.invalidateQueries({ queryKey: ["lookups", "suppliers"] }),
      ]);
      toast.success("Fornecedor atualizado com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      if (!parsed.isValidationError) {
        toast.error(parsed.message || "Erro ao atualizar fornecedor.");
      }
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => supplierService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["lookups", "suppliers"] });
      toast.success("Fornecedor excluído com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error(parsed.message || "Erro ao excluir fornecedor.");
    },
  });
}
