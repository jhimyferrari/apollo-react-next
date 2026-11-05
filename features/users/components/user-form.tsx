"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  ArrowLeft,
  Save,
  ShieldCheck,
  User,
  Mail,
  Lock,
  Package,
  Tags,
  FolderTree,
  UserCheck,
  Briefcase,
  Truck,
  ShoppingCart,
  ShoppingBag,
  Eye,
  EyeOff,
  Plus,
  Pencil,
  Trash2,
  CheckCheck,
  X,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormFieldError } from "@/components/common/form-field-error";
import {
  permissionDomainGroups,
  availablePermissions,
  userCreateSchema,
  type UserCreateFormData,
} from "../schemas/user.schema";
import { useCreateUser, useUpdateUser } from "../hooks/use-users";
import { parseApiError, applyApiValidationErrors } from "@/lib/api/errors";
import type { UserResource, PermissionAction } from "../types";

interface UserFormProps {
  initialData?: UserResource;
}

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  users: User,
  products: Package,
  brands: Tags,
  categories: FolderTree,
  clients: UserCheck,
  sellers: Briefcase,
  suppliers: Truck,
  "sales-orders": ShoppingCart,
  "purchase-orders": ShoppingBag,
};

const ACTION_CONFIG: Record<
  PermissionAction,
  {
    icon: React.ElementType;
    badgeStyle: string;
    borderActive: string;
    label: string;
  }
> = {
  read: {
    icon: Eye,
    badgeStyle: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    borderActive: "border-sky-500/50 bg-sky-500/5",
    label: "Ler (Read)",
  },
  create: {
    icon: Plus,
    badgeStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    borderActive: "border-emerald-500/50 bg-emerald-500/5",
    label: "Criar (Create)",
  },
  update: {
    icon: Pencil,
    badgeStyle: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    borderActive: "border-amber-500/50 bg-amber-500/5",
    label: "Editar (Update)",
  },
  delete: {
    icon: Trash2,
    badgeStyle: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    borderActive: "border-rose-500/50 bg-rose-500/5",
    label: "Deletar (Delete)",
  },
};

/** Extrai a mensagem de erro de permissões retornada pela API (`permission` ou `permissions`). */
function extractPermissionsError(fields: Record<string, string[]>): string | null {
  for (const key of ["permission", "permissions"]) {
    if (fields[key]?.length) return fields[key][0];
  }
  const nested = Object.entries(fields).find(([key]) => key.startsWith("permissions."));
  return nested?.[1]?.[0] ?? null;
}

export function UserForm({ initialData }: UserFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  // Permissões iniciais do usuário (exclui permissões de controle de usuário que não são atribuíveis a operadores)
  const availablePermissionNames = new Set(availablePermissions.map((p) => p.name));
  const initialPermissionNames = (initialData?.permissions?.map((p) => p.name) || []).filter(
    (name) => availablePermissionNames.has(name)
  );
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    initialPermissionNames
  );
  const [showPassword, setShowPassword] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);

  // Administradores têm acesso total e suas permissões não podem ser modificadas
  const isAdminTarget = Boolean(initialData?.is_administrator);

  const createForm = useForm<UserCreateFormData>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      permissions: [],
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const togglePermission = (permName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permName)
        ? prev.filter((p) => p !== permName)
        : [...prev, permName]
    );
  };

  const toggleDomainPermissions = (domainId: string) => {
    const group = permissionDomainGroups.find((g) => g.id === domainId);
    if (!group) return;

    const domainPerms = [
      group.permissions.read.name,
      group.permissions.create.name,
      group.permissions.update.name,
      group.permissions.delete.name,
    ];

    const allSelected = domainPerms.every((p) => selectedPermissions.includes(p));

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => !domainPerms.includes(p))
      );
    } else {
      setSelectedPermissions((prev) =>
        Array.from(new Set([...prev, ...domainPerms]))
      );
    }
  };

  const selectAll = () => {
    setSelectedPermissions(availablePermissions.map((p) => p.name));
  };

  const deselectAll = () => {
    setSelectedPermissions([]);
  };

  const selectOnlyRead = () => {
    const readPerms = permissionDomainGroups.map((g) => g.permissions.read.name);
    setSelectedPermissions(readPerms);
  };

  const handleCreateSubmit = async (formData: UserCreateFormData) => {
    setPermissionsError(null);
    try {
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        permissions: selectedPermissions,
      });

      router.push("/users");
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.isValidationError) {
        applyApiValidationErrors(parsed, createForm.setError);
        setPermissionsError(extractPermissionsError(parsed.fields));
      }
    }
  };

  const handleUpdateSubmit = async () => {
    if (!initialData) return;
    if (isAdminTarget) return;
    setPermissionsError(null);
    try {
      await updateMutation.mutateAsync({
        id: initialData.id,
        data: {
          permissions: selectedPermissions,
        },
      });

      router.push("/users");
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.isValidationError) {
        // O backend retorna a chave `permission` (singular), que não é um campo visível do formulário
        setPermissionsError(
          extractPermissionsError(parsed.fields) || parsed.message || "Não foi possível salvar as permissões."
        );
      }
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {isEditing && initialData ? (
        /* Modo Edição de Permissões */
        <div className="space-y-6">
          <Card className="border border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Dados do Operador
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
              <div>
                <div className="font-semibold text-foreground">{initialData.name}</div>
                <div className="text-xs text-muted-foreground">{initialData.email}</div>
              </div>
              <Badge variant="outline" className="w-fit text-xs">
                ID: {initialData.id.slice(0, 8)}...
              </Badge>
            </CardContent>
          </Card>

          {isAdminTarget ? (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Usuário Administrador
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Administradores possuem acesso total ao sistema e suas permissões não
                  podem ser modificadas.
                </p>
              </div>
            </div>
          ) : (
            <>
              <PermissionsErrorAlert message={permissionsError} />

              {/* Painel de Permissões por Domínio */}
              <PermissionsMatrix
                selectedPermissions={selectedPermissions}
                onTogglePermission={togglePermission}
                onToggleDomain={toggleDomainPermissions}
                onSelectAll={selectAll}
                onDeselectAll={deselectAll}
                onSelectOnlyRead={selectOnlyRead}
              />
            </>
          )}

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
            <Button asChild variant="outline" type="button" disabled={isSubmitting}>
              <Link href="/users">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar à Lista
              </Link>
            </Button>

            {!isAdminTarget && (
              <Button
                type="button"
                onClick={handleUpdateSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando Permissões...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Permissões
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Modo Criação de Novo Usuário */
        <form
          onSubmit={createForm.handleSubmit(handleCreateSubmit)}
          className="space-y-8"
          noValidate
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome Completo <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Ex.: Mariana Silva"
                  className="pl-9"
                  {...createForm.register("name")}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <FormFieldError error={createForm.formState.errors.name} />
            </div>

            {/* E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-mail de Acesso <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="operador@empresa.com.br"
                  className="pl-9"
                  {...createForm.register("email")}
                  disabled={isSubmitting}
                />
              </div>
              <FormFieldError error={createForm.formState.errors.email} />
            </div>

            {/* Senha */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha Inicial <span className="text-destructive">*</span>
              </Label>
              <div className="relative max-w-md">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mín. 8 caracteres, maiúscula, minúscula, número e símbolo"
                  className="pl-9 pr-10"
                  {...createForm.register("password")}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  title={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Deve conter ao menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.
              </p>
              <FormFieldError error={createForm.formState.errors.password} />
            </div>
          </div>

          {/* Permissões Iniciais no Cadastro */}
          <div className="pt-4 border-t border-border">
            <PermissionsErrorAlert message={permissionsError} />
            <PermissionsMatrix
              selectedPermissions={selectedPermissions}
              onTogglePermission={togglePermission}
              onToggleDomain={toggleDomainPermissions}
              onSelectAll={selectAll}
              onDeselectAll={deselectAll}
              onSelectOnlyRead={selectOnlyRead}
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
            <Button asChild variant="outline" type="button" disabled={isSubmitting}>
              <Link href="/users">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar à Lista
              </Link>
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando Usuário...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Cadastrar Usuário
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function PermissionsErrorAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
    >
      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Matriz de Permissões: organiza os 8 domínios operacionais nos 4 tipos de permissões
 * [Ler (Read), Criar (Create), Editar (Update), Deletar (Delete)]
 */
function PermissionsMatrix({
  selectedPermissions,
  onTogglePermission,
  onToggleDomain,
  onSelectAll,
  onDeselectAll,
  onSelectOnlyRead,
}: {
  selectedPermissions: string[];
  onTogglePermission: (permName: string) => void;
  onToggleDomain: (domainId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSelectOnlyRead: () => void;
}) {
  const actions: PermissionAction[] = ["read", "create", "update", "delete"];

  return (
    <div className="space-y-4">
      {/* Barra de Ações Rápidas Globais */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-border bg-muted/20">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Permissões por Domínio
            </span>
            <Badge variant="secondary" className="text-xs font-medium">
              {selectedPermissions.length} de {availablePermissions.length} ativas
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            4 tipos padronizados: Ler (Read), Criar (Create), Editar (Update), Deletar (Delete)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={onSelectAll}
          >
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            Todas
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={onSelectOnlyRead}
          >
            <BookOpen className="mr-1.5 h-3.5 w-3.5" />
            Somente Leitura (Read)
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            onClick={onDeselectAll}
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Limpar
          </Button>
        </div>
      </div>

      {/* Cards por Domínio */}
      <div className="space-y-3">
        {permissionDomainGroups.map((group) => {
          const DomainIcon = DOMAIN_ICONS[group.id] || ShieldCheck;
          const domainPerms = [
            group.permissions.read.name,
            group.permissions.create.name,
            group.permissions.update.name,
            group.permissions.delete.name,
          ];
          const selectedInDomain = domainPerms.filter((p) =>
            selectedPermissions.includes(p)
          );
          const allDomainSelected = selectedInDomain.length === 4;

          return (
            <Card
              key={group.id}
              className="border border-border/80 shadow-xs overflow-hidden"
            >
              <CardHeader className="p-3 px-4 pb-2.5 flex flex-row items-center justify-between space-y-0 bg-muted/15 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-md bg-background border border-border flex items-center justify-center shrink-0">
                    <DomainIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground uppercase tracking-wide">
                        {group.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 px-1.5 font-mono text-muted-foreground"
                      >
                        {group.id}.*
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {group.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">
                    {selectedInDomain.length}/4
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] px-2"
                    onClick={() => onToggleDomain(group.id)}
                  >
                    {allDomainSelected ? "Desmarcar Módulo" : "Marcar Módulo"}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-3 px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {actions.map((act) => {
                    const perm = group.permissions[act];
                    const isChecked = selectedPermissions.includes(perm.name);
                    const config = ACTION_CONFIG[act];
                    const ActionIcon = config.icon;

                    return (
                      <label
                        key={perm.name}
                        className={`flex items-start gap-2.5 p-2 rounded-md border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? `${config.borderActive} shadow-xs font-medium`
                            : "border-border/60 hover:border-border hover:bg-muted/10 text-muted-foreground"
                        }`}
                        title={perm.description}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onTogglePermission(perm.name)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${config.badgeStyle}`}
                            >
                              <ActionIcon className="h-2.5 w-2.5" />
                              {config.label}
                            </span>
                          </div>
                          <div
                            className={`text-[11px] leading-tight truncate ${
                              isChecked ? "text-foreground font-medium" : "text-muted-foreground"
                            }`}
                            title={perm.label}
                          >
                            {perm.label}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
