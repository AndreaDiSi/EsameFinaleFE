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

export const createCarModelSchema = z.object({
  name: z.string().min(2, "Il nome deve essere di almeno 2 caratteri"),
  brand: z.string().min(2, "Il brand deve essere di almeno 2 caratteri"),
  category: z.enum(["sedan", "suv", "coupe", "hatchback", "wagon"], {
    errorMap: () => ({ message: "Seleziona una categoria valida" }),
  }),
  basePrice: z.number({ required_error: "Il prezzo base è obbligatorio" }).min(0, "Il prezzo deve essere positivo"),
  description: z.string().min(1, "La descrizione è obbligatoria"),
  imageColor: z.string().min(1, "Il colore è obbligatorio"),
})

export const createMotorizationSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  fuelType: z.enum(["petrol", "diesel", "electric", "hybrid"], {
    errorMap: () => ({ message: "Seleziona un tipo di carburante valido" }),
  }),
  power: z
    .number({ required_error: "La potenza è obbligatoria" })
    .int("Deve essere un numero intero")
    .min(1, "Minimo 1 CV")
    .max(2000, "Massimo 2000 CV"),
  torque: z
    .number({ required_error: "La coppia è obbligatoria" })
    .int("Deve essere un numero intero")
    .min(1, "Minimo 1 Nm")
    .max(2000, "Massimo 2000 Nm"),
  acceleration: z
    .number({ required_error: "L'accelerazione è obbligatoria" })
    .min(0, "Deve essere positiva")
    .max(30, "Massimo 30s"),
  consumption: z.string().min(1, "Il consumo è obbligatorio"),
  price: z.number({ required_error: "Il prezzo è obbligatorio" }).min(0, "Il prezzo deve essere positivo"),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ConfigurationNameFormData = z.infer<typeof configurationNameSchema>
export type QuoteRequestFormData = z.infer<typeof quoteRequestSchema>
export type QuoteAdminFormData = z.infer<typeof quoteAdminSchema>
export type UserEditFormData = z.infer<typeof userEditSchema>
export type CreateCarModelFormData = z.infer<typeof createCarModelSchema>
export type CreateMotorizationFormData = z.infer<typeof createMotorizationSchema>
