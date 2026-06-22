import * as React from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Eye, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/mock-data"
import { formatPrice, formatDate } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { Quote, QuoteStatus } from "@/types"

const STATUS_CONFIG: Record<QuoteStatus, { label: string; variant: "success" | "warning" | "destructive" | "outline" | "info"; icon: React.ReactNode }> = {
  pending: { label: "In attesa", variant: "warning", icon: <Clock className="size-3.5" /> },
  approved: { label: "Approvato", variant: "success", icon: <CheckCircle className="size-3.5" /> },
  rejected: { label: "Rifiutato", variant: "destructive", icon: <XCircle className="size-3.5" /> },
  expired: { label: "Scaduto", variant: "outline", icon: <AlertCircle className="size-3.5" /> },
}

function QuoteCard({ quote }: Readonly<{ quote: Quote }>) {
  const navigate = useNavigate()
  const config = db.getConfigurationById(quote.configurationId)
  const model = config ? db.getModelById(config.modelId) : null
  const mot = config ? db.getMotorizationById(config.motorizationId) : null
  const status = STATUS_CONFIG[quote.status]

  return (
    <Card
      className="hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5 overflow-hidden"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/quotes/${quote.id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/quotes/${quote.id}`) }}
    >
      {model && (
        <div
          className="h-1.5"
          style={{ background: `linear-gradient(to right, ${model.imageColor}, ${model.imageColor}77)` }}
        />
      )}
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-xl"
              style={model ? { background: `linear-gradient(135deg, ${model.imageColor}44, ${model.imageColor}22)` } : undefined}
            >
              <FileText className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{config?.name ?? "Configurazione eliminata"}</p>
              <p className="text-sm text-muted-foreground">
                {model ? `${model.brand} ${model.name}` : "—"}{mot ? ` · ${mot.name}` : ""}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Richiesto il {formatDate(quote.createdAt)}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge variant={status.variant} className="gap-1">
              {status.icon}
              {status.label}
            </Badge>
            <div className="text-right">
              {quote.discount > 0 && (
                <p className="text-xs text-muted-foreground line-through">{formatPrice(quote.totalPrice)}</p>
              )}
              <p className="font-bold text-primary">{formatPrice(quote.finalPrice)}</p>
              {quote.discount > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Sconto {quote.discount}%</p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={(e) => { e.stopPropagation(); navigate(`/quotes/${quote.id}`) }}
          >
            <Eye className="size-3.5" />
            Visualizza
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
        <FileText className="size-8 text-muted-foreground/35" />
      </div>
      <p className="text-sm text-muted-foreground">Nessun preventivo in questa categoria</p>
    </div>
  )
}

export function QuotesPage() {
  const { user } = useAuth()
  const [quotes, setQuotes] = React.useState<Quote[]>([])

  React.useEffect(() => {
    if (!user) return
    setQuotes(db.getQuotesByUser(user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }, [user])

  const pending = quotes.filter((q) => q.status === "pending")
  const approved = quotes.filter((q) => q.status === "approved")
  const rejected = quotes.filter((q) => q.status === "rejected" || q.status === "expired")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">I miei preventivi</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{quotes.length} preventivi totali</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tutti ({quotes.length})</TabsTrigger>
          <TabsTrigger value="pending">In attesa ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Approvati ({approved.length})</TabsTrigger>
          <TabsTrigger value="other">Altro ({rejected.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-5">
          {quotes.length === 0 ? <EmptyState /> : (
            <div className="flex flex-col gap-3">
              {quotes.map((q) => <QuoteCard key={q.id} quote={q} />)}
            </div>
          )}
        </TabsContent>
        <TabsContent value="pending" className="mt-5">
          {pending.length === 0 ? <EmptyState /> : (
            <div className="flex flex-col gap-3">
              {pending.map((q) => <QuoteCard key={q.id} quote={q} />)}
            </div>
          )}
        </TabsContent>
        <TabsContent value="approved" className="mt-5">
          {approved.length === 0 ? <EmptyState /> : (
            <div className="flex flex-col gap-3">
              {approved.map((q) => <QuoteCard key={q.id} quote={q} />)}
            </div>
          )}
        </TabsContent>
        <TabsContent value="other" className="mt-5">
          {rejected.length === 0 ? <EmptyState /> : (
            <div className="flex flex-col gap-3">
              {rejected.map((q) => <QuoteCard key={q.id} quote={q} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
