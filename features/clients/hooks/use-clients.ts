"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientService } from "../services/client.service";
import { parseApiError } from "@/lib/api/errors";
import type { StoreClientRequest, UpdateClientRequest } from "../types";

export function useClients(page = 1) {
  return useQuery({
    queryKey: ["clients", page],
    queryFn: () => clientService.list({ page }),
  });
}

export function useClient(id?: string) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => clientService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreClientRequest) => clientService.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success(res?.message || "Cliente cadastrado com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      if (!parsed.isValidationError) {
        toast.error(parsed.message || "Erro ao cadastrar cliente.");
      }
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<UpdateClientRequest>;
    }) => clientService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente atualizado com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      if (!parsed.isValidationError) {
        toast.error(parsed.message || "Erro ao atualizar cliente.");
      }
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente excluído com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error(parsed.message || "Erro ao excluir cliente.");
    },
  });
}
