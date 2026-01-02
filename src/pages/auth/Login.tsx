import Loginform from "@/components/auth/Login-form"
import fleetImage from "@/assets/fleet.png"
import bgImage from "@/assets/bg.jpg"

const highlights = [
  "Track live performance metrics to keep every asset mission-ready.",
  "Detect mechanical anomalies early with predictive diagnostics.",
  "Coordinate scheduled and preventive maintenance in one dashboard.",
]

const Login = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-background via-background/85 to-background">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute -left-[15%] top-[-20%] h-105 w-105 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-[-25%] right-[-10%] h-120 w-120 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(80,90,255,0.18),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(80,90,255,0.22),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(12,18,36,0.25)_0%,rgba(12,18,36,0.6)_40%,rgba(12,18,36,0.25)_100%)] dark:bg-[linear-gradient(135deg,rgba(12,15,28,0.6),rgba(12,15,28,0.35))]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-5 py-16 sm:px-8 lg:flex-row lg:items-stretch lg:justify-between">
        <div className="flex max-w-xl flex-1 flex-col justify-center gap-10 text-center text-foreground/90 lg:text-left">
          <div className="mx-auto flex max-w-lg flex-col items-center gap-4 lg:mx-0 lg:items-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-primary/80 shadow-sm">
              Intelligence in Motion
            </span>
            <h1 className="text-balance font-black leading-tight tracking-tight text-5xl sm:text-6xl md:text-7xl">
              <span className="bg-linear-to-r from-primary via-accent to-primary/80 bg-clip-text text-transparent">
                AutoNode
              </span>
            </h1>
            <p className="text-balance text-lg font-medium text-muted-foreground sm:text-xl">
              Command every fleet decision from a single control center engineered for precision and speed.
            </p>
          </div>
          <figure className="relative mx-auto flex w-full max-w-lg items-center justify-center overflow-hidden rounded-3xl border border-primary/20 bg-background/80 p-4 shadow-[0_25px_80px_-45px_rgba(15,23,42,0.7)] backdrop-blur lg:mx-0">
            <div className="pointer-events-none absolute -left-10 top-1/2 size-40 -translate-y-1/2 rounded-full bg-primary/25 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 top-6 size-32 rounded-full bg-accent/20 blur-3xl" />
            <img
              src={fleetImage}
              alt="AutoNode fleet diagnostics interface"
              className="relative w-full rounded-2xl border border-border/40 object-cover"
              loading="lazy"
            />
          </figure>
          <ul className="grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
            {highlights.map((item) => (
              <li
                key={item}
                className="relative flex items-start gap-3 rounded-2xl border border-foreground/5 bg-background/60 px-4 py-3 text-sm shadow-[0_12px_32px_-24px_rgba(15,23,42,0.6)] backdrop-blur"
              >
                <span className="mt-1 inline-flex size-2.5 rounded-full bg-primary shadow-[0_0_0_4px_rgba(99,102,241,0.25)]" />
                <span className="text-foreground/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 flex w-full flex-1 items-center justify-center lg:mt-0">
          <Loginform />
        </div>
      </div>
    </div>
  )
}

export default Login