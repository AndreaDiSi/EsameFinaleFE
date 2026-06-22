export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(dateString))
}
