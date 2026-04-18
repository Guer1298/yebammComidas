import type { MenuCategory } from '../api'
import MenuItemCard from './MenuItemCard'

export interface MenuCategorySectionProps {
  id?: string
  category: MenuCategory
  businessName: string
  businessCategory?: string
  onOpenProduct?: (productId: number) => void
  onOrder?: (productName: string) => void
}

export default function MenuCategorySection({
  category,
  businessName,
  businessCategory,
  onOpenProduct,
  onOrder,
  id,
}: MenuCategorySectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">{category.name}</h3>
          {category.description ? (
            <p className="mt-1 text-sm leading-6 text-slate-500">{category.description}</p>
          ) : null}
        </div>
        <span className="text-sm text-slate-500">
          {category.products.length} producto{category.products.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="mt-6 grid gap-4">
        {category.products.map((product) => (
          <MenuItemCard
            key={product.id}
            product={product}
            businessName={businessName}
            businessCategory={businessCategory}
            onOpenProduct={onOpenProduct ? () => onOpenProduct(product.id) : undefined}
            onOrder={onOrder ? () => onOrder(product.name) : undefined}
          />
        ))}
      </div>
    </section>
  )
}
