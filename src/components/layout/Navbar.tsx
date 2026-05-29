import { Bell, Moon, Sun, LogOut, User, Plus } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/configurator": "Le mie configurazioni",
  "/configurator/new": "Nuovo configuratore",
  "/quotes": "I miei preventivi",
  "/settings": "Impostazioni",
  "/admin": "Admin Dashboard",
  "/admin/users": "Gestione utenti",
  "/admin/quotes": "Gestione preventivi",
  "/admin/models": "Modelli auto",
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function Navbar() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const isConfigEdit = location.pathname.startsWith("/configurator/") && location.pathname !== "/configurator/new"
  const pageLabel = isConfigEdit
    ? "Modifica configurazione"
    : (ROUTE_LABELS[location.pathname] ?? "AutoConfig")

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <p className="text-sm font-bold tracking-wide text-foreground hidden sm:block uppercase">{pageLabel}</p>
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate("/configurator/new")}
          className="gap-1.5 rounded-full px-4 shadow-md shadow-primary/30 font-semibold tracking-wide"
        >
          <Plus className="size-3.5" />
          <span className="hidden sm:inline">Nuova config</span>
          <span className="sm:hidden">Nuova</span>
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <Button variant="ghost" size="icon" aria-label="Notifiche">
          <Bell className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2" aria-label="Menu utente">
              <Avatar className="size-7">
                <AvatarFallback className="text-[11px] font-semibold bg-primary/12 text-primary">
                  {user ? getInitials(user.name) : "?"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
              </div>
              {user?.role === "admin" && (
                <Badge variant="info" className="mt-1.5">Admin</Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <User className="size-4" />
              Profilo e impostazioni
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="size-4" />
              Esci
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
