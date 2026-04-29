import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/shared/Navbar'
import Footer from '../../components/shared/Footer'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card, { CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { getPromotionById, type PromotionRecord } from './api'
import { buildVisualImageDataUrl } from '../../lib/visualImage'
import { trackCtaClick, trackEvent } from '../../lib/analytics'

function formatDateLabel(value?: string | null) {
  if (!value) return 'Sin fecha'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export default function PromotionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [promotion, setPromotion] = useState<PromotionRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPromotion() {
      if (!id) {
        setError('ID de promoción no proporcionado')
        setLoading(false)
        return
      }

      const promotionId = Number(id)
      if (Number.isNaN(promotionId)) {
        setError('ID de promoción inválido')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        setPromotion(await getPromotionById(promotionId))
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            'No fue posible cargar el detalle de la promoción'
        )
      } finally {
        setLoading(false)
      }
    }

    loadPromotion()
  }, [id])

  useEffect(() => {
    if (!promotion?.id) return

    void trackEvent({
      eventType: 'PROMOTION_CLICK',
      entityType: 'promotion',
      entityId: promotion.id,
      sourceScreen: 'promotion_detail',
      metadata: { action: 'view_page' },
    })
  }, [promotion?.id])

  const imageUrl = useMemo(
    () =>
      promotion?.imageUrl ||
      buildVisualImageDataUrl(
        promotion?.title || 'Promoción',
        promotion?.business?.name || 'Negocio'
      ),
    [promotion]
  )

  if (loading) {
    return <main className="p-8">Cargando promoción...</main>
  }

  if (error || !promotion) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link to="/promotions" className="text-sm font-medium text-orange-600">
            ← Volver a promociones
          </Link>
          <p className="mt-4 text-sm text-red-600">
            {error || 'Promoción no disponible'}
          </p>
        </main>
        <Footer />
      </div>
    )
  }

  const ctaUrl = promotion.ctaUrl || (promotion.businessId ? `/businesses/${promotion.businessId}` : null)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar
        brandName="Yebaam"
        brandHref="/"
        links={[
          { label: 'Inicio', href: '/' },
          { label: 'Negocios', href: '/businesses' },
          { label: 'Promociones', href: '/promotions', isActive: true },
        ]}
        onLogin={() => navigate('/login')}
        onRegister={() => navigate('/register')}
      />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/promotions"
          className="inline-flex text-sm font-medium text-orange-600 transition hover:text-orange-700"
        >
          ← Volver a promociones
        </Link>

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <img
              src={imageUrl}
              alt={promotion.title}
              className="h-[320px] w-full object-cover lg:h-full"
            />

            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap gap-2">
                <Badge variant="neutral">{promotion.business?.name || 'Negocio'}</Badge>
                {promotion.isHighlighted ? <Badge variant="success">Destacada</Badge> : null}
                <Badge variant="warning">{promotion.status}</Badge>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {promotion.title}
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-600">
                {promotion.description || 'Promoción activa disponible para este negocio.'}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Vigencia</CardTitle>
                    <CardDescription>
                      {promotion.startsAt ? `Desde ${formatDateLabel(promotion.startsAt)}` : 'Sin fecha de inicio'}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Expira</CardTitle>
                    <CardDescription>
                      {promotion.endsAt ? formatDateLabel(promotion.endsAt) : 'Sin fecha de cierre'}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {ctaUrl ? (
                  <Button
                    onClick={() => {
                      if (promotion.businessId) {
                        void trackCtaClick({
                          businessId: promotion.businessId,
                          sourceScreen: 'promotion_detail',
                        })
                      }
                      window.open(ctaUrl, '_blank', 'noreferrer')
                    }}
                  >
                    {promotion.ctaLabel || 'Ir al negocio'}
                  </Button>
                ) : null}
                {promotion.businessId ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      void trackEvent({
                        eventType: 'BUSINESS_PROFILE_VIEW',
                        entityType: 'business',
                        entityId: promotion.businessId,
                        sourceScreen: 'promotion_detail',
                        metadata: { action: 'view_business' },
                      })
                      navigate(`/businesses/${promotion.businessId}`)
                    }}
                  >
                    Ver negocio
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
