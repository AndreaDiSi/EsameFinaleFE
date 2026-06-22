import type { User } from "@/types"

const TOKEN_KEY = "autoconfig_token"
const SECRET = "autoconfig-secret-key-2024"

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"])
}

function b64url(buf: ArrayBuffer): string {
  return btoa(String.fromCodePoint(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

function encodeSegment(obj: object): string {
  const bytes = new TextEncoder().encode(JSON.stringify(obj))
  let binary = ""
  bytes.forEach((b) => (binary += String.fromCodePoint(b)))
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function decodeSegment(seg: string): unknown {
  const binary = atob(seg.replace(/-/g, "+").replace(/_/g, "/"))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return JSON.parse(new TextDecoder().decode(bytes))
}

export async function createJWT(user: User): Promise<string> {
  const header = encodeSegment({ alg: "HS256", typ: "JWT" })
  const now = Math.floor(Date.now() / 1000)
  const payload = encodeSegment({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    iat: now,
    exp: now + 60 * 60 * 24 * 7,
  })
  const key = await getKey()
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${header}.${payload}`))
  return `${header}.${payload}.${b64url(sig)}`
}

export async function verifyJWT(token: string): Promise<User | null> {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const [header, payload, sig] = parts
    const key = await getKey()
    const sigBytes = Uint8Array.from(atob(sig.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(`${header}.${payload}`))
    if (!valid) return null
    const claims = decodeSegment(payload) as { sub: string; name: string; email: string; role: User["role"]; createdAt: string; exp: number }
    if (claims.exp < Math.floor(Date.now() / 1000)) return null
    return { id: claims.sub, name: claims.name, email: claims.email, role: claims.role, createdAt: claims.createdAt }
  } catch {
    return null
  }
}

export async function saveSession(user: User): Promise<void> {
  const token = await createJWT(user)
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export async function getStoredUser(): Promise<User | null> {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  return verifyJWT(token)
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(dateString))
}
