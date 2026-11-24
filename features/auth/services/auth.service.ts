import { apiClient } from "@/lib/api/client";
import { cleanDocument } from "@/lib/masks";
import type {
  AuthSessionResponse,
  LoginCredentials,
  LoginResponse,
  RegisterOrganizationData,
  RegisterOrganizationResponse,
} from "../types";

export const authService = {
  /**
   * Realiza login no sistema (multi-tenant) via BFF.
   * POST /api/v1/login { email, password, organization_document }
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const payload = {
      email: credentials.email.trim(),
      password: credentials.password,
      organization_document: cleanDocument(credentials.organization_document),
    };

    return apiClient.post<LoginResponse>("/v1/login", payload);
  },

  /**
   * Consulta a sessão autenticada atual via BFF.
   * GET /api/auth/session
   */
  async getSession(): Promise<AuthSessionResponse> {
    return apiClient.get<AuthSessionResponse>("/auth/session");
  },

  /**
   * Registra uma nova organização (empresa)
   * POST /api/v1/organizations { name, document, email, password }
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
   * Encerra a sessão do usuário via BFF (revoga no Laravel e limpa o cookie HttpOnly).
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/v1/logout");
    } catch {
      // Falha na requisição de logout não impede a limpeza do estado local
    }
  },
};
