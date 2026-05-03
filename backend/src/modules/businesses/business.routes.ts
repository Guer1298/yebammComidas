import { Router } from 'express'
import {
  createBusinessHandler,
  findAllBusinesses,
  findAllBusinessesForAdmin,
  findBusinessByIdForAdmin,
  findBusinessById,
  deleteBusinessHandler,
  toggleBusinessLikeHandler,
  toggleBusinessFollowHandler,
  toggleBusinessCustomerHandler,
  getBusinessCustomersHandler,
  getBusinessFollowersHandler,
  updateBusinessStatusHandler,
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
router.get(
  '/admin/:id',
  requireAuth,
  requireRole('ADMIN'),
  findBusinessByIdForAdmin
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
  '/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  updateBusinessStatusHandler
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
router.post(
  '/:id/follow',
  requireAuth,
  toggleBusinessFollowHandler
)
router.post(
  '/:id/customer',
  requireAuth,
  toggleBusinessCustomerHandler
)
router.get(
  '/:id/customers',
  getBusinessCustomersHandler
)
router.get(
  '/:id/followers',
  getBusinessFollowersHandler
)

export default router
