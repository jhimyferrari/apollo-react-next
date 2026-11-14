import type { AddressResource } from "@/features/addresses/types";

export type ClientStatus = "active" | "inactive";

export interface ClientResource {
  id: string;
  number: number;
  status: ClientStatus | string;
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

export interface StoreClientRequest {
  document: string;
  legal_name: string;
  trade_name: string;
  state_registration?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface UpdateClientRequest {
  status?: ClientStatus;
  document?: string;
  legal_name?: string;
  trade_name?: string;
  state_registration?: string | null;
  phone?: string | null;
  email?: string | null;
}
