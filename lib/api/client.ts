import { getToken, removeToken } from "../auth/token";
import { parseApiError } from "./errors";
import type { ParsedApiError } from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000/api";

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
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Executa a requisição HTTP aplicando interceptors de autenticação e erro.
   */
  public async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, headers: customHeaders, ...customOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(customHeaders as Record<string, string>),
    };

    // Interceptor de Requisição: Injeta Token Bearer se autenticado
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...customOptions,
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

      // Se desautenticado (401), limpa credenciais e redireciona ao login
      if (parsed.isUnauthenticated) {
        removeToken();
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
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
