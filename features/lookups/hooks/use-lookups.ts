"use client";

import { useQuery } from "@tanstack/react-query";
import { lookupService } from "../services/lookup.service";
import type { LookupParams } from "../types";

const LOOKUP_STALE_TIME = 1000 * 60 * 2; // 2 minutos

export function useClientLookup(params?: LookupParams, enabled = true) {
  return useQuery({
    queryKey: ["lookups", "clients", params ?? {}],
    queryFn: () => lookupService.clients(params),
    enabled,
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useSellerLookup(params?: LookupParams, enabled = true) {
  return useQuery({
    queryKey: ["lookups", "sellers", params ?? {}],
    queryFn: () => lookupService.sellers(params),
    enabled,
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useProductLookup(params?: LookupParams, enabled = true) {
  return useQuery({
    queryKey: ["lookups", "products", params ?? {}],
    queryFn: () => lookupService.products(params),
    enabled,
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useSupplierLookup(params?: LookupParams, enabled = true) {
  return useQuery({
    queryKey: ["lookups", "suppliers", params ?? {}],
    queryFn: () => lookupService.suppliers(params),
    enabled,
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useBrandLookup(params?: LookupParams, enabled = true) {
  return useQuery({
    queryKey: ["lookups", "brands", params ?? {}],
    queryFn: () => lookupService.brands(params),
    enabled,
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useCategoryLookup(params?: LookupParams, enabled = true) {
  return useQuery({
    queryKey: ["lookups", "categories", params ?? {}],
    queryFn: () => lookupService.categories(params),
    enabled,
    staleTime: LOOKUP_STALE_TIME,
  });
}

