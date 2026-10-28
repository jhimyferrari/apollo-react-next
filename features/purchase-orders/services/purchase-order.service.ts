import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import type {
  PurchaseOrderResource,
  StorePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
} from "../types";

export const purchaseOrderService = {
  list(params?: { page?: number; per_page?: number; status?: string }) {
    return apiClient.get<PaginatedResponse<PurchaseOrderResource>>(
      "/v1/purchase-orders",
      params
    );
  },

  getById(id: string) {
    return apiClient.get<{ data: PurchaseOrderResource }>(
      `/v1/purchase-orders/${id}`
    );
  },

  create(data: StorePurchaseOrderRequest) {
    return apiClient.post<{ message: string; data: PurchaseOrderResource }>(
      "/v1/purchase-orders",
      data
    );
  },

  update(id: string, data: UpdatePurchaseOrderRequest) {
    return apiClient.patch<void>(`/v1/purchase-orders/${id}`, data);
  },

  confirm(id: string) {
    return apiClient.patch<{ message: string }>(
      `/v1/purchase-orders/${id}/confirm`
    );
  },

  reopen(id: string) {
    return apiClient.patch<{ message: string }>(
      `/v1/purchase-orders/${id}/reopen`
    );
  },

  cancel(id: string, reason?: string) {
    return apiClient.patch<{ message: string }>(
      `/v1/purchase-orders/${id}/cancel`,
      { cancellation_reason: reason || null }
    );
  },

  delete(id: string) {
    return apiClient.delete<void>(`/v1/purchase-orders/${id}`);
  },
};
