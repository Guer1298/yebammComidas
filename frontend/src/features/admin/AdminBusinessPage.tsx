import { useEffect, useState } from 'react'
import Card, {
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card'
import BusinessForm, {
  type BusinessFormValues,
} from './components/BusinessForm'
import { getBusinessById, updateBusinessById } from '../businesses/api'
import { getPrimaryBusinessId } from '../../lib/session'

type BusinessDetail = BusinessFormValues & {
  id: number
  businessType?: string | null
  aboutArticle?: string | null
  website?: string | null
  instagram?: string | null
}

export default function AdminBusinessPage() {
  const businessId = getPrimaryBusinessId()
  const [business, setBusiness] = useState<BusinessDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadBusiness() {
      if (!businessId) {
        setError('No hay un negocio asociado a esta cuenta.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await getBusinessById<BusinessDetail>(businessId)
        setBusiness({
          ...data,
          businessType: data.businessType || '',
          aboutArticle: data.aboutArticle || '',
          website: data.website || '',
          instagram: data.instagram || '',
        })
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            'No fue posible cargar el negocio administrativo'
        )
      } finally {
        setLoading(false)
      }
    }

    loadBusiness()
  }, [businessId])

  async function handleSubmit(values: BusinessFormValues) {
    if (!businessId) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const updated = await updateBusinessById<BusinessDetail>(businessId, {
        name: values.name,
        category: values.category,
        businessType: values.businessType || null,
        description: values.description || null,
        aboutArticle: values.aboutArticle || null,
        city: values.city || null,
        address: values.address || null,
        phone: values.phone || null,
        whatsapp: values.whatsapp || null,
        email: values.email || null,
        website: values.website || null,
        instagram: values.instagram || null,
      })

      setBusiness({
        ...updated,
        businessType: updated.businessType || '',
        aboutArticle: updated.aboutArticle || '',
        website: updated.website || '',
        instagram: updated.instagram || '',
      })
      setSuccess('Negocio actualizado correctamente.')
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'No fue posible guardar los cambios del negocio'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Cargando negocio...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
          Negocio
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Editar perfil del negocio
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Mantén actualizada la información que ven los usuarios.
        </p>
      </div>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {success ? (
        <Card>
          <CardHeader>
            <CardTitle>Guardado</CardTitle>
            <CardDescription>{success}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {business ? (
        <BusinessForm
          initialValues={business}
          loading={saving}
          onSubmit={handleSubmit}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sin negocio</CardTitle>
            <CardDescription>
              No se encontró un negocio asociado a la sesión.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
