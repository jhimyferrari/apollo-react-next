import type { SessionUser } from "./session";

/**
 * Normaliza chaves de permissão para garantir compatibilidade entre os formatos
 * canônicos (ex.: "users.create", "product.read") e as chaves reais do backend Laravel
 * (ex.: "user.create", "product.view").
 */
export function normalizePermissionKey(perm: string): string {
  if (!perm) return "";
  let normalized = perm.trim().toLowerCase();

  // Substitui sufixo .read por .view (convenção do backend Laravel)
  if (normalized.endsWith(".read")) {
    normalized = normalized.replace(/\.read$/, ".view");
  }

  // Normaliza domínios no plural para o formato aceito pelo backend Laravel
  normalized = normalized
    .replace(/^users\./, "user.")
    .replace(/^products\./, "product.")
    .replace(/^brands\./, "brand.")
    .replace(/^categories\./, "category.")
    .replace(/^clients\./, "client.")
    .replace(/^sellers\./, "seller.")
    .replace(/^suppliers\./, "supplier.")
    .replace(/^sales[-_]orders\./, "sales-order.")
    .replace(/^purchase[-_]orders\./, "purchase-order.");

  return normalized;
}

/**
 * Extrai todos os nomes de permissões de um SessionUser como um Set normalizado.
 */
export function extractUserPermissionKeys(
  user: SessionUser | null | undefined
): Set<string> {
  const keys = new Set<string>();
  if (!user || !Array.isArray(user.permissions)) return keys;

  for (const item of user.permissions) {
    const rawName = typeof item === "string" ? item : item?.name;
    if (rawName) {
      keys.add(rawName);
      keys.add(normalizePermissionKey(rawName));
    }
  }

  return keys;
}

/**
 * Verifica se um usuário possui determinada permissão ou conjunto de permissões.
 * - Administradores (is_administrator === true) possuem acesso irrestrito automático.
 * - Suporta checagem única ("product.create") ou múltipla (["product.update", "product.delete"]).
 * - Suporta modos "any" (basta uma) ou "all" (requer todas).
 */
export function hasPermission(
  user: SessionUser | null | undefined,
  requiredPermission?: string | string[] | null,
  mode: "all" | "any" = "any"
): boolean {
  if (!user) return false;

  // Administrador da organização tem passe livre
  if (user.is_administrator) return true;

  if (!requiredPermission) return true;

  const required = Array.isArray(requiredPermission)
    ? requiredPermission
    : [requiredPermission];

  if (required.length === 0) return true;

  const userPerms = extractUserPermissionKeys(user);

  if (mode === "all") {
    return required.every((req) => userPerms.has(normalizePermissionKey(req)));
  }

  return required.some((req) => userPerms.has(normalizePermissionKey(req)));
}
