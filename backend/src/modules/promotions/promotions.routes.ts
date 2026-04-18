import { Router } from 'express'
import {
  createPromotionHandler,
  deactivatePromotionHandler,
  findAllPromotions,
  findPromotionById,
  findPromotionsByBusinessId,
  updatePromotionHandler,
} from './promotions.controller'
import { requireAuth } from '../../shared/middleware/requireAuth'
import { requireRole } from '../../shared/middleware/requireRole'

const router = Router()

router.get('/', findAllPromotions)
router.get('/businesses/:id/promotions', findPromotionsByBusinessId)
router.get('/:id', findPromotionById)

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'BUSINESS_ADMIN'),
  createPromotionHandler
)

router.patch(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'BUSINESS_ADMIN'),
  updatePromotionHandler
)

router.patch(
  '/:id/deactivate',
  requireAuth,
  requireRole('ADMIN', 'BUSINESS_ADMIN'),
  deactivatePromotionHandler
)

export default router
