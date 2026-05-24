import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Car, CheckCircle, XCircle, Clock, AlertCircle, Download, Send } from "lucide-react"

import { db } from "@/lib/mock-data"
import { formatPrice, formatDate } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Quote, QuoteStatus } from "@/types"

const STATUS_CONFIG: Record<QuoteStatus, { label: string; variant: "success" | "warning" | "destructive" | "outline"; icon: React.ReactNode; description: string }> = {
  pending: { label: "In attesa di risposta", variant: "warning", icon: <Clock className="size-4" />, description: "Il tuo preventivo è in fase di revisione. Ti risponderemo al più presto." },
  approved: { label: "Preventivo approvato", variant: "success", icon: <CheckCircle className="size-4" />, description: "Il tuo preventivo è stato approvato. Contattaci per procedere con l'ordine." },
  rejected: { label: "Preventivo rifiutato", variant: "destructive", icon: <XCircle className="size-4" />, description: "Il tuo preventivo non è stato accettato. Puoi richiederne uno nuovo." },
  expired: { label: "Preventivo scaduto", variant: "outline", icon: <AlertCircle className="size-4" />, description: "Questo preventivo è scaduto. Puoi richiederne uno nuovo." },
}

export function QuoteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quote, setQuote] = React.useState<Quote | null>(null)

  React.useEffect(() => {
    if (!id) return
    setQuote(db.getQuoteById(id))
  }, [id])

  if (!quote) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <AlertCircle className="size-10 text-muted-foreground" />
        <p className="text-muted-foreground">Preventivo non trovato</p>
        <Button onClick={() => navigate("/quotes")}>Torna ai preventivi</Button>
      </div>
    )
  }

  const config = db.getConfigurationById(quote.configurationId)
  const model = config ? db.getModelById(config.modelId) : null
  const mot = config ? db.getMotorizationById(config.motorizationId) : null
  const options = config ? db.getOptionsByIds(config.optionIds) : []
  const status = STATUS_CONFIG[quote.status]

  function handleExport() {
    if (!quote) return
    const lines = [
      `PREVENTIVO #${quote.id.toUpperCase()}`,
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
    a.download = `preventivo-${quote.id}.txt`
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
          <h1 className="text-2xl font-bold">Preventivo #{quote.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">Richiesto il {formatDate(quote.createdAt)}</p>
        </div>
      </div>

      {/* Status alert */}
      <Alert variant={quote.status === "approved" ? "success" : quote.status === "rejected" ? "destructive" : "default"}>
        {status.icon}
        <AlertDescription>
          <span className="font-medium">{status.label}.</span> {status.description}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Vehicle info */}
          <Card>
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
                    className="h-28 rounded-lg flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${model?.imageColor ?? "#333"}, ${model?.imageColor ?? "#333"}88)` }}
                  >
                    <svg viewBox="0 0 200 80" className="w-32 fill-white/80">
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
                <p className="text-sm text-muted-foreground">Configurazione non più disponibile</p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {(quote.notes || quote.adminNotes) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Note</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {quote.notes && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Tue note</p>
                    <p className="text-sm">{quote.notes}</p>
                  </div>
                )}
                {quote.adminNotes && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Risposta concessionaria</p>
                    <p className="text-sm">{quote.adminNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Price summary */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Riepilogo prezzi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prezzo configurazione</span>
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
            <CardContent className="p-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
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
            <Button className="gap-2 w-full">
              <Send className="size-4" />
              Contattaci per l'ordine
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
