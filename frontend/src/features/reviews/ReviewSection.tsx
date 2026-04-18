import { useEffect, useMemo, useState } from 'react'
import ReviewSectionView from './components/ReviewSection'
import { createReview, getBusinessReviews } from './api'
import { getStoredUser, isAuthenticated } from '../../lib/session'

type ReviewUser = {
  id: number
  name: string
}

type Review = {
  id: number
  rating: number
  comment?: string | null
  createdAt: string
  user?: ReviewUser
}

type ReviewsResponse = {
  businessId: number
  ratingAverage: number
  reviewsCount: number
  reviews: Review[]
}

type ReviewSectionProps = {
  businessId: number
}

export default function ReviewSection({ businessId }: ReviewSectionProps) {
  const [data, setData] = useState<ReviewsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadReviews() {
    try {
      setLoading(true)
      setError('')
      setData(await getBusinessReviews<ReviewsResponse>(businessId))
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'No fue posible cargar las reviews'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [businessId])

  const reviews = useMemo(
    () =>
      (data?.reviews ?? []).map((review) => ({
        id: review.id,
        authorName: review.user?.name || 'Usuario',
        rating: review.rating,
        comment: review.comment || 'Sin comentario.',
        createdAt: review.createdAt,
      })),
    [data]
  )

  const currentUser = getStoredUser()
  const canReview = isAuthenticated()

  if (loading) {
    return <section className="py-8 text-sm text-slate-500">Cargando reviews...</section>
  }

  if (error) {
    return (
      <section className="py-8 text-sm text-red-600">
        {error}
      </section>
    )
  }

  return (
    <ReviewSectionView
      averageRating={data?.ratingAverage ?? 0}
      totalReviews={data?.reviewsCount ?? 0}
      reviews={reviews}
      submitLoading={false}
      canSubmitReview={canReview}
      currentUserName={currentUser?.name}
      onSubmitReview={
        canReview
          ? async ({ rating, comment }) => {
              await createReview({ businessId, rating, comment })
              await loadReviews()
            }
          : undefined
      }
    />
  )
}
