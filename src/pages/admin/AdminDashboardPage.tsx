import { useNavigate } from "react-router-dom"
import { Users, FileText, Car, TrendingUp, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react"

import { db, CAR_MODELS } from "@/lib/mock-data"
import { formatPrice } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { QuoteStatus } from "@/types"

const QUOTE_STATUS: Record<QuoteStatus, { label: string; variant: "success" | "warning" | "destructive" | "outline" }> = {
  pending: { label: "In attesa", variant: "warning" },
  approved: { label: "Approvato", variant: "success" },
  rejected: { label: "Rifiutato", variant: "destructive" },
  expired: { label: "Scaduto", variant: "outline" },
}

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const allUsers = db.getUsers()
  const allQuotes = db.getAllQuotes()
  const allConfigs = db.getAllConfigurations()

  const totalRevenue = allQuotes
    .filter((q) => q.status === "approved")
    .reduce((sum, q) => sum + q.finalPrice, 0)

  const pendingQuotes = allQuotes.filter((q) => q.status === "pending")
  const approvedQuotes = allQuotes.filter((q) => q.status === "approved")
  const rejectedQuotes = allQuotes.filter((q) => q.status === "rejected")

  const recentQuotes = [...allQuotes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Model popularity
  const modelCounts = allConfigs.reduce<Record<string, number>>((acc, c) => {
    acc[c.modelId] = (acc[c.modelId] ?? 0) + 1
    return acc
  }, {})
  const popularModels = CAR_MODELS.map((m) => ({ model: m, count: modelCounts[m.id] ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  const maxCount = Math.max(...popularModels.map((m) => m.count), 1)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Panoramica generale del sistema</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Users className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{allUsers.length}</p>
              <p className="text-xs text-muted-foreground">Utenti totali</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Car className="size-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{allConfigs.length}</p>
              <p className="text-xs text-muted-foreground">Configurazioni</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <FileText className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{allQuotes.length}</p>
              <p className="text-xs text-muted-foreground">Preventivi totali</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold">{formatPrice(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">Valore approvato</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quote status breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Stato preventivi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {[
                { label: "In attesa", count: pendingQuotes.length, icon: <Clock className="size-4 text-amber-500" />, color: "bg-amber-500" },
                { label: "Approvati", count: approvedQuotes.length, icon: <CheckCircle className="size-4 text-emerald-500" />, color: "bg-emerald-500" },
                { label: "Rifiutati", count: rejectedQuotes.length, icon: <XCircle className="size-4 text-red-500" />, color: "bg-red-500" },
              ].map(({ label, count, icon, color }) => (
                <div key={label} className="flex items-center gap-3">
                  {icon}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{label}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <Progress value={allQuotes.length ? (count / allQuotes.length) * 100 : 0} className={`h-1.5 [&>div]:${color}`} />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full gap-1" onClick={() => navigate("/admin/quotes")}>
              Gestisci preventivi <ArrowRight className="size-3" />
            </Button>
          </CardContent>
        </Card>

        {/* Popular models */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Modelli più configurati</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {popularModels.map(({ model, count }) => (
                <div key={model.id} className="flex items-center gap-3">
                  <div
                    className="size-8 shrink-0 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: model.imageColor }}
                  >
                    <Car className="size-4 text-white/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate font-medium">{model.brand} {model.name}</span>
                      <span className="text-muted-foreground ml-2">{count}</span>
                    </div>
                    <Progress value={(count / maxCount) * 100} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent quotes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Ultimi preventivi</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/quotes")} className="gap-1">
              Tutti <ArrowRight className="size-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col divide-y divide-border">
              {recentQuotes.map((quote) => {
                const user = db.getUsers().find((u) => u.id === quote.userId)
                const config = db.getConfigurationById(quote.configurationId)
                const status = QUOTE_STATUS[quote.status]
                return (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded transition-colors"
                    onClick={() => navigate(`/admin/quotes`)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{user?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{config?.name ?? "Config eliminata"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                      <Badge variant={status.variant} className="text-[10px] py-0">{status.label}</Badge>
                      <p className="text-xs font-medium">{formatPrice(quote.finalPrice)}</p>
                    </div>
                  </div>
                )
              })}
              {recentQuotes.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">Nessun preventivo</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
