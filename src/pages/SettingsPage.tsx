import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { User, Moon, Sun, Monitor, Check } from "lucide-react"
import { z } from "zod"

import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/components/theme-provider"
import { db } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  })

  function onSubmit(data: ProfileFormData) {
    if (!user) return
    const updated = db.updateUser(user.id, { name: data.name, email: data.email })
    updateCurrentUser(updated)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const themeOptions = [
    { value: "light", label: "Chiaro", icon: <Sun className="size-4" /> },
    { value: "dark", label: "Scuro", icon: <Moon className="size-4" /> },
    { value: "system", label: "Sistema", icon: <Monitor className="size-4" /> },
  ] as const

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Impostazioni</h1>
        <p className="text-sm text-muted-foreground">Gestisci il tuo profilo e le preferenze</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4" />
            Profilo utente
          </CardTitle>
          <CardDescription>Aggiorna le tue informazioni personali</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="size-16">
              <AvatarFallback className="text-xl">{user ? getInitials(user.name) : "?"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">Ruolo: {user?.role}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {success && (
              <Alert variant="success">
                <Check className="size-4" />
                <AlertDescription>Profilo aggiornato con successo!</AlertDescription>
              </Alert>
            )}
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvataggio…" : "Salva modifiche"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tema</CardTitle>
          <CardDescription>Scegli l'aspetto dell'interfaccia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  theme === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                {opt.icon}
                <span className="text-sm font-medium">{opt.label}</span>
                {theme === opt.value && (
                  <div className="flex size-4 items-center justify-center rounded-full bg-primary">
                    <Check className="size-2.5 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
