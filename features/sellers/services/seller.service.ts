import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import { cleanDocument, onlyDigits } from "@/lib/masks";
import type {
  SellerResource,
  StoreSellerRequest,
  UpdateSellerRequest,
} from "../types";

export const sellerService = {
  list(params?: { page?: number; per_page?: number }) {
    return apiClient.get<PaginatedResponse<SellerResource>>("/v1/sellers", params);
  },

  getById(id: string) {
    return apiClient.get<{ data: SellerResource }>(`/v1/sellers/${id}`);
  },

  create(data: StoreSellerRequest) {
    const payload = {
      ...data,
      document: cleanDocument(data.document),
      phone: data.phone ? onlyDigits(data.phone) : null,
      email: data.email?.trim() || null,
      state_registration: data.state_registration?.trim() || null,
      started_at: data.started_at || null,
      ended_at: data.ended_at || null,
    };
    return apiClient.post<{ message: string; data: SellerResource }>(
      "/v1/sellers",
      payload
    );
  },

  update(id: string, data: Partial<UpdateSellerRequest>) {
    const payload = {
      ...data,
      ...(data.document ? { document: cleanDocument(data.document) } : {}),
      ...(data.phone !== undefined ? { phone: data.phone ? onlyDigits(data.phone) : null } : {}),
      ...(data.email !== undefined ? { email: data.email?.trim() || null } : {}),
      ...(data.state_registration !== undefined
        ? { state_registration: data.state_registration?.trim() || null }
        : {}),
      ...(data.started_at !== undefined ? { started_at: data.started_at || null } : {}),
      ...(data.ended_at !== undefined ? { ended_at: data.ended_at || null } : {}),
    };
    return apiClient.patch<void>(`/v1/sellers/${id}`, payload);
  },

  delete(id: string) {
    return apiClient.delete<void>(`/v1/sellers/${id}`);
  },
};
