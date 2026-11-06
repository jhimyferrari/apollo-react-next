"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { reportService } from "../services/report.service";
import { lookupService } from "@/features/lookups/services/lookup.service";
import { maskDocument } from "@/lib/masks";
import type { ReportFilters } from "../types";

export function useSalesSummaryReport(filters: ReportFilters, enabled = true) {
  return useQuery({
    queryKey: ["reports", "sales", "summary", filters],
    queryFn: () => reportService.salesSummary(filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useSalesByProductReport(filters: ReportFilters, enabled = true) {
  return useQuery({
    queryKey: ["reports", "sales", "by-product", filters],
    queryFn: () => reportService.salesByProduct(filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useSalesBySellerReport(filters: ReportFilters, enabled = true) {
  return useQuery({
    queryKey: ["reports", "sales", "by-seller", filters],
    queryFn: () => reportService.salesBySeller(filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function usePurchasesSummaryReport(filters: ReportFilters, enabled = true) {
  return useQuery({
    queryKey: ["reports", "purchases", "summary", filters],
    queryFn: () => reportService.purchasesSummary(filters),
    placeholderData: keepPreviousData,
    enabled,
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

const STALE_TIME = 1000 * 60 * 5;

/**
 * Carrega as opções de filtro utilizando os novos endpoints dedicados `/v1/lookups/*`
 * com `status: "all"`, permitindo filtrar inclusive por registros inativos no histórico
 * e sem truncamento de paginação.
 */
export function useFilterOptions(entity: FilterEntity, enabled: boolean) {
  return useQuery<FilterOption[]>({
    queryKey: ["reports", "lookup-options", entity],
    enabled,
    staleTime: STALE_TIME,
    queryFn: async () => {
      switch (entity) {
        case "clients": {
          const res = await lookupService.clients({ status: "all" });
          return (res.data || []).map((c) => ({
            value: c.id,
            label: `#${c.number} - ${c.name}${c.document ? ` (${maskDocument(c.document)})` : ""}`,
          }));
        }
        case "sellers": {
          const res = await lookupService.sellers({ status: "all" });
          return (res.data || []).map((s) => ({
            value: s.id,
            label: `#${s.number} - ${s.name}`,
          }));
        }
        case "suppliers": {
          const res = await lookupService.suppliers({ status: "all" });
          return (res.data || []).map((s) => ({
            value: s.id,
            label: `#${s.number} - ${s.name}${s.document ? ` (${maskDocument(s.document)})` : ""}`,
          }));
        }
        case "products": {
          const res = await lookupService.products({ status: "all" });
          return (res.data || []).map((p) => ({
            value: p.id,
            label: `#${p.number} - ${p.name} (${p.unit.toUpperCase()})`,
          }));
        }
        case "categories": {
          const res = await lookupService.categories();
          return (res.data || []).map((c) => ({
            value: c.id,
            label: `#${c.number} - ${c.name}`,
          }));
        }
        case "brands": {
          const res = await lookupService.brands();
          return (res.data || []).map((b) => ({
            value: b.id,
            label: `#${b.number} - ${b.name}`,
          }));
        }
      }
    },
  });
}
