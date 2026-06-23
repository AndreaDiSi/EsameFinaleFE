import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Edit, Trash2, Fuel, Zap, Leaf, Gauge, ChevronDown, ChevronUp } from "lucide-react"

import { api } from "@/lib/api"
import { formatPrice } from "@/lib/auth"
import {
  createCarModelSchema, createMotorizationSchema,
  type CreateCarModelFormData, type CreateMotorizationFormData,
} from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CarModel, Motorization } from "@/types"

const FUEL_ICONS: Record<string, React.ReactNode> = {
  petrol: <Fuel className="size-3.5 text-amber-500" />,
  diesel: <Zap className="size-3.5 text-blue-500" />,
  electric: <Zap className="size-3.5 text-emerald-500" />,
  hybrid: <Leaf className="size-3.5 text-emerald-500" />,
}

const FUEL_LABELS: Record<string, string> = {
  petrol: "Benzina",
  diesel: "Diesel",
  electric: "Elettrico",
  hybrid: "Ibrido",
}

export function AdminModelsPage() {
  const [models, setModels] = React.useState<CarModel[]>([])
  const [motorizations, setMotorizations] = React.useState<Motorization[]>([])
  const [expandedModel, setExpandedModel] = React.useState<string | null>(null)

  const [modelOpen, setModelOpen] = React.useState(false)
  const [editingModel, setEditingModel] = React.useState<CarModel | null>(null)

  const [motOpen, setMotOpen] = React.useState(false)
  const [motModelId, setMotModelId] = React.useState<string | null>(null)
  const [editingMot, setEditingMot] = React.useState<Motorization | null>(null)

  const [deleteModel, setDeleteModel] = React.useState<CarModel | null>(null)
  const [deleteMot, setDeleteMot] = React.useState<Motorization | null>(null)

  async function load() {
    const { models: m, motorizations: mots } = await api.getModels()
    setModels(m)
    setMotorizations(mots)
  }

  React.useEffect(() => { load() }, [])

  const {
    register: regModel,
    handleSubmit: handleModel,
    setValue: setModelVal,
    watch: watchModel,
    formState: { errors: modelErrors, isSubmitting: modelSubmitting },
    reset: resetModel,
  } = useForm<CreateCarModelFormData>({ resolver: zodResolver(createCarModelSchema) })

  const {
    register: regMot,
    handleSubmit: handleMot,
    setValue: setMotVal,
    watch: watchMot,
    formState: { errors: motErrors, isSubmitting: motSubmitting },
    reset: resetMot,
  } = useForm<CreateMotorizationFormData>({ resolver: zodResolver(createMotorizationSchema) })

  function openModelDialog(model?: CarModel) {
    resetModel(model
      ? { name: model.name, brand: model.brand, category: model.category, basePrice: model.basePrice, description: model.description, imageColor: model.imageColor }
      : { name: "", brand: "", category: "sedan", basePrice: 0, description: "", imageColor: "#3b82f6" }
    )
    setEditingModel(model ?? null)
    setModelOpen(true)
  }

  function openMotDialog(modelId: string, mot?: Motorization) {
    setMotModelId(modelId)
    resetMot(mot
      ? { name: mot.name, fuelType: mot.fuelType, power: mot.power, torque: mot.torque, acceleration: mot.acceleration, consumption: mot.consumption, price: mot.price }
      : { name: "", fuelType: "petrol", power: 0, torque: 0, acceleration: 0, consumption: "", price: 0 }
    )
    setEditingMot(mot ?? null)
    setMotOpen(true)
  }

  async function onSubmitModel(data: CreateCarModelFormData) {
    if (editingModel) {
      await api.updateModel(editingModel.id, data)
    } else {
      await api.createModel(data)
    }
    setModelOpen(false)
    load()
  }

  async function onSubmitMot(data: CreateMotorizationFormData) {
    if (!motModelId) return
    if (editingMot) {
      await api.updateMotorization(motModelId, editingMot.id, data)
    } else {
      await api.createMotorization(motModelId, data)
    }
    setMotOpen(false)
    load()
  }

  async function handleDeleteModel() {
    if (!deleteModel) return
    await api.deleteModel(deleteModel.id)
    setDeleteModel(null)
    load()
  }

  async function handleDeleteMot() {
    if (!deleteMot) return
    await api.deleteMotorization(deleteMot.modelId, deleteMot.id)
    setDeleteMot(null)
    load()
  }

  const currentModelColor = watchModel("imageColor") || "#3b82f6"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Modelli e motorizzazioni</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{models.length} modelli disponibili nel catalogo</p>
        </div>
        <Button onClick={() => openModelDialog()}>
          <Plus className="size-4 mr-2" />
          Aggiungi modello
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {models.map((model) => {
          const mots = motorizations.filter((m) => m.modelId === model.id)
          const isExpanded = expandedModel === model.id
          return (
            <Card key={model.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div
                className="relative h-32 flex items-end p-4"
                style={{ background: `linear-gradient(145deg, ${model.imageColor}dd, ${model.imageColor}77)` }}
              >
                <div className="absolute right-3 top-3 flex gap-1">
                  <Button
                    variant="ghost" size="icon-sm"
                    className="bg-black/20 text-white hover:bg-black/40"
                    onClick={() => openModelDialog(model)}
                  >
                    <Edit className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon-sm"
                    className="bg-black/20 text-white hover:bg-red-500/60"
                    onClick={() => setDeleteModel(model)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
                <div className="relative z-10">
                  <Badge variant="outline" className="border-white/30 text-white text-[11px] mb-1 bg-black/20 capitalize backdrop-blur-sm">
                    {model.category}
                  </Badge>
                  <h3 className="text-white font-bold text-lg leading-tight drop-shadow-sm">{model.brand} {model.name}</h3>
                </div>
              </div>

              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{model.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prezzo base</span>
                  <span className="font-bold text-primary">{formatPrice(model.basePrice)}</span>
                </div>
                <Separator className="mb-3" />
                <button
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => setExpandedModel(isExpanded ? null : model.id)}
                >
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Motorizzazioni ({mots.length})
                  </p>
                  {isExpanded
                    ? <ChevronUp className="size-3.5 text-muted-foreground" />
                    : <ChevronDown className="size-3.5 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {mots.map((mot) => (
                      <div key={mot.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                        <div className="flex items-center gap-2">
                          {FUEL_ICONS[mot.fuelType]}
                          <div>
                            <p className="text-sm font-medium leading-tight">{mot.name}</p>
                            <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-0.5"><Gauge className="size-3" />{mot.power} CV</span>
                              <span>0–100: {mot.acceleration}s</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="text-right mr-1">
                            <Badge variant="outline" className="text-[10px] mb-0.5">{FUEL_LABELS[mot.fuelType]}</Badge>
                            <p className="text-xs font-bold text-primary">
                              {mot.price === 0 ? "Base" : `+${formatPrice(mot.price)}`}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon-sm" onClick={() => openMotDialog(model.id, mot)}>
                            <Edit className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon-sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteMot(mot)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline" size="sm"
                      className="w-full mt-1 border-dashed"
                      onClick={() => { openMotDialog(model.id); setExpandedModel(model.id) }}
                    >
                      <Plus className="size-3.5 mr-1.5" />
                      Aggiungi motorizzazione
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Model dialog ─────────────────────────────────────────────────── */}
      <Dialog open={modelOpen} onOpenChange={(open) => { if (!open) setModelOpen(false) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingModel ? "Modifica modello" : "Nuovo modello"}</DialogTitle>
            <DialogDescription>
              {editingModel
                ? `Modifica i dati di ${editingModel.brand} ${editingModel.name}`
                : "Aggiungi un nuovo modello al catalogo"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleModel(onSubmitModel)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Nome</Label>
                <Input {...regModel("name")} aria-invalid={!!modelErrors.name} />
                {modelErrors.name && <p className="text-xs text-destructive">{modelErrors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Brand</Label>
                <Input {...regModel("brand")} aria-invalid={!!modelErrors.brand} />
                {modelErrors.brand && <p className="text-xs text-destructive">{modelErrors.brand.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Categoria</Label>
                <Select
                  value={watchModel("category")}
                  onValueChange={(v) => setModelVal("category", v as CreateCarModelFormData["category"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="coupe">Coupé</SelectItem>
                    <SelectItem value="hatchback">Hatchback</SelectItem>
                    <SelectItem value="wagon">Wagon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Prezzo base (€)</Label>
                <Input
                  type="number" step="100"
                  {...regModel("basePrice", { valueAsNumber: true })}
                  aria-invalid={!!modelErrors.basePrice}
                />
                {modelErrors.basePrice && <p className="text-xs text-destructive">{modelErrors.basePrice.message}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Descrizione</Label>
              <Input {...regModel("description")} aria-invalid={!!modelErrors.description} />
              {modelErrors.description && <p className="text-xs text-destructive">{modelErrors.description.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Colore immagine</Label>
              <div className="flex items-center gap-2">
                <div
                  className="h-9 w-10 shrink-0 rounded-md border border-input"
                  style={{ backgroundColor: currentModelColor }}
                />
                <Input
                  value={currentModelColor}
                  onChange={(e) => setModelVal("imageColor", e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                  aria-invalid={!!modelErrors.imageColor}
                />
                <input
                  type="color"
                  value={currentModelColor}
                  onChange={(e) => setModelVal("imageColor", e.target.value)}
                  className="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-input p-0.5"
                />
              </div>
              {modelErrors.imageColor && <p className="text-xs text-destructive">{modelErrors.imageColor.message}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setModelOpen(false)}>Annulla</Button>
              <Button type="submit" disabled={modelSubmitting}>
                {editingModel ? "Salva modifiche" : "Crea modello"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Motorization dialog ──────────────────────────────────────────── */}
      <Dialog open={motOpen} onOpenChange={(open) => { if (!open) setMotOpen(false) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMot ? "Modifica motorizzazione" : "Nuova motorizzazione"}</DialogTitle>
            <DialogDescription>
              {(() => {
                const m = models.find((x) => x.id === motModelId)
                return m ? `${m.brand} ${m.name}` : ""
              })()}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMot(onSubmitMot)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Nome</Label>
                <Input {...regMot("name")} aria-invalid={!!motErrors.name} />
                {motErrors.name && <p className="text-xs text-destructive">{motErrors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Carburante</Label>
                <Select
                  value={watchMot("fuelType")}
                  onValueChange={(v) => setMotVal("fuelType", v as CreateMotorizationFormData["fuelType"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">Benzina</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="electric">Elettrico</SelectItem>
                    <SelectItem value="hybrid">Ibrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Potenza (CV)</Label>
                <Input type="number" {...regMot("power", { valueAsNumber: true })} aria-invalid={!!motErrors.power} />
                {motErrors.power && <p className="text-xs text-destructive">{motErrors.power.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Coppia (Nm)</Label>
                <Input type="number" {...regMot("torque", { valueAsNumber: true })} aria-invalid={!!motErrors.torque} />
                {motErrors.torque && <p className="text-xs text-destructive">{motErrors.torque.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>0–100 (s)</Label>
                <Input type="number" step="0.1" {...regMot("acceleration", { valueAsNumber: true })} aria-invalid={!!motErrors.acceleration} />
                {motErrors.acceleration && <p className="text-xs text-destructive">{motErrors.acceleration.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Consumo</Label>
                <Input placeholder="es. 6.0 L/100km" {...regMot("consumption")} aria-invalid={!!motErrors.consumption} />
                {motErrors.consumption && <p className="text-xs text-destructive">{motErrors.consumption.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Sovrapprezzo (€)</Label>
                <Input type="number" step="100" {...regMot("price", { valueAsNumber: true })} aria-invalid={!!motErrors.price} />
                {motErrors.price && <p className="text-xs text-destructive">{motErrors.price.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setMotOpen(false)}>Annulla</Button>
              <Button type="submit" disabled={motSubmitting}>
                {editingMot ? "Salva modifiche" : "Aggiungi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete model confirm ─────────────────────────────────────────── */}
      <Dialog open={!!deleteModel} onOpenChange={() => setDeleteModel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elimina modello</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare <strong>{deleteModel?.brand} {deleteModel?.name}</strong>?
              Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModel(null)}>Annulla</Button>
            <Button variant="destructive" onClick={handleDeleteModel}>Elimina</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete motorization confirm ──────────────────────────────────── */}
      <Dialog open={!!deleteMot} onOpenChange={() => setDeleteMot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elimina motorizzazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare <strong>{deleteMot?.name}</strong>?
              Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMot(null)}>Annulla</Button>
            <Button variant="destructive" onClick={handleDeleteMot}>Elimina</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
