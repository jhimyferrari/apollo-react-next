"use client";

import React from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, LogOut, Shield } from "lucide-react";

export function UserNav() {
  const { user, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full bg-muted flex items-center justify-center border border-border"
        >
          <span className="font-semibold text-xs text-foreground uppercase">
            {user?.name ? user.name.slice(0, 2) : "AP"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">
              {user?.name || "Usuário"}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user?.email || "usuario@apollo.com.br"}
            </p>
            {user?.is_administrator && (
              <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold mt-1">
                <Shield className="h-3 w-3" />
                Administrador
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair do Apollo</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
