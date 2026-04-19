import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../features/admin/components/AdminSidebar'
import { getStoredUser } from '../../lib/session'

export default function AdminLayout() {
  const user = getStoredUser()
  const brandName =
    user?.name && user.role !== 'ADMIN'
      ? `${user.name} Admin`
      : 'Yebaam Admin'

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <AdminSidebar brandName={brandName} />
        <Outlet />
      </section>
    </main>
  )
}
