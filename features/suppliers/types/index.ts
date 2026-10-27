import type { AddressResource } from "@/features/addresses/types";

export interface SupplierResource {
  id: string;
  number: number;
  status: string;
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
  document?: string;
  legal_name?: string;
  trade_name?: string;
  state_registration?: string | null;
  phone?: string | null;
  email?: string | null;
}
