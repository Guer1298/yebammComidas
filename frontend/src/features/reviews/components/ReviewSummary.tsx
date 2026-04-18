import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card'

export interface ReviewSummaryProps {
  averageRating: number
  totalReviews: number
  distribution?: {
    stars5?: number
    stars4?: number
    stars3?: number
    stars2?: number
    stars1?: number
  }
}

function percentage(value: number, total: number) {
  if (total <= 0) return 0
  return Math.round((value / total) * 100)
}

export default function ReviewSummary({
  averageRating,
  totalReviews,
  distribution = {},
}: ReviewSummaryProps) {
  const rows = [
    { label: '5 estrellas', value: distribution.stars5 ?? 0 },
    { label: '4 estrellas', value: distribution.stars4 ?? 0 },
    { label: '3 estrellas', value: distribution.stars3 ?? 0 },
    { label: '2 estrellas', value: distribution.stars2 ?? 0 },
    { label: '1 estrella', value: distribution.stars1 ?? 0 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de reseñas</CardTitle>
        <CardDescription>
          Reputación visible para reforzar confianza antes del CTA.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="rounded-3xl bg-slate-50 p-6 text-center">
          <p className="text-4xl font-bold text-slate-900">
            {averageRating.toFixed(1)}
          </p>
          <p className="mt-2 text-sm font-medium text-amber-500">
            {'★'.repeat(Math.round(averageRating))}
            {'☆'.repeat(5 - Math.round(averageRating))}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Basado en {totalReviews} reseña{totalReviews === 1 ? '' : 's'}
          </p>
        </div>

        <div className="space-y-3">
          {rows.map((row) => {
            const percent = percentage(row.value, totalReviews)

            return (
              <div key={row.label} className="grid grid-cols-[90px_1fr_40px] items-center gap-3">
                <span className="text-sm text-slate-600">{row.label}</span>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <span className="text-right text-sm text-slate-500">
                  {row.value}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}