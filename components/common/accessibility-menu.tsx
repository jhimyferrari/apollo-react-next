"use client";

import React from "react";
import { useTheme } from "next-themes";
import {
  Contrast,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Moon,
  Accessibility,
  Check,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useAccessibility,
  FONT_SCALE_STEPS,
  type FontScale,
} from "@/components/providers/accessibility-provider";
import { cn } from "@/lib/utils";

interface AccessibilityMenuProps {
  /** Se verdadeiro, exibe também os botões rápidos inline (A-, A+, Contraste) ao lado do menu */
  showQuickControls?: boolean;
  className?: string;
}

export function AccessibilityMenu({
  showQuickControls = true,
  className,
}: AccessibilityMenuProps) {
  const { theme, setTheme } = useTheme();
  const {
    highContrast,
    fontScale,
    canIncreaseFont,
    canDecreaseFont,
    isCustomized,
    toggleHighContrast,
    increaseFont,
    decreaseFont,
    setFontScale,
    resetFont,
    resetAll,
  } = useAccessibility();

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="region"
      aria-label="Controles de acessibilidade visual"
    >
      {/* Controles rápidos inline para ajuste imediato em 1 clique */}
      {showQuickControls && (
        <div className="hidden sm:flex items-center rounded-md border border-border bg-background/80 p-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={decreaseFont}
            disabled={!canDecreaseFont}
            title="Diminuir fonte (Alt + Shift + -)"
            aria-label="Diminuir tamanho da fonte"
            className="h-7 px-2 text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            A-
          </Button>

          <button
            type="button"
            onClick={resetFont}
            title="Restaurar tamanho original da fonte (100%)"
            aria-label={`Tamanho atual da fonte: ${fontScale}%. Clique para restaurar 100%`}
            className={cn(
              "px-1.5 text-[11px] font-mono tabular-nums rounded transition-colors h-7 flex items-center",
              fontScale !== 100
                ? "text-primary font-bold bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {fontScale}%
          </button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={increaseFont}
            disabled={!canIncreaseFont}
            title="Aumentar fonte (Alt + Shift + +)"
            aria-label="Aumentar tamanho da fonte"
            className="h-7 px-2 text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            A+
          </Button>

          <div className="h-4 w-px bg-border mx-0.5" aria-hidden="true" />

          <Button
            type="button"
            variant={highContrast ? "default" : "ghost"}
            size="sm"
            onClick={toggleHighContrast}
            title="Alternar Autocontraste / Alto Contraste (Alt + Shift + C)"
            aria-label="Alternar modo de alto contraste"
            aria-pressed={highContrast}
            className={cn(
              "h-7 px-2 text-xs gap-1.5",
              !highContrast && "text-muted-foreground hover:text-foreground"
            )}
          >
            <Contrast className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Contraste</span>
          </Button>
        </div>
      )}

      {/* Menu completo de Acessibilidade Visual */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant={isCustomized ? "default" : "outline"}
            size="sm"
            className="h-8 gap-1.5 px-2.5 relative"
            title="Opções de Acessibilidade Visual (Fonte e Autocontraste)"
            aria-label="Abrir painel de acessibilidade visual"
          >
            <Accessibility className="h-4 w-4" />
            <span className="text-xs font-medium hidden md:inline sm:hidden">
              Acessibilidade
            </span>
            {isCustomized && (
              <span
                className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-background"
                aria-hidden="true"
              />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <DropdownMenuLabel className="p-0 text-sm font-semibold flex items-center gap-2">
              <Accessibility className="h-4 w-4 text-primary" />
              Acessibilidade Visual
            </DropdownMenuLabel>
            {isCustomized && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetAll}
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                title="Restaurar padrões (Alt + Shift + 0)"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Restaurar
              </Button>
            )}
          </div>

          <DropdownMenuSeparator />

          {/* Seção 1: Autocontraste */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Contrast className="h-3.5 w-3.5 text-primary" />
                Autocontraste (Alto Contraste)
              </span>
              <Badge
                variant={highContrast ? "default" : "secondary"}
                className="text-[10px] px-1.5 py-0"
              >
                {highContrast ? "Ativado" : "Desativado"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Maximiza a nitidez de textos, bordas e indicadores visuais para baixa visão (padrão WCAG AAA).
            </p>
            <Button
              type="button"
              variant={highContrast ? "default" : "outline"}
              size="sm"
              onClick={toggleHighContrast}
              aria-pressed={highContrast}
              className="w-full justify-between text-xs h-8"
            >
              <span className="flex items-center gap-2">
                <Contrast className="h-3.5 w-3.5" />
                {highContrast
                  ? "Desativar Autocontraste"
                  : "Ativar Autocontraste"}
              </span>
              {highContrast && <Check className="h-3.5 w-3.5" />}
            </Button>
          </div>

          <DropdownMenuSeparator />

          {/* Seção 2: Tamanho da Fonte */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5 text-primary" />
                Tamanho da Fonte
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">
                {fontScale}%
              </Badge>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={decreaseFont}
                disabled={!canDecreaseFont}
                className="flex-1 h-8 text-xs font-semibold"
                aria-label="Diminuir fonte"
              >
                <ZoomOut className="mr-1.5 h-3.5 w-3.5" />
                A- Diminuir
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={increaseFont}
                disabled={!canIncreaseFont}
                className="flex-1 h-8 text-xs font-semibold"
                aria-label="Aumentar fonte"
              >
                <ZoomIn className="mr-1.5 h-3.5 w-3.5" />
                A+ Aumentar
              </Button>
            </div>

            {/* Escala direta por nível */}
            <div className="grid grid-cols-6 gap-1">
              {FONT_SCALE_STEPS.map((step: FontScale) => {
                const isSelected = fontScale === step;
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setFontScale(step)}
                    className={cn(
                      "py-1 rounded text-[11px] font-mono border transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary font-bold"
                        : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-accent"
                    )}
                    title={`Definir escala de fonte em ${step}%`}
                  >
                    {step}%
                  </button>
                );
              })}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Seção 3: Tema Luminoso (Claro / Escuro) */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-foreground block">
              Luminosidade do Tema
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                type="button"
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="h-8 text-xs gap-1.5"
              >
                <Sun className="h-3.5 w-3.5" />
                Claro
              </Button>
              <Button
                type="button"
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="h-8 text-xs gap-1.5"
              >
                <Moon className="h-3.5 w-3.5" />
                Escuro
              </Button>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Atalhos de Teclado */}
          <div className="rounded-md bg-muted/50 p-2 text-[10px] text-muted-foreground space-y-1">
            <div className="font-semibold text-foreground">
              Atalhos de Teclado:
            </div>
            <div className="flex justify-between">
              <span>Autocontraste:</span>
              <kbd className="font-mono bg-background px-1 rounded border border-border">
                Alt + Shift + C
              </kbd>
            </div>
            <div className="flex justify-between">
              <span>Aumentar / Diminuir Fonte:</span>
              <kbd className="font-mono bg-background px-1 rounded border border-border">
                Alt + Shift + +/-
              </kbd>
            </div>
            <div className="flex justify-between">
              <span>Restaurar Padrão:</span>
              <kbd className="font-mono bg-background px-1 rounded border border-border">
                Alt + Shift + 0
              </kbd>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

