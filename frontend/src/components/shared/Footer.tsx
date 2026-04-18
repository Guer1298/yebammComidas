
export interface FooterLinkGroup {
  title: string
  links: Array<{
    label: string
    href: string
  }>
}

export interface FooterProps {
  brandName?: string
  description?: string
  linkGroups?: FooterLinkGroup[]
  bottomText?: string
}

export default function Footer({
  brandName = 'ProyectoC',
  description = 'Descubre negocios, explora productos, compara promociones y toma decisiones más rápido dentro del ecosistema de comidas rápidas.',
  linkGroups = [
    {
      title: 'Plataforma',
      links: [
        { label: 'Inicio', href: '#' },
        { label: 'Negocios', href: '#negocios' },
        { label: 'Promociones', href: '#promociones' },
      ],
    },
    {
      title: 'Cuenta',
      links: [
        { label: 'Iniciar sesión', href: '#login' },
        { label: 'Registrarse', href: '#register' },
      ],
    },
    {
      title: 'Negocios',
      links: [
        { label: 'Publica tu negocio', href: '#publicar' },
        { label: 'Panel administrativo', href: '#admin' },
      ],
    },
  ],
  bottomText = `© ${new Date().getFullYear()} ProyectoC. Todos los derechos reservados.`,
}: FooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 font-bold text-white shadow-sm">
              {brandName.slice(0, 2).toUpperCase()}
            </div>

            <div>
              <p className="text-sm text-slate-400">Plataforma digital</p>
              <h3 className="text-lg font-semibold text-white">{brandName}</h3>
            </div>
          </div>

          <p className="max-w-md text-sm leading-6 text-slate-400">{description}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3 lg:col-span-8">
          {linkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
                {group.title}
              </h4>

              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 transition hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>{bottomText}</p>
          <p>Diseñado para conversión, confianza visual y operación simple.</p>
        </div>
      </div>
    </footer>
  )
}