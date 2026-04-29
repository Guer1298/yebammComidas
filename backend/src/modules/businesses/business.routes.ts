import { Router } from 'express'
import {
  createBusinessHandler,
  findAllBusinesses,
  findAllBusinessesForAdmin,
  findBusinessById,
  deleteBusinessHandler,
  toggleBusinessLikeHandler,
  updateBusinessProfileImageHandler,
  updateBusinessHandler,
} from './business.controller'
import { requireAuth } from '../../shared/middleware/requireAuth'
import { requireRole } from '../../shared/middleware/requireRole'

const router = Router()

router.get('/', findAllBusinesses)
router.get(
  '/admin',
  requireAuth,
  requireRole('ADMIN'),
  findAllBusinessesForAdmin
)
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  createBusinessHandler
)
router.get('/:id', findBusinessById)
router.patch(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'BUSINESS_ADMIN'),
  updateBusinessHandler
)
router.patch(
  '/:id/profile-image',
  requireAuth,
  requireRole('ADMIN', 'BUSINESS_ADMIN'),
  updateBusinessProfileImageHandler
)
router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  deleteBusinessHandler
)
router.post(
  '/:id/like',
  requireAuth,
  toggleBusinessLikeHandler
)

export default router
