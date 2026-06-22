import * as React from "react"
import type { CarModel, Motorization, CarOption } from "@/types"
import { db, CAR_OPTIONS } from "@/lib/mock-data"

export type ConfiguratorStep = 1 | 2 | 3 | 4

interface ConfiguratorState {
  step: ConfiguratorStep
  selectedModel: CarModel | null
  selectedMotorization: Motorization | null
  selectedOptionIds: string[]
  configName: string
  editingConfigId: string | null
}

interface ConfiguratorContextValue extends ConfiguratorState {
  setStep: (step: ConfiguratorStep) => void
  selectModel: (model: CarModel) => void
  selectMotorization: (mot: Motorization) => void
  toggleOption: (optionId: string) => void
  setConfigName: (name: string) => void
  reset: () => void
  loadConfiguration: (configId: string) => void
  totalPrice: number
  availableOptions: CarOption[]
  isOptionCompatible: (optionId: string) => boolean
}

const ConfiguratorContext = React.createContext<ConfiguratorContextValue | undefined>(undefined)

function isOptionValidForMotorization(optionId: string, motorizationId: string): boolean {
  const opt = CAR_OPTIONS.find((o) => o.id === optionId)
  if (!opt?.requiredMotorizations) return true
  return opt.requiredMotorizations.includes(motorizationId)
}

const initialState: ConfiguratorState = {
  step: 1,
  selectedModel: null,
  selectedMotorization: null,
  selectedOptionIds: [],
  configName: "",
  editingConfigId: null,
}

export function ConfiguratorProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [state, setState] = React.useState<ConfiguratorState>(initialState)

  function setStep(step: ConfiguratorStep) {
    setState((s) => ({ ...s, step }))
  }

  function selectModel(model: CarModel) {
    setState((s) => ({
      ...s,
      selectedModel: model,
      selectedMotorization: null,
      selectedOptionIds: [],
      step: 2,
    }))
  }

  function selectMotorization(mot: Motorization) {
    setState((s) => ({
      ...s,
      selectedMotorization: mot,
      selectedOptionIds: s.selectedOptionIds.filter((id) => isOptionValidForMotorization(id, mot.id)),
      step: 3,
    }))
  }

  function toggleOption(optionId: string) {
    setState((s) => {
      const isSelected = s.selectedOptionIds.includes(optionId)
      if (isSelected) {
        return { ...s, selectedOptionIds: s.selectedOptionIds.filter((id) => id !== optionId) }
      }
      const opt = CAR_OPTIONS.find((o) => o.id === optionId)
      if (!opt) return s
      const filtered = s.selectedOptionIds.filter((id) => !opt.incompatibleWith.includes(id))
      return { ...s, selectedOptionIds: [...filtered, optionId] }
    })
  }

  function setConfigName(name: string) {
    setState((s) => ({ ...s, configName: name }))
  }

  function reset() {
    setState(initialState)
  }

  function loadConfiguration(configId: string) {
    const config = db.getConfigurationById(configId)
    if (!config) return
    const model = db.getModelById(config.modelId)
    const mot = db.getMotorizationById(config.motorizationId)
    if (!model || !mot) return
    setState({
      step: 1,
      selectedModel: model,
      selectedMotorization: mot,
      selectedOptionIds: config.optionIds,
      configName: config.name,
      editingConfigId: configId,
    })
  }

  const totalPrice = React.useMemo(() => {
    if (!state.selectedModel || !state.selectedMotorization) return 0
    return db.calculateTotalPrice(state.selectedModel.id, state.selectedMotorization.id, state.selectedOptionIds)
  }, [state.selectedModel, state.selectedMotorization, state.selectedOptionIds])

  const availableOptions = React.useMemo(() => {
    if (!state.selectedMotorization) return CAR_OPTIONS
    return CAR_OPTIONS.filter((opt) => {
      if (!opt.requiredMotorizations) return true
      return opt.requiredMotorizations.includes(state.selectedMotorization!.id)
    })
  }, [state.selectedMotorization])

  function isOptionCompatible(optionId: string): boolean {
    return !state.selectedOptionIds.some((id) => {
      const opt = CAR_OPTIONS.find((o) => o.id === id)
      return opt?.incompatibleWith.includes(optionId)
    })
  }

  return (
    <ConfiguratorContext.Provider
      value={{ ...state, setStep, selectModel, selectMotorization, toggleOption, setConfigName, reset, loadConfiguration, totalPrice, availableOptions, isOptionCompatible }}
    >
      {children}
    </ConfiguratorContext.Provider>
  )
}

export function useConfigurator(): ConfiguratorContextValue {
  const ctx = React.useContext(ConfiguratorContext)
  if (!ctx) throw new Error("useConfigurator must be used within ConfiguratorProvider")
  return ctx
}
