"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sellerService } from "../services/seller.service";
import { parseApiError } from "@/lib/api/errors";
import type { StoreSellerRequest, UpdateSellerRequest } from "../types";

export function useSellers(page = 1) {
  return useQuery({
    queryKey: ["sellers", page],
    queryFn: () => sellerService.list({ page }),
  });
}

export function useSeller(id?: string) {
  return useQuery({
    queryKey: ["sellers", id],
    queryFn: () => sellerService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreSellerRequest) => sellerService.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      toast.success(res?.message || "Vendedor cadastrado com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      if (!parsed.isValidationError) {
        toast.error(parsed.message || "Erro ao cadastrar vendedor.");
      }
    },
  });
}

export function useUpdateSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<UpdateSellerRequest>;
    }) => sellerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      toast.success("Vendedor atualizado com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      if (!parsed.isValidationError) {
        toast.error(parsed.message || "Erro ao atualizar vendedor.");
      }
    },
  });
}

export function useDeleteSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sellerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      toast.success("Vendedor excluído com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error(parsed.message || "Erro ao excluir vendedor.");
    },
  });
}
