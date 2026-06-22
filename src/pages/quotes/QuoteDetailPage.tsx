import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Car, CheckCircle, XCircle, Clock, AlertCircle, Download, Send } from "lucide-react"

import { useCatalog } from "@/context/CatalogContext"
import { api } from "@/lib/api"
import { formatPrice, formatDate } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Quote, QuoteStatus, Configuration } from "@/types"

const STATUS_CONFIG: Record<QuoteStatus, { label: string; variant: "success" | "warning" | "destructive" | "outline"; icon: React.ReactNode; description: string }> = {
  pending: { label: "In attesa di risposta", variant: "warning", icon: <Clock className="size-4" />, description: "Il tuo preventivo è in fase di revisione. Ti risponderemo al più presto." },
  approved: { label: "Preventivo approvato", variant: "success", icon: <CheckCircle className="size-4" />, description: "Il tuo preventivo è stato approvato. Contattaci per procedere con l'ordine." },
  rejected: { label: "Preventivo rifiutato", variant: "destructive", icon: <XCircle className="size-4" />, description: "Il tuo preventivo non è stato accettato. Puoi richiederne uno nuovo." },
  expired: { label: "Preventivo scaduto", variant: "outline", icon: <AlertCircle className="size-4" />, description: "Questo preventivo è scaduto. Puoi richiederne uno nuovo." },
}

export function QuoteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getModelById, getMotorizationById, getOptionsByIds } = useCatalog()
  const [quote, setQuote] = React.useState<Quote | null>(null)
  const [config, setConfig] = React.useState<Configuration | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!id) return
    api.getQuote(id)
      .then(async (q) => {
        setQuote(q)
        const c = await api.getConfiguration(q.configurationId).catch(() => null)
        setConfig(c)
      })
      .catch(() => setQuote(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Caricamento…</p>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
          <AlertCircle className="size-8 text-muted-foreground/40" />
        </div>
        <div>
          <p className="font-medium">Preventivo non trovato</p>
          <p className="text-sm text-muted-foreground mt-0.5">Il preventivo potrebbe essere stato eliminato</p>
        </div>
        <Button onClick={() => navigate("/quotes")}>Torna ai preventivi</Button>
      </div>
    )
  }

  const model = config ? getModelById(config.modelId) : null
  const mot = config ? getMotorizationById(config.motorizationId) : null
  const options = config ? getOptionsByIds(config.optionIds) : []
  const status = STATUS_CONFIG[quote.status]

  let alertVariant: "success" | "destructive" | "default"
  if (quote.status === "approved") alertVariant = "success"
  else if (quote.status === "rejected") alertVariant = "destructive"
  else alertVariant = "default"

  function handleExport() {
    if (!quote) return
    const lines = [
      `PREVENTIVO #${quote.id.slice(0, 8).toUpperCase()}`,
      `Data: ${formatDate(quote.createdAt)}`,
      `Scade: ${formatDate(quote.expiresAt)}`,
      `Stato: ${status.label}`,
      ``,
      `VEICOLO`,
      `Modello: ${model?.brand} ${model?.name}`,
      `Motorizzazione: ${mot?.name}`,
      ``,
      `OPTIONAL`,
      ...options.map((o) => `- ${o.name}: ${o.price === 0 ? "Incluso" : formatPrice(o.price)}`),
      ``,
      `PREZZI`,
      `Prezzo configurazione: ${formatPrice(quote.totalPrice)}`,
      quote.discount > 0 ? `Sconto: ${quote.discount}%` : null,
      `Prezzo finale: ${formatPrice(quote.finalPrice)}`,
      ``,
      quote.notes ? `NOTE CLIENTE: ${quote.notes}` : null,
      quote.adminNotes ? `NOTE CONCESSIONARIA: ${quote.adminNotes}` : null,
    ].filter(Boolean).join("\n")

    const blob = new Blob([lines], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `preventivo-${quote.id.slice(0, 8)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Torna indietro">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Preventivo #{quote.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">Richiesto il {formatDate(quote.createdAt)}</p>
        </div>
      </div>

      <Alert variant={alertVariant}>
        {status.icon}
        <AlertDescription>
          <span className="font-medium">{status.label}.</span> {status.description}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 flex flex-col gap-4">
          <Card className="overflow-hidden">
            {model && (
              <div
                className="h-1.5"
                style={{ background: `linear-gradient(to right, ${model.imageColor}, ${model.imageColor}55)` }}
              />
            )}
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Car className="size-4" />
                Veicolo configurato
              </CardTitle>
            </CardHeader>
            <CardContent>
              {config ? (
                <div className="flex flex-col gap-4">
                  <div
                    className="h-28 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(145deg, ${model?.imageColor ?? "#333"}dd, ${model?.imageColor ?? "#333"}77)` }}
                  >
                    <svg viewBox="0 0 200 80" className="w-32 fill-white/80 drop-shadow-sm">
                      <path d="M160,50 L150,30 Q145,20 130,20 L70,20 Q55,20 50,30 L40,50 L30,50 Q25,50 25,55 L25,62 Q25,65 30,65 L35,65 Q35,72 42,72 Q49,72 49,65 L151,65 Q151,72 158,72 Q165,72 165,65 L170,65 Q175,65 175,62 L175,55 Q175,50 170,50 Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-lg">{config.name}</p>
                    <p className="text-muted-foreground">{model?.brand} {model?.name} · {mot?.name}</p>
                  </div>
                  {options.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-2">Optional inclusi</p>
                        <div className="flex flex-wrap gap-1.5">
                          {options.map((opt) => (
                            <Badge key={opt.id} variant="outline" className="text-xs">
                              {opt.color && <span className="size-2.5 rounded-full mr-1.5 inline-block" style={{ backgroundColor: opt.color }} />}
                              {opt.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4">Configurazione non più disponibile</p>
              )}
            </CardContent>
          </Card>

          {(quote.notes || quote.adminNotes) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Note</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {quote.notes && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Tue note</p>
                    <p className="text-sm">{quote.notes}</p>
                  </div>
                )}
                {quote.adminNotes && (
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                    <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-widest mb-1.5">Risposta concessionaria</p>
                    <p className="text-sm">{quote.adminNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card className="overflow-hidden">
            <div className="h-0.5 bg-primary" />
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Riepilogo prezzi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Configurazione</span>
                  <span>{formatPrice(quote.totalPrice)}</span>
                </div>
                {quote.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Sconto {quote.discount}%</span>
                    <span>-{formatPrice(quote.totalPrice * quote.discount / 100)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Totale</span>
                  <span className="text-primary">{formatPrice(quote.finalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Stato</span>
                <Badge variant={status.variant} className="gap-1">{status.icon}{status.label}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Richiesto</span>
                <span>{formatDate(quote.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scade il</span>
                <span>{formatDate(quote.expiresAt)}</span>
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="gap-2 w-full" onClick={handleExport}>
            <Download className="size-4" />
            Esporta preventivo
          </Button>

          {quote.status === "approved" && (
            <Button className="gap-2 w-full shadow-sm shadow-primary/20">
              <Send className="size-4" />
              Contattaci per l'ordine
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
