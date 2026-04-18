import { Router } from 'express'
import {
  createProductHandler,
  deactivateProductHandler,
  findProductById,
  updateProductHandler,
} from './products.controller'
import { requireAuth } from '../../shared/middleware/requireAuth'
import { requireRole } from '../../shared/middleware/requireRole'

const router = Router()

router.get('/:id', findProductById)

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'BUSINESS_ADMIN'),
  createProductHandler
)

router.patch(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'BUSINESS_ADMIN'),
  updateProductHandler
)

router.patch(
  '/:id/deactivate',
  requireAuth,
  requireRole('ADMIN', 'BUSINESS_ADMIN'),
  deactivateProductHandler
)

export default router