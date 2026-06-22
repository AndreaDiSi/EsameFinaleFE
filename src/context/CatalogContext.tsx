import * as React from "react"
import { api } from "@/lib/api"
import type { CarModel, Motorization, CarOption } from "@/types"

interface CatalogContextValue {
  models: CarModel[]
  motorizations: Motorization[]
  options: CarOption[]
  isLoading: boolean
  getModelById: (id: string) => CarModel | null
  getMotorizationById: (id: string) => Motorization | null
  getMotorizationsByModel: (modelId: string) => Motorization[]
  getOptionsByIds: (ids: string[]) => CarOption[]
  calculateTotalPrice: (modelId: string, motorizationId: string, optionIds: string[]) => number
}

const CatalogContext = React.createContext<CatalogContextValue | undefined>(undefined)

export function CatalogProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [models, setModels] = React.useState<CarModel[]>([])
  const [motorizations, setMotorizations] = React.useState<Motorization[]>([])
  const [options, setOptions] = React.useState<CarOption[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.all([api.getModels(), api.getOptions()])
      .then(([catalog, opts]) => {
        setModels(catalog.models)
        setMotorizations(catalog.motorizations)
        setOptions(opts)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const getModelById = React.useCallback((id: string): CarModel | null => {
    return models.find((m) => m.id === id) ?? null
  }, [models])

  const getMotorizationById = React.useCallback((id: string): Motorization | null => {
    return motorizations.find((m) => m.id === id) ?? null
  }, [motorizations])

  const getMotorizationsByModel = React.useCallback((modelId: string): Motorization[] => {
    return motorizations.filter((m) => m.modelId === modelId)
  }, [motorizations])

  const getOptionsByIds = React.useCallback((ids: string[]): CarOption[] => {
    return options.filter((o) => ids.includes(o.id))
  }, [options])

  const calculateTotalPrice = React.useCallback((modelId: string, motorizationId: string, optionIds: string[]): number => {
    const model = models.find((m) => m.id === modelId)
    const mot = motorizations.find((m) => m.id === motorizationId)
    const opts = options.filter((o) => optionIds.includes(o.id))
    return (model?.basePrice ?? 0) + (mot?.price ?? 0) + opts.reduce((sum, o) => sum + o.price, 0)
  }, [models, motorizations, options])

  const value = React.useMemo(() => ({
    models, motorizations, options, isLoading,
    getModelById, getMotorizationById, getMotorizationsByModel,
    getOptionsByIds, calculateTotalPrice,
  }), [models, motorizations, options, isLoading, getModelById, getMotorizationById, getMotorizationsByModel, getOptionsByIds, calculateTotalPrice])

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  )
}

export function useCatalog(): CatalogContextValue {
  const ctx = React.useContext(CatalogContext)
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider")
  return ctx
}
