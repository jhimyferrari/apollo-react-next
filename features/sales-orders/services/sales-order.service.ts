import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import { clientService } from "@/features/clients/services/client.service";
import { sellerService } from "@/features/sellers/services/seller.service";
import type {
  SalesOrderResource,
  StoreSalesOrderRequest,
  UpdateSalesOrderRequest,
  ReopenSalesOrderResponse,
} from "../types";

export const salesOrderService = {
  list(params?: { page?: number; per_page?: number; status?: string }) {
    return apiClient.get<PaginatedResponse<SalesOrderResource>>(
      "/v1/sales-orders",
      params
    );
  },

  async getById(id: string): Promise<{ data: SalesOrderResource }> {
    const res = await apiClient.get<{ data: SalesOrderResource }>(
      `/v1/sales-orders/${id}`
    );
    const order = res?.data;
    if (!order) return res;

    let enriched = { ...order };

    // O endpoint GET /v1/sales-orders/{id} pode não carregar client, seller e items via eager load.
    // Caso estejam ausentes, enriquecemos a partir da listagem e/ou serviços individuais.
    if (
      enriched.items === undefined ||
      enriched.client === undefined ||
      enriched.seller === undefined
    ) {
      try {
        const listRes = await apiClient.get<PaginatedResponse<SalesOrderResource>>(
          "/v1/sales-orders",
          { page: 1 }
        );
        const match = listRes?.data?.find((item) => item.id === id);
        if (match) {
          enriched = {
            ...enriched,
            client: enriched.client ?? match.client,
            seller: enriched.seller ?? match.seller,
            items: enriched.items ?? match.items,
          };
        }
      } catch {
        // Continua para tentativa individual
      }
    }

    if (!enriched.client && enriched.client_id) {
      try {
        const clientRes = await clientService.getById(enriched.client_id);
        if (clientRes?.data) {
          enriched.client = clientRes.data;
        }
      } catch {
        // Fallback silencioso
      }
    }

    if (!enriched.seller && enriched.seller_id) {
      try {
        const sellerRes = await sellerService.getById(enriched.seller_id);
        if (sellerRes?.data) {
          enriched.seller = sellerRes.data;
        }
      } catch {
        // Fallback silencioso
      }
    }

    return { data: enriched };
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

  reopen(id: string, reason?: string) {
    return apiClient.patch<ReopenSalesOrderResponse>(
      `/v1/sales-orders/${id}/reopen`,
      reason ? { reason } : undefined
    );
  },

  cancel(id: string, reason?: string) {
    const cleanReason = reason?.trim() || null;
    return apiClient.patch<{ message: string }>(`/v1/sales-orders/${id}/cancel`, {
      reason: cleanReason,
      cancellation_reason: cleanReason,
    });
  },

  delete(id: string) {
    return apiClient.delete<void>(`/v1/sales-orders/${id}`);
  },
};
