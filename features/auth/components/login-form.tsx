"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Building2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFieldError } from "@/components/common/form-field-error";
import { loginSchema, type LoginFormData } from "../schemas/auth.schema";
import { useAuth } from "../hooks/use-auth";
import { maskDocument } from "@/lib/masks";
import { applyApiValidationErrors, parseApiError } from "@/lib/api/errors";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      organization_document: "",
    },
  });

  const organizationDoc = watch("organization_document");

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.isValidationError) {
        applyApiValidationErrors(parsed, setError);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Documento da Organização (CNPJ/CPF) */}
      <div className="space-y-2">
        <Label htmlFor="organization_document" className="text-sm font-medium">
          CNPJ ou Documento da Empresa
        </Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="organization_document"
            type="text"
            placeholder="00.000.000/0000-00"
            className="pl-9"
            value={organizationDoc}
            onChange={(e) => {
              const masked = maskDocument(e.target.value);
              setValue("organization_document", masked, {
                shouldValidate: true,
              });
            }}
            disabled={isLoggingIn}
            autoComplete="organization"
          />
        </div>
        <FormFieldError error={errors.organization_document} />
      </div>

      {/* E-mail */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          E-mail de Acesso
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="seu.email@empresa.com.br"
            className="pl-9"
            {...register("email")}
            disabled={isLoggingIn}
            autoComplete="email"
          />
        </div>
        <FormFieldError error={errors.email} />
      </div>

      {/* Senha */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">
            Senha
          </Label>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-9 pr-10"
            {...register("password")}
            disabled={isLoggingIn}
            autoComplete="current-password"
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
        <FormFieldError error={errors.password} />
      </div>

      {/* Botão de Envio */}
      <Button
        type="submit"
        className="w-full mt-2 font-medium"
        disabled={isLoggingIn}
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Autenticando...
          </>
        ) : (
          "Acessar o Apollo System"
        )}
      </Button>

      <div className="pt-4 text-center text-xs text-muted-foreground">
        Ainda não tem sua organização cadastrada?{" "}
        <Link
          href="/register-organization"
          className="font-medium text-primary hover:underline"
        >
          Cadastre sua empresa
        </Link>
      </div>
    </form>
  );
}
