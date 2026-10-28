"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { salesOrderService } from "../services/sales-order.service";
import { parseApiError } from "@/lib/api/errors";
import type { StoreSalesOrderRequest, UpdateSalesOrderRequest } from "../types";

export function useSalesOrders(page = 1, status?: string) {
  return useQuery({
    queryKey: ["sales-orders", page, status],
    queryFn: () => salesOrderService.list({ page, status }),
  });
}

export function useSalesOrder(id?: string) {
  return useQuery({
    queryKey: ["sales-orders", id],
    queryFn: () => salesOrderService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreSalesOrderRequest) => salesOrderService.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      toast.success(res?.message || "Pedido de venda criado com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      if (!parsed.isValidationError) {
        toast.error(parsed.message || "Erro ao criar pedido de venda.");
      }
    },
  });
}

export function useUpdateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSalesOrderRequest;
    }) => salesOrderService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      toast.success("Pedido atualizado com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      if (!parsed.isValidationError) {
        toast.error(parsed.message || "Erro ao atualizar pedido.");
      }
    },
  });
}

export function useConfirmSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salesOrderService.confirm(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      toast.success(res?.message || "Pedido de venda confirmado!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error(parsed.message || "Erro ao confirmar pedido.");
    },
  });
}

export function useReopenSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salesOrderService.reopen(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      toast.success(res?.message || "Pedido reaberto com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error(parsed.message || "Erro ao reabrir pedido.");
    },
  });
}

export function useCancelSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      salesOrderService.cancel(id, reason),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      toast.success(res?.message || "Pedido cancelado com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error(parsed.message || "Erro ao cancelar pedido.");
    },
  });
}

export function useDeleteSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salesOrderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      toast.success("Pedido excluído com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error(parsed.message || "Erro ao excluir pedido.");
    },
  });
}
