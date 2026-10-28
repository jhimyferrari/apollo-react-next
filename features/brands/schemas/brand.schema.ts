import { z } from "zod";

export const brandSchema = z.object({
  name: z
    .string()
    .min(1, "O nome da marca é obrigatório")
    .max(100, "O nome pode ter no máximo 100 caracteres"),
  description: z.string().optional().nullable(),
});

export type BrandFormData = z.infer<typeof brandSchema>;
