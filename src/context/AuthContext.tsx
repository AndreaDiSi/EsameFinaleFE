import * as React from "react"
import { db } from "@/lib/mock-data"
import { saveSession, clearSession, getStoredUser } from "@/lib/auth"
import type { User } from "@/types"

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateCurrentUser: (updated: User) => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    getStoredUser().then((stored) => {
      if (stored) setUser(stored)
      setIsLoading(false)
    })
  }, [])

  async function login(email: string, password: string) {
    const found = db.findUserByEmail(email)
    if (!found || !db.validatePassword(found.id, password)) {
      throw new Error("Credenziali non valide")
    }
    await saveSession(found)
    setUser(found)
  }

  async function register(name: string, email: string, password: string) {
    const existing = db.findUserByEmail(email)
    if (existing) throw new Error("Email già registrata")
    const newUser = db.createUser({ name, email, password })
    await saveSession(newUser)
    setUser(newUser)
  }

  function logout() {
    clearSession()
    setUser(null)
  }

  async function updateCurrentUser(updated: User) {
    setUser(updated)
    await saveSession(updated)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
