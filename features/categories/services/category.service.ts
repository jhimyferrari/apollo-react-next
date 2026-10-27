import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import type {
  CategoryResource,
  StoreCategoryRequest,
  UpdateCategoryRequest,
} from "../types";

export const categoryService = {
  list(params?: { page?: number; per_page?: number }) {
    return apiClient.get<PaginatedResponse<CategoryResource>>(
      "/v1/categories",
      params
    );
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
