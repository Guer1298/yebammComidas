import type { MenuCategory } from '../api'
import MenuCategoryNav from './MenuCategoryNav'
import MenuCategorySection from './MenuCategorySection'

export interface MenuCatalogProps {
  businessName: string
  businessCategory?: string
  categories: MenuCategory[]
  activeCategoryId?: number | null
  onSelectCategory?: (id: number) => void
  onOpenProduct?: (productId: number) => void
  onOrder?: (productName: string) => void
}

export default function MenuCatalog({
  businessName,
  businessCategory,
  categories,
  activeCategoryId,
  onSelectCategory,
  onOpenProduct,
  onOrder,
}: MenuCatalogProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500">
        Todavía no hay categorías visibles para esta carta.
      </div>
    )
  }

  const navItems = categories.map((category) => ({
    id: category.id,
    label: category.name,
  }))

  return (
    <div className="space-y-6">
      <MenuCategoryNav
        items={navItems}
        activeId={activeCategoryId}
        onSelect={onSelectCategory}
      />

      <div className="space-y-6">
        {categories.map((category) => (
          <MenuCategorySection
            key={category.id}
            id={`menu-category-${category.id}`}
            category={category}
            businessName={businessName}
            businessCategory={businessCategory}
            onOpenProduct={onOpenProduct}
            onOrder={onOrder}
          />
        ))}
      </div>
    </div>
  )
}
