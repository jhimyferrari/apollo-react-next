"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { reportService } from "../services/report.service";
import { brandService } from "@/features/brands/services/brand.service";
import { categoryService } from "@/features/categories/services/category.service";
import { clientService } from "@/features/clients/services/client.service";
import { productService } from "@/features/products/services/product.service";
import { sellerService } from "@/features/sellers/services/seller.service";
import { supplierService } from "@/features/suppliers/services/supplier.service";
import type { ReportFilters } from "../types";

export function useSalesSummaryReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "sales", "summary", filters],
    queryFn: () => reportService.salesSummary(filters),
    placeholderData: keepPreviousData,
  });
}

export function useSalesByProductReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "sales", "by-product", filters],
    queryFn: () => reportService.salesByProduct(filters),
    placeholderData: keepPreviousData,
  });
}

export function useSalesBySellerReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "sales", "by-seller", filters],
    queryFn: () => reportService.salesBySeller(filters),
    placeholderData: keepPreviousData,
  });
}

export function usePurchasesSummaryReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "purchases", "summary", filters],
    queryFn: () => reportService.purchasesSummary(filters),
    placeholderData: keepPreviousData,
  });
}

export type FilterEntity =
  | "clients"
  | "sellers"
  | "suppliers"
  | "products"
  | "categories"
  | "brands";

export interface FilterOption {
  value: string;
  label: string;
}

const OPTIONS_PARAMS = { per_page: 100 };
const STALE_TIME = 1000 * 60 * 5;

/**
 * Carrega as opções (até 100 registros) dos seletores de filtro.
 * `enabled` evita requisições a endpoints sem permissão de leitura.
 */
export function useFilterOptions(entity: FilterEntity, enabled: boolean) {
  return useQuery<FilterOption[]>({
    queryKey: ["reports", "filter-options", entity],
    enabled,
    staleTime: STALE_TIME,
    queryFn: async () => {
      switch (entity) {
        case "clients": {
          const res = await clientService.list(OPTIONS_PARAMS);
          return res.data.map((c) => ({ value: c.id, label: c.trade_name || c.legal_name }));
        }
        case "sellers": {
          const res = await sellerService.list(OPTIONS_PARAMS);
          return res.data.map((s) => ({ value: s.id, label: s.trade_name || s.legal_name }));
        }
        case "suppliers": {
          const res = await supplierService.list(OPTIONS_PARAMS);
          return res.data.map((s) => ({ value: s.id, label: s.trade_name || s.legal_name }));
        }
        case "products": {
          const res = await productService.list(OPTIONS_PARAMS);
          return res.data.map((p) => ({ value: p.id, label: p.name }));
        }
        case "categories": {
          const res = await categoryService.list(OPTIONS_PARAMS);
          return res.data.map((c) => ({ value: c.id, label: c.name }));
        }
        case "brands": {
          const res = await brandService.list(OPTIONS_PARAMS);
          return res.data.map((b) => ({ value: b.id, label: b.name }));
        }
      }
    },
  });
}

