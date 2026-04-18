import { useState } from 'react'
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
}

interface BusinessFormProps {
  initialValues?: Partial<BusinessFormValues>
  onSubmit?: (values: BusinessFormValues) => void
  loading?: boolean
}

export default function BusinessForm({
  initialValues = {},
  onSubmit,
  loading = false,
}: BusinessFormProps) {
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
  })

  function handleChange<K extends keyof BusinessFormValues>(
    key: K,
    value: BusinessFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit?.(values)
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

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Tipo de negocio"
              value={values.businessType}
              onChange={(e) => handleChange('businessType', e.target.value)}
              placeholder="Ej. Restaurante"
            />

            <Input
              label="Correo"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="contacto@ejemplo.com"
            />
          </div>

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

          <Button type="submit" loading={loading}>
            Guardar cambios
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
