"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  Building2,
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormFieldError } from "@/components/common/form-field-error";
import { loginSchema, type LoginFormData } from "../schemas/auth.schema";
import { useAuth } from "../hooks/use-auth";
import { maskDocument } from "@/lib/masks";
import { applyApiValidationErrors, parseApiError } from "@/lib/api/errors";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, isLoggingIn } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    control,
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

  const organizationDoc = useWatch({ control, name: "organization_document" });

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
    <>
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
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            disabled={isLoggingIn}
            className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
          >
            Esqueci minha senha
          </button>
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

    <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Recuperação de Senha
          </DialogTitle>
          <DialogDescription>
            Veja como redefinir sua senha de acordo com o seu perfil de acesso:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1 text-sm">
          <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1">
            <p className="font-medium text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary shrink-0" />
              Usuário regular
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Entre em contato com o administrador da sua organização para
              solicitar a alteração da sua senha.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1">
            <p className="font-medium text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              Administrador da organização
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Entre em contato com o suporte através do e-mail{" "}
              <a
                href="mailto:souzaferrarik@gmail.com"
                className="font-medium text-primary hover:underline"
              >
                souzaferrarik@gmail.com
              </a>
              .
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForgotPassword(false)}
          >
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
