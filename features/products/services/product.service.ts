import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import type {
  ProductResource,
  StoreProductRequest,
  UpdateProductRequest,
} from "../types";

export const productService = {
  list(params?: { page?: number; per_page?: number }) {
    return apiClient.get<PaginatedResponse<ProductResource>>(
      "/v1/products",
      params
    );
  },

  getById(id: string) {
    return apiClient.get<{ data: ProductResource }>(`/v1/products/${id}`);
  },

  create(data: StoreProductRequest) {
    return apiClient.post<{ message: string; data: ProductResource }>(
      "/v1/products",
      data
    );
  },

  /**
   * Envia apenas os campos alterados via PATCH
   */
  update(id: string, diff: Partial<UpdateProductRequest>) {
    return apiClient.patch<void>(`/v1/products/${id}`, diff);
  },

  delete(id: string) {
    return apiClient.delete<void>(`/v1/products/${id}`);
  },
};
