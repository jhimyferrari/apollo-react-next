import type { BrandResource } from "@/features/brands/types";
import type { CategoryResource } from "@/features/categories/types";

export type ProductUnit = "un" | "kg" | "cx" | "l" | "m";

export interface NcmCodeResource {
  id: string;
  code: string;
  valid_from: string;
  isActive: string;
}

export interface ProductResource {
  id: string;
  number: number;
  name: string;
  status: string;
  description: string | null;
  unit: ProductUnit;
  ncm: NcmCodeResource | null;
  ean: string | null;
  // No JSON do Laravel, campos money chegam como string ou object formatado
  cost_price: string | number | Record<string, unknown>;
  sale_price: string | number | Record<string, unknown>;
  stock_quantity: string | number | Record<string, unknown> | null;
  brand: BrandResource | null;
  categories: CategoryResource[];
  created_at: string | null;
  updated_at: string | null;
}

export interface StoreProductRequest {
  name: string;
  description?: string | null;
  unit: ProductUnit;
  ncm?: string | null;
  ean?: string | null;
  cost_price: number;
  sale_price: number;
  brand_id?: string | null;
  categories?: Array<{ id: string }> | null;
}

export interface UpdateProductRequest {
  name: string;
  description?: string | null;
  unit: ProductUnit;
  ncm?: string | null;
  ean?: string | null;
  cost_price: number;
  sale_price: number;
  stock_quantity?: number | null;
  brand_id?: string | null;
  categories?: Array<{ id: string }> | null;
}
