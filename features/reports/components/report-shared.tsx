import React from "react";
import { AlertCircle, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import type { ReportBreakdownEntry } from "../types";

export const STATUS_LABELS: Record<string, string> = {
  draf: "Rascunho",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

export const PAYMENT_LABELS: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
};

export function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card className="py-4 gap-1">
      <CardContent className="px-5">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold tracking-tight text-foreground mt-1 tabular-nums">
          {value}
        </p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function BreakdownCard({
  title,
  entries,
  labels,
}: {
  title: string;
  entries: Record<string, ReportBreakdownEntry>;
  labels: Record<string, string>;
}) {
  const rows = Object.entries(entries);

  return (
    <Card className="py-4 gap-3">
      <CardContent className="px-5">
        <p className="text-xs font-medium text-muted-foreground mb-3">{title}</p>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados no período.</p>
        ) : (
          <ul className="space-y-2">
            {rows.map(([key, entry]) => (
              <li key={key} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {labels[key] ?? key}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {entry.count} {entry.count === 1 ? "pedido" : "pedidos"}
                  </span>
                </div>
                <span className="font-semibold tabular-nums">{entry.total_formatted}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "confirmed" ? "default" : status === "cancelled" ? "destructive" : "secondary";
  return (
    <Badge variant={variant} className="text-[10px]">
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function PaymentBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === "paid" ? "default" : "outline"} className="text-[10px]">
      {PAYMENT_LABELS[status] ?? status}
    </Badge>
  );
}

export function ReportError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center">
      <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
      <h3 className="font-semibold text-destructive">Não foi possível gerar o relatório</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        {message || "Erro de comunicação com a API."}
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  );
}

export function ReportEmpty() {
  return (
    <EmptyState
      icon={BarChart3}
      title="Nenhum dado encontrado"
      description="Não há registros para os filtros selecionados. Ajuste o período ou os filtros e tente novamente."
    />
  );
}

export function ReportStatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-24 rounded-xl border border-border bg-card animate-pulse" />
      ))}
    </div>
  );
}
