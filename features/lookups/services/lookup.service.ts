import { apiClient } from "@/lib/api/client";
import type {
  BrandLookupResource,
  CategoryLookupResource,
  ClientLookupResource,
  LookupParams,
  LookupResponse,
  ProductLookupResource,
  SellerLookupResource,
  SupplierLookupResource,
} from "../types";

function cleanLookupParams(params?: LookupParams) {
  if (!params) return undefined;
  const cleaned: Record<string, string> = {};
  if (params.status) cleaned.status = params.status;
  if (params.search && params.search.trim() !== "") {
    cleaned.search = params.search.trim();
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

export const lookupService = {
  clients(params?: LookupParams) {
    return apiClient.get<LookupResponse<ClientLookupResource>>(
      "/v1/lookups/clients",
      cleanLookupParams(params)
    );
  },

  sellers(params?: LookupParams) {
    return apiClient.get<LookupResponse<SellerLookupResource>>(
      "/v1/lookups/sellers",
      cleanLookupParams(params)
    );
  },

  products(params?: LookupParams) {
    return apiClient.get<LookupResponse<ProductLookupResource>>(
      "/v1/lookups/products",
      cleanLookupParams(params)
    );
  },

  suppliers(params?: LookupParams) {
    return apiClient.get<LookupResponse<SupplierLookupResource>>(
      "/v1/lookups/suppliers",
      cleanLookupParams(params)
    );
  },

  brands(params?: LookupParams) {
    return apiClient.get<LookupResponse<BrandLookupResource>>(
      "/v1/lookups/brands",
      cleanLookupParams(params)
    );
  },

  categories(params?: LookupParams) {
    return apiClient.get<LookupResponse<CategoryLookupResource>>(
      "/v1/lookups/categories",
      cleanLookupParams(params)
    );
  },
};

