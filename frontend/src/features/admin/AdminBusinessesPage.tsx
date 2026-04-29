import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaArrowRight,
  FaMagnifyingGlass,
  FaTrash,
} from 'react-icons/fa6'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card'
import { buildVisualImageDataUrl } from '../../lib/visualImage'
import {
  deleteBusinessById,
  listBusinessesForAdmin,
  type BusinessListItem,
} from '../businesses/api'
import {
  getStoredUser,
  removeBusinessIdFromStoredUser,
} from '../../lib/session'

export default function AdminBusinessesPage() {
  const user = getStoredUser()
  const isSuperAdmin = user?.role === 'ADMIN'
  const [businesses, setBusinesses] = useState<BusinessListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (!isSuperAdmin) return

    async function loadBusinesses() {
      try {
        setLoading(true)
        setError('')
        setBusinesses(await listBusinessesForAdmin())
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            'No fue posible cargar los negocios'
        )
      } finally {
        setLoading(false)
      }
    }

    loadBusinesses()
  }, [isSuperAdmin])

  const filteredBusinesses = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) return businesses

    return businesses.filter((business) => {
      const searchable = [
        business.name,
        business.category,
        business.description,
        business.city,
        business.address,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchable.includes(term)
    })
  }, [businesses, search])

  async function handleDelete(business: BusinessListItem) {
    const confirmed = window.confirm(
      `¿Eliminar "${business.name}"? Esta acción borrará el negocio y todo su contenido asociado.`
    )

    if (!confirmed) return

    try {
      setDeletingId(business.id)
      await deleteBusinessById(business.id)
      removeBusinessIdFromStoredUser(business.id)
      setBusinesses((current) => current.filter((item) => item.id !== business.id))
    } catch (err: any) {
      window.alert(
        err?.response?.data?.message ||
          'No fue posible eliminar el negocio'
      )
    } finally {
      setDeletingId(null)
    }
  }

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acceso restringido</CardTitle>
          <CardDescription>
            Esta sección está disponible solo para superadmin.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
            Negocios
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Gestionar negocios
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Revisa el inventario completo de negocios y elimina los que ya no deban estar activos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="neutral">{businesses.length} totales</Badge>
          <Link
            to="/admin/business/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--brand-green-600)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-green-700)]"
          >
            Nuevo negocio
            <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="relative">
            <FaMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, categoría o ciudad..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-green-400)] focus:ring-4 focus:ring-[color:rgba(22,164,76,0.10)]"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Cargando negocios...</CardTitle>
            <CardDescription>Obteniendo la lista completa para administración.</CardDescription>
          </CardHeader>
        </Card>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>No se pudieron cargar los negocios</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : filteredBusinesses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No hay resultados</CardTitle>
            <CardDescription>
              No encontramos negocios con ese criterio de búsqueda.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredBusinesses.map((business) => {
            const imageUrl =
              business.cover?.url ||
              business.profileImageUrl ||
              buildVisualImageDataUrl(business.name, business.category || 'Negocio')

            return (
              <Card key={business.id} className="overflow-hidden">
                <div className="grid gap-0 sm:grid-cols-[128px_minmax(0,1fr)]">
                  <img
                    src={imageUrl}
                    alt={business.name}
                    className="h-full min-h-[128px] w-full object-cover"
                  />

                  <CardContent className="flex h-full flex-col gap-4 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                            {business.name}
                          </h2>
                          {business.isVerified ? (
                            <Badge variant="success">Verificado</Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {business.category}
                          {business.city ? ` · ${business.city}` : ''}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold text-slate-950">
                          {business.ratingAverage?.toFixed(1) ?? '0.0'}
                        </p>
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                          {business.reviewsCount ?? 0} reseñas
                        </p>
                      </div>
                    </div>

                    <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                      {business.description ||
                        'Negocio disponible para administración y acciones operativas.'}
                    </p>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={business.isActive ? 'success' : 'neutral'}>
                          {business.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Badge variant="neutral">
                          {business.activePromotionsCount ?? 0} promos
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/businesses/${business.id}`}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver perfil
                        </Link>
                        <Button
                          variant="outline"
                          className="border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50"
                          onClick={() => handleDelete(business)}
                          disabled={deletingId === business.id}
                        >
                          <FaTrash className="mr-2 text-xs" />
                          {deletingId === business.id ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
