import { NavLink, useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Car,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Shield,
  Package,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import * as React from "react"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
  end?: boolean
}

const USER_NAV: NavItem[] = [
  { to: "/dashboard", icon: <LayoutDashboard className="size-4.5" />, label: "Dashboard" },
  { to: "/configurator", icon: <Car className="size-4.5" />, label: "Configuratore" },
  { to: "/quotes", icon: <FileText className="size-4.5" />, label: "Preventivi" },
]

const ADMIN_NAV: NavItem[] = [
  { to: "/admin", icon: <LayoutDashboard className="size-4.5" />, label: "Dashboard", end: true },
  { to: "/admin/quotes", icon: <FileText className="size-4.5" />, label: "Preventivi" },
  { to: "/admin/users", icon: <Users className="size-4.5" />, label: "Utenti" },
  { to: "/admin/models", icon: <Wrench className="size-4.5" />, label: "Modelli Auto" },
  { to: "/admin/options", icon: <Package className="size-4.5" />, label: "Optional" },
]

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: Readonly<SidebarProps>) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isAdmin = user?.role === "admin"

  React.useEffect(() => {
    onMobileClose()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 border-l-2",
      isActive
        ? "bg-primary/10 text-primary border-primary"
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-transparent",
      collapsed && "justify-center px-2 border-l-0 border-none"
    )

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-sidebar transition-all duration-300",
        // Mobile: fixed overlay, slides in/out
        "fixed inset-y-0 left-0 z-40 w-72",
        mobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full",
        // Desktop: relative in flex layout
        "sm:relative sm:translate-x-0 sm:shadow-none",
        collapsed ? "sm:w-15" : "sm:w-60"
      )}
    >
      {/* Brand */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-border", collapsed && "justify-center px-3")}>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary shadow-md shadow-primary/40">
          <Car className="size-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] leading-none text-foreground">
              AutoConfig
            </p>
            <p className="text-[10px] text-primary mt-1 font-semibold tracking-widest uppercase">
              Pro Configurator
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50 select-none">
            Menu
          </p>
        )}
        {USER_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={navLinkClass}
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            {collapsed ? (
              <div className="my-2 border-t border-border/60 mx-1" />
            ) : (
              <p className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50 flex items-center gap-1.5 select-none">
                <Shield className="size-3" />
                Amministrazione
              </p>
            )}
            {ADMIN_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navLinkClass}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User card */}
      <div className="border-t border-border p-2">
        <button
          onClick={() => navigate("/settings")}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-accent text-left",
            collapsed && "justify-center"
          )}
        >
          <Avatar className="size-7 shrink-0">
            <AvatarFallback className="text-[11px] font-bold bg-primary/15 text-primary">
              {user ? getInitials(user.name) : "?"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium truncate leading-none">{user?.name}</p>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
              </div>
              <Settings className="size-3.5 text-muted-foreground shrink-0" />
            </>
          )}
        </button>
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[76px] hidden sm:flex size-6 items-center justify-center rounded-full border border-border bg-sidebar shadow-md hover:bg-muted transition-colors"
        aria-label={collapsed ? "Espandi sidebar" : "Riduci sidebar"}
      >
        {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
      </button>
    </aside>
  )
}
