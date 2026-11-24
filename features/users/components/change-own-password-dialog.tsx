"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, Loader2, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFieldError } from "@/components/common/form-field-error";
import {
  updateOwnPasswordSchema,
  type UpdateOwnPasswordFormData,
} from "../schemas/user.schema";
import { useUpdateOwnPassword } from "../hooks/use-users";
import { applyApiValidationErrors, parseApiError } from "@/lib/api/errors";

interface ChangeOwnPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeOwnPasswordDialog({
  open,
  onOpenChange,
}: ChangeOwnPasswordDialogProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const updateOwnPasswordMutation = useUpdateOwnPassword();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UpdateOwnPasswordFormData>({
    resolver: zodResolver(updateOwnPasswordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
    onOpenChange(nextOpen);
  };

  const isSubmitting = updateOwnPasswordMutation.isPending;

  const onSubmit = async (formData: UpdateOwnPasswordFormData) => {
    try {
      await updateOwnPasswordMutation.mutateAsync({
        current_password: formData.current_password,
        password: formData.password,
      });
      handleOpenChange(false);
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.isValidationError) {
        applyApiValidationErrors(parsed, setError, {
          knownFields: ["current_password", "password"],
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Alterar Minha Senha
          </DialogTitle>
          <DialogDescription>
            Informe sua senha atual e defina uma nova senha forte. Sua sessão
            atual permanecerá ativa, mas outros dispositivos conectados serão
            desconectados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="current_password" className="text-sm font-medium">
              Senha Atual <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="current_password"
                type={showCurrent ? "text" : "password"}
                placeholder="Digite sua senha atual"
                className="pl-9 pr-10"
                {...register("current_password")}
                disabled={isSubmitting}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setShowCurrent((prev) => !prev)}
                tabIndex={-1}
                title={showCurrent ? "Ocultar senha" : "Ver senha"}
              >
                {showCurrent ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <FormFieldError error={errors.current_password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password" className="text-sm font-medium">
              Nova Senha <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="new_password"
                type={showNew ? "text" : "password"}
                placeholder="Mín. 8 caracteres, maiúscula, minúscula, número e símbolo"
                className="pl-9 pr-10"
                {...register("password")}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setShowNew((prev) => !prev)}
                tabIndex={-1}
                title={showNew ? "Ocultar senha" : "Ver senha"}
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Deve conter ao menos 8 caracteres, incluindo letras maiúsculas,
              minúsculas, números e símbolos, e ser diferente da senha atual.
            </p>
            <FormFieldError error={errors.password} />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password_confirmation"
              className="text-sm font-medium"
            >
              Confirmar Nova Senha <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password_confirmation"
                type={showConfirm ? "text" : "password"}
                placeholder="Repita a nova senha"
                className="pl-9 pr-10"
                {...register("password_confirmation")}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirm((prev) => !prev)}
                tabIndex={-1}
                title={showConfirm ? "Ocultar senha" : "Ver senha"}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <FormFieldError error={errors.password_confirmation} />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                "Atualizar Senha"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

