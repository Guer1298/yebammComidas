import { useEffect, useState } from 'react'
import MediaUploader from './components/MediaUploader'
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card'
import { getBusinessById } from '../businesses/api'
import { uploadMediaFile } from '../media/api'
import { getPrimaryBusinessId } from '../../lib/session'

type MediaAsset = {
  id: number
  url: string
  type: 'IMAGE' | 'VIDEO'
  isPrimary: boolean
}

type BusinessDetail = {
  id: number
  name: string
  mediaAssets?: MediaAsset[]
}

export default function AdminMediaPage() {
  const businessId = getPrimaryBusinessId()
  const [business, setBusiness] = useState<BusinessDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

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
        setBusiness(data)
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            'No fue posible cargar la media del negocio'
        )
      } finally {
        setLoading(false)
      }
    }

    loadBusiness()
  }, [businessId])

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0 || !businessId) return

    setUploading(true)
    setError('')

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('businessId', String(businessId))
        formData.append('file', file)
        await uploadMediaFile(formData)
      }

      const refreshed = await getBusinessById<BusinessDetail>(businessId)
      setBusiness(refreshed)
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'No fue posible subir la media'
      )
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div>Cargando media...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
          Media
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Administra imágenes y videos
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Mantén actualizada la vitrina visual del negocio.
        </p>
      </div>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">{error}</CardContent>
        </Card>
      ) : null}

      <MediaUploader onUpload={handleUpload} />

      <Card>
        <CardHeader>
          <CardTitle>Media publicada</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(business?.mediaAssets ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">
              Aún no hay recursos visuales publicados.
            </p>
          ) : (
            business?.mediaAssets?.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
              >
                <img
                  src={item.url}
                  alt={`media-${item.id}`}
                  className="h-52 w-full object-cover"
                />
                <div className="p-4 text-sm text-slate-600">
                  {item.type}
                  {item.isPrimary ? ' · Principal' : ''}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {uploading ? (
        <p className="text-sm text-slate-500">Subiendo archivos...</p>
      ) : null}
    </div>
  )
}
