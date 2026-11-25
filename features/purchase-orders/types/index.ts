import type { SupplierResource } from "@/features/suppliers/types";
import type { ProductResource } from "@/features/products/types";
import type {
  OrderLifecycleStatus,
  OrderPaymentStatus,
} from "@/lib/orders/payment-status";
import type { MoneyLike } from "@/lib/formatters";

export type OrderStatus = OrderLifecycleStatus;
export type PaymentStatus = OrderPaymentStatus;

export interface PurchaseOrderItemResource {
  id: string;
  number: number;
  product_id: string;
  quantity: string | number;
  unit_price: MoneyLike;
  subtotal: MoneyLike;
  product?: ProductResource;
}

export interface PurchaseOrderResource {
  id: string;
  number: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  supplier_id: string;
  total: MoneyLike;
  replaces_order_id: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  paid_at: string | null;
  refunded_at: string | null;
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
  items?: {
    to_add?: StorePurchaseOrderItemInput[];
    to_update?: Array<{
      id: string;
      product_id?: string;
      number?: number;
      quantity?: number;
    }>;
    to_remove?: string[];
  };
}

export interface OutdatedPriceWarning {
  product_id: string;
  product_name: string;
  negotiated_price: string | number;
  current_price: string | number;
}

export interface ReopenPurchaseOrderResponse {
  message: string;
  data?: {
    order: PurchaseOrderResource;
    outdated_prices?: OutdatedPriceWarning[];
  };
}
