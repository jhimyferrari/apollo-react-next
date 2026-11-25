import type { PaginationLinks } from "@/lib/api/types";
import type { MoneyLike } from "@/lib/formatters";

/** Metadados de paginação enxutos retornados pelos endpoints de relatório. */
export interface ReportPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export type ReportDateField =
  | "confirmed_at"
  | "created_at"
  | "paid_at"
  | "refunded_at"
  | "cancelled_at";
export type ReportOrderDirection = "asc" | "desc";
export type ReportOrderStatus = "draft" | "confirmed" | "cancelled" | "all";
export type ReportPaymentStatus = "pending" | "paid" | "refunded" | "cancelled";

/** Filtros aceitos pelos endpoints /v1/reports/*. */
export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  date_field?: ReportDateField;
  status?: ReportOrderStatus;
  payment_status?: ReportPaymentStatus;
  client_id?: string;
  seller_id?: string;
  supplier_id?: string;
  product_id?: string;
  category_id?: string;
  brand_id?: string;
  order_by?: string;
  order_direction?: ReportOrderDirection;
  per_page?: number;
  page?: number;
}

export interface ReportBreakdownEntry {
  count: number;
  total: MoneyLike;
}

export interface OrderSummaryTotals {
  orders_count: number;
  total_amount: MoneyLike;
  average_ticket: MoneyLike;
  total_items_quantity: string;
  by_status: Record<string, ReportBreakdownEntry>;
  by_payment_status: Record<string, ReportBreakdownEntry>;
  pending_refund?: ReportBreakdownEntry;
}

export interface ReportPartnerRef {
  id: string;
  number: number;
  trade_name: string;
  legal_name: string;
}

interface ReportOrderRowBase {
  id: string;
  number: number;
  status: string;
  payment_status: string;
  total: MoneyLike;
  items_count: number;
  confirmed_at: string | null;
  paid_at: string | null;
  refunded_at: string | null;
  cancelled_at: string | null;
  created_at: string | null;
}

export interface SalesSummaryRow extends ReportOrderRowBase {
  client: ReportPartnerRef | null;
  seller: ReportPartnerRef | null;
}

export interface PurchaseSummaryRow extends ReportOrderRowBase {
  supplier: ReportPartnerRef | null;
}

interface ReportEnvelope<TTotals, TRow> {
  totals: TTotals;
  data: TRow[];
  meta: ReportPaginationMeta;
  links: PaginationLinks;
}

export type SalesSummaryReport = ReportEnvelope<OrderSummaryTotals, SalesSummaryRow>;
export type PurchaseSummaryReport = ReportEnvelope<OrderSummaryTotals, PurchaseSummaryRow>;

export interface SalesByProductTotals {
  distinct_products_count: number;
  total_quantity: string;
  total_amount: MoneyLike;
}

export interface SalesByProductRow {
  product_id: string;
  product_number: number;
  product_name: string;
  product_unit: string;
  brand: { id: string; name: string } | null;
  quantity_sold: string;
  total_amount: MoneyLike;
  average_unit_price: MoneyLike;
  orders_count: number;
}

export type SalesByProductReport = ReportEnvelope<SalesByProductTotals, SalesByProductRow>;

export interface SalesBySellerTotals {
  active_sellers_count: number;
  orders_count: number;
  total_amount: MoneyLike;
}

export interface SalesBySellerRow {
  seller_id: string;
  seller_number: number;
  trade_name: string;
  legal_name: string;
  document: string;
  orders_count: number;
  total_amount: MoneyLike;
  average_ticket: MoneyLike;
  percentage_of_total: number;
}

export type SalesBySellerReport = ReportEnvelope<SalesBySellerTotals, SalesBySellerRow>;

