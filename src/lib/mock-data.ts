import type { CarModel, Motorization, CarOption, User, Configuration, Quote } from "@/types"

export const CAR_MODELS: CarModel[] = [
  {
    id: "m1",
    name: "Serie 3",
    brand: "BMW",
    category: "sedan",
    basePrice: 42900,
    description: "La berlina sportiva per eccellenza, con un equilibrio perfetto tra prestazioni e comfort.",
    imageColor: "#1a1a2e",
  },
  {
    id: "m2",
    name: "Q5",
    brand: "Audi",
    category: "suv",
    basePrice: 56900,
    description: "SUV premium con tecnologia all'avanguardia e design raffinato.",
    imageColor: "#16213e",
  },
  {
    id: "m3",
    name: "Classe C",
    brand: "Mercedes",
    category: "sedan",
    basePrice: 46500,
    description: "Eleganza senza compromessi con il massimo del lusso tedesco.",
    imageColor: "#0f3460",
  },
  {
    id: "m4",
    name: "Golf",
    brand: "Volkswagen",
    category: "hatchback",
    basePrice: 28900,
    description: "L'icona del segmento compatto, affidabile e versatile.",
    imageColor: "#533483",
  },
  {
    id: "m5",
    name: "Cayenne",
    brand: "Porsche",
    category: "suv",
    basePrice: 89900,
    description: "Il SUV sportivo definitivo, prestazioni da supercar con la praticità di un SUV.",
    imageColor: "#e94560",
  },
]

export const MOTORIZATIONS: Motorization[] = [
  // BMW Serie 3
  { id: "mo1", modelId: "m1", name: "318i", fuelType: "petrol", power: 156, torque: 250, acceleration: 8.4, consumption: "6.1 L/100km", price: 0 },
  { id: "mo2", modelId: "m1", name: "320d", fuelType: "diesel", power: 190, torque: 400, acceleration: 7.1, consumption: "4.5 L/100km", price: 2500 },
  { id: "mo3", modelId: "m1", name: "330i", fuelType: "petrol", power: 258, torque: 400, acceleration: 5.8, consumption: "6.9 L/100km", price: 6800 },
  { id: "mo4", modelId: "m1", name: "330e", fuelType: "hybrid", power: 292, torque: 420, acceleration: 5.9, consumption: "1.8 L/100km", price: 9200 },
  // Audi Q5
  { id: "mo5", modelId: "m2", name: "35 TDI", fuelType: "diesel", power: 163, torque: 370, acceleration: 9, consumption: "5.2 L/100km", price: 0 },
  { id: "mo6", modelId: "m2", name: "40 TDI", fuelType: "diesel", power: 204, torque: 400, acceleration: 7.5, consumption: "5.8 L/100km", price: 3200 },
  { id: "mo7", modelId: "m2", name: "45 TFSI", fuelType: "petrol", power: 265, torque: 370, acceleration: 5.9, consumption: "7.3 L/100km", price: 5900 },
  { id: "mo8", modelId: "m2", name: "55 TFSI e", fuelType: "hybrid", power: 367, torque: 500, acceleration: 5.3, consumption: "2.2 L/100km", price: 12500 },
  // Mercedes Classe C
  { id: "mo9", modelId: "m3", name: "C 180", fuelType: "petrol", power: 170, torque: 270, acceleration: 8.0, consumption: "6.4 L/100km", price: 0 },
  { id: "mo10", modelId: "m3", name: "C 220 d", fuelType: "diesel", power: 200, torque: 440, acceleration: 7.1, consumption: "4.7 L/100km", price: 2800 },
  { id: "mo11", modelId: "m3", name: "C 300", fuelType: "petrol", power: 258, torque: 400, acceleration: 6.0, consumption: "7.0 L/100km", price: 7100 },
  { id: "mo12", modelId: "m3", name: "C 300 e", fuelType: "hybrid", power: 313, torque: 550, acceleration: 5.7, consumption: "1.5 L/100km", price: 10800 },
  // VW Golf
  { id: "mo13", modelId: "m4", name: "1.0 eTSI", fuelType: "petrol", power: 110, torque: 200, acceleration: 10.5, consumption: "5.4 L/100km", price: 0 },
  { id: "mo14", modelId: "m4", name: "1.5 eTSI", fuelType: "petrol", power: 150, torque: 250, acceleration: 8.5, consumption: "5.9 L/100km", price: 1800 },
  { id: "mo15", modelId: "m4", name: "2.0 TDI", fuelType: "diesel", power: 150, torque: 360, acceleration: 8.6, consumption: "4.3 L/100km", price: 2200 },
  { id: "mo16", modelId: "m4", name: "GTE", fuelType: "hybrid", power: 245, torque: 400, acceleration: 6.7, consumption: "1.4 L/100km", price: 8500 },
  // Porsche Cayenne
  { id: "mo17", modelId: "m5", name: "V6 3.0T", fuelType: "petrol", power: 340, torque: 450, acceleration: 6.2, consumption: "9.4 L/100km", price: 0 },
  { id: "mo18", modelId: "m5", name: "S V8 2.9T", fuelType: "petrol", power: 440, torque: 550, acceleration: 5.0, consumption: "10.6 L/100km", price: 18500 },
  { id: "mo19", modelId: "m5", name: "E-Hybrid", fuelType: "hybrid", power: 470, torque: 700, acceleration: 4.7, consumption: "3.2 L/100km", price: 22000 },
  { id: "mo20", modelId: "m5", name: "Turbo V8", fuelType: "petrol", power: 650, torque: 800, acceleration: 3.7, consumption: "12.4 L/100km", price: 56000 },
]

export const CAR_OPTIONS: CarOption[] = [
  // Colors
  { id: "opt1", name: "Bianco Alpine", description: "Bianco metallizzato brillante", category: "color", price: 0, color: "#F5F5F5", incompatibleWith: ["opt2", "opt3", "opt4", "opt5"] },
  { id: "opt2", name: "Nero Zaffiro", description: "Nero metallizzato profondo", category: "color", price: 1200, color: "#1a1a1a", incompatibleWith: ["opt1", "opt3", "opt4", "opt5"] },
  { id: "opt3", name: "Blu Portimao", description: "Blu metallizzato intenso", category: "color", price: 1200, color: "#1E3A5F", incompatibleWith: ["opt1", "opt2", "opt4", "opt5"] },
  { id: "opt4", name: "Rosso Aventurin", description: "Rosso metallizzato vibrante", category: "color", price: 1500, color: "#8B1A1A", incompatibleWith: ["opt1", "opt2", "opt3", "opt5"] },
  { id: "opt5", name: "Grigio Mineral", description: "Grigio opaco effetto pietra", category: "color", price: 1800, color: "#708090", incompatibleWith: ["opt1", "opt2", "opt3", "opt4"] },
  // Interior
  { id: "opt6", name: "Interni Standard Nero", description: "Interni in tessuto nero con cuciture a contrasto", category: "interior", price: 0, incompatibleWith: ["opt7", "opt8"] },
  { id: "opt7", name: "Interni Dakota Beige", description: "Sedili in pelle Dakota color beige", category: "interior", price: 2800, incompatibleWith: ["opt6", "opt8"] },
  { id: "opt8", name: "Interni Merino Cognac", description: "Pelle Merino pieno fiore color cognac", category: "interior", price: 5200, incompatibleWith: ["opt6", "opt7"] },
  // Technology
  { id: "opt9", name: "Sistema di Navigazione", description: "GPS integrato con aggiornamenti mappe", category: "technology", price: 1800, incompatibleWith: [] },
  { id: "opt10", name: "Pacchetto Parcheggio", description: "Sensori parcheggio anteriori e posteriori + telecamera", category: "technology", price: 900, incompatibleWith: [] },
  { id: "opt11", name: "Head-Up Display", description: "Proiezione velocità e navigazione sul parabrezza", category: "technology", price: 1200, incompatibleWith: [] },
  { id: "opt12", name: "Illuminazione Ambiente", description: "Illuminazione ambientale interna a 64 colori", category: "technology", price: 500, incompatibleWith: [] },
  { id: "opt13", name: "Harman Kardon Audio", description: "Impianto audio premium 17 altoparlanti", category: "technology", price: 2200, incompatibleWith: [] },
  // Safety
  { id: "opt14", name: "Pacchetto Driver Assist", description: "ACC, Lane Keeping, Emergency Brake", category: "safety", price: 2400, incompatibleWith: [] },
  { id: "opt15", name: "Monitoraggio Angolo Cieco", description: "Rilevamento veicoli negli angoli ciechi", category: "safety", price: 800, incompatibleWith: [] },
  { id: "opt16", name: "Night Vision", description: "Sistema visione notturna con rilevamento pedoni", category: "safety", price: 2100, incompatibleWith: [] },
  // Comfort
  { id: "opt17", name: "Sedili Riscaldati", description: "Riscaldamento anteriore e posteriore", category: "comfort", price: 600, incompatibleWith: [] },
  { id: "opt18", name: "Sedili Ventilati", description: "Ventilazione sedili anteriori", category: "comfort", price: 900, incompatibleWith: [] },
  { id: "opt19", name: "Tetto Panoramico", description: "Tetto apribile in vetro panoramico", category: "comfort", price: 1900, incompatibleWith: [] },
  { id: "opt20", name: "Keyless Entry", description: "Accesso e avviamento senza chiave", category: "comfort", price: 700, incompatibleWith: [] },
  { id: "opt21", name: "Portellone Elettrico", description: "Apertura/chiusura elettrica del bagagliaio", category: "comfort", price: 1100, incompatibleWith: [] },
]

const SEED_USERS: User[] = [
  { id: "u1", email: "admin@autoconfig.it", name: "Admin Sistema", role: "admin", createdAt: "2024-01-01T00:00:00Z" },
  { id: "u2", email: "mario@example.com", name: "Mario Rossi", role: "user", createdAt: "2024-02-15T00:00:00Z" },
  { id: "u3", email: "giulia@example.com", name: "Giulia Bianchi", role: "user", createdAt: "2024-03-10T00:00:00Z" },
]

const SEED_PASSWORDS: Record<string, string> = {
  u1: "admin123",
  u2: "mario123",
  u3: "giulia123",
}

const SEED_CONFIGURATIONS: Configuration[] = [
  {
    id: "c1", userId: "u2", name: "BMW Sogno", modelId: "m1", motorizationId: "mo3",
    optionIds: ["opt2", "opt8", "opt9", "opt11", "opt14", "opt17", "opt19"],
    totalPrice: 42900 + 6800 + 1200 + 5200 + 1800 + 1200 + 2400 + 600 + 1900,
    createdAt: "2024-04-01T10:00:00Z", updatedAt: "2024-04-01T10:00:00Z",
  },
  {
    id: "c2", userId: "u2", name: "Golf Pratica", modelId: "m4", motorizationId: "mo15",
    optionIds: ["opt1", "opt6", "opt9", "opt10", "opt17"],
    totalPrice: 28900 + 2200 + 0 + 0 + 1800 + 900 + 600,
    createdAt: "2024-04-15T14:30:00Z", updatedAt: "2024-04-15T14:30:00Z",
  },
]

const SEED_QUOTES: Quote[] = [
  {
    id: "q1", configurationId: "c1", userId: "u2",
    totalPrice: 63800, discount: 5, finalPrice: 60610,
    status: "approved", notes: "Possibile consegna entro giugno?", adminNotes: "Approvato con sconto fedeltà del 5%",
    createdAt: "2024-04-02T09:00:00Z", updatedAt: "2024-04-05T11:00:00Z",
    expiresAt: "2024-07-02T09:00:00Z",
  },
  {
    id: "q2", configurationId: "c2", userId: "u2",
    totalPrice: 34400, discount: 0, finalPrice: 34400,
    status: "pending", notes: "", adminNotes: "",
    createdAt: "2024-04-16T08:00:00Z", updatedAt: "2024-04-16T08:00:00Z",
    expiresAt: "2024-07-16T08:00:00Z",
  },
]

function seed() {
  if (!localStorage.getItem("autoconfig_seeded")) {
    localStorage.setItem("autoconfig_users", JSON.stringify(SEED_USERS))
    localStorage.setItem("autoconfig_passwords", JSON.stringify(SEED_PASSWORDS))
    localStorage.setItem("autoconfig_configurations", JSON.stringify(SEED_CONFIGURATIONS))
    localStorage.setItem("autoconfig_quotes", JSON.stringify(SEED_QUOTES))
    localStorage.setItem("autoconfig_seeded", "true")
  }
}

seed()

function getUsers(): User[] {
  return JSON.parse(localStorage.getItem("autoconfig_users") || "[]")
}

function saveUsers(users: User[]) {
  localStorage.setItem("autoconfig_users", JSON.stringify(users))
}

function getPasswords(): Record<string, string> {
  return JSON.parse(localStorage.getItem("autoconfig_passwords") || "{}")
}

function savePasswords(pw: Record<string, string>) {
  localStorage.setItem("autoconfig_passwords", JSON.stringify(pw))
}

function getConfigurations(): Configuration[] {
  return JSON.parse(localStorage.getItem("autoconfig_configurations") || "[]")
}

function saveConfigurations(configs: Configuration[]) {
  localStorage.setItem("autoconfig_configurations", JSON.stringify(configs))
}

function getQuotes(): Quote[] {
  return JSON.parse(localStorage.getItem("autoconfig_quotes") || "[]")
}

function saveQuotes(quotes: Quote[]) {
  localStorage.setItem("autoconfig_quotes", JSON.stringify(quotes))
}

function generateId(): string {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

export const db = {
  // Auth
  findUserByEmail(email: string): User | null {
    return getUsers().find((u) => u.email === email) ?? null
  },
  validatePassword(userId: string, password: string): boolean {
    return getPasswords()[userId] === password
  },
  createUser(data: { name: string; email: string; password: string }): User {
    const users = getUsers()
    const passwords = getPasswords()
    const user: User = { id: generateId(), email: data.email, name: data.name, role: "user", createdAt: new Date().toISOString() }
    users.push(user)
    passwords[user.id] = data.password
    saveUsers(users)
    savePasswords(passwords)
    return user
  },

  // Users (admin)
  getUsers,
  updateUser(id: string, data: Partial<User>): User {
    const users = getUsers()
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error("User not found")
    users[idx] = { ...users[idx], ...data }
    saveUsers(users)
    return users[idx]
  },
  deleteUser(id: string) {
    saveUsers(getUsers().filter((u) => u.id !== id))
  },

  // Configurations
  getConfigurationsByUser(userId: string): Configuration[] {
    return getConfigurations().filter((c) => c.userId === userId)
  },
  getAllConfigurations(): Configuration[] {
    return getConfigurations()
  },
  getConfigurationById(id: string): Configuration | null {
    return getConfigurations().find((c) => c.id === id) ?? null
  },
  createConfiguration(data: Omit<Configuration, "id" | "createdAt" | "updatedAt">): Configuration {
    const configs = getConfigurations()
    const config: Configuration = { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    configs.push(config)
    saveConfigurations(configs)
    return config
  },
  updateConfiguration(id: string, data: Partial<Configuration>): Configuration {
    const configs = getConfigurations()
    const idx = configs.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error("Configuration not found")
    configs[idx] = { ...configs[idx], ...data, updatedAt: new Date().toISOString() }
    saveConfigurations(configs)
    return configs[idx]
  },
  deleteConfiguration(id: string) {
    saveConfigurations(getConfigurations().filter((c) => c.id !== id))
  },

  // Quotes
  getQuotesByUser(userId: string): Quote[] {
    return getQuotes().filter((q) => q.userId === userId)
  },
  getAllQuotes(): Quote[] {
    return getQuotes()
  },
  getQuoteById(id: string): Quote | null {
    return getQuotes().find((q) => q.id === id) ?? null
  },
  createQuote(data: Omit<Quote, "id" | "createdAt" | "updatedAt">): Quote {
    const quotes = getQuotes()
    const quote: Quote = { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    quotes.push(quote)
    saveQuotes(quotes)
    return quote
  },
  updateQuote(id: string, data: Partial<Quote>): Quote {
    const quotes = getQuotes()
    const idx = quotes.findIndex((q) => q.id === id)
    if (idx === -1) throw new Error("Quote not found")
    quotes[idx] = { ...quotes[idx], ...data, updatedAt: new Date().toISOString() }
    saveQuotes(quotes)
    return quotes[idx]
  },
  deleteQuote(id: string) {
    saveQuotes(getQuotes().filter((q) => q.id !== id))
  },

  // Static data helpers
  getModelById(id: string): CarModel | null {
    return CAR_MODELS.find((m) => m.id === id) ?? null
  },
  getMotorizationById(id: string): Motorization | null {
    return MOTORIZATIONS.find((m) => m.id === id) ?? null
  },
  getMotorizationsByModel(modelId: string): Motorization[] {
    return MOTORIZATIONS.filter((m) => m.modelId === modelId)
  },
  getOptionById(id: string): CarOption | null {
    return CAR_OPTIONS.find((o) => o.id === id) ?? null
  },
  getOptionsByIds(ids: string[]): CarOption[] {
    return CAR_OPTIONS.filter((o) => ids.includes(o.id))
  },
  calculateTotalPrice(modelId: string, motorizationId: string, optionIds: string[]): number {
    const model = CAR_MODELS.find((m) => m.id === modelId)
    const mot = MOTORIZATIONS.find((m) => m.id === motorizationId)
    const opts = CAR_OPTIONS.filter((o) => optionIds.includes(o.id))
    return (model?.basePrice ?? 0) + (mot?.price ?? 0) + opts.reduce((sum, o) => sum + o.price, 0)
  },
}
