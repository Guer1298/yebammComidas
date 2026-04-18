import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/shared/Navbar'
import Footer from '../../components/shared/Footer'
import SectionHeader from '../../components/shared/SectionHeader'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card'
import ReviewSection from '../reviews/ReviewSection'
import { getBusinessById } from './api'

type MediaAsset = {
  id: number
  url: string
  type?: 'IMAGE' | 'VIDEO'
  isPrimary?: boolean
  altText?: string | null
  title?: string | null
}

type Promotion = {
  id: number
  title: string
  description?: string | null
  imageUrl?: string | null
  ctaLabel?: string | null
  isHighlighted?: boolean
  status?: string
}

type BusinessDetail = {
  id: number
  name: string
  slug: string
  category: string
  businessType?: string | null
  description?: string | null
  city?: string | null
  address?: string | null
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
  website?: string | null
  instagram?: string | null
  facebook?: string | null
  tiktok?: string | null
  isActive: boolean
  ratingAverage?: number
  reviewsCount?: number
  mediaAssets?: MediaAsset[]
  promotions?: Promotion[]
  posts?: Array<{
    id: number
    title: string
    excerpt?: string | null
    coverImageUrl?: string | null
    status?: string
    publishedAt?: string | null
  }>
  menus?: Array<{
    id: number
    name: string
    description?: string | null
    categories?: Array<{
      id: number
      name: string
      description?: string | null
      products?: Array<{ id: number }>
    }>
  }>
}

function sanitizeWhatsApp(value: string) {
  return value.replace(/[^\d]/g, '')
}

function getPrimaryMedia(business?: BusinessDetail | null) {
  return (
    business?.mediaAssets?.find((item) => item.isPrimary) ||
    business?.mediaAssets?.[0] ||
    null
  )
}

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [business, setBusiness] = useState<BusinessDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadBusiness() {
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
        setBusiness(await getBusinessById<BusinessDetail>(businessId))
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            'No fue posible cargar el detalle del negocio'
        )
      } finally {
        setLoading(false)
      }
    }

    loadBusiness()
  }, [id])

  const coverImage = getPrimaryMedia(business)?.url

  const menuCategories = useMemo(() => {
    const menus = business?.menus ?? []
    const firstMenu = menus[0]

    return firstMenu?.categories ?? []
  }, [business])

  const highlightPromotion = useMemo(() => {
    return (
      business?.promotions?.find(
        (promotion) =>
          promotion.isHighlighted && promotion.status === 'ACTIVE'
      ) ||
      business?.promotions?.find((promotion) => promotion.status === 'ACTIVE') ||
      business?.promotions?.[0] ||
      null
    )
  }, [business])

  const whatsappUrl = useMemo(() => {
    const raw = business?.whatsapp || business?.phone
    if (!raw) return null

    const cleaned = sanitizeWhatsApp(raw)
    if (!cleaned) return null

    const message = encodeURIComponent(
      `Hola, quiero pedir en ${business?.name || 'este negocio'}.`
    )

    return `https://wa.me/${cleaned}?text=${message}`
  }, [business])

  const mediaAssets = business?.mediaAssets ?? []
  const reelMedia =
    mediaAssets.find((item) => item.type === 'VIDEO') ||
    mediaAssets.find((item) => item.isPrimary) ||
    mediaAssets[0] ||
    null

  const galleryMedia = mediaAssets.filter((item) => item.url).slice(0, 6)
  const profileImage =
    mediaAssets.find((item) => !item.isPrimary && item.type !== 'VIDEO')?.url ||
    coverImage ||
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80'

  const quickLinks = [
    { label: 'Detalles', href: '#detalles' },
    { label: 'Fotos', href: '#fotos' },
    { label: 'Promociones', href: '#promociones' },
    { label: 'Carta', href: '#menu' },
    { label: 'Reseñas', href: '#reseñas' },
    { label: 'Posts', href: '#posts' },
  ]

  const socialLinks = [
    business?.website ? { label: 'Web', href: business.website } : null,
    business?.instagram
      ? { label: 'Instagram', href: business.instagram }
      : null,
    business?.facebook ? { label: 'Facebook', href: business.facebook } : null,
    business?.tiktok ? { label: 'TikTok', href: business.tiktok } : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>

  const publishedPosts = (business?.posts ?? [])
    .filter((post) => post.status === 'PUBLISHED')
    .slice(0, 4)

  const openBusinessWhatsapp = (message: string) => {
    const raw = business?.whatsapp || business?.phone
    if (!raw) return

    const cleaned = sanitizeWhatsApp(raw)
    if (!cleaned) return

    window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">Cargando negocio...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            to="/businesses"
            className="mb-4 inline-flex text-sm font-medium text-orange-600 transition hover:text-orange-700"
          >
            ← Volver a negocios
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>No se pudo cargar el negocio</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    )
  }

  if (!business) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            to="/businesses"
            className="mb-4 inline-flex text-sm font-medium text-orange-600 transition hover:text-orange-700"
          >
            ← Volver a negocios
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Negocio no encontrado</CardTitle>
              <CardDescription>
                El negocio solicitado no existe o no está disponible.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-slate-900">
      <Navbar
        brandName="ProyectoC"
        brandHref="/"
        links={[
          { label: 'Negocios', href: '/businesses' },
          { label: 'Fotos', href: '#fotos' },
          { label: 'Carta', href: '#menu' },
          { label: 'Reseñas', href: '#reseñas' },
        ]}
        onLogin={() => navigate('/login')}
        onRegister={() => navigate('/register')}
      />

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <Card className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Atajos
              </p>
              <div className="mt-4 space-y-2">
                {quickLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Últimos posts
              </p>
              <div className="mt-4 space-y-3">
                {publishedPosts.length > 0 ? (
                  publishedPosts.map((post) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => document.getElementById('posts')?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-orange-200"
                    >
                      <img
                        src={
                          post.coverImageUrl ||
                          profileImage
                        }
                        alt={post.title}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {post.title}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {post.excerpt || 'Publicación reciente'}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                    Aún no hay posts visibles.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="relative">
              <img
                src={
                  coverImage ||
                  'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1400&q=80'
                }
                alt={business.name}
                className="h-[360px] w-full object-cover sm:h-[420px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

              <div className="absolute left-5 top-5 flex items-center gap-2 text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/25 text-sm font-semibold">
                  ★
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {business.ratingAverage?.toFixed(1) ?? '0.0'}
                  </p>
                  <p className="text-xs text-white/75">
                    {business.reviewsCount ?? 0} reseñas
                  </p>
                </div>
              </div>

              <div className="absolute right-5 top-5 flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white/90 text-slate-900 hover:bg-white"
                  onClick={() => {
                    if (whatsappUrl) {
                      window.open(whatsappUrl, '_blank', 'noreferrer')
                    }
                  }}
                >
                  Recomendar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white/90 text-slate-900 hover:bg-white"
                  onClick={() => navigate('/register')}
                >
                  Hacerse cliente
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white/90 text-slate-900 hover:bg-white"
                  onClick={() =>
                    document.getElementById('reseñas')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    })
                  }
                >
                  Me gusta
                </Button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <div className="max-w-3xl text-white">
                  <p className="text-sm font-medium text-orange-200">
                    {business.businessType || business.category}
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                    {business.name}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-100 sm:text-base">
                    {business.description || 'Sin descripción disponible.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <MetaPill>{business.category}</MetaPill>
                    {business.city ? <MetaPill>📍 {business.city}</MetaPill> : null}
                    {business.address ? <MetaPill>📦 {business.address}</MetaPill> : null}
                    {highlightPromotion?.title ? (
                      <MetaPill>{highlightPromotion.title}</MetaPill>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 border-t border-slate-200 bg-white px-5 pb-5 pt-0 sm:px-6 lg:px-8">
              <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="h-28 w-28 overflow-hidden rounded-[1.75rem] border-4 border-white bg-slate-200 shadow-lg">
                  <img
                    src={profileImage}
                    alt={`${business.name} perfil`}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1 pb-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Foto de perfil
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                    {business.name}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant={business.isActive ? 'success' : 'neutral'}>
                      {business.isActive ? 'Abierto' : 'Cerrado'}
                    </Badge>
                    {business.category ? <Badge>{business.category}</Badge> : null}
                    {highlightPromotion?.isHighlighted ? (
                      <Badge variant="warning">Promoción destacada</Badge>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Franja de badges
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    business.category,
                    business.city,
                    business.businessType,
                    business.reviewsCount ? `${business.reviewsCount} reseñas` : null,
                    business.whatsapp ? 'WhatsApp' : null,
                    business.website ? 'Web' : null,
                  ]
                    .filter(Boolean)
                    .map((label) => (
                      <Badge key={label as string} variant="neutral">
                        {label}
                      </Badge>
                    ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {quickLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </section>

          <section
            id="detalles"
            className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm xl:grid-cols-[360px_minmax(0,1fr)]"
          >
            <Card className="bg-slate-50">
              <CardHeader>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                  Detalles
                </p>
                <CardTitle className="mt-2 text-2xl">Acerca del negocio</CardTitle>
                <CardDescription>
                  La información principal que el usuario quiere ver de inmediato.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <InfoChip label="Nombre" value={business.name} />
                <InfoChip label="Categoría" value={business.category} />
                <InfoChip label="Dirección" value={business.address || 'No definida'} />
                <InfoChip label="Ciudad" value={business.city || 'No definida'} />
                <InfoChip
                  label="Teléfono / WhatsApp"
                  value={business.phone || business.whatsapp || 'No disponible'}
                />

                {socialLinks.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Redes sociales
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {socialLinks.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="px-0">
                <div className="flex items-center justify-between px-5 pt-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                      Reel
                    </p>
                    <CardTitle className="mt-2 text-xl">Photo o video</CardTitle>
                  </div>
                  {reelMedia?.type === 'VIDEO' ? (
                    <Badge variant="info">Video</Badge>
                  ) : (
                    <Badge variant="neutral">Foto</Badge>
                  )}
                </div>
                <CardDescription className="px-5">
                  Un bloque visual dominante, parecido a Facebook, para reforzar deseo y confianza.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-5 pb-5">
                {reelMedia?.type === 'VIDEO' ? (
                  <video
                    src={reelMedia.url}
                    poster={coverImage || undefined}
                    controls
                    className="h-[340px] w-full rounded-[1.5rem] bg-slate-950 object-cover"
                  />
                ) : (
                  <img
                    src={
                      reelMedia?.url ||
                      coverImage ||
                      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80'
                    }
                    alt={business.name}
                    className="h-[340px] w-full rounded-[1.5rem] object-cover"
                  />
                )}
              </CardContent>
            </Card>
          </section>

          <section id="menu" className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              eyebrow="Carta"
              title="Abrir menú completo"
              description="Los platos no aparecen aquí. Solo se muestran cuando entras al menú."
            />

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_300px]">
              <Card className="bg-slate-50">
                <CardHeader>
                  <CardTitle className="text-2xl">Una vista limpia del negocio</CardTitle>
                  <CardDescription>
                    Mantener la portada sin exceso ayuda a que el usuario primero entienda
                    qué negocio es y luego entre a la carta cuando ya tiene intención de pedir.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {menuCategories.slice(0, 6).map((category) => (
                      <Badge key={category.id} variant="neutral">
                        {category.name}
                      </Badge>
                    ))}
                    {menuCategories.length === 0 ? (
                      <Badge variant="neutral">Sin categorías visibles</Badge>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => navigate(`/businesses/${business.id}/menu`)}>
                      Ver carta completa
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        openBusinessWhatsapp(
                          `Hola, quiero ver la carta de ${business.name}.`
                        )
                      }
                    >
                      Pedir por WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumen</CardTitle>
                  <CardDescription>
                    {menuCategories.length} categoría{menuCategories.length === 1 ? '' : 's'} y toda la carta
                    disponible dentro del menú.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {menuCategories.length > 0 ? (
                    menuCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => navigate(`/businesses/${business.id}/menu`)}
                        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
                      >
                        <span>{category.name}</span>
                        <span className="text-xs text-slate-500">
                          {category.products?.length ?? 0} platos
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                      La carta todavía no tiene categorías visibles.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="fotos" className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              eyebrow="Fotos"
              title="Galería"
              description="Material visual breve para reforzar la decisión."
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galleryMedia.length > 0 ? (
                galleryMedia.map((media) => (
                  <img
                    key={media.id}
                    src={media.url}
                    alt={media.altText || business.name}
                    className="h-52 w-full rounded-[1.5rem] object-cover"
                  />
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500 lg:col-span-3">
                  No hay fotos adicionales registradas.
                </div>
              )}
            </div>
          </section>

          <section id="promociones" className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              eyebrow="Promociones"
              title="Ofertas activas"
              description="Promociones visibles para empujar al usuario a pedir."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {business.promotions?.filter((promotion) => promotion.status === 'ACTIVE').length ? (
                business.promotions
                  ?.filter((promotion) => promotion.status === 'ACTIVE')
                  .slice(0, 3)
                  .map((promotion) => (
                    <Card key={promotion.id} hoverable padding="none" className="overflow-hidden">
                      <img
                        src={
                          promotion.imageUrl ||
                          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
                        }
                        alt={promotion.title}
                        className="h-44 w-full object-cover"
                      />
                      <div className="space-y-3 p-5">
                        <div className="flex items-center justify-between gap-3">
                          <Badge variant="warning">Activa</Badge>
                          {promotion.isHighlighted ? <Badge variant="success">Destacada</Badge> : null}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-950">
                            {promotion.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {promotion.description || 'Promoción disponible para este negocio.'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                  Este negocio no tiene promociones activas.
                </div>
              )}
            </div>
          </section>

          <section id="posts" className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              eyebrow="Posts"
              title="Últimos posts"
              description="Contenido reciente para acompañar la carta y las fotos."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {publishedPosts.length > 0 ? (
                publishedPosts.map((post) => (
                  <article
                    key={post.id}
                    className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
                  >
                    <img
                      src={
                        post.coverImageUrl ||
                        profileImage
                      }
                      alt={post.title}
                      className="h-52 w-full object-cover"
                    />
                    <div className="space-y-2 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Publicado
                      </p>
                      <h3 className="text-lg font-semibold text-slate-950">{post.title}</h3>
                      <p className="text-sm leading-6 text-slate-600">
                        {post.excerpt || 'Sin resumen disponible.'}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500 md:col-span-2">
                  Aún no hay posts visibles.
                </div>
              )}
            </div>
          </section>

          <section id="reseñas" className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <ReviewSection businessId={business.id} />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function MetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-white/15 px-3 py-1 text-sm text-white backdrop-blur">
      {children}
    </span>
  )
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-950">{value}</p>
    </div>
  )
}
