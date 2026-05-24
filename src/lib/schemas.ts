import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Inserisci un'email valida"),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, "Il nome deve essere di almeno 2 caratteri"),
    email: z.string().email("Inserisci un'email valida"),
    password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  })

export const configurationNameSchema = z.object({
  name: z.string().min(2, "Il nome deve essere di almeno 2 caratteri").max(60, "Massimo 60 caratteri"),
})

export const quoteRequestSchema = z.object({
  notes: z.string().max(500, "Massimo 500 caratteri").optional(),
})

export const quoteAdminSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "expired"]),
  discount: z.number().min(0).max(50),
  adminNotes: z.string().max(500, "Massimo 500 caratteri").optional(),
})

export const userEditSchema = z.object({
  name: z.string().min(2, "Il nome deve essere di almeno 2 caratteri"),
  email: z.string().email("Inserisci un'email valida"),
  role: z.enum(["admin", "user"]),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ConfigurationNameFormData = z.infer<typeof configurationNameSchema>
export type QuoteRequestFormData = z.infer<typeof quoteRequestSchema>
export type QuoteAdminFormData = z.infer<typeof quoteAdminSchema>
export type UserEditFormData = z.infer<typeof userEditSchema>
