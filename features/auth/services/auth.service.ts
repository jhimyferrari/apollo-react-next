import { apiClient } from "@/lib/api/client";
import { setToken, removeToken } from "@/lib/auth/token";
import { setUserSession, clearSession } from "@/lib/auth/session";
import { cleanDocument } from "@/lib/masks";
import type {
  LoginCredentials,
  LoginResponse,
  RegisterOrganizationData,
  RegisterOrganizationResponse,
} from "../types";

export const authService = {
  /**
   * Realiza login no sistema (multi-tenant)
   * POST /v1/login { email, password, organization_document }
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const payload = {
      email: credentials.email.trim(),
      password: credentials.password,
      organization_document: cleanDocument(credentials.organization_document),
    };

    const response = await apiClient.post<LoginResponse>("/v1/login", payload);

    if (response?.data?.token) {
      setToken(response.data.token);
      if (response.data.user) {
        setUserSession(response.data.user);
      }
    }

    return response;
  },

  /**
   * Registra uma nova organização (empresa)
   * POST /v1/organizations { name, document, email, password }
   */
  async registerOrganization(
    data: RegisterOrganizationData
  ): Promise<RegisterOrganizationResponse> {
    const payload = {
      name: data.name.trim(),
      document: cleanDocument(data.document),
      email: data.email.trim(),
      password: data.password,
    };

    return apiClient.post<RegisterOrganizationResponse>(
      "/v1/organizations",
      payload
    );
  },

  /**
   * Encerra a sessão do usuário.
   * Executa POST /v1/logout e limpa determinísticamente o token no cliente.
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/v1/logout");
    } catch {
      // Falha na requisição de logout no servidor não impede a limpeza no cliente
    } finally {
      clearSession();
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },
};
