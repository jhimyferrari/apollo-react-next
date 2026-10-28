import { z } from "zod";
import { onlyDigits } from "@/lib/masks";

export const productUnits = ["un", "kg", "cx", "l", "m"] as const;

export const productSchema = z.object({
  name: z
    .string()
    .min(1, "O nome do produto é obrigatório")
    .max(45, "O nome pode ter no máximo 45 caracteres"),
  description: z.string().optional().nullable(),
  unit: z.enum(productUnits, {
    error: "Selecione uma unidade válida (un, kg, cx, l, m)",
  }),
  cost_price: z
    .string()
    .min(1, "Preço de custo é obrigatório")
    .refine((val) => {
      const clean = val.replace(",", ".");
      const num = Number(clean);
      return !isNaN(num) && num >= 0 && !val.endsWith(",");
    }, "Informe um preço de custo válido"),
  sale_price: z
    .string()
    .min(1, "Preço de venda é obrigatório")
    .refine((val) => {
      const clean = val.replace(",", ".");
      const num = Number(clean);
      return !isNaN(num) && num >= 0 && !val.endsWith(",");
    }, "Informe um preço de venda válido"),
  stock_quantity: z
    .string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val) return true;
      const clean = val.replace(",", ".");
      const num = Number(clean);
      return !isNaN(num) && num >= 0 && !val.endsWith(",");
    }, "Quantidade em estoque inválida"),
  ncm: z
    .string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val) return true;
      const digits = onlyDigits(val);
      return digits.length === 8;
    }, "O NCM deve conter exatamente 8 dígitos numéricos"),
  ean: z
    .string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val) return true;
      const digits = onlyDigits(val);
      return digits.length === 13;
    }, "O código EAN deve conter exatamente 13 dígitos numéricos"),
  brand_id: z.string().optional().nullable(),
  category_ids: z.array(z.string()).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
