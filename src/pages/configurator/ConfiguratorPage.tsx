import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronRight, Zap, Fuel, Gauge, Leaf, X, AlertTriangle } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { ConfiguratorProvider, useConfigurator, type ConfiguratorStep } from "@/context/ConfiguratorContext"
import { CAR_MODELS, MOTORIZATIONS, CAR_OPTIONS, db } from "@/lib/mock-data"
import { formatPrice } from "@/lib/auth"
import { configurationNameSchema, type ConfigurationNameFormData } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { CarModel, Motorization, CarOption, OptionCategory } from "@/types"
import { cn } from "@/lib/utils"

const STEPS = ["Modello", "Motore", "Optional", "Riepilogo"]

function StepIndicator({ current }: Readonly<{ current: ConfiguratorStep }>) {
  return (
    <div className="flex items-center">
      {STEPS.map((label, idx) => {
        const num = (idx + 1) as ConfiguratorStep
        const done = current > num
        const active = current === num
        const spanColor = done ? "text-primary" : "text-muted-foreground"
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-200",
                  done && "bg-primary text-primary-foreground shadow-sm shadow-primary/30",
                  active && "bg-primary/10 border-2 border-primary text-primary",
                  !done && !active && "bg-muted border-2 border-border text-muted-foreground"
                )}
              >
                {done ? <Check className="size-3.5" /> : num}
              </div>
              <span
                className={cn(
                  "hidden sm:inline text-sm font-medium transition-colors",
                  active ? "text-foreground" : spanColor
                )}
              >
                {label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 mx-3 transition-colors duration-300",
                  current > num ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function PriceBar() {
  const { totalPrice, selectedModel } = useConfigurator()
  if (!selectedModel) return null
  return (
    <div className="sticky bottom-0 flex items-center justify-between rounded-xl border border-border bg-card/95 backdrop-blur shadow-lg px-5 py-3.5 mx-0">
      <div>
        <p className="text-xs text-muted-foreground">Prezzo totale configurazione</p>
        <p className="text-xl font-bold text-primary">{formatPrice(totalPrice)}</p>
      </div>
    </div>
  )
}

function StepModel() {
  const { selectModel, selectedModel } = useConfigurator()
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold">Scegli il modello</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Seleziona il modello di automobile che vuoi configurare</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAR_MODELS.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            selected={selectedModel?.id === model.id}
            onSelect={selectModel}
          />
        ))}
      </div>
    </div>
  )
}

function ModelCard({ model, selected, onSelect }: Readonly<{ model: CarModel; selected: boolean; onSelect: (m: CarModel) => void }>) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden",
        selected && "ring-2 ring-primary shadow-md shadow-primary/15"
      )}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(model)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(model) }}
    >
      <CardContent className="p-0">
        <div
          className="relative flex h-36 items-center justify-center"
          style={{ background: `linear-gradient(145deg, ${model.imageColor}dd, ${model.imageColor}88)` }}
        >
          <svg viewBox="0 0 200 80" className="w-40 fill-white/80 drop-shadow-sm">
            <path d="M160,50 L150,30 Q145,20 130,20 L70,20 Q55,20 50,30 L40,50 L30,50 Q25,50 25,55 L25,62 Q25,65 30,65 L35,65 Q35,72 42,72 Q49,72 49,65 L151,65 Q151,72 158,72 Q165,72 165,65 L170,65 Q175,65 175,62 L175,55 Q175,50 170,50 Z" />
          </svg>
          {selected && (
            <div className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-primary shadow-sm">
              <Check className="size-3.5 text-primary-foreground" />
            </div>
          )}
          <div className="absolute bottom-2 left-3">
            <Badge variant="outline" className="border-white/30 bg-black/20 text-white text-[10px] capitalize backdrop-blur-sm">
              {model.category}
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <p className="font-bold text-base">{model.brand} <span className="text-muted-foreground font-medium">{model.name}</span></p>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{model.description}</p>
          <p className="mt-3 font-bold text-primary">da {formatPrice(model.basePrice)}</p>
        </div>
      </CardContent>
    </Card>
  )
}

const FUEL_ICONS: Record<string, React.ReactNode> = {
  petrol: <Fuel className="size-4 text-amber-500" />,
  diesel: <Zap className="size-4 text-blue-500" />,
  electric: <Zap className="size-4 text-emerald-500" />,
  hybrid: <Leaf className="size-4 text-emerald-500" />,
}

const FUEL_LABELS: Record<string, string> = {
  petrol: "Benzina",
  diesel: "Diesel",
  electric: "Elettrico",
  hybrid: "Ibrido",
}

function StepMotorization() {
  const { selectedModel, selectedMotorization, selectMotorization } = useConfigurator()
  const motorizations = MOTORIZATIONS.filter((m) => m.modelId === selectedModel?.id)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold">Scegli la motorizzazione</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Motorizzazioni disponibili per {selectedModel?.brand} {selectedModel?.name}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {motorizations.map((mot) => (
          <MotorizationCard
            key={mot.id}
            mot={mot}
            basePrice={selectedModel!.basePrice}
            selected={selectedMotorization?.id === mot.id}
            onSelect={selectMotorization}
          />
        ))}
      </div>
    </div>
  )
}

function MotorizationCard({ mot, basePrice, selected, onSelect }: Readonly<{
  mot: Motorization
  basePrice: number
  selected: boolean
  onSelect: (m: Motorization) => void
}>) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        selected && "ring-2 ring-primary shadow-sm shadow-primary/15"
      )}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(mot)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(mot) }}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
          selected ? "bg-primary/10" : "bg-muted"
        )}>
          {FUEL_ICONS[mot.fuelType]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold">{mot.name}</p>
            <Badge variant="outline" className="text-xs">{FUEL_LABELS[mot.fuelType]}</Badge>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Gauge className="size-3" />{mot.power} CV</span>
            <span>{mot.torque} Nm</span>
            <span>0–100: {mot.acceleration}s</span>
            <span>{mot.consumption}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          {mot.price === 0 ? (
            <p className="text-sm font-medium text-muted-foreground">Incluso</p>
          ) : (
            <p className="text-sm font-semibold text-primary">+{formatPrice(mot.price)}</p>
          )}
          <p className="text-xs text-muted-foreground">{formatPrice(basePrice + mot.price)}</p>
        </div>
        {selected && (
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary shadow-sm">
            <Check className="size-3.5 text-primary-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const CATEGORY_LABELS: Record<OptionCategory, string> = {
  color: "Colore",
  interior: "Interni",
  technology: "Tecnologia",
  safety: "Sicurezza",
  comfort: "Comfort",
}

function StepOptions() {
  const { selectedOptionIds, toggleOption, availableOptions, isOptionCompatible } = useConfigurator()
  const categories: OptionCategory[] = ["color", "interior", "technology", "safety", "comfort"]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold">Scegli gli optional</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Personalizza la tua auto con accessori e optional</p>
      </div>
      <Tabs defaultValue="color">
        <TabsList className="flex-wrap h-auto gap-1">
          {categories.map((cat) => {
            const count = selectedOptionIds.filter((id) =>
              availableOptions.find((o) => o.id === id && o.category === cat)
            ).length
            return (
              <TabsTrigger key={cat} value={cat} className="gap-1.5">
                {CATEGORY_LABELS[cat]}
                {count > 0 && (
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>
        {categories.map((cat) => {
          const opts = availableOptions.filter((o) => o.category === cat)
          return (
            <TabsContent key={cat} value={cat} className="mt-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {opts.map((opt) => {
                  const isSelected = selectedOptionIds.includes(opt.id)
                  const compatible = isOptionCompatible(opt.id)
                  return (
                    <OptionCard
                      key={opt.id}
                      option={opt}
                      selected={isSelected}
                      compatible={compatible || isSelected}
                      onToggle={toggleOption}
                    />
                  )
                })}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

function OptionCard({ option, selected, compatible, onToggle }: Readonly<{
  option: CarOption
  selected: boolean
  compatible: boolean
  onToggle: (id: string) => void
}>) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-150",
        selected && "ring-2 ring-primary shadow-sm shadow-primary/15",
        !compatible && "opacity-50 cursor-not-allowed"
      )}
      role="button"
      tabIndex={compatible ? 0 : -1}
      onClick={() => compatible && onToggle(option.id)}
      onKeyDown={(e) => { if (compatible && (e.key === 'Enter' || e.key === ' ')) onToggle(option.id) }}
    >
      <CardContent className="flex items-start gap-3 p-4">
        {option.category === "color" && option.color ? (
          <div
            className="size-10 shrink-0 rounded-xl border border-border shadow-sm"
            style={{ backgroundColor: option.color }}
          />
        ) : null}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight">{option.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{option.description}</p>
              {!compatible && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="size-3" /> Non compatibile
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <p className="text-sm font-semibold whitespace-nowrap">
                {option.price === 0 ? "Incluso" : `+${formatPrice(option.price)}`}
              </p>
              {selected ? (
                <div className="flex size-5 items-center justify-center rounded-full bg-primary shadow-sm">
                  <Check className="size-3 text-primary-foreground" />
                </div>
              ) : (
                <div className="size-5 rounded-full border-2 border-border" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StepSummary({ onSave }: Readonly<{ onSave: () => void }>) {
  const { selectedModel, selectedMotorization, selectedOptionIds, configName, setConfigName, totalPrice, editingConfigId } = useConfigurator()
  const { register, handleSubmit, formState: { errors } } = useForm<ConfigurationNameFormData>({
    resolver: zodResolver(configurationNameSchema),
    defaultValues: { name: configName },
  })

  function onSubmit(data: ConfigurationNameFormData) {
    setConfigName(data.name)
    onSave()
  }

  const selectedOptions = CAR_OPTIONS.filter((o) => selectedOptionIds.includes(o.id))
  const optionsByCategory = selectedOptions.reduce<Record<string, CarOption[]>>((acc, opt) => {
    if (!acc[opt.category]) acc[opt.category] = []
    acc[opt.category].push(opt)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Riepilogo configurazione</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Rivedi la tua configurazione prima di salvarla</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="size-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `linear-gradient(135deg, ${selectedModel?.imageColor ?? "#666"}, ${selectedModel?.imageColor ?? "#666"}88)` }}
                >
                  <svg viewBox="0 0 200 80" className="w-7 fill-white/80">
                    <path d="M160,50 L150,30 Q145,20 130,20 L70,20 Q55,20 50,30 L40,50 L30,50 Q25,50 25,55 L25,62 Q25,65 30,65 L35,65 Q35,72 42,72 Q49,72 49,65 L151,65 Q151,72 158,72 Q165,72 165,65 L170,65 Q175,65 175,62 L175,55 Q175,50 170,50 Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Veicolo selezionato</h3>
                  <p className="text-xs text-muted-foreground">{selectedModel?.brand} {selectedModel?.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-muted-foreground text-xs mb-0.5">Categoria</p>
                  <p className="font-medium capitalize">{selectedModel?.category}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-muted-foreground text-xs mb-0.5">Motorizzazione</p>
                  <p className="font-medium">{selectedMotorization?.name}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-muted-foreground text-xs mb-0.5">Alimentazione</p>
                  <p className="font-medium">{FUEL_LABELS[selectedMotorization?.fuelType ?? ""]}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-muted-foreground text-xs mb-0.5">Potenza</p>
                  <p className="font-medium">{selectedMotorization?.power} CV</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-muted-foreground text-xs mb-0.5">0–100 km/h</p>
                  <p className="font-medium">{selectedMotorization?.acceleration}s</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-muted-foreground text-xs mb-0.5">Consumo</p>
                  <p className="font-medium">{selectedMotorization?.consumption}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedOptions.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-3">Optional selezionati ({selectedOptions.length})</h3>
                <div className="flex flex-col gap-3">
                  {Object.entries(optionsByCategory).map(([cat, opts]) => (
                    <div key={cat}>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                        {CATEGORY_LABELS[cat as OptionCategory]}
                      </p>
                      <div className="flex flex-col gap-1">
                        {opts.map((opt) => (
                          <div key={opt.id} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              {opt.color && <span className="size-3 rounded-full inline-block border border-border" style={{ backgroundColor: opt.color }} />}
                              {opt.name}
                            </span>
                            <span className="text-muted-foreground">{opt.price === 0 ? "Incluso" : `+${formatPrice(opt.price)}`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-3">Dai un nome alla configurazione</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="configName">Nome</Label>
                  <Input
                    id="configName"
                    placeholder="Es. BMW Sogno 2024"
                    aria-invalid={!!errors.name}
                    defaultValue={configName}
                    {...register("name")}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <Button type="submit" className="w-full sm:w-auto shadow-sm shadow-primary/20" size="lg">
                  {editingConfigId ? "Aggiorna configurazione" : "Salva configurazione"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-4 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary to-primary/50" />
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-4">Dettaglio prezzi</h3>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prezzo base</span>
                  <span>{formatPrice(selectedModel?.basePrice ?? 0)}</span>
                </div>
                {(selectedMotorization?.price ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Motorizzazione</span>
                    <span>+{formatPrice(selectedMotorization!.price)}</span>
                  </div>
                )}
                {selectedOptions.map((opt) => (
                  opt.price > 0 && (
                    <div key={opt.id} className="flex justify-between">
                      <span className="text-muted-foreground truncate mr-2">{opt.name}</span>
                      <span className="shrink-0">+{formatPrice(opt.price)}</span>
                    </div>
                  )
                ))}
                <div className="border-t border-border pt-3 mt-1 flex justify-between font-bold text-base">
                  <span>Totale</span>
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function ConfiguratorPage() {
  const { id } = useParams()
  return (
    <ConfiguratorProvider>
      <ConfiguratorInnerWithLoad id={id} />
    </ConfiguratorProvider>
  )
}

function ConfiguratorInnerWithLoad({ id }: Readonly<{ id?: string }>) {
  const { loadConfiguration, setStep } = useConfigurator()
  const loaded = React.useRef(false)

  React.useEffect(() => {
    if (id && id !== "new" && !loaded.current) {
      loaded.current = true
      loadConfiguration(id)
      setStep(1)
    }
  }, [id, loadConfiguration, setStep])

  return (
    <div className="flex flex-col gap-6 pb-20">
      <InnerWizard />
    </div>
  )
}

function InnerWizard() {
  const ctx = useConfigurator()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = React.useState(false)

  const canGoNext =
    (ctx.step === 1 && !!ctx.selectedModel) ||
    (ctx.step === 2 && !!ctx.selectedMotorization) ||
    ctx.step === 3

  function handleSave() {
    if (!user || !ctx.selectedModel || !ctx.selectedMotorization || !ctx.configName) return
    if (ctx.editingConfigId) {
      db.updateConfiguration(ctx.editingConfigId, {
        name: ctx.configName,
        modelId: ctx.selectedModel.id,
        motorizationId: ctx.selectedMotorization.id,
        optionIds: ctx.selectedOptionIds,
        totalPrice: ctx.totalPrice,
      })
    } else {
      db.createConfiguration({
        userId: user.id,
        name: ctx.configName,
        modelId: ctx.selectedModel.id,
        motorizationId: ctx.selectedMotorization.id,
        optionIds: ctx.selectedOptionIds,
        totalPrice: ctx.totalPrice,
      })
    }
    setSaved(true)
    ctx.reset()
    setTimeout(() => navigate("/configurator"), 1200)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {ctx.editingConfigId ? "Modifica configurazione" : "Nuovo configuratore"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Passo {ctx.step} di 4</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { ctx.reset(); navigate("/configurator") }}>
          <X className="size-4" />
          <span className="hidden sm:inline ml-1.5">Annulla</span>
        </Button>
      </div>

      <StepIndicator current={ctx.step} />

      {saved && (
        <Alert variant="success">
          <Check className="size-4" />
          <AlertDescription>Configurazione salvata! Reindirizzamento in corso…</AlertDescription>
        </Alert>
      )}

      {ctx.step === 1 && <StepModel />}
      {ctx.step === 2 && <StepMotorization />}
      {ctx.step === 3 && <StepOptions />}
      {ctx.step === 4 && <StepSummary onSave={handleSave} />}

      {ctx.step < 4 && (
        <div className="flex justify-between pt-2">
          {ctx.step > 1 ? (
            <Button variant="outline" onClick={() => ctx.setStep((ctx.step - 1) as ConfiguratorStep)}>
              Indietro
            </Button>
          ) : (
            <div />
          )}
          <Button
            onClick={() => ctx.setStep((ctx.step + 1) as ConfiguratorStep)}
            disabled={!canGoNext}
            className="gap-1.5 shadow-sm shadow-primary/20"
          >
            {ctx.step === 3 ? "Vai al riepilogo" : "Avanti"}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      <PriceBar />
    </>
  )
}
