import { z } from "zod";

export const salesOrderItemSchema = z.object({
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

export const salesOrderSchema = z.object({
  client_id: z.string().min(1, "Selecione o cliente"),
  seller_id: z.string().min(1, "Selecione o vendedor responsável"),
  items: z
    .array(salesOrderItemSchema)
    .min(1, "O pedido deve conter ao menos um item"),
});

export type SalesOrderFormData = z.infer<typeof salesOrderSchema>;
export type SalesOrderItemFormData = z.infer<typeof salesOrderItemSchema>;
