import { useState, type ChangeEvent, type FormEvent } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/components/theme-context"
import type { UserRole } from "@/types/auth.types"

type CreateUserFormState = {
  email: string
  password: string
  confirmPassword: string
  role: UserRole | ""
}

type CreateUserFormErrors = {
  email?: string
  password?: string
  confirmPassword?: string
  role?: string
}

type CreateUserProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AVAILABLE_ROLES: { value: UserRole; label: string }[] = [
  { value: "ADMIN", label: "Administrator" },
  { value: "FLEET_MANAGER", label: "Fleet Manager" },
  { value: "MECHANIC", label: "Mechanic" },
  { value: "DRIVER", label: "Driver" },
]

// Password strength calculator
const calculatePasswordStrength = (password: string) => {
  if (!password) return 0
  
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z\d]/.test(password)) strength++
  
  return Math.min(strength, 4)
}

const getPasswordStrengthLabel = (strength: number) => {
  const labels = ["Weak", "Fair", "Good", "Strong", "Very Strong"]
  return labels[strength] || "Weak"
}

const getPasswordStrengthColor = (strength: number) => {
  const colors = [
    "bg-red-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-emerald-500",
  ]
  return colors[strength] || "bg-slate-300"
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [formState, setFormState] = useState<CreateUserFormState>({
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  })
  const [fieldErrors, setFieldErrors] = useState<CreateUserFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  const passwordStrength = calculatePasswordStrength(formState.password)
  const passwordsMatch = formState.password === formState.confirmPassword && formState.password.length > 0

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear error on change
    if (fieldErrors[name as keyof CreateUserFormState]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleBlur = (fieldName: string) => {
    setTouchedFields((prev) => new Set(prev).add(fieldName))
  }

  const handleRoleChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      role: value as UserRole,
    }))
    if (fieldErrors.role) {
      setFieldErrors((prev) => ({
        ...prev,
        role: undefined,
      }))
    }
  }

  const validate = (): CreateUserFormErrors => {
    const errors: CreateUserFormErrors = {}

    if (!formState.email.trim()) {
      errors.email = "Email is required."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
      errors.email = "Enter a valid email address."
    }

    if (!formState.password) {
      errors.password = "Password is required."
    } else if (formState.password.length < 8) {
      errors.password = "Password must be at least 8 characters."
    }

    if (!formState.confirmPassword) {
      errors.confirmPassword = "Please confirm your password."
    } else if (formState.password !== formState.confirmPassword) {
      errors.confirmPassword = "Passwords do not match."
    }

    if (!formState.role) {
      errors.role = "Role is required."
    }

    return errors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      // TODO: Call API to create user
      // await AuthService.register({
      //   email: formState.email,
      //   password: formState.password,
      //   role: formState.role,
      // })

      toast.success(`User ${formState.email} created successfully`, {
        description: `Role: ${AVAILABLE_ROLES.find(r => r.value === formState.role)?.label}`
      })
      setFormState({ email: "", password: "", confirmPassword: "", role: "" })
      setTouchedFields(new Set())
      onOpenChange(false)
    } catch (error) {
      let message = "Failed to create user. Please try again."
      if (error instanceof Error) {
        message = error.message
      }
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-106.25 ${isDark ? "" : ""}`}>
        <DialogHeader className="space-y-2">
          <DialogTitle className={isDark ? "text-2xl" : "text-2xl text-slate-900"}>Create user account</DialogTitle>
          <DialogDescription className={isDark ? "text-slate-400" : "text-slate-600"}>
            Register a new user by providing their email, password, and role assignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Email Field */}
          <Field>
            <FieldLabel htmlFor="email" className={isDark ? "" : "text-slate-900"}>
              Email address <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jane.doe@company.com"
                value={formState.email}
                onChange={handleChange}
                onBlur={() => handleBlur("email")}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.email && touchedFields.has("email"))}
                className={isDark ? "" : "border-slate-300 bg-slate-50"}
              />
              {fieldErrors.email && touchedFields.has("email") && (
                <FieldError>{fieldErrors.email}</FieldError>
              )}
              {!fieldErrors.email && formState.email && (
                <div className={`text-xs ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                  ✓ Email looks good
                </div>
              )}
            </FieldContent>
          </Field>

          {/* Password Field */}
          <Field>
            <FieldLabel htmlFor="password" className={isDark ? "" : "text-slate-900"}>
              Password <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formState.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur("password")}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.password && touchedFields.has("password"))}
                  className={`pr-10 ${isDark ? "" : "border-slate-300 bg-slate-50"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${
                    isDark
                      ? "text-slate-500 hover:text-slate-400"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {formState.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-700/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor(
                          passwordStrength
                        )}`}
                        style={{
                          width: `${((passwordStrength + 1) / 5) * 100}%`,
                        }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 1
                        ? isDark
                          ? "text-red-400"
                          : "text-red-600"
                        : passwordStrength === 2
                        ? isDark
                          ? "text-amber-400"
                          : "text-amber-600"
                        : isDark
                        ? "text-emerald-400"
                        : "text-emerald-600"
                    }`}>
                      {getPasswordStrengthLabel(passwordStrength)}
                    </span>
                  </div>
                  <ul className={`text-xs space-y-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    <li className={formState.password.length >= 8 ? (isDark ? "text-emerald-400" : "text-emerald-600") : ""}>
                      {formState.password.length >= 8 ? "✓" : "○"} At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(formState.password) && /[a-z]/.test(formState.password) ? (isDark ? "text-emerald-400" : "text-emerald-600") : ""}>
                      {/[A-Z]/.test(formState.password) && /[a-z]/.test(formState.password) ? "✓" : "○"} Uppercase and lowercase letters
                    </li>
                    <li className={/\d/.test(formState.password) ? (isDark ? "text-emerald-400" : "text-emerald-600") : ""}>
                      {/\d/.test(formState.password) ? "✓" : "○"} At least one number
                    </li>
                    <li className={/[^a-zA-Z\d]/.test(formState.password) ? (isDark ? "text-emerald-400" : "text-emerald-600") : ""}>
                      {/[^a-zA-Z\d]/.test(formState.password) ? "✓" : "○"} Special character (!@#$%^&*)
                    </li>
                  </ul>
                </div>
              )}

              {fieldErrors.password && touchedFields.has("password") && (
                <FieldError>{fieldErrors.password}</FieldError>
              )}
            </FieldContent>
          </Field>

          {/* Confirm Password Field */}
          <Field>
            <FieldLabel htmlFor="confirmPassword" className={isDark ? "" : "text-slate-900"}>
              Confirm password <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formState.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur("confirmPassword")}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.confirmPassword && touchedFields.has("confirmPassword"))}
                  className={`pr-10 ${isDark ? "" : "border-slate-300 bg-slate-50"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${
                    isDark
                      ? "text-slate-500 hover:text-slate-400"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              {formState.confirmPassword && (
                <div className={`text-xs mt-2 ${
                  passwordsMatch
                    ? isDark
                      ? "text-emerald-400"
                      : "text-emerald-600"
                    : isDark
                    ? "text-amber-400"
                    : "text-amber-600"
                }`}>
                  {passwordsMatch ? "✓ Passwords match" : "✗ Passwords don't match"}
                </div>
              )}

              {fieldErrors.confirmPassword && touchedFields.has("confirmPassword") && (
                <FieldError>{fieldErrors.confirmPassword}</FieldError>
              )}
            </FieldContent>
          </Field>

          {/* Role Field */}
          <Field>
            <FieldLabel htmlFor="role" className={isDark ? "" : "text-slate-900"}>
              User role <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <Select value={formState.role} onValueChange={handleRoleChange} disabled={isSubmitting}>
                <SelectTrigger 
                  id="role" 
                  aria-invalid={Boolean(fieldErrors.role && touchedFields.has("role"))}
                  className={isDark ? "" : "border-slate-300 bg-slate-50"}
                >
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ROLES.map((roleOption) => (
                    <SelectItem key={roleOption.value} value={roleOption.value}>
                      {roleOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription className={isDark ? "text-slate-500" : "text-slate-600"}>
                Assign the appropriate role and permissions for this user.
              </FieldDescription>
              {fieldErrors.role && touchedFields.has("role") && (
                <FieldError>{fieldErrors.role}</FieldError>
              )}
            </FieldContent>
          </Field>

          {/* Form Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setFormState({ email: "", password: "", confirmPassword: "", role: "" })
                setFieldErrors({})
                setTouchedFields(new Set())
              }}
              disabled={isSubmitting}
              className={isDark ? "" : "border-slate-300 text-slate-900 hover:bg-slate-100"}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formState.email || !formState.password || !formState.confirmPassword || !formState.role}
              className={isDark ? "" : "bg-amber-500 text-white hover:bg-amber-700"}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </span>
              ) : (
                "Create user"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
