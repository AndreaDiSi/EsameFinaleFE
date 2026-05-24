import * as React from "react"
import { db } from "@/lib/mock-data"
import { saveSession, clearSession, getStoredUser, generateToken } from "@/lib/auth"
import type { User } from "@/types"

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateCurrentUser: (updated: User) => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const stored = getStoredUser()
    if (stored) setUser(stored)
    setIsLoading(false)
  }, [])

  async function login(email: string, password: string) {
    const found = db.findUserByEmail(email)
    if (!found || !db.validatePassword(found.id, password)) {
      throw new Error("Credenziali non valide")
    }
    const token = generateToken(found.id)
    saveSession(found, token)
    setUser(found)
  }

  async function register(name: string, email: string, password: string) {
    const existing = db.findUserByEmail(email)
    if (existing) throw new Error("Email già registrata")
    const newUser = db.createUser({ name, email, password })
    const token = generateToken(newUser.id)
    saveSession(newUser, token)
    setUser(newUser)
  }

  function logout() {
    clearSession()
    setUser(null)
  }

  function updateCurrentUser(updated: User) {
    setUser(updated)
    saveSession(updated, generateToken(updated.id))
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
