import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { formatMenuPrice, type MenuProduct } from '../api'

export interface MenuItemCardProps {
  product: MenuProduct
  businessName: string
  businessCategory?: string
  onOpenProduct?: () => void
  onOrder?: () => void
}

export default function MenuItemCard({
  product,
  businessName,
  businessCategory,
  onOpenProduct,
  onOrder,
}: MenuItemCardProps) {
  return (
    <article className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <img
        src={
          product.imageUrl ||
          'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=400&q=80'
        }
        alt={product.name}
        className="h-20 w-20 rounded-2xl object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">{product.name}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {businessName}
            </p>
          </div>
          <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
            {formatMenuPrice(product.price, product.currency || 'COP')}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {product.shortDescription || product.description || 'Producto visible en la carta'}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {businessCategory ? <Badge>{businessCategory}</Badge> : null}
          {product.isFeatured ? <Badge variant="success">Destacado</Badge> : null}
        </div>

        <div className="mt-4 flex gap-2">
          {onOpenProduct ? (
            <Button variant="outline" size="sm" onClick={onOpenProduct}>
              Ver plato
            </Button>
          ) : null}
          {onOrder ? (
            <Button size="sm" onClick={onOrder}>
              Pedir
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
