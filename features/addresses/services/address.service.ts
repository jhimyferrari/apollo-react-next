import { apiClient } from "@/lib/api/client";
import type {
  AddressResource,
  StoreAddressRequest,
  UpdateAddressRequest,
} from "../types";

export type AddressOwnerType = "clients" | "sellers" | "suppliers";

export const addressService = {
  list(ownerType: AddressOwnerType, ownerId: string) {
    return apiClient.get<{ data: AddressResource[] }>(
      `/v1/${ownerType}/${ownerId}/addresses`
    );
  },

  create(ownerType: AddressOwnerType, ownerId: string, data: StoreAddressRequest) {
    return apiClient.post<{ message: string; data: AddressResource }>(
      `/v1/${ownerType}/${ownerId}/addresses`,
      data
    );
  },

  setDefault(ownerType: AddressOwnerType, ownerId: string, addressId: string) {
    return apiClient.patch<void>(
      `/v1/${ownerType}/${ownerId}/addresses/${addressId}/setDefault`
    );
  },

  update(addressId: string, data: UpdateAddressRequest) {
    return apiClient.patch<void>(`/v1/addresses/${addressId}`, data);
  },

  delete(addressId: string) {
    return apiClient.delete<void>(`/v1/addresses/${addressId}`);
  },
};
