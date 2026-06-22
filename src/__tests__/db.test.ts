import { describe, it, expect, beforeEach } from "vitest"
import { db } from "@/lib/mock-data"

beforeEach(() => {
  localStorage.clear()
})

// ── calculateTotalPrice ────────────────────────────────────────────────────────

describe("calculateTotalPrice", () => {
  it("somma prezzo base del modello + motorizzazione + optional", () => {
    // BMW Serie 3 (m1, base 42.900) + 330i (mo3, +6.800) + Nero Zaffiro (opt2, +1.200)
    const price = db.calculateTotalPrice("m1", "mo3", ["opt2"])
    expect(price).toBe(42900 + 6800 + 1200)
  })

  it("restituisce solo il prezzo base se non ci sono optional", () => {
    // BMW Serie 3 + 318i (mo1, price 0) + nessun optional
    const price = db.calculateTotalPrice("m1", "mo1", [])
    expect(price).toBe(42900)
  })

  it("somma correttamente più optional", () => {
    // Golf (m4, 28.900) + 2.0 TDI (mo15, +2.200) + Navigazione (opt9, +1.800) + Parcheggio (opt10, +900)
    const price = db.calculateTotalPrice("m4", "mo15", ["opt9", "opt10"])
    expect(price).toBe(28900 + 2200 + 1800 + 900)
  })

  it("restituisce 0 per id inesistenti", () => {
    expect(db.calculateTotalPrice("xxx", "yyy", [])).toBe(0)
  })
})

// ── Auth ──────────────────────────────────────────────────────────────────────

describe("findUserByEmail", () => {
  it("trova un utente esistente", () => {
    localStorage.setItem("autoconfig_users", JSON.stringify([
      { id: "u1", email: "mario@test.it", name: "Mario", role: "user", createdAt: "2024-01-01T00:00:00Z" },
    ]))
    const user = db.findUserByEmail("mario@test.it")
    expect(user?.name).toBe("Mario")
  })

  it("restituisce null per email inesistente", () => {
    localStorage.setItem("autoconfig_users", JSON.stringify([]))
    expect(db.findUserByEmail("ghost@test.it")).toBeNull()
  })
})

describe("validatePassword", () => {
  it("restituisce true per password corretta", () => {
    localStorage.setItem("autoconfig_passwords", JSON.stringify({ u1: "secret123" }))
    expect(db.validatePassword("u1", "secret123")).toBe(true)
  })

  it("restituisce false per password errata", () => {
    localStorage.setItem("autoconfig_passwords", JSON.stringify({ u1: "secret123" }))
    expect(db.validatePassword("u1", "wrong")).toBe(false)
  })
})

describe("createUser", () => {
  it("crea un nuovo utente con ruolo user", () => {
    localStorage.setItem("autoconfig_users", JSON.stringify([]))
    localStorage.setItem("autoconfig_passwords", JSON.stringify({}))

    const user = db.createUser({ name: "Luca", email: "luca@test.it", password: "pass123" })

    expect(user.name).toBe("Luca")
    expect(user.email).toBe("luca@test.it")
    expect(user.role).toBe("user")
    expect(user.id).toBeTruthy()
  })

  it("persiste l'utente nel localStorage", () => {
    localStorage.setItem("autoconfig_users", JSON.stringify([]))
    localStorage.setItem("autoconfig_passwords", JSON.stringify({}))

    const user = db.createUser({ name: "Sara", email: "sara@test.it", password: "pass456" })
    const found = db.findUserByEmail("sara@test.it")

    expect(found?.id).toBe(user.id)
  })
})

// ── Configurations ────────────────────────────────────────────────────────────

describe("createConfiguration / getConfigurationsByUser", () => {
  it("crea una configurazione e la recupera per userId", () => {
    localStorage.setItem("autoconfig_configurations", JSON.stringify([]))

    const config = db.createConfiguration({
      userId: "u99",
      name: "Test Config",
      modelId: "m1",
      motorizationId: "mo1",
      optionIds: ["opt1"],
      totalPrice: 42900,
    })

    const configs = db.getConfigurationsByUser("u99")
    expect(configs).toHaveLength(1)
    expect(configs[0].name).toBe("Test Config")
    expect(configs[0].id).toBe(config.id)
  })

  it("non restituisce configurazioni di altri utenti", () => {
    localStorage.setItem("autoconfig_configurations", JSON.stringify([]))

    db.createConfiguration({
      userId: "u1",
      name: "Config U1",
      modelId: "m1",
      motorizationId: "mo1",
      optionIds: [],
      totalPrice: 42900,
    })

    expect(db.getConfigurationsByUser("u2")).toHaveLength(0)
  })
})

describe("deleteConfiguration", () => {
  it("elimina la configurazione corretta", () => {
    localStorage.setItem("autoconfig_configurations", JSON.stringify([]))

    const c1 = db.createConfiguration({ userId: "u1", name: "A", modelId: "m1", motorizationId: "mo1", optionIds: [], totalPrice: 42900 })
    db.createConfiguration({ userId: "u1", name: "B", modelId: "m2", motorizationId: "mo5", optionIds: [], totalPrice: 56900 })

    db.deleteConfiguration(c1.id)

    const remaining = db.getConfigurationsByUser("u1")
    expect(remaining).toHaveLength(1)
    expect(remaining[0].name).toBe("B")
  })
})

// ── Quotes ────────────────────────────────────────────────────────────────────

describe("createQuote / getQuotesByUser", () => {
  it("crea un preventivo e lo recupera per userId", () => {
    localStorage.setItem("autoconfig_quotes", JSON.stringify([]))

    const quote = db.createQuote({
      configurationId: "c1",
      userId: "u99",
      totalPrice: 50000,
      discount: 0,
      finalPrice: 50000,
      status: "pending",
      notes: "",
      adminNotes: "",
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    })

    const quotes = db.getQuotesByUser("u99")
    expect(quotes).toHaveLength(1)
    expect(quotes[0].id).toBe(quote.id)
    expect(quotes[0].status).toBe("pending")
  })
})

describe("updateQuote", () => {
  it("aggiorna lo stato e lo sconto del preventivo", () => {
    localStorage.setItem("autoconfig_quotes", JSON.stringify([]))

    const quote = db.createQuote({
      configurationId: "c1",
      userId: "u1",
      totalPrice: 60000,
      discount: 0,
      finalPrice: 60000,
      status: "pending",
      notes: "",
      adminNotes: "",
      expiresAt: new Date().toISOString(),
    })

    const updated = db.updateQuote(quote.id, { status: "approved", discount: 10, finalPrice: 54000, adminNotes: "Sconto applicato" })

    expect(updated.status).toBe("approved")
    expect(updated.discount).toBe(10)
    expect(updated.finalPrice).toBe(54000)
    expect(updated.adminNotes).toBe("Sconto applicato")
  })

  it("lancia errore per id inesistente", () => {
    localStorage.setItem("autoconfig_quotes", JSON.stringify([]))
    expect(() => db.updateQuote("nope", { status: "approved" })).toThrow("Quote not found")
  })
})
