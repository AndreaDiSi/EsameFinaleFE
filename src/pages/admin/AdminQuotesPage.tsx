import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Search, Eye, CheckCircle, XCircle, Clock, AlertCircle, SlidersHorizontal } from "lucide-react"

import { db } from "@/lib/mock-data"
import { formatPrice, formatDate } from "@/lib/auth"
import { quoteAdminSchema, type QuoteAdminFormData } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { Quote, QuoteStatus } from "@/types"

const STATUS_CONFIG: Record<QuoteStatus, { label: string; variant: "success" | "warning" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending: { label: "In attesa", variant: "warning", icon: <Clock className="size-3.5" /> },
  approved: { label: "Approvato", variant: "success", icon: <CheckCircle className="size-3.5" /> },
  rejected: { label: "Rifiutato", variant: "destructive", icon: <XCircle className="size-3.5" /> },
  expired: { label: "Scaduto", variant: "outline", icon: <AlertCircle className="size-3.5" /> },
}

function QuoteRow({ quote, onEdit }: Readonly<{ quote: Quote; onEdit: (q: Quote) => void }>) {
  const config = db.getConfigurationById(quote.configurationId)
  const user = db.getUsers().find((u) => u.id === quote.userId)
  const model = config ? db.getModelById(config.modelId) : null
  const status = STATUS_CONFIG[quote.status]

  return (
    <TableRow>
      <TableCell>
        <div>
          <p className="font-medium text-sm">{user?.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="text-sm">{config?.name ?? "Config eliminata"}</p>
          {model && <p className="text-xs text-muted-foreground">{model.brand} {model.name}</p>}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={status.variant} className="gap-1">
          {status.icon}{status.label}
        </Badge>
      </TableCell>
      <TableCell>
        <div>
          {quote.discount > 0 && (
            <p className="text-xs text-muted-foreground line-through">{formatPrice(quote.totalPrice)}</p>
          )}
          <p className="font-semibold text-sm">{formatPrice(quote.finalPrice)}</p>
          {quote.discount > 0 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">-{quote.discount}%</p>
          )}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">{formatDate(quote.createdAt)}</TableCell>
      <TableCell>
        <Button variant="ghost" size="icon-sm" onClick={() => onEdit(quote)}>
          <Eye className="size-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

export function AdminQuotesPage() {
  const [, setQuotes] = React.useState<Quote[]>([])
  const [search, setSearch] = React.useState("")
  const [editingQuote, setEditingQuote] = React.useState<Quote | null>(null)

  function load() {
    setQuotes(db.getAllQuotes().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }

  React.useEffect(() => { load() }, [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset: resetForm,
  } = useForm<QuoteAdminFormData>({ resolver: zodResolver(quoteAdminSchema) })

  function openEdit(quote: Quote) {
    setEditingQuote(quote)
    resetForm({ status: quote.status, discount: quote.discount, adminNotes: quote.adminNotes })
  }

  function onSubmit(data: QuoteAdminFormData) {
    if (!editingQuote) return
    const finalPrice = editingQuote.totalPrice * (1 - data.discount / 100)
    db.updateQuote(editingQuote.id, {
      status: data.status,
      discount: data.discount,
      finalPrice,
      adminNotes: data.adminNotes ?? "",
    })
    setEditingQuote(null)
    load()
  }

  function filterByStatus(status: QuoteStatus | "all") {
    const all = db.getAllQuotes().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (status === "all") return all
    return all.filter((q) => q.status === status)
  }

  function searchFilter(qs: Quote[]) {
    if (!search) return qs
    const s = search.toLowerCase()
    return qs.filter((q) => {
      const user = db.getUsers().find((u) => u.id === q.userId)
      const config = db.getConfigurationById(q.configurationId)
      return (
        user?.name.toLowerCase().includes(s) ||
        user?.email.toLowerCase().includes(s) ||
        config?.name.toLowerCase().includes(s)
      )
    })
  }

  const allQuotes = db.getAllQuotes()
  const pendingCount = allQuotes.filter((q) => q.status === "pending").length
  const approvedCount = allQuotes.filter((q) => q.status === "approved").length
  const rejectedCount = allQuotes.filter((q) => q.status === "rejected").length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Gestione preventivi</h1>
        <p className="text-sm text-muted-foreground">{allQuotes.length} preventivi totali</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input placeholder="Cerca per utente o configurazione…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tutti ({allQuotes.length})</TabsTrigger>
          <TabsTrigger value="pending">In attesa ({pendingCount})</TabsTrigger>
          <TabsTrigger value="approved">Approvati ({approvedCount})</TabsTrigger>
          <TabsTrigger value="rejected">Rifiutati ({rejectedCount})</TabsTrigger>
        </TabsList>

        {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Configurazione</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Prezzo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchFilter(filterByStatus(tab)).map((q) => (
                    <QuoteRow key={q.id} quote={q} onEdit={openEdit} />
                  ))}
                  {searchFilter(filterByStatus(tab)).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nessun preventivo trovato
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit dialog */}
      <Dialog open={!!editingQuote} onOpenChange={() => setEditingQuote(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SlidersHorizontal className="size-4" />
              Gestisci preventivo
            </DialogTitle>
            <DialogDescription>
              Aggiorna stato e condizioni del preventivo
            </DialogDescription>
          </DialogHeader>
          {editingQuote && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm mb-2">
              <p className="font-medium">{db.getConfigurationById(editingQuote.configurationId)?.name ?? "—"}</p>
              <p className="text-muted-foreground">{db.getUsers().find((u) => u.id === editingQuote.userId)?.name}</p>
              <p className="font-semibold text-primary mt-1">{formatPrice(editingQuote.totalPrice)}</p>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Stato</Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as QuoteStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">In attesa</SelectItem>
                  <SelectItem value="approved">Approvato</SelectItem>
                  <SelectItem value="rejected">Rifiutato</SelectItem>
                  <SelectItem value="expired">Scaduto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Sconto (%)</Label>
              <Input
                type="number"
                min={0}
                max={50}
                {...register("discount", { valueAsNumber: true })}
                aria-invalid={!!errors.discount}
              />
              {errors.discount && <p className="text-xs text-destructive">{errors.discount.message}</p>}
              {editingQuote && (watch("discount") ?? 0) > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Prezzo finale: {formatPrice(editingQuote.totalPrice * (1 - (watch("discount") ?? 0) / 100))}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Note admin (opzionale)</Label>
              <Textarea
                placeholder="Motivazione, condizioni speciali…"
                className="min-h-20"
                {...register("adminNotes")}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setEditingQuote(null)}>Annulla</Button>
              <Button type="submit" disabled={isSubmitting}>Aggiorna</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
