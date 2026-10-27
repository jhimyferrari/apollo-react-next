import type { SupplierResource } from "@/features/suppliers/types";
import type { ProductResource } from "@/features/products/types";

export type OrderStatus = "draf" | "confirmed" | "cancelled";
export type PaymentStatus = "pending" | "paid";

export interface PurchaseOrderItemResource {
  id: string;
  number: number;
  product_id: string;
  quantity: string | number;
  unit_price: string;
  subtotal: string;
  product?: ProductResource;
}

export interface PurchaseOrderResource {
  id: string;
  number: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  supplier_id: string;
  total: string;
  replaces_order_id: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
  items?: PurchaseOrderItemResource[];
  supplier?: SupplierResource;
}

export interface StorePurchaseOrderItemInput {
  product_id: string;
  number: number;
  quantity: number;
}

export interface StorePurchaseOrderRequest {
  supplier_id: string;
  items: StorePurchaseOrderItemInput[];
}

export interface UpdatePurchaseOrderRequest {
  supplier_id?: string;
  payment_status?: PaymentStatus;
  items?: {
    to_add?: StorePurchaseOrderItemInput[];
    to_update?: Array<{
      id: string;
      product_id?: string;
      number?: number;
      quantity?: number;
    }>;
    to_remove?: Array<{ id: string }>;
  };
}
