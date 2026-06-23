import type { User, CarModel, Motorization, CarOption, Configuration, Quote } from "@/types"

const TOKEN_KEY = "autoconfig_token"
const USER_KEY = "autoconfig_user"

// ── Session helpers ──────────────────────────────────────────────────────────

export function storeSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

// ── HTTP core ────────────────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const t = getStoredToken()
  return {
    "Content-Type": "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  })
  if (res.status === 204) return undefined as T
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body?.message ?? body?.title ?? `HTTP ${res.status}`)
  return body as T
}

// ── Backend DTO shapes ───────────────────────────────────────────────────────
// (camelCase matches ASP.NET Core default serialization)

interface AuthResponse {
  token: string
  user: { id: string; email: string; name: string; role: string; createdAt: string }
}

interface CarModelApi {
  id: string
  name: string
  brand: string
  category: string
  basePrice: number
  description: string
  imageColor: string
  motorizations?: MotorizationApi[]
}

interface MotorizationApi {
  id: string
  modelId: string
  name: string
  fuelType: string
  power: number
  torque: number
  acceleration: number
  consumption: string
  price: number
}

interface CarOptionApi {
  id: string
  name: string
  description: string
  category: string
  price: number
  color?: string
  incompatibleWith: string[]
  requiredMotorizations: string[]
}

interface ConfigurationApi {
  id: string
  userId: string
  name: string
  modelId: string
  modelName: string
  modelBrand: string
  motorizationId: string
  motorizationName: string
  optionIds: string[]
  totalPrice: number
  createdAt: string
  updatedAt: string
}

interface QuoteApi {
  id: string
  configurationId: string
  userId: string
  totalPrice: number
  discount: number
  finalPrice: number
  status: string
  notes: string
  adminNotes: string
  createdAt: string
  updatedAt: string
  expiresAt: string
  configurationName?: string
}

interface UserApi {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
}

// ── Mappers (lowercase enums) ────────────────────────────────────────────────

function mapUser(u: UserApi): User {
  return { ...u, role: u.role.toLowerCase() as User["role"] }
}

function mapModel(m: CarModelApi): CarModel {
  return { ...m, category: m.category.toLowerCase() as CarModel["category"] }
}

function mapMotorization(m: MotorizationApi): Motorization {
  return { ...m, fuelType: m.fuelType.toLowerCase() as Motorization["fuelType"] }
}

function mapOption(o: CarOptionApi): CarOption {
  return { ...o, category: o.category.toLowerCase() as CarOption["category"] }
}

function mapConfiguration(c: ConfigurationApi): Configuration {
  return {
    id: c.id,
    userId: c.userId,
    name: c.name,
    modelId: c.modelId,
    motorizationId: c.motorizationId,
    optionIds: c.optionIds,
    totalPrice: c.totalPrice,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }
}

function mapQuote(q: QuoteApi): Quote {
  return { ...q, status: q.status.toLowerCase() as Quote["status"] }
}

// ── Auth endpoints ───────────────────────────────────────────────────────────

export const api = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    return { token: res.token, user: mapUser(res.user) }
  },

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
    return { token: res.token, user: mapUser(res.user) }
  },

  async me(): Promise<User> {
    const res = await request<UserApi>("/auth/me")
    return mapUser(res)
  },

  async updateProfile(name: string, email: string): Promise<User> {
    const res = await request<UserApi>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ name, email }),
    })
    return mapUser(res)
  },

  // ── Catalog (public) ─────────────────────────────────────────────────────

  async getModels(): Promise<{ models: CarModel[]; motorizations: Motorization[] }> {
    const raw = await request<CarModelApi[]>("/catalog/models")
    const models = raw.map(mapModel)
    const motorizations = raw.flatMap((m) => (m.motorizations ?? []).map(mapMotorization))
    return { models, motorizations }
  },

  async getOptions(): Promise<CarOption[]> {
    const raw = await request<CarOptionApi[]>("/catalog/options")
    return raw.map(mapOption)
  },

  // ── Configurations ───────────────────────────────────────────────────────

  async getConfigurations(): Promise<Configuration[]> {
    const raw = await request<ConfigurationApi[]>("/configurations")
    return raw.map(mapConfiguration)
  },

  async getConfiguration(id: string): Promise<Configuration> {
    const raw = await request<ConfigurationApi>(`/configurations/${id}`)
    return mapConfiguration(raw)
  },

  async createConfiguration(data: {
    name: string
    modelId: string
    motorizationId: string
    optionIds: string[]
  }): Promise<Configuration> {
    const raw = await request<ConfigurationApi>("/configurations", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return mapConfiguration(raw)
  },

  async updateConfiguration(
    id: string,
    data: { name: string; modelId: string; motorizationId: string; optionIds: string[] },
  ): Promise<Configuration> {
    const raw = await request<ConfigurationApi>(`/configurations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    return mapConfiguration(raw)
  },

  async deleteConfiguration(id: string): Promise<void> {
    await request<void>(`/configurations/${id}`, { method: "DELETE" })
  },

  // ── Quotes ───────────────────────────────────────────────────────────────

  async getQuotes(): Promise<Quote[]> {
    const raw = await request<QuoteApi[]>("/quotes")
    return raw.map(mapQuote)
  },

  async getQuote(id: string): Promise<Quote> {
    const raw = await request<QuoteApi>(`/quotes/${id}`)
    return mapQuote(raw)
  },

  async createQuote(configurationId: string, notes = ""): Promise<Quote> {
    const raw = await request<QuoteApi>("/quotes", {
      method: "POST",
      body: JSON.stringify({ configurationId, notes }),
    })
    return mapQuote(raw)
  },

  async updateQuote(
    id: string,
    data: { status: string; discount: number; adminNotes: string },
  ): Promise<Quote> {
    const raw = await request<QuoteApi>(`/quotes/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        status: data.status.charAt(0).toUpperCase() + data.status.slice(1),
        discount: data.discount,
        adminNotes: data.adminNotes,
      }),
    })
    return mapQuote(raw)
  },

  async deleteQuote(id: string): Promise<void> {
    await request<void>(`/quotes/${id}`, { method: "DELETE" })
  },

  // ── Users (admin) ────────────────────────────────────────────────────────

  async getUsers(): Promise<User[]> {
    const raw = await request<UserApi[]>("/users")
    return raw.map(mapUser)
  },

  async updateUser(
    id: string,
    data: { name: string; email: string; role: string },
  ): Promise<User> {
    const raw = await request<UserApi>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        role: data.role.charAt(0).toUpperCase() + data.role.slice(1),
      }),
    })
    return mapUser(raw)
  },

  async deleteUser(id: string): Promise<void> {
    await request<void>(`/users/${id}`, { method: "DELETE" })
  },

  // ── Admin ────────────────────────────────────────────────────────────────

  async getAdminStats(): Promise<{
    totalUsers: number
    totalConfigurations: number
    totalQuotes: number
    pendingQuotes: number
    approvedQuotes: number
    totalRevenue: number
    averageConfigurationPrice: number
  }> {
    return request("/admin/stats")
  },

  // ── Admin Catalog — Models ────────────────────────────────────────────────

  async createModel(data: { name: string; brand: string; category: string; basePrice: number; description: string; imageColor: string }): Promise<CarModel> {
    const res = await request<CarModelApi>("/catalog/models", {
      method: "POST",
      body: JSON.stringify({ ...data, category: data.category.charAt(0).toUpperCase() + data.category.slice(1) }),
    })
    return mapModel(res)
  },

  async updateModel(id: string, data: { name: string; brand: string; category: string; basePrice: number; description: string; imageColor: string }): Promise<CarModel> {
    const res = await request<CarModelApi>(`/catalog/models/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...data, category: data.category.charAt(0).toUpperCase() + data.category.slice(1) }),
    })
    return mapModel(res)
  },

  async deleteModel(id: string): Promise<void> {
    await request<void>(`/catalog/models/${id}`, { method: "DELETE" })
  },

  // ── Admin Catalog — Motorizations ─────────────────────────────────────────

  async createMotorization(modelId: string, data: { name: string; fuelType: string; power: number; torque: number; acceleration: number; consumption: string; price: number }): Promise<Motorization> {
    const res = await request<MotorizationApi>(`/catalog/models/${modelId}/motorizations`, {
      method: "POST",
      body: JSON.stringify({ ...data, fuelType: data.fuelType.charAt(0).toUpperCase() + data.fuelType.slice(1) }),
    })
    return mapMotorization(res)
  },

  async updateMotorization(modelId: string, id: string, data: { name: string; fuelType: string; power: number; torque: number; acceleration: number; consumption: string; price: number }): Promise<Motorization> {
    const res = await request<MotorizationApi>(`/catalog/models/${modelId}/motorizations/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...data, fuelType: data.fuelType.charAt(0).toUpperCase() + data.fuelType.slice(1) }),
    })
    return mapMotorization(res)
  },

  async deleteMotorization(modelId: string, id: string): Promise<void> {
    await request<void>(`/catalog/models/${modelId}/motorizations/${id}`, { method: "DELETE" })
  },

  // ── Admin Catalog — Options ───────────────────────────────────────────────

  async createOption(data: { name: string; description: string; category: string; price: number; color?: string; incompatibleWith: string[]; requiredMotorizationIds: string[] }): Promise<CarOption> {
    const res = await request<CarOptionApi>("/catalog/options", {
      method: "POST",
      body: JSON.stringify({ ...data, category: data.category.charAt(0).toUpperCase() + data.category.slice(1) }),
    })
    return mapOption(res)
  },

  async updateOption(id: string, data: { name: string; description: string; category: string; price: number; color?: string; incompatibleWith: string[]; requiredMotorizationIds: string[] }): Promise<CarOption> {
    const res = await request<CarOptionApi>(`/catalog/options/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...data, category: data.category.charAt(0).toUpperCase() + data.category.slice(1) }),
    })
    return mapOption(res)
  },

  async deleteOption(id: string): Promise<void> {
    await request<void>(`/catalog/options/${id}`, { method: "DELETE" })
  },
}
