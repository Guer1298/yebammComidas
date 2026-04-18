import { Router } from 'express'
import {
  createReviewHandler,
  findReviewsByBusinessId,
} from './reviews.controller'
import { requireAuth } from '../../shared/middleware/requireAuth'

const router = Router()

router.get('/businesses/:id/reviews', findReviewsByBusinessId)
router.post('/reviews', requireAuth, createReviewHandler)

export default router