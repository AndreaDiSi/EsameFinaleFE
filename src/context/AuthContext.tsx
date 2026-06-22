import * as React from "react"
import { api, storeSession, clearStoredSession, getStoredToken, getStoredUser } from "@/lib/api"
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

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    // Verify token is still valid; use stored user for instant display while verifying
    const cached = getStoredUser()
    if (cached) setUser(cached)
    api.me()
      .then((fresh) => {
        setUser(fresh)
        // update stored user with fresh data
        storeSession(token, fresh)
      })
      .catch(() => {
        clearStoredSession()
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const { token, user: u } = await api.login(email, password)
    storeSession(token, u)
    setUser(u)
  }

  async function register(name: string, email: string, password: string) {
    const { token, user: u } = await api.register(name, email, password)
    storeSession(token, u)
    setUser(u)
  }

  function logout() {
    clearStoredSession()
    setUser(null)
  }

  function updateCurrentUser(updated: User) {
    const token = getStoredToken() ?? ""
    storeSession(token, updated)
    setUser(updated)
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
