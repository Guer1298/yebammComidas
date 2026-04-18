import Badge from '../../../components/ui/Badge'

export type GalleryMediaItem = {
  id: number | string
  type: 'image' | 'video'
  title?: string
  url: string
  thumbnailUrl?: string
  alt?: string
  isFeatured?: boolean
}

interface GalleryGridProps {
  items: GalleryMediaItem[]
  onSelect?: (item: GalleryMediaItem, index: number) => void
}

export default function GalleryGrid({
  items,
  onSelect,
}: GalleryGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h3 className="text-lg font-semibold text-slate-900">
          No hay contenido visual disponible
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Cuando este negocio publique fotos o videos, aparecerán aquí.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item, index) => {
        const preview = item.type === 'video' ? item.thumbnailUrl || item.url : item.url

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item, index)}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative">
              <img
                src={preview}
                alt={item.alt || item.title || 'Media item'}
                className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <Badge>{item.type === 'video' ? 'Video' : 'Imagen'}</Badge>
                {item.isFeatured && <Badge variant="warning">Destacado</Badge>}
              </div>

              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-slate-900 shadow-lg">
                    ▶
                  </div>
                </div>
              )}
            </div>

            <div className="p-4">
              <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                {item.title || (item.type === 'video' ? 'Video del negocio' : 'Imagen del negocio')}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Haz clic para ver en detalle
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
