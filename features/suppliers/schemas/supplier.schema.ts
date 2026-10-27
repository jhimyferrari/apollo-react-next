import { z } from "zod";
import { cleanDocument } from "@/lib/masks";

export const supplierSchema = z.object({
  document: z
    .string()
    .min(1, "Documento (CPF ou CNPJ) é obrigatório")
    .refine((val) => {
      const clean = cleanDocument(val);
      return clean.length === 11 || clean.length === 14;
    }, "Documento deve ser um CPF (11 dígitos) ou CNPJ (14 caracteres) válido"),
  legal_name: z
    .string()
    .min(1, "Razão Social / Nome Completo é obrigatório")
    .max(255, "Nome muito longo"),
  trade_name: z
    .string()
    .min(1, "Nome Fantasia / Apelido é obrigatório")
    .max(255, "Nome Fantasia muito longo"),
  state_registration: z.string().optional().nullable(),
  email: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "E-mail inválido",
    }),
  phone: z.string().optional().nullable(),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
