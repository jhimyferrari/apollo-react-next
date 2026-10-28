import { z } from "zod";
import { cleanDocument } from "@/lib/masks";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Informe um e-mail válido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(8, "A senha deve conter no mínimo 8 caracteres"),
  organization_document: z
    .string()
    .min(1, "CNPJ ou documento da empresa é obrigatório")
    .refine((val) => {
      const clean = cleanDocument(val);
      return clean.length === 11 || clean.length === 14;
    }, "Documento deve ser um CPF (11 dígitos) ou CNPJ (14 caracteres) válido"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerOrganizationSchema = z.object({
  name: z.string().min(2, "Nome da empresa deve conter pelo menos 2 caracteres"),
  document: z
    .string()
    .min(1, "Documento da empresa é obrigatório")
    .refine((val) => {
      const clean = cleanDocument(val);
      return clean.length === 11 || clean.length === 14;
    }, "Documento deve ser um CPF (11 dígitos) ou CNPJ (14 caracteres) válido"),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z
    .string()
    .min(1, "A senha é obrigatória")
    .min(8, "A senha deve conter no mínimo 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/,
      "A senha deve conter letra maiúscula, minúscula, número e caractere especial"
    ),
});

export type RegisterOrganizationFormData = z.infer<
  typeof registerOrganizationSchema
>;
