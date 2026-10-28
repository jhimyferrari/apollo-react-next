import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import type {
  UserResource,
  StoreUserRequest,
  UpdateUserRequest,
} from "../types";

export const userService = {
  list(params?: { page?: number; per_page?: number }) {
    return apiClient.get<PaginatedResponse<UserResource>>("/v1/users", params);
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

  delete(id: string) {
    return apiClient.delete<void>(`/v1/users/${id}`);
  },
};
