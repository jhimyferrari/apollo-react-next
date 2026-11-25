import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import { cleanListParams, type BaseListParams } from "@/lib/table-utils";
import { lookupService } from "@/features/lookups/services/lookup.service";
import type { LookupParams } from "@/features/lookups/types";
import type {
  CategoryResource,
  StoreCategoryRequest,
  UpdateCategoryRequest,
} from "../types";

export type CategoryListParams = BaseListParams;

export const categoryService = {
  list(params?: CategoryListParams) {
    return apiClient.get<PaginatedResponse<CategoryResource>>(
      "/v1/categories",
      cleanListParams(params)
    );
  },

  lookup(params?: LookupParams) {
    return lookupService.categories(params);
  },

  getById(id: string) {
    return apiClient.get<{ data: CategoryResource }>(`/v1/categories/${id}`);
  },

  create(data: StoreCategoryRequest) {
    return apiClient.post<{ message: string; data: CategoryResource }>(
      "/v1/categories",
      data
    );
  },

  update(id: string, data: Partial<UpdateCategoryRequest>) {
    return apiClient.patch<void>(`/v1/categories/${id}`, data);
  },

  delete(id: string) {
    return apiClient.delete<void>(`/v1/categories/${id}`);
  },
};
