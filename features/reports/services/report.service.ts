import { apiClient } from "@/lib/api/client";
import type {
  ReportFilters,
  SalesSummaryReport,
  SalesByProductReport,
  SalesBySellerReport,
  PurchaseSummaryReport,
} from "../types";

/** Remove chaves vazias para não enviar query params inválidos (ex.: `status=`). */
function clean(filters: ReportFilters) {
  const params: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = value as string | number;
    }
  }
  return params;
}

export const reportService = {
  salesSummary(filters: ReportFilters) {
    return apiClient.get<SalesSummaryReport>("/v1/reports/sales/summary", clean(filters));
  },

  salesByProduct(filters: ReportFilters) {
    return apiClient.get<SalesByProductReport>("/v1/reports/sales/by-product", clean(filters));
  },

  salesBySeller(filters: ReportFilters) {
    return apiClient.get<SalesBySellerReport>("/v1/reports/sales/by-seller", clean(filters));
  },

  purchasesSummary(filters: ReportFilters) {
    return apiClient.get<PurchaseSummaryReport>("/v1/reports/purchases/summary", clean(filters));
  },
};

