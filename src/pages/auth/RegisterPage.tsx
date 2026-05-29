import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { Car, AlertCircle, ArrowRight } from "lucide-react"
import * as React from "react"

import { registerSchema, type RegisterFormData } from "@/lib/schemas"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

const STATS = [
  { label: "Modelli", value: "10+" },
  { label: "Optional", value: "50+" },
  { label: "Preventivi", value: "Gratis" },
  { label: "Configurazioni", value: "∞" },
]

export function RegisterPage() {
  const { register: registerUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true })
  }, [isAuthenticated, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(data: RegisterFormData) {
    setServerError(null)
    try {
      await registerUser(data.name, data.email, data.password)
      navigate("/dashboard")
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Errore durante la registrazione")
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
        {/* Speed lines */}
        <svg
          viewBox="0 0 600 400"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]"
          preserveAspectRatio="none"
          fill="none"
          stroke="white"
          strokeWidth="1"
        >
          <line x1="0" y1="400" x2="600" y2="0" />
          <line x1="80" y1="400" x2="600" y2="40" />
          <line x1="200" y1="400" x2="600" y2="120" />
          <line x1="0" y1="300" x2="500" y2="0" />
        </svg>
        {/* Glow blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/6 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/4 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
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
          {/* Car SVG watermark */}
          <svg viewBox="0 0 460 185" className="w-72 opacity-[0.18] fill-white">
            <path d="M370,115 L345,65 Q332,42 298,42 L162,42 Q128,42 115,65 L90,115 L68,115 Q55,115 55,127 L55,143 Q55,151 68,151 L80,151 Q80,168 97,168 Q114,168 114,151 L346,151 Q346,168 363,168 Q380,168 380,151 L392,151 Q405,151 405,143 L405,127 Q405,115 392,115 Z" />
            <path d="M142,90 L158,62 Q164,52 178,52 L282,52 Q296,52 302,62 L318,90 Z" opacity="0.5" />
          </svg>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Inizia ora — è gratis
            </p>
            <h2 className="text-[3rem] font-black text-white leading-[1.0] tracking-tight">
              Il tuo<br />
              <span className="text-primary">configuratore</span><br />
              personalizzato
            </h2>
            <p className="mt-5 text-[oklch(0.60_0_0)] text-[0.9rem] leading-relaxed max-w-xs">
              Crea un account per salvare le tue configurazioni, richiedere preventivi e tracciare i tuoi ordini.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {STATS.map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl bg-white/5 border border-white/8 p-4 relative overflow-hidden"
              >
                <p className="text-2xl font-black text-primary leading-none">{value}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[oklch(0.50_0_0)] mt-1.5">{label}</p>
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
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-2">Registrazione</p>
            <h1 className="text-3xl font-black tracking-tight">Crea il tuo account</h1>
            <p className="text-muted-foreground mt-1.5 text-sm">Inizia a configurare la tua auto dei sogni</p>
          </div>

          {serverError && (
            <Alert variant="destructive" className="mb-5">
              <AlertCircle className="size-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide">Nome completo</Label>
              <Input
                id="name"
                placeholder="Mario Rossi"
                autoComplete="name"
                aria-invalid={!!errors.name}
                className="h-11 rounded-lg"
                {...register("name")}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

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
                placeholder="Minimo 6 caratteri"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                className="h-11 rounded-lg"
                {...register("password")}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wide">Conferma password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ripeti la password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                className="h-11 rounded-lg"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-full shadow-md shadow-primary/30 font-bold tracking-wide gap-2 mt-1"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? "Registrazione in corso…" : (
                <>
                  Crea account
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Hai già un account?{" "}
              <Link to="/login" className="font-bold text-primary hover:underline underline-offset-4">
                Accedi
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
