import React from 'react'
import Button from '../ui/Button'

export interface NavbarLink {
  label: string
  href: string
  isActive?: boolean
}

export interface NavbarProps {
  brandName?: string
  brandHref?: string
  links?: NavbarLink[]
  onLogin?: () => void
  onRegister?: () => void
  onMenuToggle?: () => void
  rightSlot?: React.ReactNode
  showAuthActions?: boolean
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar({
  brandName = 'ProyectoC',
  brandHref = '/',
  links = [
    { label: 'Inicio', href: '#' },
    { label: 'Negocios', href: '#negocios' },
    { label: 'Promociones', href: '#promociones' },
    { label: 'Cómo funciona', href: '#como-funciona' },
  ],
  onLogin,
  onRegister,
  onMenuToggle,
  rightSlot,
  showAuthActions = true,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href={brandHref} className="flex items-center gap-3" aria-label={brandName}>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-sm font-bold text-white shadow-sm">
            {brandName.slice(0, 2).toUpperCase()}
          </div>

          <div className="leading-tight">
            <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">
              Plataforma
            </span>
            <span className="block text-base font-semibold text-slate-900">{brandName}</span>
          </div>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={cn(
                'text-sm font-medium transition',
                link.isActive
                  ? 'text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {rightSlot}
          {showAuthActions && (
            <>
              <Button variant="ghost" onClick={onLogin}>
                Iniciar sesión
              </Button>
              <Button onClick={onRegister}>Crear cuenta</Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onMenuToggle}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
          aria-label="Abrir menú"
        >
          ☰
        </button>
      </div>
    </header>
  )
}