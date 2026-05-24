import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Car,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wrench,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import * as React from "react"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", icon: <LayoutDashboard className="size-4.5" />, label: "Dashboard" },
  { to: "/configurator", icon: <Car className="size-4.5" />, label: "Configuratore" },
  { to: "/quotes", icon: <FileText className="size-4.5" />, label: "Preventivi" },
  { to: "/admin", icon: <LayoutDashboard className="size-4.5" />, label: "Admin Dashboard", adminOnly: true },
  { to: "/admin/quotes", icon: <FileText className="size-4.5" />, label: "Gestione Preventivi", adminOnly: true },
  { to: "/admin/users", icon: <Users className="size-4.5" />, label: "Utenti", adminOnly: true },
  { to: "/admin/models", icon: <Wrench className="size-4.5" />, label: "Modelli Auto", adminOnly: true },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth()

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === "admin")

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-border", collapsed && "justify-center px-2")}>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Car className="size-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold leading-none">AutoConfig</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Configuratore</p>
          </div>
        )}
      </div>

      <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )
            }
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-2"
            )
          }
          title={collapsed ? "Impostazioni" : undefined}
        >
          <Settings className="size-4.5" />
          {!collapsed && <span>Impostazioni</span>}
        </NavLink>
      </div>

      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 flex size-6 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted transition-colors"
        aria-label={collapsed ? "Espandi sidebar" : "Riduci sidebar"}
      >
        {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
      </button>
    </aside>
  )
}
