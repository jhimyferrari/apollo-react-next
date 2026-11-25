import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import { cleanListParams, type BaseListParams } from "@/lib/table-utils";
import type {
  UserResource,
  StoreUserRequest,
  UpdateUserRequest,
  UpdateOwnPasswordRequest,
} from "../types";

export interface UserListParams extends BaseListParams {
  profile?: string;
}

export const userService = {
  list(params?: UserListParams) {
    return apiClient.get<PaginatedResponse<UserResource>>(
      "/v1/users",
      cleanListParams(params)
    );
  },

  getById(id: string) {
    return apiClient.get<{ data: UserResource }>(`/v1/users/${id}`);
  },

  create(data: StoreUserRequest) {
    return apiClient.post<{ message: string; data: UserResource }>(
      "/v1/users",
      data
    );
  },

  update(id: string, data: UpdateUserRequest) {
    return apiClient.patch<void>(`/v1/users/${id}`, data);
  },

  updateOwnPassword(data: UpdateOwnPasswordRequest) {
    return apiClient.patch<void>("/v1/users/me/password", data);
  },

  delete(id: string) {
    return apiClient.delete<void>(`/v1/users/${id}`);
  },
};
