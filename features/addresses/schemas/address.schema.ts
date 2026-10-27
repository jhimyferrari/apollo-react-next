import { z } from "zod";
import { onlyDigits } from "@/lib/masks";

export const addressSchema = z.object({
  street: z.string().min(1, "Logradouro / Rua é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  complement: z.string().optional().nullable(),
  cep: z
    .string()
    .min(1, "CEP é obrigatório")
    .refine((val) => {
      const digits = onlyDigits(val);
      return digits.length === 8;
    }, "O CEP deve conter 8 dígitos numéricos"),
  city_ibge_code: z.string().min(1, "Código IBGE do município é obrigatório"),
  is_default: z.boolean().optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;
