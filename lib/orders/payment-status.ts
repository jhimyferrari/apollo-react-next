export type OrderLifecycleStatus = "draf" | "confirmed" | "cancelled";
export type OrderPaymentStatus = "pending" | "paid" | "refunded" | "cancelled";

export interface PaymentStatusDisplay {
  label: string;
  shortLabel: string;
  variant: "default" | "outline" | "secondary" | "destructive";
}

export const PAYMENT_STATUS_CONFIG: Record<
  OrderPaymentStatus,
  PaymentStatusDisplay
> = {
  pending: {
    label: "Pagamento Pendente",
    shortLabel: "Pendente",
    variant: "outline",
  },
  paid: {
    label: "Pago",
    shortLabel: "Pago",
    variant: "default",
  },
  refunded: {
    label: "Estornado",
    shortLabel: "Estornado",
    variant: "secondary",
  },
  cancelled: {
    label: "Cancelado",
    shortLabel: "Cancelado",
    variant: "destructive",
  },
};

export function getPaymentStatusDisplay(status: string): PaymentStatusDisplay {
  if (status in PAYMENT_STATUS_CONFIG) {
    return PAYMENT_STATUS_CONFIG[status as OrderPaymentStatus];
  }
  return {
    label: status,
    shortLabel: status,
    variant: "outline",
  };
}

export interface PaymentTransitionAction {
  targetStatus: OrderPaymentStatus;
  actionLabel: string;
  dialogTitle: string;
  dialogDescription: (orderNumber: number) => string;
  confirmLabel: string;
  variant: "default" | "destructive";
}

/**
 * Retorna a transição manual de pagamento permitida para o pedido,
 * espelhando exatamente as regras de `App\Actions\Order\UpdateOrderPaymentStatus`.
 */
export function getAvailablePaymentAction(
  orderStatus: OrderLifecycleStatus,
  paymentStatus: OrderPaymentStatus
): PaymentTransitionAction | null {
  if (orderStatus === "draf" || orderStatus === "confirmed") {
    if (paymentStatus === "pending") {
      return {
        targetStatus: "paid",
        actionLabel: "Marcar como Pago",
        dialogTitle: "Confirmar Pagamento",
        dialogDescription: (num) =>
          `Deseja marcar o pedido #${num} como pago?`,
        confirmLabel: "Confirmar Pagamento",
        variant: "default",
      };
    }

    if (paymentStatus === "paid") {
      return {
        targetStatus: "pending",
        actionLabel: "Reverter para Pendente",
        dialogTitle: "Reverter Pagamento para Pendente",
        dialogDescription: (num) =>
          `Deseja reverter o pagamento do pedido #${num} para pendente?`,
        confirmLabel: "Reverter Pagamento",
        variant: "destructive",
      };
    }

    return null;
  }

  if (orderStatus === "cancelled" && paymentStatus === "paid") {
    return {
      targetStatus: "refunded",
      actionLabel: "Estornar Pagamento",
      dialogTitle: "Confirmar Estorno de Pagamento",
      dialogDescription: (num) =>
        `Deseja registrar o estorno do pagamento do pedido cancelado #${num}?`,
      confirmLabel: "Confirmar Estorno",
      variant: "destructive",
    };
  }

  return null;
}
