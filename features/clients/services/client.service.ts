import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import { cleanListParams, type BaseListParams } from "@/lib/table-utils";
import { lookupService } from "@/features/lookups/services/lookup.service";
import type { LookupParams } from "@/features/lookups/types";
import { cleanDocument, onlyDigits } from "@/lib/masks";
import type {
  ClientResource,
  StoreClientRequest,
  UpdateClientRequest,
} from "../types";

export interface ClientListParams extends BaseListParams {
  status?: string;
}

export const clientService = {
  list(params?: ClientListParams) {
    return apiClient.get<PaginatedResponse<ClientResource>>(
      "/v1/clients",
      cleanListParams(params)
    );
  },

  lookup(params?: LookupParams) {
    return lookupService.clients(params);
  },

  getById(id: string) {
    return apiClient.get<{ data: ClientResource }>(`/v1/clients/${id}`);
  },

  create(data: StoreClientRequest) {
    const payload = {
      ...data,
      document: cleanDocument(data.document),
      phone: data.phone ? onlyDigits(data.phone) : null,
      email: data.email?.trim() || null,
      state_registration: data.state_registration?.trim() || null,
    };
    return apiClient.post<{ message: string; data: ClientResource }>(
      "/v1/clients",
      payload
    );
  },

  update(id: string, data: Partial<UpdateClientRequest>) {
    const payload = {
      ...data,
      ...(data.document ? { document: cleanDocument(data.document) } : {}),
      ...(data.phone !== undefined ? { phone: data.phone ? onlyDigits(data.phone) : null } : {}),
      ...(data.email !== undefined ? { email: data.email?.trim() || null } : {}),
      ...(data.state_registration !== undefined
        ? { state_registration: data.state_registration?.trim() || null }
        : {}),
    };
    return apiClient.patch<void>(`/v1/clients/${id}`, payload);
  },

  delete(id: string) {
    return apiClient.delete<void>(`/v1/clients/${id}`);
  },
};
