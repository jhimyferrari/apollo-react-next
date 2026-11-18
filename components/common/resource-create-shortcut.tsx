"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { cn } from "@/lib/utils";

interface ResourceCreateShortcutProps {
  href: string;
  label: string;
  permission?: string;
  compact?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Botão discreto com ícone "+" para atalho direto à página de criação de um recurso relacionado.
 */
export function ResourceCreateShortcut({
  href,
  label,
  permission,
  compact = false,
  disabled = false,
  className,
}: ResourceCreateShortcutProps) {
  const { can } = usePermissions();

  if (permission && !can(permission)) {
    return null;
  }

  return (
    <Button
      asChild
      type="button"
      variant="outline"
      size="icon"
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "shrink-0 text-muted-foreground hover:text-foreground",
        compact ? "h-6 w-6" : "h-9 w-9",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <Link href={href}>
        <Plus className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </Link>
    </Button>
  );
}
