"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addressService, type AddressOwnerType } from "../services/address.service";
import { parseApiError } from "@/lib/api/errors";
import type { StoreAddressRequest, UpdateAddressRequest } from "../types";

export function useAddresses(ownerType: AddressOwnerType, ownerId?: string) {
  return useQuery({
    queryKey: ["addresses", ownerType, ownerId],
    queryFn: () => addressService.list(ownerType, ownerId!),
    enabled: Boolean(ownerId),
  });
}

export function useCreateAddress(ownerType: AddressOwnerType, ownerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreAddressRequest) =>
      addressService.create(ownerType, ownerId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["addresses", ownerType, ownerId] });
      queryClient.invalidateQueries({ queryKey: [ownerType, ownerId] });
      toast.success(res?.message || "Endereço cadastrado com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      if (!parsed.isValidationError) {
        toast.error(parsed.message || "Erro ao cadastrar endereço.");
      }
    },
  });
}

export function useSetDefaultAddress(ownerType: AddressOwnerType, ownerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) =>
      addressService.setDefault(ownerType, ownerId, addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", ownerType, ownerId] });
      queryClient.invalidateQueries({ queryKey: [ownerType, ownerId] });
      toast.success("Endereço padrão definido com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error(parsed.message || "Erro ao definir endereço padrão.");
    },
  });
}

export function useUpdateAddress(ownerType: AddressOwnerType, ownerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      addressId,
      data,
    }: {
      addressId: string;
      data: UpdateAddressRequest;
    }) => addressService.update(addressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", ownerType, ownerId] });
      queryClient.invalidateQueries({ queryKey: [ownerType, ownerId] });
      toast.success("Endereço atualizado com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      if (!parsed.isValidationError) {
        toast.error(parsed.message || "Erro ao atualizar endereço.");
      }
    },
  });
}

export function useDeleteAddress(ownerType: AddressOwnerType, ownerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => addressService.delete(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", ownerType, ownerId] });
      queryClient.invalidateQueries({ queryKey: [ownerType, ownerId] });
      toast.success("Endereço removido com sucesso!");
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error(parsed.message || "Erro ao remover endereço.");
    },
  });
}
