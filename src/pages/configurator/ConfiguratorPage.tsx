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
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { CarModel, Motorization, CarOption, OptionCategory } from "@/types"
import { cn } from "@/lib/utils"

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS = ["Modello", "Motorizzazione", "Optional", "Riepilogo"]

function StepIndicator({ current }: { current: ConfiguratorStep }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((label, idx) => {
        const num = (idx + 1) as ConfiguratorStep
        const done = current > num
        const active = current === num
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary text-primary",
                  !done && !active && "border-border text-muted-foreground"
                )}
              >
                {done ? <Check className="size-3.5" /> : num}
              </div>
              <span
                className={cn(
                  "hidden sm:inline text-sm font-medium",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={cn("h-px flex-1 mx-3", current > num ? "bg-primary" : "bg-border")} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Price bar ────────────────────────────────────────────────────────────────
function PriceBar() {
  const { totalPrice, selectedModel } = useConfigurator()
  if (!selectedModel) return null
  return (
    <div className="sticky bottom-0 flex items-center justify-between border-t border-border bg-background/95 backdrop-blur px-4 py-3 sm:px-6">
      <div>
        <p className="text-xs text-muted-foreground">Prezzo totale configurazione</p>
        <p className="text-xl font-bold text-primary">{formatPrice(totalPrice)}</p>
      </div>
    </div>
  )
}

// ─── Step 1: Modello ──────────────────────────────────────────────────────────
function StepModel() {
  const { selectModel, selectedModel } = useConfigurator()
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Scegli il modello</h2>
        <p className="text-sm text-muted-foreground">Seleziona il modello di automobile che vuoi configurare</p>
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

function ModelCard({ model, selected, onSelect }: { model: CarModel; selected: boolean; onSelect: (m: CarModel) => void }) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        selected && "ring-2 ring-primary shadow-md"
      )}
      onClick={() => onSelect(model)}
    >
      <CardContent className="p-0">
        <div
          className="flex h-36 items-center justify-center rounded-t-xl"
          style={{ background: `linear-gradient(135deg, ${model.imageColor}, ${model.imageColor}99)` }}
        >
          <svg viewBox="0 0 200 80" className="w-40 fill-white/80">
            <path d="M160,50 L150,30 Q145,20 130,20 L70,20 Q55,20 50,30 L40,50 L30,50 Q25,50 25,55 L25,62 Q25,65 30,65 L35,65 Q35,72 42,72 Q49,72 49,65 L151,65 Q151,72 158,72 Q165,72 165,65 L170,65 Q175,65 175,62 L175,55 Q175,50 170,50 Z" />
          </svg>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold">{model.brand} {model.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{model.category}</p>
            </div>
            {selected && (
              <div className="flex size-5 items-center justify-center rounded-full bg-primary">
                <Check className="size-3 text-primary-foreground" />
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{model.description}</p>
          <p className="mt-3 font-semibold text-primary">da {formatPrice(model.basePrice)}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Step 2: Motorizzazione ───────────────────────────────────────────────────
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
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Scegli la motorizzazione</h2>
        <p className="text-sm text-muted-foreground">
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

function MotorizationCard({ mot, basePrice, selected, onSelect }: {
  mot: Motorization
  basePrice: number
  selected: boolean
  onSelect: (m: Motorization) => void
}) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        selected && "ring-2 ring-primary"
      )}
      onClick={() => onSelect(mot)}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
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
            <span>0-100: {mot.acceleration}s</span>
            <span>{mot.consumption}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          {mot.price === 0 ? (
            <p className="text-sm font-medium text-muted-foreground">Incluso</p>
          ) : (
            <p className="text-sm font-semibold">+{formatPrice(mot.price)}</p>
          )}
          <p className="text-xs text-muted-foreground">{formatPrice(basePrice + mot.price)}</p>
        </div>
        {selected && (
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary">
            <Check className="size-3.5 text-primary-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Step 3: Optional ─────────────────────────────────────────────────────────
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
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Scegli gli optional</h2>
        <p className="text-sm text-muted-foreground">Personalizza la tua auto con accessori e optional</p>
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

function OptionCard({ option, selected, compatible, onToggle }: {
  option: CarOption
  selected: boolean
  compatible: boolean
  onToggle: (id: string) => void
}) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all",
        selected && "ring-2 ring-primary",
        !compatible && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => compatible && onToggle(option.id)}
    >
      <CardContent className="flex items-start gap-3 p-4">
        {option.category === "color" && option.color && (
          <div
            className="size-10 shrink-0 rounded-lg border border-border shadow-sm"
            style={{ backgroundColor: option.color }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight">{option.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
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
                <div className="flex size-5 items-center justify-center rounded-full bg-primary">
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

// ─── Step 4: Riepilogo ────────────────────────────────────────────────────────
function StepSummary({ onSave }: { onSave: () => void }) {
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
        <p className="text-sm text-muted-foreground">Rivedi la tua configurazione prima di salvarla</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Model + Motorization */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-3">Veicolo</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Modello</p>
                  <p className="font-medium">{selectedModel?.brand} {selectedModel?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Categoria</p>
                  <p className="font-medium capitalize">{selectedModel?.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Motorizzazione</p>
                  <p className="font-medium">{selectedMotorization?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Alimentazione</p>
                  <p className="font-medium">{FUEL_LABELS[selectedMotorization?.fuelType ?? ""]}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Potenza</p>
                  <p className="font-medium">{selectedMotorization?.power} CV</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">0–100 km/h</p>
                  <p className="font-medium">{selectedMotorization?.acceleration}s</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          {selectedOptions.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-3">Optional selezionati ({selectedOptions.length})</h3>
                <div className="flex flex-col gap-3">
                  {Object.entries(optionsByCategory).map(([cat, opts]) => (
                    <div key={cat}>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">{CATEGORY_LABELS[cat as OptionCategory]}</p>
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

          {/* Name form */}
          <Card>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="configName">Nome della configurazione</Label>
                  <Input
                    id="configName"
                    placeholder="Es. BMW Sogno 2024"
                    aria-invalid={!!errors.name}
                    defaultValue={configName}
                    {...register("name")}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <Button type="submit" className="w-full sm:w-auto" size="lg">
                  {editingConfigId ? "Aggiorna configurazione" : "Salva configurazione"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Price breakdown */}
        <div>
          <Card className="sticky top-4">
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
                <div className="border-t border-border pt-2 mt-1 flex justify-between font-bold text-base">
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

// ─── Main Configurator ────────────────────────────────────────────────────────
export function ConfiguratorPage() {
  const { id } = useParams()

  return (
    <ConfiguratorProvider>
      <ConfiguratorInnerWithLoad id={id} />
    </ConfiguratorProvider>
  )
}

function ConfiguratorInnerWithLoad({ id }: { id?: string }) {
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
          <h1 className="text-2xl font-bold">{ctx.editingConfigId ? "Modifica configurazione" : "Nuovo configuratore"}</h1>
          <p className="text-sm text-muted-foreground">Passo {ctx.step} di 4</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { ctx.reset(); navigate("/configurator") }}>
          <X className="size-4" />
          <span className="hidden sm:inline ml-1.5">Annulla</span>
        </Button>
      </div>

      <Progress value={(ctx.step / 4) * 100} />
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
        <div className="flex justify-between">
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
            className="gap-1.5"
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
