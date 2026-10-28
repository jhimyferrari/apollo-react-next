export type PermissionAction = "read" | "create" | "update" | "delete";

export interface PermissionDefinition {
  name: string;
  domain: string;
  module: string;
  action: PermissionAction;
  actionLabel: string;
  label: string;
  description?: string;
}

export interface PermissionDomainGroup {
  id: string;
  name: string;
  description: string;
  permissions: {
    read: PermissionDefinition;
    create: PermissionDefinition;
    update: PermissionDefinition;
    delete: PermissionDefinition;
  };
}

export interface PermissionResource {
  name: string;
  status?: string;
}

export interface UserResource {
  id: string;
  name: string;
  email: string;
  permissions?: PermissionResource[];
  created_at: string | null;
  updated_at: string | null;
}

export interface StoreUserRequest {
  name: string;
  email: string;
  password?: string;
  permissions?: string[];
}

export interface UpdateUserRequest {
  permissions: string[];
}
