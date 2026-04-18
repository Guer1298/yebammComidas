export type MenuCategoryNavItem = {
  id: number
  label: string
}

export interface MenuCategoryNavProps {
  items: MenuCategoryNavItem[]
  activeId?: number | null
  onSelect?: (id: number) => void
}

export default function MenuCategoryNav({
  items,
  activeId,
  onSelect,
}: MenuCategoryNavProps) {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-2">
      {items.map((item) => {
        const active = activeId === item.id

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item.id)}
            className={[
              'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition',
              active
                ? 'bg-orange-500 text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
            ].join(' ')}
          >
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
