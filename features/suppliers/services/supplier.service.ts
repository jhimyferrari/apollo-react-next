import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import { cleanDocument, onlyDigits } from "@/lib/masks";
import type {
  SupplierResource,
  StoreSupplierRequest,
  UpdateSupplierRequest,
} from "../types";

export const supplierService = {
  list(params?: { page?: number; per_page?: number }) {
    return apiClient.get<PaginatedResponse<SupplierResource>>("/v1/suppliers", params);
  },

  getById(id: string) {
    return apiClient.get<{ data: SupplierResource }>(`/v1/suppliers/${id}`);
  },

  create(data: StoreSupplierRequest) {
    const payload = {
      ...data,
      document: cleanDocument(data.document),
      phone: data.phone ? onlyDigits(data.phone) : null,
      email: data.email?.trim() || null,
      state_registration: data.state_registration?.trim() || null,
    };
    return apiClient.post<{ message: string; data: SupplierResource }>(
      "/v1/suppliers",
      payload
    );
  },

  update(id: string, data: Partial<UpdateSupplierRequest>) {
    const payload = {
      ...data,
      ...(data.document ? { document: cleanDocument(data.document) } : {}),
      ...(data.phone !== undefined ? { phone: data.phone ? onlyDigits(data.phone) : null } : {}),
      ...(data.email !== undefined ? { email: data.email?.trim() || null } : {}),
      ...(data.state_registration !== undefined
        ? { state_registration: data.state_registration?.trim() || null }
        : {}),
    };
    return apiClient.patch<void>(`/v1/suppliers/${id}`, payload);
  },

  delete(id: string) {
    return apiClient.delete<void>(`/v1/suppliers/${id}`);
  },
};
