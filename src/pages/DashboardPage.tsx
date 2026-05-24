import { useNavigate } from "react-router-dom"
import { Car, FileText, Plus, ArrowRight, TrendingUp, Clock } from "lucide-react"
import * as React from "react"

import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/mock-data"
import { formatPrice, formatDate } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Configuration, Quote } from "@/types"

const QUOTE_STATUS_MAP: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "outline" | "info" }> = {
  pending: { label: "In attesa", variant: "warning" },
  approved: { label: "Approvato", variant: "success" },
  rejected: { label: "Rifiutato", variant: "destructive" },
  expired: { label: "Scaduto", variant: "outline" },
}

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

  const pendingQuotes = quotes.filter((q) => q.status === "pending").length
  const approvedQuotes = quotes.filter((q) => q.status === "approved").length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Benvenuto, {user?.name?.split(" ")[0]}!</h1>
        <p className="text-muted-foreground mt-1">Gestisci le tue configurazioni e i tuoi preventivi</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Car className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{db.getConfigurationsByUser(user?.id ?? "").length}</p>
              <p className="text-sm text-muted-foreground">Configurazioni</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Clock className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingQuotes}</p>
              <p className="text-sm text-muted-foreground">Preventivi in attesa</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{approvedQuotes}</p>
              <p className="text-sm text-muted-foreground">Preventivi approvati</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate("/configurator/new")} className="gap-2">
          <Plus className="size-4" />
          Nuova configurazione
        </Button>
        <Button variant="outline" onClick={() => navigate("/configurator")} className="gap-2">
          <Car className="size-4" />
          Le mie configurazioni
        </Button>
        <Button variant="outline" onClick={() => navigate("/quotes")} className="gap-2">
          <FileText className="size-4" />
          I miei preventivi
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Configurations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Configurazioni recenti</CardTitle>
              <CardDescription>Le ultime 3 configurazioni salvate</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/configurator")} className="gap-1">
              Vedi tutte <ArrowRight className="size-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {configs.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <Car className="size-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Nessuna configurazione ancora</p>
                <Button size="sm" onClick={() => navigate("/configurator/new")}>
                  Crea la prima
                </Button>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {configs.map((config) => {
                  const model = db.getModelById(config.modelId)
                  const mot = db.getMotorizationById(config.motorizationId)
                  return (
                    <div
                      key={config.id}
                      className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
                      onClick={() => navigate(`/configurator/${config.id}`)}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{config.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {model?.brand} {model?.name} · {mot?.name}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-semibold">{formatPrice(config.totalPrice)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(config.updatedAt)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Quotes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Preventivi recenti</CardTitle>
              <CardDescription>Stato degli ultimi preventivi richiesti</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/quotes")} className="gap-1">
              Vedi tutti <ArrowRight className="size-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {quotes.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <FileText className="size-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Nessun preventivo ancora</p>
                <Button size="sm" variant="outline" onClick={() => navigate("/configurator")}>
                  Configura un'auto
                </Button>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {quotes.map((quote) => {
                  const config = db.getConfigurationById(quote.configurationId)
                  const model = config ? db.getModelById(config.modelId) : null
                  const status = QUOTE_STATUS_MAP[quote.status]
                  return (
                    <div
                      key={quote.id}
                      className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
                      onClick={() => navigate(`/quotes/${quote.id}`)}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{config?.name ?? "Config eliminata"}</p>
                        <p className="text-xs text-muted-foreground">{model?.brand} {model?.name}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <p className="text-xs font-semibold">{formatPrice(quote.finalPrice)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
