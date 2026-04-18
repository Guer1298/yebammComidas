import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card'

export interface RegisterFormValues {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

interface RegisterFormProps {
  onSubmit?: (values: RegisterFormValues) => void
  loading?: boolean
  error?: string
  title?: string
  description?: string
}

export default function RegisterForm({
  onSubmit,
  loading = false,
  error = '',
  title = 'Crea tu cuenta',
  description = 'Regístrate para guardar favoritos, acceder a beneficios e interactuar dentro de la plataforma.',
}: RegisterFormProps) {
  const [fullName, setFullName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<keyof RegisterFormValues, string>>
  >({})

  function validate() {
    const nextErrors: Partial<Record<keyof RegisterFormValues, string>> = {}

    if (!fullName.trim()) {
      nextErrors.fullName = 'El nombre es obligatorio.'
    }

    if (!email.trim()) {
      nextErrors.email = 'El correo es obligatorio.'
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = 'Ingresa un correo válido.'
    }

    if (!password.trim()) {
      nextErrors.password = 'La contraseña es obligatoria.'
    } else if (password.length < 6) {
      nextErrors.password = 'La contraseña debe tener al menos 6 caracteres.'
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Debes confirmar la contraseña.'
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Las contraseñas no coinciden.'
    }

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validate()) return

    onSubmit?.({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      confirmPassword,
    })
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre"
            error={fieldErrors.fullName}
            autoComplete="name"
          />

          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            error={fieldErrors.email}
            autoComplete="email"
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            error={fieldErrors.password}
            autoComplete="new-password"
          />

          <Input
            label="Confirmar contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="********"
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
          />

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="text-sm text-slate-500">
            Al registrarte aceptas los términos básicos de uso de la plataforma.
          </div>

          <div className="flex items-center justify-between gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-orange-600 transition hover:text-orange-700"
            >
              Ya tengo cuenta
            </Link>
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Crear cuenta
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}