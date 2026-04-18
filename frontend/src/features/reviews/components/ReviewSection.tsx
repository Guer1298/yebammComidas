import SectionHeader from '../../../components/shared/SectionHeader'
import ReviewSummary from './ReviewSummary'
import ReviewCard, { type ReviewCardData } from './ReviewCard'
import ReviewForm, { type ReviewFormValues } from './ReviewForm'
import { Link } from 'react-router-dom'

export interface ReviewSectionProps {
  title?: string
  description?: string
  averageRating: number
  totalReviews: number
  distribution?: {
    stars5?: number
    stars4?: number
    stars3?: number
    stars2?: number
    stars1?: number
  }
  reviews: ReviewCardData[]
  onSubmitReview?: (values: ReviewFormValues) => void
  submitLoading?: boolean
  canSubmitReview?: boolean
  currentUserName?: string
}

export default function ReviewSection({
  title = 'Reseñas y reputación',
  description = 'La prueba social correcta ayuda a reducir incertidumbre y mejorar la conversión.',
  averageRating,
  totalReviews,
  distribution,
  reviews,
  onSubmitReview,
  submitLoading = false,
  canSubmitReview = false,
  currentUserName,
}: ReviewSectionProps) {
  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Reviews"
        title={title}
        description={description}
      />

      <ReviewSummary
        averageRating={averageRating}
        totalReviews={totalReviews}
        distribution={distribution}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <h3 className="text-lg font-semibold text-slate-900">
                Aún no hay reseñas
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Sé la primera persona en compartir su experiencia.
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          {canSubmitReview ? (
            <div className="space-y-4">
              {currentUserName ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Estás reseñando como <span className="font-semibold text-slate-900">{currentUserName}</span>.
                </div>
              ) : null}
              <ReviewForm
                onSubmit={onSubmitReview}
                loading={submitLoading}
              />
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Inicia sesión para reseñar
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Solo los usuarios registrados pueden publicar reseñas. Así mantenemos la
                reputación ligada a cuentas reales.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Crear cuenta
                </Link>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
