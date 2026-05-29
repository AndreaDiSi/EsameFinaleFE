import { CAR_MODELS, MOTORIZATIONS } from "@/lib/mock-data"
import { formatPrice } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Zap, Fuel, Leaf, Gauge } from "lucide-react"

import * as React from "react"

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
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Modelli e motorizzazioni</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{CAR_MODELS.length} modelli disponibili nel catalogo</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {CAR_MODELS.map((model) => {
          const motorizations = MOTORIZATIONS.filter((m) => m.modelId === model.id)
          return (
            <Card key={model.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div
                className="relative h-36 flex items-end p-4"
                style={{ background: `linear-gradient(145deg, ${model.imageColor}dd, ${model.imageColor}77)` }}
              >
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-15">
                  <svg viewBox="0 0 200 80" className="w-36 fill-white">
                    <path d="M160,50 L150,30 Q145,20 130,20 L70,20 Q55,20 50,30 L40,50 L30,50 Q25,50 25,55 L25,62 Q25,65 30,65 L35,65 Q35,72 42,72 Q49,72 49,65 L151,65 Q151,72 158,72 Q165,72 165,65 L170,65 Q175,65 175,62 L175,55 Q175,50 170,50 Z" />
                  </svg>
                </div>
                <div className="relative z-10">
                  <Badge variant="outline" className="border-white/30 text-white text-[11px] mb-1.5 bg-black/20 capitalize backdrop-blur-sm">
                    {model.category}
                  </Badge>
                  <h3 className="text-white font-bold text-lg leading-tight drop-shadow-sm">{model.brand} {model.name}</h3>
                </div>
              </div>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{model.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prezzo base</span>
                  <span className="font-bold text-primary text-base">{formatPrice(model.basePrice)}</span>
                </div>
                <Separator className="mb-4" />
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Motorizzazioni ({motorizations.length})
                </p>
                <div className="flex flex-col gap-2">
                  {motorizations.map((mot) => (
                    <div key={mot.id} className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5 hover:bg-muted/80 transition-colors">
                      <div className="flex items-center gap-2.5">
                        {FUEL_ICONS[mot.fuelType]}
                        <div>
                          <p className="text-sm font-semibold leading-tight">{mot.name}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-0.5"><Gauge className="size-3" />{mot.power} CV</span>
                            <span>0–100: {mot.acceleration}s</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-[11px] mb-1">{FUEL_LABELS[mot.fuelType]}</Badge>
                        <p className="text-sm font-bold text-primary">
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
