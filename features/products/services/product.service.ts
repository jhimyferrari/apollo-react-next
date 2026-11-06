import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import { lookupService } from "@/features/lookups/services/lookup.service";
import type { LookupParams } from "@/features/lookups/types";
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

  lookup(params?: LookupParams) {
    return lookupService.products(params);
  },

  async getById(id: string): Promise<{ data: ProductResource }> {
    const res = await apiClient.get<{ data: ProductResource }>(`/v1/products/${id}`);
    const product = res?.data;

    // O endpoint GET /v1/products/{id} pode omitir brand e categories se não carregados com eager load.
    // Caso não venham no payload individual, buscamos na listagem para enriquecer o recurso.
    if (product && (product.brand === undefined || product.categories === undefined)) {
      try {
        const listRes = await apiClient.get<PaginatedResponse<ProductResource>>(
          "/v1/products",
          { page: 1 }
        );
        const match = listRes?.data?.find((item) => item.id === id);
        if (match) {
          return {
            data: {
              ...product,
              brand: product.brand !== undefined ? product.brand : match.brand,
              categories:
                product.categories !== undefined
                  ? product.categories
                  : match.categories,
            },
          };
        }
      } catch {
        // Fallback silencioso para o recurso retornado pelo show
      }
    }

    return res;
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
