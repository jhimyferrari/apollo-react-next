import { z } from "zod";

export const brandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome da marca é obrigatório")
    .max(45, "O nome pode ter no máximo 45 caracteres"),
  description: z.string().optional().nullable(),
});

export type BrandFormData = z.infer<typeof brandSchema>;
