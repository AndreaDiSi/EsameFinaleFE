import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { Car, AlertCircle } from "lucide-react"
import * as React from "react"

import { loginSchema, type LoginFormData } from "@/lib/schemas"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true })
  }, [isAuthenticated, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginFormData) {
    setServerError(null)
    try {
      await login(data.email, data.password)
      navigate("/dashboard")
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Errore di accesso")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary">
            <Car className="size-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">AutoConfig</h1>
          <p className="text-sm text-muted-foreground">Configuratore Auto &amp; Preventivi</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Accedi</CardTitle>
            <CardDescription>Inserisci le tue credenziali per continuare</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              {serverError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@example.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
                {isSubmitting ? "Accesso in corso…" : "Accedi"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Non hai un account?{" "}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  Registrati
                </Link>
              </p>
            </form>

            <div className="mt-4 rounded-lg border border-dashed border-border p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Account di test:</p>
              <p className="text-xs text-muted-foreground">Admin: <span className="font-mono">admin@autoconfig.it</span> / <span className="font-mono">admin123</span></p>
              <p className="text-xs text-muted-foreground">Utente: <span className="font-mono">mario@example.com</span> / <span className="font-mono">mario123</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
