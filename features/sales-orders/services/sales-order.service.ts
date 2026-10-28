import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import type {
  SalesOrderResource,
  StoreSalesOrderRequest,
  UpdateSalesOrderRequest,
} from "../types";

export const salesOrderService = {
  list(params?: { page?: number; per_page?: number; status?: string }) {
    return apiClient.get<PaginatedResponse<SalesOrderResource>>(
      "/v1/sales-orders",
      params
    );
  },

  getById(id: string) {
    return apiClient.get<{ data: SalesOrderResource }>(`/v1/sales-orders/${id}`);
  },

  create(data: StoreSalesOrderRequest) {
    return apiClient.post<{ message: string; data: SalesOrderResource }>(
      "/v1/sales-orders",
      data
    );
  },

  update(id: string, data: UpdateSalesOrderRequest) {
    return apiClient.patch<void>(`/v1/sales-orders/${id}`, data);
  },

  confirm(id: string) {
    return apiClient.patch<{ message: string }>(`/v1/sales-orders/${id}/confirm`);
  },

  reopen(id: string) {
    return apiClient.patch<{ message: string }>(`/v1/sales-orders/${id}/reopen`);
  },

  cancel(id: string, reason?: string) {
    return apiClient.patch<{ message: string }>(`/v1/sales-orders/${id}/cancel`, {
      cancellation_reason: reason || null,
    });
  },

  delete(id: string) {
    return apiClient.delete<void>(`/v1/sales-orders/${id}`);
  },
};
