import { z } from "zod";

export const purchaseOrderItemSchema = z.object({
  product_id: z.string().min(1, "Selecione um produto"),
  quantity: z
    .string()
    .min(1, "Informe a quantidade")
    .refine((val) => {
      const num = Number(val.replace(",", "."));
      return !isNaN(num) && num > 0;
    }, "Quantidade deve ser maior que zero"),
  unit_price: z.string().optional(),
});

export const purchaseOrderSchema = z.object({
  supplier_id: z.string().min(1, "Selecione o fornecedor"),
  items: z
    .array(purchaseOrderItemSchema)
    .min(1, "O pedido de compra deve conter ao menos um item"),
});

export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;
export type PurchaseOrderItemFormData = z.infer<typeof purchaseOrderItemSchema>;
