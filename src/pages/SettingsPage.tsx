import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { User, Moon, Sun, Monitor, Check, Shield } from "lucide-react"
import { z } from "zod"

import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/components/theme-provider"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

const profileSchema = z.object({
  name: z.string().min(2, "Minimo 2 caratteri"),
  email: z.string().email("Email non valida"),
})
type ProfileFormData = z.infer<typeof profileSchema>

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function SettingsPage() {
  const { user, updateCurrentUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const [success, setSuccess] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  })

  async function onSubmit(data: ProfileFormData) {
    if (!user) return
    setServerError(null)
    try {
      const updated = await api.updateProfile(data.name, data.email)
      updateCurrentUser(updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Errore nel salvataggio")
    }
  }

  const themeOptions = [
    { value: "light", label: "Chiaro", icon: <Sun className="size-4" /> },
    { value: "dark", label: "Scuro", icon: <Moon className="size-4" /> },
    { value: "system", label: "Sistema", icon: <Monitor className="size-4" /> },
  ] as const

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Impostazioni</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gestisci il tuo profilo e le preferenze</p>
      </div>

      {/* Profile hero */}
      <Card className="overflow-hidden">
        <div className="h-16 bg-gradient-to-br from-primary/80 via-primary to-[oklch(0.4_0.22_255)]" />
        <CardContent className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-8 mb-5">
            <Avatar className="size-16 ring-4 ring-background shadow-md">
              <AvatarFallback className="text-xl font-bold bg-primary/15 text-primary">
                {user ? getInitials(user.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-lg leading-none">{user?.name}</p>
                {user?.role === "admin" && (
                  <Badge variant="info" className="gap-1">
                    <Shield className="size-3" />
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
            </div>
          </div>

          {success && (
            <Alert variant="success" className="mb-4">
              <Check className="size-4" />
              <AlertDescription>Profilo aggiornato con successo!</AlertDescription>
            </Alert>
          )}

          {serverError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="shadow-sm shadow-primary/20">
                {isSubmitting ? "Salvataggio…" : "Salva modifiche"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Profilo section header */}
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <User className="size-4" />
        Preferenze
      </div>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tema dell'interfaccia</CardTitle>
          <CardDescription>Scegli l'aspetto che preferisci</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {themeOptions.map((opt) => {
              const isSelected = theme === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex flex-1 flex-col items-center gap-2.5 rounded-xl border-2 p-4 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm shadow-primary/15"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <div className={isSelected ? "text-primary" : "text-muted-foreground"}>
                    {opt.icon}
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                    {opt.label}
                  </span>
                  {isSelected && (
                    <div className="flex size-4 items-center justify-center rounded-full bg-primary">
                      <Check className="size-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
