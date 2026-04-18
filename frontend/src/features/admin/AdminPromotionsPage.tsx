import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { getBusinessById } from '../businesses/api'
import {
  createPromotion,
  deactivatePromotionById,
  listPromotionsByBusinessId,
  updatePromotionById,
  type PromotionRecord,
  type PromotionStatus,
} from '../promotions/api'
import { getPrimaryBusinessId } from '../../lib/session'

type BusinessSummary = {
  id: number
  name: string
}

type PromotionFormState = {
  title: string
  slug: string
  description: string
  imageUrl: string
  ctaLabel: string
  ctaUrl: string
  startsAt: string
  endsAt: string
  status: PromotionStatus
  isHighlighted: boolean
}

const emptyForm: PromotionFormState = {
  title: '',
  slug: '',
  description: '',
  imageUrl: '',
  ctaLabel: '',
  ctaUrl: '',
  startsAt: '',
  endsAt: '',
  status: 'DRAFT',
  isHighlighted: false,
}

function toDateTimeLocalValue(value?: string | null) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (input: number) => String(input).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatDateLabel(value?: string | null) {
  if (!value) return 'Sin fecha'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function AdminPromotionsPage() {
  const businessId = getPrimaryBusinessId()
  const [business, setBusiness] = useState<BusinessSummary | null>(null)
  const [promotions, setPromotions] = useState<PromotionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPromotionId, setEditingPromotionId] = useState<number | null>(null)
  const [form, setForm] = useState<PromotionFormState>(emptyForm)

  async function loadData() {
    if (!businessId) {
      setError('No hay un negocio asociado a esta cuenta.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      const [businessData, promotionsData] = await Promise.all([
        getBusinessById<BusinessSummary>(businessId),
        listPromotionsByBusinessId(businessId),
      ])

      setBusiness(businessData)
      setPromotions(promotionsData)
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'No fue posible cargar las promociones'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId])

  const promotionsCount = useMemo(() => promotions.length, [promotions])

  function openCreateModal() {
    setEditingPromotionId(null)
    setForm({
      ...emptyForm,
      status: 'DRAFT',
    })
    setModalOpen(true)
  }

  function openEditModal(promotion: PromotionRecord) {
    setEditingPromotionId(promotion.id)
    setForm({
      title: promotion.title ?? '',
      slug: promotion.slug ?? '',
      description: promotion.description ?? '',
      imageUrl: promotion.imageUrl ?? '',
      ctaLabel: promotion.ctaLabel ?? '',
      ctaUrl: promotion.ctaUrl ?? '',
      startsAt: toDateTimeLocalValue(promotion.startsAt),
      endsAt: toDateTimeLocalValue(promotion.endsAt),
      status: promotion.status,
      isHighlighted: Boolean(promotion.isHighlighted),
    })
    setModalOpen(true)
  }

  function updateField<K extends keyof PromotionFormState>(
    key: K,
    value: PromotionFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!businessId) return

    try {
      setSaving(true)

      const payload = {
        businessId,
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        description: form.description.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        ctaLabel: form.ctaLabel.trim() || null,
        ctaUrl: form.ctaUrl.trim() || null,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        status: form.status,
        isHighlighted: form.isHighlighted,
      }

      if (editingPromotionId) {
        await updatePromotionById(editingPromotionId, payload)
      } else {
        await createPromotion(payload)
      }

      setModalOpen(false)
      await loadData()
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'No fue posible guardar la promoción'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(promotion: PromotionRecord) {
    const confirm = window.confirm(
      `¿Quieres desactivar la promoción "${promotion.title}"?`
    )
    if (!confirm) return

    try {
      setSaving(true)
      await deactivatePromotionById(promotion.id)
      await loadData()
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'No fue posible desactivar la promoción'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-slate-500">Cargando promociones...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
            Promociones
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {business?.name || 'Tu negocio'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Crea, edita y desactiva promociones desde el panel administrativo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="neutral">{promotionsCount} promociones</Badge>
          <Button onClick={openCreateModal}>Nueva promoción</Button>
        </div>
      </div>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {promotions.length === 0 ? (
        <EmptyState
          title="No hay promociones registradas"
          description="Crea la primera promoción para mostrar ofertas activas o campañas del negocio."
          actionLabel="Crear promoción"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid gap-5">
          {promotions.map((promotion) => (
            <Card key={promotion.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="mb-0">{promotion.title}</CardTitle>
                      <Badge
                        variant={
                          promotion.status === 'ACTIVE'
                            ? 'success'
                            : promotion.status === 'DRAFT'
                            ? 'warning'
                            : promotion.status === 'EXPIRED'
                            ? 'info'
                            : 'neutral'
                        }
                      >
                        {promotion.status}
                      </Badge>
                      {promotion.isHighlighted ? (
                        <Badge variant="success">Destacada</Badge>
                      ) : null}
                    </div>

                    <CardDescription>
                      {promotion.description || 'Sin descripción'}
                    </CardDescription>

                    <p className="text-xs text-slate-500">
                      Vigencia: {formatDateLabel(promotion.startsAt)} -{' '}
                      {formatDateLabel(promotion.endsAt)}
                    </p>
                  </div>

                  {promotion.business?.name ? (
                    <p className="text-sm font-medium text-slate-500">
                      {promotion.business.name}
                    </p>
                  ) : null}
                </div>
              </CardHeader>

              <CardContent className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => openEditModal(promotion)}>
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleDeactivate(promotion)}
                  disabled={saving}
                >
                  Desactivar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPromotionId ? 'Editar promoción' : 'Nueva promoción'}
        description="Mantén el mensaje corto y directo para impulsar el clic."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button form="promotion-form" type="submit" loading={saving}>
              Guardar
            </Button>
          </>
        }
      >
        <form id="promotion-form" className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Título"
              value={form.title}
              onChange={(event) => {
                const nextTitle = event.target.value
                setForm((current) => ({
                  ...current,
                  title: nextTitle,
                  slug: current.slug || slugify(nextTitle),
                }))
              }}
              placeholder="2x1 en helados"
              required
            />

            <Input
              label="Slug"
              value={form.slug}
              onChange={(event) => updateField('slug', event.target.value)}
              placeholder="2x1-en-helados"
              hint="Se genera solo si lo dejas vacío."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              rows={4}
              placeholder="Describe la promoción en una frase clara."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Imagen"
              value={form.imageUrl}
              onChange={(event) => updateField('imageUrl', event.target.value)}
              placeholder="https://..."
              hint="Si no tienes imagen, igual puedes guardar y luego completarla."
            />

            <Input
              label="CTA"
              value={form.ctaLabel}
              onChange={(event) => updateField('ctaLabel', event.target.value)}
              placeholder="Pedir ahora"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Enlace CTA"
              value={form.ctaUrl}
              onChange={(event) => updateField('ctaUrl', event.target.value)}
              placeholder="https://wa.me/..."
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Estado
              </label>
              <select
                value={form.status}
                onChange={(event) =>
                  updateField('status', event.target.value as PromotionStatus)
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              >
                <option value="DRAFT">Borrador</option>
                <option value="ACTIVE">Activa</option>
                <option value="EXPIRED">Expirada</option>
                <option value="ARCHIVED">Archivada</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Inicio"
              type="datetime-local"
              value={form.startsAt}
              onChange={(event) => updateField('startsAt', event.target.value)}
            />

            <Input
              label="Fin"
              type="datetime-local"
              value={form.endsAt}
              onChange={(event) => updateField('endsAt', event.target.value)}
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isHighlighted}
              onChange={(event) => updateField('isHighlighted', event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-200"
            />
            Marcar como destacada
          </label>
        </form>
      </Modal>
    </div>
  )
}
