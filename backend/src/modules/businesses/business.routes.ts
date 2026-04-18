import { Router } from 'express'
import {
  findAllBusinesses,
  findBusinessById,
  updateBusinessHandler,
} from './business.controller'
import { requireAuth } from '../../shared/middleware/requireAuth'
import { requireRole } from '../../shared/middleware/requireRole'

const router = Router()

router.get('/', findAllBusinesses)
router.get('/:id', findBusinessById)
router.patch(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'BUSINESS_ADMIN'),
  updateBusinessHandler
)

export default router
