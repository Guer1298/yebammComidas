import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listBusinesses, type BusinessListItem } from './api'

export default function BusinessListPage() {
  const [businesses, setBusinesses] = useState<BusinessListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadBusinesses() {
      try {
        setLoading(true)
        setError('')
        setBusinesses(await listBusinesses())
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
  }, [])

  const filteredBusinesses = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) return businesses

    return businesses.filter((business) => {
      const searchableText = [
        business.name,
        business.category,
        business.description,
        business.city,
        business.address,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchableText.includes(term)
    })
  }, [businesses, search])

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Link
              to="/"
              className="mb-4 inline-flex text-sm font-medium text-orange-600 transition hover:text-orange-700"
            >
              ← Volver al inicio
            </Link>

            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
              Negocios
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Explora negocios dentro del ecosistema de comidas rápidas
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              Descubre opciones, revisa reputación, compara promociones y encuentra
              negocios con una presentación visual más clara y orientada a conversión.
            </p>
          </div>

          <div className="w-full max-w-md">
            <label htmlFor="business-search" className="sr-only">
              Buscar negocios
            </label>
            <input
              id="business-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, categoría o ciudad"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : filteredBusinesses.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {filteredBusinesses.length}{' '}
                {filteredBusinesses.length === 1 ? 'negocio encontrado' : 'negocios encontrados'}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  )
}

function BusinessCard({ business }: { business: BusinessListItem }) {
  const imageUrl = business.cover?.url
  const hasPromotion = (business.activePromotionsCount ?? 0) > 0
  const rating = business.ratingAverage ?? 0
  const reviews = business.reviewsCount ?? 0

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={business.name}
            className="h-56 w-full object-cover"
          />
        ) : (
          <div className="flex h-56 w-full items-center justify-center bg-slate-100 text-sm font-medium text-slate-500">
            Sin imagen disponible
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
            {business.category || 'Sin categoría'}
          </span>

          {hasPromotion && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              {business.activePromotionsCount} promo
              {(business.activePromotionsCount ?? 0) > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              {business.name}
            </h2>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              ⭐ {rating.toFixed(1)}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {reviews} {reviews === 1 ? 'reseña' : 'reseñas'}
          </p>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-slate-600">
          {business.description || 'Sin descripción disponible.'}
        </p>

        <div className="mt-4 space-y-2 text-sm text-slate-500">
          <p>
            <span className="font-medium text-slate-700">Ciudad:</span>{' '}
            {business.city || 'No definida'}
          </p>

          {business.address ? (
            <p>
              <span className="font-medium text-slate-700">Dirección:</span>{' '}
              {business.address}
            </p>
          ) : null}

          {business.whatsapp ? (
            <p>
              <span className="font-medium text-slate-700">WhatsApp:</span>{' '}
              {business.whatsapp}
            </p>
          ) : business.phone ? (
            <p>
              <span className="font-medium text-slate-700">Contacto:</span>{' '}
              {business.phone}
            </p>
          ) : null}
        </div>

        <div className="mt-5 flex gap-3">
          <Link
            to={`/businesses/${business.id}`}
            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Ver negocio
          </Link>

          {business.whatsapp ? (
            <a
              href={`https://wa.me/${sanitizeWhatsApp(business.whatsapp)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Contactar
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-400"
            >
              Sin CTA
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function LoadingState() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="h-56 animate-pulse bg-slate-200" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-11 w-full animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
      <h2 className="text-lg font-semibold text-red-700">
        Ocurrió un problema al cargar los negocios
      </h2>
      <p className="mt-2 text-sm text-red-600">{message}</p>
    </div>
  )
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h2 className="text-lg font-semibold text-slate-900">
        No hay negocios disponibles
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        {search
          ? 'No encontramos resultados con esa búsqueda.'
          : 'Todavía no hay negocios visibles en la plataforma.'}
      </p>
    </div>
  )
}

function sanitizeWhatsApp(value: string) {
  return value.replace(/[^\d]/g, '')
}
