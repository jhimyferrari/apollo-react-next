import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import { supplierService } from "@/features/suppliers/services/supplier.service";
import { lookupService } from "@/features/lookups/services/lookup.service";
import type {
  PurchaseOrderResource,
  StorePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  ReopenPurchaseOrderResponse,
} from "../types";

export const purchaseOrderService = {
  list(params?: { page?: number; per_page?: number; status?: string }) {
    return apiClient.get<PaginatedResponse<PurchaseOrderResource>>(
      "/v1/purchase-orders",
      params
    );
  },

  async getById(id: string): Promise<{ data: PurchaseOrderResource }> {
    const res = await apiClient.get<{ data: PurchaseOrderResource }>(
      `/v1/purchase-orders/${id}`
    );
    const order = res?.data;
    if (!order) return res;

    let enriched = { ...order };

    // O endpoint GET /v1/purchase-orders/{id} pode não carregar supplier e items via eager load.
    // Caso estejam ausentes, enriquecemos a partir da listagem e/ou serviço de fornecedor.
    if (enriched.items === undefined || enriched.supplier === undefined) {
      try {
        const listRes = await apiClient.get<
          PaginatedResponse<PurchaseOrderResource>
        >("/v1/purchase-orders", { page: 1 });
        const match = listRes?.data?.find((item) => item.id === id);
        if (match) {
          enriched = {
            ...enriched,
            supplier: enriched.supplier ?? match.supplier,
            items: enriched.items ?? match.items,
          };
        }
      } catch {
        // Continua para tentativa individual
      }
    }

    if (!enriched.supplier && enriched.supplier_id) {
      try {
        const supplierRes = await supplierService.getById(enriched.supplier_id);
        if (supplierRes?.data) {
          enriched.supplier = supplierRes.data;
        }
      } catch {
        try {
          const lookupRes = await lookupService.suppliers({ status: "all" });
          const found = lookupRes?.data?.find((s) => s.id === enriched.supplier_id);
          if (found) {
            enriched.supplier = {
              id: found.id,
              number: found.number,
              status: found.status,
              document: found.document,
              legal_name: found.name,
              trade_name: found.name,
              state_registration: null,
              phone: null,
              email: null,
              created_at: null,
              updated_at: null,
            };
          }
        } catch {
          // Fallback silencioso
        }
      }
    }

    return { data: enriched };
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

  reopen(id: string, reason?: string) {
    return apiClient.patch<ReopenPurchaseOrderResponse>(
      `/v1/purchase-orders/${id}/reopen`,
      reason ? { reason } : undefined
    );
  },

  cancel(id: string, reason?: string) {
    const cleanReason = reason?.trim() || null;
    return apiClient.patch<{ message: string }>(
      `/v1/purchase-orders/${id}/cancel`,
      { reason: cleanReason, cancellation_reason: cleanReason }
    );
  },

  delete(id: string) {
    return apiClient.delete<void>(`/v1/purchase-orders/${id}`);
  },
};
