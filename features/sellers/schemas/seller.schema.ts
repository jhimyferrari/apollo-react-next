import { z } from "zod";
import { cleanDocument } from "@/lib/masks";

function getMaxStartedAtDateString(): string {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const year = maxDate.getFullYear();
  const month = String(maxDate.getMonth() + 1).padStart(2, "0");
  const day = String(maxDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const sellerStatuses = ["active", "inactive"] as const;

export const sellerSchema = z.object({
  status: z.enum(sellerStatuses).optional(),
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
  started_at: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val >= "1900-01-01", {
      message: "A data de início deve ser igual ou posterior a 01/01/1900",
    })
    .refine((val) => !val || val <= getMaxStartedAtDateString(), {
      message: "A data de início não pode ultrapassar 30 dias a partir de hoje",
    }),
  ended_at: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (data.started_at && data.ended_at) {
      return data.ended_at >= data.started_at;
    }
    return true;
  },
  {
    message: "A data de término deve ser igual ou posterior à data de início",
    path: ["ended_at"],
  }
);

export type SellerFormData = z.infer<typeof sellerSchema>;
