import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import { cleanListParams, type BaseListParams } from "@/lib/table-utils";
import { lookupService } from "@/features/lookups/services/lookup.service";
import type { LookupParams } from "@/features/lookups/types";
import type {
  BrandResource,
  StoreBrandRequest,
  UpdateBrandRequest,
} from "../types";

export type BrandListParams = BaseListParams;

export const brandService = {
  list(params?: BrandListParams) {
    return apiClient.get<PaginatedResponse<BrandResource>>(
      "/v1/brands",
      cleanListParams(params)
    );
  },

  lookup(params?: LookupParams) {
    return lookupService.brands(params);
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
