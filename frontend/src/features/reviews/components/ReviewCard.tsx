import Card, { CardContent } from '../../../components/ui/Card'

export interface ReviewCardData {
  id: number | string
  authorName: string
  rating: number
  comment: string
  createdAt?: string
  productName?: string
  isVerified?: boolean
}

interface ReviewCardProps {
  review: ReviewCardData
}

function formatDate(value?: string) {
  if (!value) return 'Fecha no disponible'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function renderStars(rating: number) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)))
  return '★'.repeat(safeRating) + '☆'.repeat(5 - safeRating)
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {review.authorName}
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-amber-500">
                {renderStars(review.rating)}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">{formatDate(review.createdAt)}</span>
            </div>
          </div>

          {review.isVerified && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Verificada
            </span>
          )}
        </div>

        {review.productName && (
          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {review.productName}
          </div>
        )}

        <p className="text-sm leading-7 text-slate-600">{review.comment}</p>
      </CardContent>
    </Card>
  )
}
