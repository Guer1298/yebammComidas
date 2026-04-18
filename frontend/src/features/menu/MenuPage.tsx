import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/shared/Navbar'
import Footer from '../../components/shared/Footer'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { getBusinessMenuById, type MenuCategory } from './api'
import MenuCatalog from './components/MenuCatalog'

type BusinessMenuResponse = {
  id: number
  name: string
  category: string
  description?: string | null
  city?: string | null
  address?: string | null
  whatsapp?: string | null
  phone?: string | null
  ratingAverage?: number
  reviewsCount?: number
  menus?: Array<{
    id: number
    name: string
    description?: string | null
    categories?: MenuCategory[]
  }>
}

function sanitizeWhatsApp(value: string) {
  return value.replace(/[^\d]/g, '')
}

export default function MenuPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [business, setBusiness] = useState<BusinessMenuResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)

  useEffect(() => {
    async function loadMenu() {
      if (!id) {
        setError('ID de negocio no proporcionado')
        setLoading(false)
        return
      }

      const businessId = Number(id)
      if (Number.isNaN(businessId)) {
        setError('ID de negocio inválido')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        setBusiness(await getBusinessMenuById(businessId))
      } catch (err: any) {
        setError(err?.response?.data?.message || 'No fue posible cargar la carta')
      } finally {
        setLoading(false)
      }
    }

    loadMenu()
  }, [id])

  const categories = useMemo(() => {
    const menus = business?.menus ?? []
    const firstMenu = menus[0]
    return firstMenu?.categories ?? []
  }, [business])

  useEffect(() => {
    if (categories.length > 0 && activeCategoryId === null) {
      setActiveCategoryId(categories[0].id)
    }
  }, [activeCategoryId, categories])

  const whatsappUrl = useMemo(() => {
    const raw = business?.whatsapp || business?.phone
    if (!raw) return null

    const cleaned = sanitizeWhatsApp(raw)
    if (!cleaned) return null

    return `https://wa.me/${cleaned}?text=${encodeURIComponent(
      `Hola, quiero ver la carta de ${business?.name || 'este negocio'}.`
    )}`
  }, [business])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">Cargando carta...</p>
        </div>
      </main>
    )
  }

  if (error || !business) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            to={business ? `/businesses/${business.id}` : '/businesses'}
            className="mb-4 inline-flex text-sm font-medium text-orange-600 transition hover:text-orange-700"
          >
            ← Volver
          </Link>
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h1 className="text-xl font-semibold text-slate-950">
              No se pudo cargar la carta
            </h1>
            <p className="mt-2 text-sm text-slate-500">{error || 'Carta no disponible'}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar
        brandName="ProyectoC"
        brandHref="/"
        links={[
          { label: 'Negocio', href: `/businesses/${business.id}` },
          { label: 'Carta', href: '#carta' },
        ]}
        onLogin={() => navigate('/login')}
        onRegister={() => navigate('/register')}
      />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Link
                to={`/businesses/${business.id}`}
                className="inline-flex text-sm font-medium text-orange-600 transition hover:text-orange-700"
              >
                ← Volver al negocio
              </Link>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">
                Carta completa
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {business.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Recorre categorías, platos y precios en una sola vista diseñada para pedir rápido.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge>{business.category}</Badge>
              <Badge variant="success">
                ⭐ {business.ratingAverage?.toFixed(1) ?? '0.0'}
              </Badge>
              <Badge variant="neutral">
                {categories.length} categoría{categories.length === 1 ? '' : 's'}
              </Badge>
              <Badge variant="neutral">
                {categories.reduce((acc, cat) => acc + cat.products.length, 0)} platos
              </Badge>
              {whatsappUrl ? (
                <Button
                  onClick={() => window.open(whatsappUrl, '_blank', 'noreferrer')}
                >
                  Pedir por WhatsApp
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section id="carta" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <MenuCatalog
          businessName={business.name}
          businessCategory={business.category}
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={(categoryId) => {
            setActiveCategoryId(categoryId)
            document.getElementById(`menu-category-${categoryId}`)?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }}
          onOpenProduct={(productId) => navigate(`/products/${productId}`)}
          onOrder={(productName) => {
            if (!whatsappUrl) return
            window.open(
              `${whatsappUrl}&text=${encodeURIComponent(
                `Hola, quiero pedir ${productName} en ${business.name}.`
              )}`,
              '_blank',
              'noreferrer'
            )
          }}
        />
      </section>

      <Footer />
    </main>
  )
}
