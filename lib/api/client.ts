import { broadcastAuthEvent } from "../auth/sync";
import { parseApiError } from "./errors";
import type { ParsedApiError } from "./types";

const BASE_URL = "/api";

export class ApiClientError extends Error {
  public status: number;
  public parsed: ParsedApiError;
  public data: unknown;

  constructor(status: number, data: unknown, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.data = data;
    this.parsed = parseApiError({ status, data });
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>
  ): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const path = `${this.baseUrl}${cleanEndpoint}`;

    if (!params) {
      return path;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    const query = searchParams.toString();
    return query ? `${path}?${query}` : path;
  }

  /**
   * Executa a requisição HTTP same-origin para o BFF Next.js.
   */
  public async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, headers: customHeaders, ...customOptions } = options;
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = this.buildUrl(cleanEndpoint, params);

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(customHeaders as Record<string, string>),
    };

    const response = await fetch(url, {
      ...customOptions,
      credentials: "same-origin",
      headers,
    });

    // Tratamento de respostas vazias (ex.: 204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

    let responseData: unknown = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }
    } else {
      responseData = await response.text();
    }

    // Interceptor de Resposta: Tratamento de Erros
    if (!response.ok) {
      const parsed = parseApiError({
        status: response.status,
        data: responseData,
      });

      const shouldIgnoreUnauthenticated =
        cleanEndpoint === "/v1/login" || cleanEndpoint === "/auth/session";

      // Se desautenticado (401), notifica outras abas e redireciona ao login
      if (parsed.isUnauthenticated && !shouldIgnoreUnauthenticated) {
        broadcastAuthEvent("logout");
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/register-organization")
        ) {
          window.location.replace("/login");
        }
      }

      throw new ApiClientError(
        response.status,
        responseData,
        parsed.message || "Erro na comunicação com a API."
      );
    }

    return responseData as T;
  }

  public get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
      params,
    });
  }

  public post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }
}

export const apiClient = new HttpClient(BASE_URL);
