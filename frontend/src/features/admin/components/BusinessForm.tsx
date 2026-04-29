import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card'

export interface BusinessFormValues {
  name: string
  category: string
  businessType: string
  description: string
  aboutArticle: string
  city: string
  address: string
  phone: string
  whatsapp: string
  email: string
  website: string
  instagram: string
  coverImageUrl: string
  adminEmail?: string
  adminPassword?: string
  adminPasswordConfirm?: string
}

interface BusinessFormProps {
  initialValues?: Partial<BusinessFormValues>
  onSubmit?: (values: BusinessFormValues) => void
  onUploadCover?: (file: File) => Promise<string>
  allowFileUpload?: boolean
  showAccessCredentials?: boolean
  loading?: boolean
}

export default function BusinessForm({
  initialValues = {},
  onSubmit,
  onUploadCover,
  allowFileUpload = true,
  showAccessCredentials = false,
  loading = false,
}: BusinessFormProps) {
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [formError, setFormError] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)
  const [values, setValues] = useState<BusinessFormValues>({
    name: initialValues.name || '',
    category: initialValues.category || '',
    businessType: initialValues.businessType || '',
    description: initialValues.description || '',
    aboutArticle: initialValues.aboutArticle || '',
    city: initialValues.city || '',
    address: initialValues.address || '',
    phone: initialValues.phone || '',
    whatsapp: initialValues.whatsapp || '',
    email: initialValues.email || '',
    website: initialValues.website || '',
    instagram: initialValues.instagram || '',
    coverImageUrl: initialValues.coverImageUrl || '',
    adminEmail: initialValues.adminEmail || '',
    adminPassword: initialValues.adminPassword || '',
    adminPasswordConfirm: initialValues.adminPasswordConfirm || '',
  })

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview('')
      return
    }

    const preview = URL.createObjectURL(coverFile)
    setCoverPreview(preview)

    return () => URL.revokeObjectURL(preview)
  }, [coverFile])

  function handleChange<K extends keyof BusinessFormValues>(
    key: K,
    value: BusinessFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setFormError('')

      let nextCoverImageUrl = values.coverImageUrl.trim()

      if (showAccessCredentials) {
        const nextAdminEmail = values.adminEmail?.trim() || values.email.trim()
        const nextAdminPassword = values.adminPassword?.trim()
        const nextAdminPasswordConfirm = values.adminPasswordConfirm?.trim()

        if (!nextAdminEmail) {
          setFormError('Debes definir un correo de acceso inicial.')
          return
        }

        if (!nextAdminPassword) {
          setFormError('Debes definir una contraseña de acceso inicial.')
          return
        }

        if (nextAdminPassword.length < 6) {
          setFormError('La contraseña de acceso debe tener al menos 6 caracteres.')
          return
        }

        if (nextAdminPassword !== nextAdminPasswordConfirm) {
          setFormError('Las contraseñas de acceso no coinciden.')
          return
        }

      }

      if (coverFile && onUploadCover) {
        setCoverUploading(true)
        nextCoverImageUrl = await onUploadCover(coverFile)
      }

      if (!nextCoverImageUrl) {
        setFormError('Debes subir una portada o pegar una URL.')
        return
      }

      await onSubmit?.({
        ...values,
        coverImageUrl: nextCoverImageUrl,
        adminEmail: values.adminEmail?.trim() || values.email.trim(),
        adminPassword: values.adminPassword?.trim(),
      })
    } catch (error: any) {
      setFormError(
        error?.response?.data?.message ||
          error?.message ||
          'No fue posible completar el alta'
      )
    } finally {
      setCoverUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del negocio</CardTitle>
        <CardDescription>
          Actualiza los datos clave que verán los usuarios en la plataforma.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Nombre del negocio"
              value={values.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ej. Burger House"
            />

            <Input
              label="Categoría"
              value={values.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="Ej. Hamburguesas"
            />
          </div>

          {allowFileUpload ? (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Portada del negocio
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-2xl file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-orange-600"
              />
              <p className="text-sm text-slate-500">
                Sube una imagen o pega una URL directa. La portada es obligatoria.
              </p>
              {(coverPreview || values.coverImageUrl) && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <img
                    src={coverPreview || values.coverImageUrl}
                    alt={values.name || 'Portada del negocio'}
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
              {formError ? (
                <p className="text-sm text-red-600">{formError}</p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Portada del negocio
              </label>
              <p className="text-sm text-slate-500">
                Para crear el negocio, pega una URL directa de portada. La subida de archivos
                se realiza después desde el panel de media.
              </p>
              {values.coverImageUrl && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <img
                    src={values.coverImageUrl}
                    alt={values.name || 'Portada del negocio'}
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
            </div>
          )}

          <Input
            label="URL de portada"
            value={values.coverImageUrl}
            onChange={(e) => handleChange('coverImageUrl', e.target.value)}
            placeholder="https://..."
            hint={
              allowFileUpload
                ? 'Opcional si subes un archivo; se completará automáticamente.'
              : 'Obligatoria para crear el negocio.'
            }
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Tipo de negocio"
              value={values.businessType}
              onChange={(e) => handleChange('businessType', e.target.value)}
              placeholder="Ej. Restaurante"
            />

            <Input
              label="Correo de contacto"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="contacto@ejemplo.com"
            />
          </div>

          {showAccessCredentials ? (
            <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Credenciales de acceso inicial
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Este acceso queda listo para que el negocio entre al panel con su propio correo y contraseña.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Correo de acceso inicial"
                  value={values.adminEmail || ''}
                  onChange={(e) => handleChange('adminEmail', e.target.value)}
                  placeholder={values.email || 'admin@negocio.com'}
                  hint="Si lo dejas vacío, se usará el correo del negocio."
                />

                <Input
                  label="Contraseña de acceso inicial"
                  type="password"
                  value={values.adminPassword || ''}
                  onChange={(e) => handleChange('adminPassword', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <Input
                label="Confirmar contraseña"
                type="password"
                value={values.adminPasswordConfirm || ''}
                onChange={(e) => handleChange('adminPasswordConfirm', e.target.value)}
                placeholder="Repite la contraseña"
              />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Descripción
            </label>
            <textarea
              value={values.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={5}
              placeholder="Describe brevemente la propuesta del negocio"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Ciudad"
              value={values.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Ej. Bogotá"
            />

            <Input
              label="Dirección"
              value={values.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Ej. Calle 45 #12-10"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Teléfono"
              value={values.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Ej. 3000000000"
            />

            <Input
              label="WhatsApp"
              value={values.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              placeholder="Ej. 573000000000"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Sitio web"
              value={values.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://..."
            />

            <Input
              label="Instagram"
              value={values.instagram}
              onChange={(e) => handleChange('instagram', e.target.value)}
              placeholder="@tu_cuenta"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Sobre el negocio
            </label>
            <textarea
              value={values.aboutArticle}
              onChange={(e) => handleChange('aboutArticle', e.target.value)}
              rows={4}
              placeholder="Historia o presentación extendida del negocio"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <Button type="submit" loading={loading || coverUploading}>
            Guardar cambios
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
