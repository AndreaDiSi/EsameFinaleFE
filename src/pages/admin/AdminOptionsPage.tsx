import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Edit, Trash2 } from "lucide-react"

import { api } from "@/lib/api"
import { formatPrice } from "@/lib/auth"
import { createCarOptionSchema, type CreateCarOptionFormData } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CarModel, Motorization, CarOption } from "@/types"

const CATEGORY_LABELS: Record<string, string> = {
  color: "Colore",
  interior: "Interni",
  technology: "Tecnologia",
  safety: "Sicurezza",
  comfort: "Comfort",
}

export function AdminOptionsPage() {
  const [options, setOptions] = React.useState<CarOption[]>([])
  const [allMots, setAllMots] = React.useState<Motorization[]>([])
  const [allModels, setAllModels] = React.useState<CarModel[]>([])

  const [optionOpen, setOptionOpen] = React.useState(false)
  const [editingOption, setEditingOption] = React.useState<CarOption | null>(null)
  const [deleteOption, setDeleteOption] = React.useState<CarOption | null>(null)

  async function load() {
    const [opts, catalog] = await Promise.all([api.getOptions(), api.getModels()])
    setOptions(opts)
    setAllMots(catalog.motorizations)
    setAllModels(catalog.models)
  }

  React.useEffect(() => { load() }, [])

  const {
    register: regOpt,
    handleSubmit: handleOpt,
    setValue: setOptVal,
    watch: watchOpt,
    formState: { errors: optErrors, isSubmitting: optSubmitting },
    reset: resetOpt,
  } = useForm<CreateCarOptionFormData>({ resolver: zodResolver(createCarOptionSchema) })

  const incompatibleWith = watchOpt("incompatibleWith") ?? []
  const requiredMotorizationIds = watchOpt("requiredMotorizationIds") ?? []
  const currentColor = watchOpt("color") || ""

  function openOptionDialog(opt?: CarOption) {
    resetOpt(opt
      ? {
          name: opt.name,
          description: opt.description,
          category: opt.category,
          price: opt.price,
          color: opt.color ?? "",
          incompatibleWith: opt.incompatibleWith,
          requiredMotorizationIds: opt.requiredMotorizations ?? [],
        }
      : { name: "", description: "", category: "technology", price: 0, color: "", incompatibleWith: [], requiredMotorizationIds: [] }
    )
    setEditingOption(opt ?? null)
    setOptionOpen(true)
  }

  function toggleIncompatible(id: string) {
    setOptVal("incompatibleWith",
      incompatibleWith.includes(id)
        ? incompatibleWith.filter((x) => x !== id)
        : [...incompatibleWith, id]
    )
  }

  function toggleRequiredMot(id: string) {
    setOptVal("requiredMotorizationIds",
      requiredMotorizationIds.includes(id)
        ? requiredMotorizationIds.filter((x) => x !== id)
        : [...requiredMotorizationIds, id]
    )
  }

  async function onSubmitOption(data: CreateCarOptionFormData) {
    const payload = {
      ...data,
      color: data.color || undefined,
      incompatibleWith: data.incompatibleWith ?? [],
      requiredMotorizationIds: data.requiredMotorizationIds ?? [],
    }
    if (editingOption) {
      await api.updateOption(editingOption.id, payload)
    } else {
      await api.createOption(payload)
    }
    setOptionOpen(false)
    load()
  }

  async function handleDeleteOption() {
    if (!deleteOption) return
    await api.deleteOption(deleteOption.id)
    setDeleteOption(null)
    load()
  }

  const otherOptions = editingOption
    ? options.filter((o) => o.id !== editingOption.id)
    : options

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Optional</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{options.length} optional disponibili nel catalogo</p>
        </div>
        <Button onClick={() => openOptionDialog()}>
          <Plus className="size-4 mr-2" />
          Aggiungi optional
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Prezzo</TableHead>
                <TableHead>Incompatibili</TableHead>
                <TableHead>Mot. richieste</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {options.map((opt) => (
                <TableRow key={opt.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      {opt.color && (
                        <div
                          className="size-4 shrink-0 rounded-full border border-border"
                          style={{ backgroundColor: opt.color }}
                        />
                      )}
                      <div>
                        <p className="font-medium text-sm">{opt.name}</p>
                        <p className="text-xs text-muted-foreground">{opt.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[11px]">
                      {CATEGORY_LABELS[opt.category] ?? opt.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{formatPrice(opt.price)}</TableCell>
                  <TableCell>
                    {opt.incompatibleWith.length > 0
                      ? <Badge variant="outline">{opt.incompatibleWith.length}</Badge>
                      : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    {(opt.requiredMotorizations ?? []).length > 0
                      ? <Badge variant="outline">{opt.requiredMotorizations!.length}</Badge>
                      : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openOptionDialog(opt)}>
                        <Edit className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon-sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteOption(opt)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {options.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nessun optional disponibile
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Option dialog ─────────────────────────────────────────────────── */}
      <Dialog open={optionOpen} onOpenChange={(open) => { if (!open) setOptionOpen(false) }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOption ? "Modifica optional" : "Nuovo optional"}</DialogTitle>
            <DialogDescription>
              {editingOption ? `Modifica i dati di "${editingOption.name}"` : "Aggiungi un nuovo optional al catalogo"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOpt(onSubmitOption)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Nome</Label>
                <Input {...regOpt("name")} aria-invalid={!!optErrors.name} />
                {optErrors.name && <p className="text-xs text-destructive">{optErrors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Categoria</Label>
                <Select
                  value={watchOpt("category")}
                  onValueChange={(v) => setOptVal("category", v as CreateCarOptionFormData["category"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="color">Colore</SelectItem>
                    <SelectItem value="interior">Interni</SelectItem>
                    <SelectItem value="technology">Tecnologia</SelectItem>
                    <SelectItem value="safety">Sicurezza</SelectItem>
                    <SelectItem value="comfort">Comfort</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Descrizione</Label>
              <Input {...regOpt("description")} aria-invalid={!!optErrors.description} />
              {optErrors.description && <p className="text-xs text-destructive">{optErrors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Prezzo (€)</Label>
                <Input
                  type="number" step="50"
                  {...regOpt("price", { valueAsNumber: true })}
                  aria-invalid={!!optErrors.price}
                />
                {optErrors.price && <p className="text-xs text-destructive">{optErrors.price.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Colore (opzionale)</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="h-9 w-10 shrink-0 rounded-md border border-input"
                    style={{ backgroundColor: currentColor || "transparent" }}
                  />
                  <Input
                    value={currentColor}
                    onChange={(e) => setOptVal("color", e.target.value)}
                    placeholder="#FF0000"
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={currentColor || "#ffffff"}
                    onChange={(e) => setOptVal("color", e.target.value)}
                    className="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-input p-0.5"
                  />
                </div>
              </div>
            </div>

            {/* Incompatibilities */}
            {otherOptions.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label>Incompatibile con</Label>
                <div className="rounded-md border border-input p-2 max-h-40 overflow-y-auto flex flex-col gap-0.5">
                  {otherOptions.map((o) => (
                    <label
                      key={o.id}
                      className="flex items-center gap-2.5 cursor-pointer rounded px-2 py-1.5 hover:bg-muted/50 text-sm"
                    >
                      <Checkbox
                        checked={incompatibleWith.includes(o.id)}
                        onCheckedChange={() => toggleIncompatible(o.id)}
                      />
                      <span className="flex-1">{o.name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {CATEGORY_LABELS[o.category] ?? o.category}
                      </Badge>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Required motorizations */}
            {allMots.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label>Richiede motorizzazione <span className="text-muted-foreground font-normal">(lascia vuoto = disponibile per tutte)</span></Label>
                <div className="rounded-md border border-input p-2 max-h-40 overflow-y-auto flex flex-col gap-0.5">
                  {allMots.map((m) => {
                    const model = allModels.find((mo) => mo.id === m.modelId)
                    return (
                      <label
                        key={m.id}
                        className="flex items-center gap-2.5 cursor-pointer rounded px-2 py-1.5 hover:bg-muted/50 text-sm"
                      >
                        <Checkbox
                          checked={requiredMotorizationIds.includes(m.id)}
                          onCheckedChange={() => toggleRequiredMot(m.id)}
                        />
                        <span className="flex-1">
                          {model ? <span className="text-muted-foreground">{model.brand} {model.name} — </span> : null}
                          {m.name}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">{m.power} CV</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOptionOpen(false)}>Annulla</Button>
              <Button type="submit" disabled={optSubmitting}>
                {editingOption ? "Salva modifiche" : "Crea optional"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ────────────────────────────────────────────────── */}
      <Dialog open={!!deleteOption} onOpenChange={() => setDeleteOption(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elimina optional</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare <strong>{deleteOption?.name}</strong>?
              Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOption(null)}>Annulla</Button>
            <Button variant="destructive" onClick={handleDeleteOption}>Elimina</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
