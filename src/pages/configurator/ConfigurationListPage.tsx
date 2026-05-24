import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Car, Trash2, Edit, FileText, Search } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/mock-data"
import { formatPrice, formatDate } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Configuration } from "@/types"

export function ConfigurationListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [configs, setConfigs] = React.useState<Configuration[]>([])
  const [search, setSearch] = React.useState("")
  const [toDelete, setToDelete] = React.useState<string | null>(null)

  function load() {
    if (!user) return
    setConfigs(db.getConfigurationsByUser(user.id))
  }

  React.useEffect(() => { load() }, [user])

  function handleDelete(id: string) {
    db.deleteConfiguration(id)
    setToDelete(null)
    load()
  }

  function handleRequestQuote(configId: string) {
    const config = db.getConfigurationById(configId)
    if (!config || !user) return
    const existingQuote = db.getQuotesByUser(user.id).find((q) => q.configurationId === configId && q.status === "pending")
    if (existingQuote) {
      navigate(`/quotes/${existingQuote.id}`)
      return
    }
    const quote = db.createQuote({
      configurationId: configId,
      userId: user.id,
      totalPrice: config.totalPrice,
      discount: 0,
      finalPrice: config.totalPrice,
      status: "pending",
      notes: "",
      adminNotes: "",
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    })
    navigate(`/quotes/${quote.id}`)
  }

  const filtered = configs.filter((c) => {
    const model = db.getModelById(c.modelId)
    const search_lower = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(search_lower) ||
      model?.brand.toLowerCase().includes(search_lower) ||
      model?.name.toLowerCase().includes(search_lower)
    )
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Le mie configurazioni</h1>
          <p className="text-sm text-muted-foreground">{configs.length} configurazioni salvate</p>
        </div>
        <Button onClick={() => navigate("/configurator/new")} className="gap-2">
          <Plus className="size-4" />
          Nuova configurazione
        </Button>
      </div>

      {configs.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cerca configurazione…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Car className="size-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Nessuna configurazione trovata</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? "Prova a cambiare il termine di ricerca" : "Crea la tua prima configurazione personalizzata"}
            </p>
          </div>
          {!search && (
            <Button onClick={() => navigate("/configurator/new")} className="gap-2">
              <Plus className="size-4" />
              Inizia a configurare
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((config) => {
            const model = db.getModelById(config.modelId)
            const mot = db.getMotorizationById(config.motorizationId)
            const options = db.getOptionsByIds(config.optionIds)
            const userQuotes = user ? db.getQuotesByUser(user.id) : []
            const hasActiveQuote = userQuotes.some(
              (q) => q.configurationId === config.id && ["pending", "approved"].includes(q.status)
            )

            return (
              <Card key={config.id} className="group overflow-hidden hover:shadow-md transition-shadow">
                <div
                  className="h-28 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${model?.imageColor ?? "#333"}, ${model?.imageColor ?? "#333"}88)` }}
                >
                  <svg viewBox="0 0 200 80" className="w-32 fill-white/80">
                    <path d="M160,50 L150,30 Q145,20 130,20 L70,20 Q55,20 50,30 L40,50 L30,50 Q25,50 25,55 L25,62 Q25,65 30,65 L35,65 Q35,72 42,72 Q49,72 49,65 L151,65 Q151,72 158,72 Q165,72 165,65 L170,65 Q175,65 175,62 L175,55 Q175,50 170,50 Z" />
                  </svg>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{config.name}</p>
                      <p className="text-sm text-muted-foreground">{model?.brand} {model?.name} · {mot?.name}</p>
                    </div>
                    {hasActiveQuote && <Badge variant="info" className="shrink-0">Preventivo</Badge>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {options.slice(0, 3).map((opt) => (
                      <Badge key={opt.id} variant="outline" className="text-xs">{opt.name}</Badge>
                    ))}
                    {options.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{options.length - 3}</Badge>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-bold text-primary">{formatPrice(config.totalPrice)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(config.updatedAt)}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => navigate(`/configurator/${config.id}`)}
                    >
                      <Edit className="size-3.5" />
                      Modifica
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => handleRequestQuote(config.id)}
                    >
                      <FileText className="size-3.5" />
                      Preventivo
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setToDelete(config.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elimina configurazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare questa configurazione? L'azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>Annulla</Button>
            <Button variant="destructive" onClick={() => toDelete && handleDelete(toDelete)}>
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
