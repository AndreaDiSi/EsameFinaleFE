import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Car, Trash2, Edit, FileText, Search } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/mock-data"
import { formatPrice, formatDate } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    const s = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(s) ||
      model?.brand.toLowerCase().includes(s) ||
      model?.name.toLowerCase().includes(s)
    )
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">Archivio</p>
          <h1 className="text-3xl font-black tracking-tight">Le mie configurazioni</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{configs.length} configurazioni salvate</p>
        </div>
        <Button onClick={() => navigate("/configurator/new")} className="gap-2 rounded-full px-5 shadow-md shadow-primary/25 font-bold">
          <Plus className="size-4" />
          Nuova configurazione
        </Button>
      </div>

      {configs.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome o modello…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-muted">
            <Car className="size-10 text-muted-foreground/35" />
          </div>
          <div>
            <p className="font-semibold text-base">
              {search ? "Nessun risultato" : "Nessuna configurazione ancora"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? "Prova a cambiare il termine di ricerca" : "Crea la tua prima configurazione personalizzata"}
            </p>
          </div>
          {!search && (
            <Button onClick={() => navigate("/configurator/new")} className="gap-2 shadow-sm shadow-primary/20">
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
              <div
                key={config.id}
                className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-200 cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/configurator/${config.id}`)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/configurator/${config.id}`) }}
              >
                {/* Card hero — color band with car watermark */}
                <div
                  className="relative h-28 flex items-center justify-center overflow-hidden"
                  style={{ background: `linear-gradient(145deg, ${model?.imageColor ?? "#333"}cc, ${model?.imageColor ?? "#333"}44)` }}
                >
                  {/* Background car watermark */}
                  <svg viewBox="0 0 200 80" className="absolute right-0 bottom-0 w-36 fill-white/10">
                    <path d="M160,50 L150,30 Q145,20 130,20 L70,20 Q55,20 50,30 L40,50 L30,50 Q25,50 25,55 L25,62 Q25,65 30,65 L35,65 Q35,72 42,72 Q49,72 49,65 L151,65 Q151,72 158,72 Q165,72 165,65 L170,65 Q175,65 175,62 L175,55 Q175,50 170,50 Z" />
                  </svg>
                  {/* Centered car */}
                  <svg viewBox="0 0 200 80" className="w-28 fill-white/75 drop-shadow-md relative z-10">
                    <path d="M160,50 L150,30 Q145,20 130,20 L70,20 Q55,20 50,30 L40,50 L30,50 Q25,50 25,55 L25,62 Q25,65 30,65 L35,65 Q35,72 42,72 Q49,72 49,65 L151,65 Q151,72 158,72 Q165,72 165,65 L170,65 Q175,65 175,62 L175,55 Q175,50 170,50 Z" />
                  </svg>
                  {hasActiveQuote && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge variant="info" className="text-[10px] rounded-full">Preventivo attivo</Badge>
                    </div>
                  )}
                  {/* Edit icon — navigation handled by card wrapper */}
                  <div className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-full bg-black/30 text-white/70 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                    <Edit className="size-3.5" />
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-1">
                    {model?.brand}
                  </p>
                  <p className="font-black text-sm truncate">{config.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{model?.name} · {mot?.name}</p>

                  {options.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {options.slice(0, 2).map((opt) => (
                        <Badge key={opt.id} variant="outline" className="text-[10px] rounded-full">{opt.name}</Badge>
                      ))}
                      {options.length > 2 && (
                        <Badge variant="outline" className="text-[10px] rounded-full">+{options.length - 2}</Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <p className="font-black text-primary">{formatPrice(config.totalPrice)}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(config.updatedAt)}</p>
                  </div>
                </div>

                {/* Action footer */}
                <div
                  className="flex gap-2 px-4 pb-4"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5 rounded-full shadow-sm shadow-primary/20 font-semibold text-xs"
                    onClick={() => handleRequestQuote(config.id)}
                  >
                    <FileText className="size-3.5" />
                    Preventivo
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={() => setToDelete(config.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full" />
              </div>
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
