import { describe, it, expect } from "vitest"
import { formatPrice, formatDate } from "@/lib/auth"

const itFormatter = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })

describe("formatPrice", () => {
  it("produce lo stesso output di Intl.NumberFormat it-IT EUR", () => {
    expect(formatPrice(42900)).toBe(itFormatter.format(42900))
  })

  it("include il simbolo dell'euro", () => {
    expect(formatPrice(42900)).toContain("€")
    expect(formatPrice(0)).toContain("€")
  })

  it("non include centesimi", () => {
    const result = formatPrice(1000.99)
    expect(result).not.toMatch(/[,\.]\d{2}/)
  })

  it("gestisce zero", () => {
    expect(formatPrice(0)).toBe(itFormatter.format(0))
  })
})

describe("formatDate", () => {
  it("formatta una data ISO in italiano", () => {
    const result = formatDate("2024-04-01T10:00:00Z")
    expect(result).toMatch(/aprile/)
    expect(result).toMatch(/2024/)
  })

  it("include giorno e anno", () => {
    const result = formatDate("2024-12-25T00:00:00Z")
    expect(result).toMatch(/2024/)
    expect(result).toMatch(/dicembre/)
  })
})
