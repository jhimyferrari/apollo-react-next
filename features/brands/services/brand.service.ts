import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import type {
  BrandResource,
  StoreBrandRequest,
  UpdateBrandRequest,
} from "../types";

export const brandService = {
  list(params?: { page?: number; per_page?: number }) {
    return apiClient.get<PaginatedResponse<BrandResource>>("/v1/brands", params);
  },

  getById(id: string) {
    return apiClient.get<{ data: BrandResource }>(`/v1/brands/${id}`);
  },

  create(data: StoreBrandRequest) {
    return apiClient.post<{ message: string; data: BrandResource }>(
      "/v1/brands",
      data
    );
  },

  update(id: string, data: Partial<UpdateBrandRequest>) {
    return apiClient.patch<void>(`/v1/brands/${id}`, data);
  },

  delete(id: string) {
    return apiClient.delete<void>(`/v1/brands/${id}`);
  },
};
