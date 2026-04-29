import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardStatCard from './components/DashboardStatCard'
import Button from '../../components/ui/Button'
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card'
import { getBusinessById } from '../businesses/api'
import { getPrimaryBusinessId, getStoredUser } from '../../lib/session'

type AdminBusiness = {
  id: number
  name: string
  products?: Array<{ id: number }>
  mediaAssets?: Array<{ id: number }>
  reviews?: Array<{ id: number }>
  promotions?: Array<{ id: number }>
  ratingAverage?: number
  reviewsCount?: number
}

export default function AdminDashboardPage() {
  const businessId = getPrimaryBusinessId()
  const navigate = useNavigate()
  const user = getStoredUser()
  const [business, setBusiness] = useState<AdminBusiness | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      if (!businessId) {
        setError('No hay un negocio asociado a esta cuenta administrativa.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const data = await getBusinessById<AdminBusiness>(businessId)
        setBusiness(data)
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            'No fue posible cargar el panel administrativo'
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [businessId])

  const stats = useMemo(() => {
    const products = business?.products?.length ?? 0
    const media = business?.mediaAssets?.length ?? 0
    const promotions = business?.promotions?.length ?? 0
    const reviews = business?.reviews?.length ?? 0

    return { products, media, promotions, reviews }
  }, [business])

  if (loading) {
    return <div className="space-y-8">Cargando dashboard...</div>
  }

  if (!businessId && user?.role === 'ADMIN') {
    return (
      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Super administrador
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Aún no has creado un negocio. Empieza por dar de alta la primera vitrina.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Crear primer negocio</CardTitle>
            <CardDescription>
              El alta crea el negocio, una portada principal y la estructura base del menú.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin/business/new')}>
              Crear negocio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Resumen operativo del negocio
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Vista real basada en el negocio asociado a tu sesión.
        </p>
      </div>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>No se pudo cargar el dashboard</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
              label="Productos"
              value={stats.products}
              hint="Catálogo real"
            />
            <DashboardStatCard
              label="Media"
              value={stats.media}
              hint="Recursos visuales"
            />
            <DashboardStatCard
              label="Promociones"
              value={stats.promotions}
              hint="Activas o históricas"
            />
            <DashboardStatCard
              label="Reviews"
              value={business?.reviewsCount ?? stats.reviews}
              trend={
                business?.ratingAverage
                  ? `${business.ratingAverage.toFixed(1)}/5`
                  : undefined
              }
              hint="Opinión visible"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Negocio actual</CardTitle>
                <CardDescription>
                  Datos tomados del backend, no de mocks.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  {business?.name || 'Sin negocio asociado'}
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  ID: {businessId ?? 'No disponible'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones rápidas</CardTitle>
                <CardDescription>
                  Tareas frecuentes para mantener el negocio actualizado.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {[
                  'Actualizar datos del negocio',
                  'Crear un nuevo producto',
                  'Subir imágenes recientes',
                  'Revisar promociones activas',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
