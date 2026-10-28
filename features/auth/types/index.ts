import type { SessionUser } from "@/lib/auth/session";

export interface LoginCredentials {
  email: string;
  password: string;
  organization_document: string;
}

export interface LoginResponseData {
  token: string;
  user: SessionUser | null;
}

export interface LoginResponse {
  message: number | string;
  data: LoginResponseData;
}

export interface Organization {
  id: string;
  name: string;
  document: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RegisterOrganizationData {
  name: string;
  document: string;
  email: string;
  password: string;
}

export interface RegisterOrganizationResponse {
  message: string;
  data: {
    organization: Organization;
    admin_email: string;
  };
}
