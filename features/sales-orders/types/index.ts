import type { ClientResource } from "@/features/clients/types";
import type { SellerResource } from "@/features/sellers/types";
import type { ProductResource } from "@/features/products/types";

export type OrderStatus = "draf" | "confirmed" | "cancelled";
export type PaymentStatus = "pending" | "paid";

export interface SalesOrderItemResource {
  id: string;
  number: number;
  product_id: string;
  quantity: string | number;
  unit_price: string;
  subtotal: string;
  product?: ProductResource;
}

export interface SalesOrderResource {
  id: string;
  number: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  client_id: string;
  seller_id: string;
  total: string;
  replaces_order_id: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
  items?: SalesOrderItemResource[];
  client?: ClientResource;
  seller?: SellerResource;
}

export interface StoreSalesOrderItemInput {
  product_id: string;
  number: number;
  quantity: number;
}

export interface StoreSalesOrderRequest {
  client_id: string;
  seller_id: string;
  items: StoreSalesOrderItemInput[];
}

export interface UpdateSalesOrderRequest {
  client_id?: string;
  seller_id?: string;
  payment_status?: PaymentStatus;
  items?: {
    to_add?: StoreSalesOrderItemInput[];
    to_update?: Array<{
      id: string;
      product_id?: string;
      number?: number;
      quantity?: number;
    }>;
    to_remove?: Array<{ id: string }>;
  };
}
