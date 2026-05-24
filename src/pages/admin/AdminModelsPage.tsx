import { CAR_MODELS, MOTORIZATIONS } from "@/lib/mock-data"
import { formatPrice } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Zap, Fuel, Leaf, Gauge } from "lucide-react"

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

import * as React from "react"

export function AdminModelsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Modelli e motorizzazioni</h1>
        <p className="text-sm text-muted-foreground">{CAR_MODELS.length} modelli disponibili nel catalogo</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {CAR_MODELS.map((model) => {
          const motorizations = MOTORIZATIONS.filter((m) => m.modelId === model.id)
          return (
            <Card key={model.id} className="overflow-hidden">
              <div
                className="h-32 flex items-end p-4"
                style={{ background: `linear-gradient(135deg, ${model.imageColor}, ${model.imageColor}88)` }}
              >
                <div>
                  <Badge variant="outline" className="border-white/30 text-white text-xs mb-1 bg-white/10 capitalize">
                    {model.category}
                  </Badge>
                  <h3 className="text-white font-bold text-lg leading-tight">{model.brand} {model.name}</h3>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">{model.description}</p>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">Prezzo base</span>
                  <span className="font-bold text-primary">{formatPrice(model.basePrice)}</span>
                </div>
                <Separator className="mb-3" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Motorizzazioni ({motorizations.length})
                </p>
                <div className="flex flex-col gap-2">
                  {motorizations.map((mot) => (
                    <div key={mot.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        {FUEL_ICONS[mot.fuelType]}
                        <div>
                          <p className="text-sm font-medium">{mot.name}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-0.5"><Gauge className="size-3" />{mot.power} CV</span>
                            <span>0-100: {mot.acceleration}s</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs mb-1">{FUEL_LABELS[mot.fuelType]}</Badge>
                        <p className="text-sm font-semibold">
                          {mot.price === 0 ? "Base" : `+${formatPrice(mot.price)}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
