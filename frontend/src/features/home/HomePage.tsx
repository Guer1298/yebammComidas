import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/shared/Navbar'
import Footer from '../../components/shared/Footer'
import SearchBar from '../../components/shared/SearchBar'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { loadHomeCatalog, type HomeBusinessItem, type HomeProductItem } from './api'

function formatPrice(value: number | string, currency = 'COP') {
  const numericValue = typeof value === 'string' ? Number(value) : value

  if (Number.isNaN(numericValue)) {
    return String(value)
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(numericValue)
}

function matchesSearch(term: string, values: Array<string | number | null | undefined>) {
  if (!term) return true

  return values
    .filter((value) => value !== null && value !== undefined)
    .join(' ')
    .toLowerCase()
    .includes(term)
}

function sortBusinesses(items: HomeBusinessItem[]) {
  return [...items].sort((a, b) => {
    const ratingDelta = b.ratingAverage - a.ratingAverage
    if (ratingDelta !== 0) return ratingDelta

    const promoDelta = b.activePromotionsCount - a.activePromotionsCount
    if (promoDelta !== 0) return promoDelta

    return b.reviewsCount - a.reviewsCount
  })
}

function sortProducts(items: HomeProductItem[]) {
  return [...items].sort((a, b) => {
    const featuredDelta = Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured))
    if (featuredDelta !== 0) return featuredDelta

    const ratingDelta = b.businessRating - a.businessRating
    if (ratingDelta !== 0) return ratingDelta

    return a.name.localeCompare(b.name)
  })
}

export default function HomePage() {
  const navigate = useNavigate()
  const resultsRef = useRef<HTMLDivElement | null>(null)

  const [search, setSearch] = useState('')
  const [businesses, setBusinesses] = useState<HomeBusinessItem[]>([])
  const [products, setProducts] = useState<HomeProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoading(true)
        setError('')

        const catalog = await loadHomeCatalog()
        setBusinesses(sortBusinesses(catalog.businesses))
        setProducts(sortProducts(catalog.products))
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            'No fue posible cargar los negocios y productos de inicio'
        )
      } finally {
        setLoading(false)
      }
    }

    loadCatalog()
  }, [])

  const normalizedSearch = search.trim().toLowerCase()

  const featuredBusinesses = useMemo(() => businesses.slice(0, 4), [businesses])
  const featuredProducts = useMemo(() => products.slice(0, 6), [products])

  const matchingBusinesses = useMemo(() => {
    if (!normalizedSearch) return []

    return businesses.filter((business) =>
      matchesSearch(normalizedSearch, [
        business.name,
        business.category,
        business.description,
        business.city,
        business.address,
      ])
    )
  }, [businesses, normalizedSearch])

  const matchingProducts = useMemo(() => {
    if (!normalizedSearch) return []

    return products.filter((product) =>
      matchesSearch(normalizedSearch, [
        product.name,
        product.shortDescription,
        product.description,
        product.categoryName,
        product.businessName,
        product.businessCategory,
      ])
    )
  }, [normalizedSearch, products])

  const stats = useMemo(
    () => [
      { label: 'Negocios', value: businesses.length },
      { label: 'Platos', value: products.length },
      {
        label: 'Reseñas',
        value: businesses.reduce((acc, business) => acc + business.reviewsCount, 0),
      },
    ],
    [businesses, products]
  )

  const handleSearchSubmit = () => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar
        brandName="ProyectoC"
        brandHref="/"
        links={[
          { label: 'Negocios', href: '#resultados' },
          { label: 'Carta', href: '#resultados' },
          { label: 'Explorar', href: '#resultados' },
        ]}
        onLogin={() => navigate('/login')}
        onRegister={() => navigate('/register')}
      />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">
              Busca negocios y platos reales
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Encuentra rápido la carta que quieres ver.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Un buscador simple para descubrir negocios, abrir su carta y entrar al detalle
              de cada plato sin ruido visual.
            </p>

            <div className="mx-auto mt-8 max-w-2xl">
              <SearchBar
                value={search}
                onChange={setSearch}
                onSearch={handleSearchSubmit}
                placeholder="Busca helado, bandeja paisa, hamburguesa o negocio"
                buttonLabel="Buscar"
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {stats.map((stat) => (
                <Metric key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button onClick={() => navigate('/businesses')}>Ver negocios</Button>
              <Button variant="outline" onClick={() => navigate('/promotions')}>
                Ver promociones
              </Button>
              <Button variant="outline" onClick={() => navigate('/register')}>
                Crear cuenta
              </Button>
            </div>
          </div>
        </div>
      </section>

      {!normalizedSearch ? (
        <section
          id="resultados"
          className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8"
        >
          <ShowcaseSection
            title="Negocios Destacados"
            subtitle="Los que más llaman la atención primero."
            actionLabel="Ver todos los negocios"
            onAction={() => navigate('/businesses')}
          >
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredBusinesses.slice(0, 3).map((business) => (
                <HighlightBusinessCard
                  key={business.id}
                  business={business}
                  onOpen={() => navigate(`/businesses/${business.id}`)}
                />
              ))}
            </div>
          </ShowcaseSection>

          <ShowcaseSection
            title="Galería de Platos Populares"
            subtitle="Fotos claras, precio visible y una acción directa."
            actionLabel="Ver carta completa"
            onAction={() => navigate('/businesses')}
          >
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredProducts.slice(0, 3).map((product) => (
                <HighlightProductCard
                  key={product.id}
                  product={product}
                  onOpenProduct={() => navigate(`/products/${product.id}`)}
                  onOpenBusiness={() => navigate(`/businesses/${product.businessId}`)}
                />
              ))}
            </div>
          </ShowcaseSection>
        </section>
      ) : (
        <section ref={resultsRef} id="resultados" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">
                    Resultados
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    Coincidencias para "{search.trim()}"
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Los resultados están ordenados para que entres rápido al negocio o al plato.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Chip label="Negocios" value={matchingBusinesses.length} />
                  <Chip label="Platos" value={matchingProducts.length} />
                  <Button variant="outline" onClick={() => setSearch('')}>
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {loading ? (
                <LoadingState />
              ) : error ? (
                <ErrorState message={error} />
              ) : matchingBusinesses.length === 0 &&
                matchingProducts.length === 0 ? (
                <EmptySearchState term={search} onReset={() => setSearch('')} />
              ) : (
                <div className="grid gap-8 lg:grid-cols-2">
                  <ResultGroup
                    title="Negocios"
                    count={matchingBusinesses.length}
                    emptyLabel="No hay negocios para mostrar."
                  >
                    {matchingBusinesses.slice(0, 4).map((business) => (
                      <BusinessRow
                        key={business.id}
                        business={business}
                        onOpen={() => navigate(`/businesses/${business.id}`)}
                      />
                    ))}
                  </ResultGroup>

                  <ResultGroup
                    title="Platos"
                    count={matchingProducts.length}
                    emptyLabel="No hay platos para mostrar."
                  >
                    {matchingProducts.slice(0, 6).map((product) => (
                      <ProductRow
                        key={product.id}
                        product={product}
                        onOpenProduct={() => navigate(`/products/${product.id}`)}
                        onOpenBusiness={() =>
                          navigate(`/businesses/${product.businessId}`)
                        }
                      />
                    ))}
                  </ResultGroup>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Navegación directa, sin ruido.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                El home ya funciona como una puerta de entrada limpia a negocios y cartas.
              </p>
            </div>

            <Button onClick={() => navigate('/businesses')}>Explorar todo</Button>
          </div>
        </div>
      </section>

      <Footer
        brandName="ProyectoC"
        description="Datos reales de negocios y productos, presentados con una interfaz limpia para descubrir y entrar a la carta rápido."
        linkGroups={[
          {
            title: 'Explorar',
            links: [
              { label: 'Negocios', href: '#resultados' },
              { label: 'Carta', href: '#resultados' },
            ],
          },
          {
            title: 'Cuenta',
            links: [
              { label: 'Iniciar sesión', href: '/login' },
              { label: 'Registrarse', href: '/register' },
            ],
          },
          {
            title: 'Acceso',
            links: [{ label: 'Panel administrativo', href: '/admin' }],
          },
        ]}
      />
    </main>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
      <span className="font-semibold text-slate-950">{value}</span>
      <span>{label}</span>
    </div>
  )
}

function ShowcaseSection({
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
}: {
  title: string
  subtitle: string
  actionLabel: string
  onAction: () => void
  children: ReactNode
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
        </div>

        <Button variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>

      <div className="px-6 py-6 sm:px-8">{children}</div>
    </section>
  )
}

function HighlightBusinessCard({
  business,
  onOpen,
}: {
  business: HomeBusinessItem
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative">
        <img
          src={
            business.coverUrl ||
            'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80'
          }
          alt={business.name}
          className="h-56 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent" />
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
            Popular
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-lg font-semibold text-white drop-shadow-sm">{business.name}</p>
          <p className="mt-1 text-sm text-slate-200 drop-shadow-sm">
            {business.category || 'Sin categoría'} · ⭐ {business.ratingAverage.toFixed(1)}
          </p>
        </div>
      </div>
    </button>
  )
}

function HighlightProductCard({
  product,
  onOpenProduct,
  onOpenBusiness,
}: {
  product: HomeProductItem
  onOpenProduct: () => void
  onOpenBusiness: () => void
}) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative">
        <img
          src={
            product.imageUrl ||
            'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80'
          }
          alt={product.name}
          className="h-56 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-white drop-shadow-sm">
                {product.name}
              </p>
              <p className="mt-1 truncate text-sm text-slate-200 drop-shadow-sm">
                {product.businessName}
              </p>
            </div>
            <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-800 backdrop-blur">
              {formatPrice(product.price, product.currency || 'COP')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-4">
        <Button variant="outline" fullWidth onClick={onOpenProduct}>
          Foto/Plato
        </Button>
        <Button fullWidth onClick={onOpenBusiness}>
          Ver carta
        </Button>
      </div>
    </article>
  )
}

function Chip({ label, value }: { label: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
      <span className="font-medium text-slate-950">{value}</span>
      <span>{label}</span>
    </div>
  )
}

function ResultGroup({
  title,
  count,
  emptyLabel,
  children,
}: {
  title: string
  count: number
  emptyLabel: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {count} {count === 1 ? 'resultado' : 'resultados'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {count > 0 ? (
          children
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">
            {emptyLabel}
          </div>
        )}
      </div>
    </section>
  )
}

function BusinessRow({
  business,
  onOpen,
}: {
  business: HomeBusinessItem
  onOpen: () => void
}) {
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-orange-200 hover:shadow-sm">
      <img
        src={
          business.coverUrl ||
          'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80'
        }
        alt={business.name}
        className="h-16 w-16 rounded-xl object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">{business.name}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {business.category || 'Sin categoría'} · ⭐ {business.ratingAverage.toFixed(1)}
            </p>
          </div>
          {business.activePromotionsCount > 0 ? (
            <Badge variant="success">
              {business.activePromotionsCount} promo
              {business.activePromotionsCount === 1 ? '' : 's'}
            </Badge>
          ) : null}
        </div>

        <p className="mt-2 line-clamp-1 text-xs text-slate-500">
          {business.description || 'Sin descripción disponible.'}
        </p>
      </div>

      <Button variant="outline" size="sm" onClick={onOpen}>
        Ver
      </Button>
    </article>
  )
}

function ProductRow({
  product,
  onOpenProduct,
  onOpenBusiness,
}: {
  product: HomeProductItem
  onOpenProduct: () => void
  onOpenBusiness: () => void
}) {
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-orange-200 hover:shadow-sm">
      <img
        src={
          product.imageUrl ||
          'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=400&q=80'
        }
        alt={product.name}
        className="h-16 w-16 rounded-xl object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">{product.name}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {product.businessName}
            </p>
          </div>
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
            {formatPrice(product.price, product.currency || 'COP')}
          </span>
        </div>

        <p className="mt-2 line-clamp-1 text-xs text-slate-500">
          {product.shortDescription || product.description || 'Sin descripción disponible.'}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="outline" size="sm" onClick={onOpenProduct}>
          Plato
        </Button>
        <Button size="sm" onClick={onOpenBusiness}>
          Carta
        </Button>
      </div>
    </article>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-56 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, column) => (
          <div key={column} className="space-y-3">
            {Array.from({ length: 3 }).map((__, index) => (
              <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm font-semibold text-red-700">No fue posible cargar los datos</p>
      <p className="mt-2 text-sm text-red-600">{message}</p>
    </div>
  )
}

function EmptySearchState({
  term,
  onReset,
}: {
  term: string
  onReset: () => void
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <p className="text-lg font-semibold text-slate-950">
        No encontramos resultados para "{term}"
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Prueba con un plato, una categoría o el nombre de un negocio.
      </p>
      <div className="mt-6">
        <Button variant="outline" onClick={onReset}>
          Limpiar búsqueda
        </Button>
      </div>
    </div>
  )
}
