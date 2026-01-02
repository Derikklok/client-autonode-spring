
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { isAxiosError } from "axios"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"

type FormState = {
  email: string
  password: string
  remember: boolean
}

type FormErrors = Partial<Pick<FormState, "email" | "password">>

const rememberEmailKey = "autonode:remembered-email"

const Loginform = () => {
  const navigate = useNavigate()
  const { login, getDashboardPath } = useAuth()

  const [formState, setFormState] = useState<FormState>({
    email: "",
    password: "",
    remember: false,
  })
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const savedEmail = localStorage.getItem(rememberEmailKey)
    if (savedEmail) {
      setFormState((prev) => ({ ...prev, email: savedEmail, remember: true }))
    }
  }, [])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const validate = (): FormErrors => {
    const errors: FormErrors = {}

    if (!formState.email.trim()) {
      errors.email = "Enter your work email."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
      errors.email = "Enter a valid email address."
    }

    if (!formState.password) {
      errors.password = "Enter your password."
    } else if (formState.password.length < 8) {
      errors.password = "Password must be at least 8 characters."
    }

    return errors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setServerError(null)

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      const authResponse = await login(
        formState.email.trim(),
        formState.password
      )

      toast.success("Signed in successfully")

      if (formState.remember) {
        localStorage.setItem(rememberEmailKey, formState.email.trim())
      } else {
        localStorage.removeItem(rememberEmailKey)
      }

      const destination = getDashboardPath(authResponse.role)
      navigate(destination, { replace: true })
    } catch (error) {
      let message = "Unable to sign in right now. Please try again."
      if (isAxiosError<{ message?: string }>(error)) {
        message = error.response?.data?.message ?? message
      } else if (error instanceof Error && error.message) {
        message = error.message
      }
      setServerError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="w-full max-w-105"
      onSubmit={handleSubmit}
      noValidate
    >
      <Card className="border-border/50 bg-card/95 backdrop-blur-xl shadow-[0_35px_120px_-50px_rgba(17,25,40,0.9)]">
        <CardHeader className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-primary/80">
            AutoNode Access
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Welcome back, operator
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">
            Authenticate with your AutoNode credentials to unlock diagnostics,
            maintenance intelligence, and mission control tools.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FieldSet className="space-y-5">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Work email</FieldLabel>
                <FieldContent>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="e.g. alex@autonode.io"
                    value={formState.email}
                    onChange={handleChange}
                    autoComplete="email"
                    aria-invalid={Boolean(fieldErrors.email)}
                  />
                  <FieldDescription>
                    Use the credentials provided by your fleet administrator.
                  </FieldDescription>
                  {fieldErrors.email ? (
                    <FieldError>{fieldErrors.email}</FieldError>
                  ) : null}
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <FieldContent>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formState.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    aria-invalid={Boolean(fieldErrors.password)}
                  />
                  <FieldDescription>
                    Minimum 8 characters with a blend of letters and numbers.
                  </FieldDescription>
                  {fieldErrors.password ? (
                    <FieldError>{fieldErrors.password}</FieldError>
                  ) : null}
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input
                type="checkbox"
                name="remember"
                checked={formState.remember}
                onChange={handleChange}
                className="size-4 rounded border border-input bg-transparent accent-primary transition-colors"
              />
              Keep me signed in
            </label>
            <a
              href="mailto:support@autonode.ai"
              className="font-medium text-primary transition-colors hover:text-primary/80"
            >
              Need help signing in?
            </a>
          </div>

          {serverError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button
            type="submit"
            className="h-11 w-full rounded-full text-base font-semibold shadow-[0_10px_30px_-12px_rgba(98,102,209,0.8)]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Authenticating..." : "Access AutoNode"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Secure access for Admins, Fleet Managers, Mechanics, and Drivers.
          </p>
        </CardFooter>
      </Card>
    </form>
  )
}

export default Loginform