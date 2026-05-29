import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { Car, AlertCircle, Check } from "lucide-react"
import * as React from "react"

import { loginSchema, type LoginFormData } from "@/lib/schemas"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

const FEATURES = [
  "Configura la tua auto dei sogni",
  "Preventivi personalizzati in tempo reale",
  "Gestione completa dell'ordine",
]

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
    <div className="flex min-h-screen">
      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden bg-[oklch(0.07_0.008_248)]">
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(oklch(1 0 0 / 3%) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.09_0.012_248)] via-transparent to-[oklch(0.06_0.005_248)]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/6 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/4 rounded-full blur-3xl pointer-events-none" />

        {/* Brand logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary shadow-lg shadow-primary/40">
            <Car className="size-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-[13px] font-black uppercase tracking-[0.14em] text-white">AutoConfig</span>
            <p className="text-[10px] text-primary font-semibold tracking-widest uppercase -mt-0.5">Pro Configurator</p>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col gap-10">
          {/* Large car SVG illustration */}
          <div className="flex justify-start">
            <svg viewBox="0 0 460 185" className="w-80 opacity-20" fill="white">
              <path d="M370,115 L345,65 Q332,42 298,42 L162,42 Q128,42 115,65 L90,115 L68,115 Q55,115 55,127 L55,143 Q55,151 68,151 L80,151 Q80,168 97,168 Q114,168 114,151 L346,151 Q346,168 363,168 Q380,168 380,151 L392,151 Q405,151 405,143 L405,127 Q405,115 392,115 Z" />
              <path d="M142,90 L158,62 Q164,52 178,52 L282,52 Q296,52 302,62 L318,90 Z" opacity="0.5" />
            </svg>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Piattaforma di Configurazione
            </p>
            <h2 className="text-[3rem] font-black text-white leading-[1.0] tracking-tight">
              Car<br />
              <span className="text-primary">Tuning</span><br />
              Pro
            </h2>
            <p className="mt-5 text-[oklch(0.60_0_0)] text-[0.9rem] leading-relaxed max-w-xs">
              Scegli modello, motorizzazione e optional. Richiedi un preventivo personalizzato in pochi click.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-8">
            <div>
              <p className="text-2xl font-black text-primary">€5.000</p>
              <p className="text-[11px] font-medium text-[oklch(0.50_0_0)] uppercase tracking-wide mt-0.5">Deposito min.</p>
            </div>
            <div className="w-px bg-border/50" />
            <div>
              <p className="text-2xl font-black text-white">24/7</p>
              <p className="text-[11px] font-medium text-[oklch(0.50_0_0)] uppercase tracking-wide mt-0.5">Supporto attivo</p>
            </div>
          </div>

          {/* Features list */}
          <div className="flex flex-col gap-3">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/40">
                  <Check className="size-3 text-primary" />
                </div>
                <span className="text-[oklch(0.70_0_0)] text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[oklch(0.30_0_0)] text-xs">© 2024 AutoConfig. Tutti i diritti riservati.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="lg:hidden mb-10 flex flex-col items-center gap-2 text-center">
            <div className="flex size-12 items-center justify-center rounded-md bg-primary shadow-lg shadow-primary/40">
              <Car className="size-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-[0.12em]">AutoConfig</h1>
              <p className="text-[10px] text-primary font-semibold tracking-widest uppercase">Pro Configurator</p>
            </div>
          </div>

          <div className="mb-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-2">Accesso</p>
            <h1 className="text-3xl font-black tracking-tight">Bentornato</h1>
            <p className="text-muted-foreground mt-1.5 text-sm">Inserisci le credenziali per accedere</p>
          </div>

          {serverError && (
            <Alert variant="destructive" className="mb-5">
              <AlertCircle className="size-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                className="h-11 rounded-lg"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                className="h-11 rounded-lg"
                {...register("password")}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-full shadow-md shadow-primary/30 font-bold tracking-wide mt-1"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? "Accesso in corso…" : "Accedi"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Non hai un account?{" "}
              <Link to="/register" className="font-bold text-primary hover:underline underline-offset-4">
                Registrati
              </Link>
            </p>
          </form>

          <div className="mt-7 rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">Account di test</p>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-muted-foreground">
                Admin:{" "}
                <span className="font-mono text-[11px] text-foreground">admin@autoconfig.it</span>
                {" / "}
                <span className="font-mono text-[11px] text-foreground">admin123</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Utente:{" "}
                <span className="font-mono text-[11px] text-foreground">mario@example.com</span>
                {" / "}
                <span className="font-mono text-[11px] text-foreground">mario123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
