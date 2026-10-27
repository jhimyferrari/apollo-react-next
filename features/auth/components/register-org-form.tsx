"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Building2, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFieldError } from "@/components/common/form-field-error";
import {
  registerOrganizationSchema,
  type RegisterOrganizationFormData,
} from "../schemas/auth.schema";
import { authService } from "../services/auth.service";
import { maskDocument } from "@/lib/masks";
import { applyApiValidationErrors, parseApiError } from "@/lib/api/errors";

export function RegisterOrgForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegisterOrganizationFormData>({
    resolver: zodResolver(registerOrganizationSchema),
    defaultValues: {
      name: "",
      document: "",
      email: "",
      password: "",
    },
  });

  const docValue = watch("document");

  const onSubmit = async (data: RegisterOrganizationFormData) => {
    setIsLoading(true);
    try {
      const res = await authService.registerOrganization(data);
      toast.success(
        res?.message || "Organização cadastrada com sucesso! Efetue login para começar."
      );
      router.push("/login");
    } catch (err) {
      const parsed = parseApiError(err);
      const applied = applyApiValidationErrors(parsed, setError);

      if (!applied || !parsed.isValidationError) {
        toast.error(parsed.message || "Erro ao cadastrar organização.");
      } else {
        toast.error(parsed.message || "Verifique os erros apontados no formulário.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Razão Social / Nome da Empresa */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Razão Social ou Nome Fantasia
        </Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            placeholder="Minha Empresa Ltda"
            className="pl-9"
            {...register("name")}
            disabled={isLoading}
          />
        </div>
        <FormFieldError error={errors.name} />
      </div>

      {/* CNPJ / Documento */}
      <div className="space-y-2">
        <Label htmlFor="document" className="text-sm font-medium">
          Documento de pessoa física ou jurídica
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="document"
            placeholder="00.000.000/0000-00"
            className="pl-9"
            value={docValue}
            onChange={(e) => {
              const masked = maskDocument(e.target.value);
              setValue("document", masked, { shouldValidate: true });
            }}
            disabled={isLoading}
          />
        </div>
        <FormFieldError error={errors.document} />
      </div>

      {/* E-mail do Administrador */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          E-mail do Administrador
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="admin@empresa.com.br"
            className="pl-9"
            {...register("email")}
            disabled={isLoading}
          />
        </div>
        <FormFieldError error={errors.email} />
      </div>

      {/* Senha */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Senha de Acesso (Mínimo 8 caracteres)
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-9 pr-10"
            {...register("password")}
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <FormFieldError error={errors.password} />
      </div>

      <Button type="submit" className="w-full mt-2" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando Organização...
          </>
        ) : (
          "Criar Conta e Organização"
        )}
      </Button>

      <div className="pt-4 text-center text-xs text-muted-foreground">
        Já possui conta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Fazer Login
        </Link>
      </div>
    </form>
  );
}
