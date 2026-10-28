"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supplierService } from "../services/supplier.service";
import { parseApiError } from "@/lib/api/errors";
import type { StoreSupplierRequest, UpdateSupplierRequest } from "../types";

export function useSuppliers(page = 1) {
  return useQuery({
    queryKey: ["suppliers", page],
    queryFn: () => supplierService.list({ page }),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
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
      toast.success("Fornecedor excluído com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error(parsed.message || "Erro ao excluir fornecedor.");
    },
  });
}
