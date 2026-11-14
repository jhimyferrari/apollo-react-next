import type { AddressResource } from "@/features/addresses/types";

export type SupplierStatus = "active" | "inactive";

export interface SupplierResource {
  id: string;
  number: number;
  status: SupplierStatus | string;
  document: string;
  legal_name: string;
  trade_name: string;
  state_registration: string | null;
  phone: string | null;
  email: string | null;
  address?: AddressResource[];
  created_at: string | null;
  updated_at: string | null;
}

export interface StoreSupplierRequest {
  document: string;
  legal_name: string;
  trade_name: string;
  state_registration?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface UpdateSupplierRequest {
  status?: SupplierStatus;
  document?: string;
  legal_name?: string;
  trade_name?: string;
  state_registration?: string | null;
  phone?: string | null;
  email?: string | null;
}
