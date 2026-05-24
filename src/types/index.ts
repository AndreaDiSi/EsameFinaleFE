export type Role = "admin" | "user"

export interface User {
  id: string
  email: string
  name: string
  role: Role
  createdAt: string
}

export type FuelType = "petrol" | "diesel" | "electric" | "hybrid"
export type OptionCategory = "color" | "interior" | "technology" | "safety" | "comfort"
export type CarCategory = "sedan" | "suv" | "coupe" | "hatchback" | "wagon"

export interface CarModel {
  id: string
  name: string
  brand: string
  category: CarCategory
  basePrice: number
  description: string
  imageColor: string
}

export interface Motorization {
  id: string
  modelId: string
  name: string
  fuelType: FuelType
  power: number
  torque: number
  acceleration: number
  consumption: string
  price: number
}

export interface CarOption {
  id: string
  name: string
  description: string
  category: OptionCategory
  price: number
  color?: string
  incompatibleWith: string[]
  requiredMotorizations?: string[]
}

export interface Configuration {
  id: string
  userId: string
  name: string
  modelId: string
  motorizationId: string
  optionIds: string[]
  totalPrice: number
  createdAt: string
  updatedAt: string
}

export type QuoteStatus = "pending" | "approved" | "rejected" | "expired"

export interface Quote {
  id: string
  configurationId: string
  userId: string
  totalPrice: number
  discount: number
  finalPrice: number
  status: QuoteStatus
  notes: string
  adminNotes: string
  createdAt: string
  updatedAt: string
  expiresAt: string
}
