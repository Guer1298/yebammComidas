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

export interface LoginFormValues {
  email: string
  password: string
}

interface LoginFormProps {
  onSubmit?: (values: LoginFormValues) => void
  loading?: boolean
  error?: string
  title?: string
  description?: string
}

export default function LoginForm({
  onSubmit,
  loading = false,
  error = '',
  title = 'Inicia sesión',
  description = 'Accede a tu cuenta para continuar explorando, interactuar o administrar tu negocio.',
}: LoginFormProps) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<keyof LoginFormValues, string>>>({})

  function validate() {
    const nextErrors: Partial<Record<keyof LoginFormValues, string>> = {}

    if (!email.trim()) {
      nextErrors.email = 'El correo es obligatorio.'
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = 'Ingresa un correo válido.'
    }

    if (!password.trim()) {
      nextErrors.password = 'La contraseña es obligatoria.'
    }

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validate()) return

    onSubmit?.({
      email: email.trim(),
      password,
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
            autoComplete="current-password"
          />

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <Link
              to="/register"
              className="text-sm font-medium text-orange-600 transition hover:text-orange-700"
            >
              Crear cuenta
            </Link>

            <a
              href="#"
              className="text-sm text-slate-500 transition hover:text-slate-700"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Iniciar sesión
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}