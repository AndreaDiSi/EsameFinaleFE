import { useNavigate } from "react-router-dom"
import { Car, FileText, Plus, ArrowRight, Wrench, Settings, TrendingUp, Clock } from "lucide-react"
import * as React from "react"

import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/mock-data"
import { formatPrice, formatDate } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Configuration, Quote } from "@/types"

const QUOTE_STATUS_MAP: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "outline" | "info" }> = {
  pending: { label: "In attesa", variant: "warning" },
  approved: { label: "Approvato", variant: "success" },
  rejected: { label: "Rifiutato", variant: "destructive" },
  expired: { label: "Scaduto", variant: "outline" },
}

const SERVICES = [
  {
    to: "/configurator/new",
    category: "Strumento",
    title: "Configuratore",
    description: "Crea una nuova configurazione personalizzata",
    icon: <Car className="size-16 text-current" />,
  },
  {
    to: "/configurator",
    category: "Archivio",
    title: "Le mie config",
    description: "Visualizza e gestisci le tue configurazioni",
    icon: <Wrench className="size-16 text-current" />,
  },
  {
    to: "/quotes",
    category: "Documenti",
    title: "Preventivi",
    description: "Storico e stato dei tuoi preventivi",
    icon: <FileText className="size-16 text-current" />,
  },
  {
    to: "/settings",
    category: "Account",
    title: "Impostazioni",
    description: "Gestisci il tuo profilo e preferenze",
    icon: <Settings className="size-16 text-current" />,
  },
]

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [configs, setConfigs] = React.useState<Configuration[]>([])
  const [quotes, setQuotes] = React.useState<Quote[]>([])

  React.useEffect(() => {
    if (!user) return
    setConfigs(db.getConfigurationsByUser(user.id).slice(0, 3))
    setQuotes(db.getQuotesByUser(user.id).slice(0, 3))
  }, [user])

  const totalConfigs = db.getConfigurationsByUser(user?.id ?? "").length
  const totalQuotes = db.getQuotesByUser(user?.id ?? "").length
  const pendingQuotes = db.getQuotesByUser(user?.id ?? "").filter((q) => q.status === "pending").length
  const approvedQuotes = db.getQuotesByUser(user?.id ?? "").filter((q) => q.status === "approved").length

  return (
    <div className="flex flex-col gap-6">

      {/* ── HERO SECTION ──────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-card border border-border min-h-[260px] flex items-center">

        {/* Background speed lines (decorative SVG overlay) */}
        <svg
          viewBox="0 0 900 300"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035]"
          preserveAspectRatio="none"
          fill="none"
          stroke="white"
          strokeWidth="1"
        >
          <line x1="0" y1="300" x2="900" y2="0" />
          <line x1="100" y1="300" x2="900" y2="30" />
          <line x1="200" y1="300" x2="900" y2="70" />
          <line x1="0" y1="220" x2="750" y2="0" />
          <line x1="0" y1="160" x2="600" y2="0" />
        </svg>

        {/* Glow blob */}
        <div className="absolute top-[-60px] right-[20%] w-[340px] h-[340px] rounded-full bg-primary/8 blur-[80px] pointer-events-none" />

        {/* Car SVG watermark — right side */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.07]">
          <svg viewBox="0 0 500 200" className="w-[360px] fill-white">
            <path d="M400,125 L375,70 Q362,48 325,48 L175,48 Q138,48 125,70 L100,125 L78,125 Q63,125 63,138 L63,156 Q63,165 78,165 L92,165 Q92,182 112,182 Q132,182 132,165 L368,165 Q368,182 388,182 Q408,182 408,165 L422,165 Q437,165 437,156 L437,138 Q437,125 422,125 Z" />
            <path d="M178,110 L196,76 Q203,62 222,62 L278,62 Q297,62 304,76 L322,110 Z" opacity="0.6" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 md:p-10 flex flex-col gap-6 max-w-[520px]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary mb-3">
              Piattaforma Configurazione
            </p>
            <h1 className="text-5xl font-black leading-[0.95] tracking-tight">
              <span className="text-foreground">Car</span>
              <br />
              <span className="text-primary">Tuning</span>
            </h1>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
            Il configuratore è aggiornato quotidianamente. Difficile immaginare un'auto moderna senza equipaggiamento aggiuntivo.
          </p>

          <Button
            size="lg"
            className="gap-2 rounded-full w-fit px-6 shadow-lg shadow-primary/30 font-bold"
            onClick={() => navigate("/configurator/new")}
          >
            <Plus className="size-4" />
            Nuova configurazione
          </Button>

          {/* Stats bar */}
          <div className="flex items-center gap-6 pt-2 border-t border-border">
            <div>
              <p className="text-2xl font-black text-primary leading-none">{totalConfigs}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mt-1">
                Configurazioni
              </p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-2xl font-black text-foreground leading-none">{totalQuotes}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mt-1">
                Preventivi
              </p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-2xl font-black text-foreground leading-none">24/7</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mt-1">
                Assistenza
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICE CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SERVICES.map((service) => (
          <button
            key={service.title}
            type="button"
            className="group relative overflow-hidden rounded-xl bg-card border border-border p-5 cursor-pointer hover:border-primary/40 transition-all duration-200 text-left w-full"
            onClick={() => navigate(service.to)}
          >
            {/* Arrow button top right */}
            <div className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
              <ArrowRight className="size-4" />
            </div>

            {/* Category label */}
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
              {service.category}
            </p>

            {/* Title */}
            <p className="text-base font-black text-foreground leading-tight pr-10">
              {service.title}
            </p>

            {/* Icon watermark bottom right */}
            <div className="absolute bottom-2 right-3 opacity-[0.07] text-foreground pointer-events-none">
              {service.icon}
            </div>

            {/* Bottom line accent on hover */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full rounded-b-xl" />
          </button>
        ))}
      </div>

      {/* ── RECENT ACTIVITY ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Recent Configurations */}
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Archivio</p>
              <p className="text-sm font-bold mt-0.5">Configurazioni recenti</p>
            </div>
            <button
              onClick={() => navigate("/configurator")}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline underline-offset-4"
            >
              Vedi tutte <ArrowRight className="size-3" />
            </button>
          </div>
          <div className="p-2">
            {configs.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <div className="flex size-14 items-center justify-center rounded-xl bg-muted">
                  <Car className="size-7 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="text-sm font-bold">Nessuna configurazione</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Crea la tua prima configurazione</p>
                </div>
                <Button size="sm" className="rounded-full gap-1.5" onClick={() => navigate("/configurator/new")}>
                  <Plus className="size-3.5" /> Crea la prima
                </Button>
              </div>
            ) : (
              configs.map((config) => {
                const model = db.getModelById(config.modelId)
                const mot = db.getMotorizationById(config.motorizationId)
                return (
                  <button
                    key={config.id}
                    type="button"
                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group w-full text-left"
                    onClick={() => navigate(`/configurator/${config.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="size-9 shrink-0 rounded-lg flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${model?.imageColor ?? "#555"}, ${model?.imageColor ?? "#555"}88)` }}
                      >
                        <Car className="size-4 text-white/80" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{config.name}</p>
                        <p className="text-xs text-muted-foreground">{model?.brand} {model?.name} · {mot?.name}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-bold text-primary">{formatPrice(config.totalPrice)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(config.updatedAt)}</p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Documenti</p>
              <p className="text-sm font-bold mt-0.5">Preventivi recenti</p>
            </div>
            <button
              onClick={() => navigate("/quotes")}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline underline-offset-4"
            >
              Vedi tutti <ArrowRight className="size-3" />
            </button>
          </div>
          <div className="p-2">
            {quotes.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <div className="flex size-14 items-center justify-center rounded-xl bg-muted">
                  <FileText className="size-7 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="text-sm font-bold">Nessun preventivo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Configura un'auto per richiedere un preventivo</p>
                </div>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => navigate("/configurator")}>
                  Configura un'auto
                </Button>
              </div>
            ) : (
              quotes.map((quote) => {
                const config = db.getConfigurationById(quote.configurationId)
                const model = config ? db.getModelById(config.modelId) : null
                const status = QUOTE_STATUS_MAP[quote.status]
                return (
                  <button
                    key={quote.id}
                    type="button"
                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors w-full text-left"
                    onClick={() => navigate(`/quotes/${quote.id}`)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{config?.name ?? "Config eliminata"}</p>
                      <p className="text-xs text-muted-foreground">{model?.brand} {model?.name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <p className="text-xs font-bold">{formatPrice(quote.finalPrice)}</p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* ── QUICK STATS ROW ───────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Configurazioni", value: totalConfigs, icon: <Car className="size-5" />, color: "text-primary" },
          { label: "In attesa", value: pendingQuotes, icon: <Clock className="size-5" />, color: "text-amber-400" },
          { label: "Approvati", value: approvedQuotes, icon: <TrendingUp className="size-5" />, color: "text-emerald-400" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="rounded-xl bg-card border border-border p-4 flex items-center gap-4">
            <div className={`${color} opacity-80`}>{icon}</div>
            <div>
              <p className={`text-2xl font-black leading-none ${color}`}>{value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
