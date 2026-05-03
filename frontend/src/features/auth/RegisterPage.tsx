import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import RegisterForm, { type RegisterFormValues } from './components/RegisterForm'
import { register } from './api'
import { trackEvent } from '../../lib/analytics'
import { getErrorMessage } from '../../lib/httpError'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(values: RegisterFormValues) {
    setLoading(true)
    setError('')

    try {
      const result = await register(
        values.fullName,
        values.email,
        values.password
      )

      const token = result?.token
      const user = result?.user
      const hasAdminAccess =
        user?.role === 'ADMIN' || user?.role === 'BUSINESS_ADMIN'

      if (token) {
        localStorage.setItem('auth_token', token)
      }

      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user))
      }

      void trackEvent({
        eventType: 'REGISTER_SUCCESS',
        sourceScreen: 'register',
        metadata: { role: user?.role ?? null },
      })

      navigate(hasAdminAccess ? '/admin' : '/businesses')
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'No fue posible registrar el usuario'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-16">
        <div className="max-w-xl">
          <Link
            to="/"
            className="mb-5 inline-flex text-sm font-medium text-orange-600 transition hover:text-orange-700"
          >
            ← Volver al inicio
          </Link>

          <p className="mb-3 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
            Registro
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Crea tu cuenta y empieza a explorar mejor.
          </h1>

          <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
            Regístrate para descubrir negocios, revisar productos, acceder a
            promociones y continuar tu experiencia dentro de la plataforma.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                Acceso más claro
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Guarda tu sesión y navega con menos fricción.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                Mejor experiencia
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Interactúa con el ecosistema y avanza más rápido hacia la acción.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                Base para escalar
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Más adelante podrás conectar beneficios, favoritos y funciones de negocio.
              </p>
            </div>
          </div>
        </div>

        <div>
          <RegisterForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            title="Crear cuenta"
            description="Completa tus datos para registrarte en la plataforma."
          />
        </div>
      </section>
    </main>
  )
}
