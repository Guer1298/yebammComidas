import { Link, useLocation, useNavigate } from 'react-router-dom'

type AdminNavItem = {
  label: string
  to: string
}

const DEFAULT_ITEMS: AdminNavItem[] = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Negocio', to: '/admin/business' },
  { label: 'Productos', to: '/admin/products' },
  { label: 'Media', to: '/admin/media' },
  { label: 'Promociones', to: '/admin/promotions' },
]

interface AdminSidebarProps {
  items?: AdminNavItem[]
  brandName?: string
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function AdminSidebar({
  items = DEFAULT_ITEMS,
  brandName = 'ProyectoC Admin',
}: AdminSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('auth_user')
    navigate('/login', { replace: true })
  }

  return (
    <aside className="w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
          Panel administrativo
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">{brandName}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Gestión operativa del negocio.
        </p>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to !== '/admin' && location.pathname.startsWith(item.to))

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-6 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
