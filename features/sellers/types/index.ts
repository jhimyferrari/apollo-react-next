import type { AddressResource } from "@/features/addresses/types";

export type SellerStatus = "active" | "inactive";

export interface SellerResource {
  id: string;
  number: number;
  status: SellerStatus | string;
  document: string;
  legal_name: string;
  trade_name: string;
  state_registration: string | null;
  phone: string | null;
  email: string | null;
  started_at: string | null;
  ended_at: string | null;
  address?: AddressResource[];
  created_at: string | null;
  updated_at: string | null;
}

export interface StoreSellerRequest {
  document: string;
  legal_name: string;
  trade_name: string;
  state_registration?: string | null;
  phone?: string | null;
  email?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
}

export interface UpdateSellerRequest {
  status?: SellerStatus;
  document?: string;
  legal_name?: string;
  trade_name?: string;
  state_registration?: string | null;
  phone?: string | null;
  email?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
}
