import { describe, it, expect } from "vitest"
import { loginSchema, registerSchema, configurationNameSchema, quoteAdminSchema } from "@/lib/schemas"

describe("loginSchema", () => {
  it("accetta credenziali valide", () => {
    const result = loginSchema.safeParse({ email: "mario@test.it", password: "secret123" })
    expect(result.success).toBe(true)
  })

  it("rifiuta email non valida", () => {
    const result = loginSchema.safeParse({ email: "non-una-email", password: "secret123" })
    expect(result.success).toBe(false)
  })

  it("rifiuta password troppo corta (< 6 caratteri)", () => {
    const result = loginSchema.safeParse({ email: "mario@test.it", password: "abc" })
    expect(result.success).toBe(false)
  })
})

describe("registerSchema", () => {
  it("accetta dati di registrazione validi", () => {
    const result = registerSchema.safeParse({
      name: "Mario Rossi",
      email: "mario@test.it",
      password: "pass123",
      confirmPassword: "pass123",
    })
    expect(result.success).toBe(true)
  })

  it("rifiuta se le password non coincidono", () => {
    const result = registerSchema.safeParse({
      name: "Mario Rossi",
      email: "mario@test.it",
      password: "pass123",
      confirmPassword: "diversa",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."))
      expect(paths).toContain("confirmPassword")
    }
  })

  it("rifiuta nome troppo corto (< 2 caratteri)", () => {
    const result = registerSchema.safeParse({
      name: "A",
      email: "mario@test.it",
      password: "pass123",
      confirmPassword: "pass123",
    })
    expect(result.success).toBe(false)
  })
})

describe("configurationNameSchema", () => {
  it("accetta un nome valido", () => {
    expect(configurationNameSchema.safeParse({ name: "BMW Sogno" }).success).toBe(true)
  })

  it("rifiuta nome troppo corto", () => {
    expect(configurationNameSchema.safeParse({ name: "A" }).success).toBe(false)
  })

  it("rifiuta nome troppo lungo (> 60 caratteri)", () => {
    const longName = "A".repeat(61)
    expect(configurationNameSchema.safeParse({ name: longName }).success).toBe(false)
  })
})

describe("quoteAdminSchema", () => {
  it("accetta dati admin validi", () => {
    const result = quoteAdminSchema.safeParse({ status: "approved", discount: 10, adminNotes: "Ok" })
    expect(result.success).toBe(true)
  })

  it("rifiuta sconto negativo", () => {
    const result = quoteAdminSchema.safeParse({ status: "approved", discount: -1, adminNotes: "" })
    expect(result.success).toBe(false)
  })

  it("rifiuta sconto superiore a 50", () => {
    const result = quoteAdminSchema.safeParse({ status: "approved", discount: 51, adminNotes: "" })
    expect(result.success).toBe(false)
  })

  it("rifiuta status non valido", () => {
    const result = quoteAdminSchema.safeParse({ status: "sconosciuto", discount: 5, adminNotes: "" })
    expect(result.success).toBe(false)
  })
})
