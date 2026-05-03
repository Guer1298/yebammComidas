import { Router } from 'express'
import { requireAuth } from '../../shared/middleware/requireAuth'
import { requireRole } from '../../shared/middleware/requireRole'
import {
  createBusinessAdminHandler,
  deleteBusinessAdminHandler,
  getBusinessAdminHandler,
  getDashboardHandler,
  listActivityHandler,
  listBusinessAdminsHandler,
  updateBusinessAdminHandler,
  updateBusinessAdminPasswordHandler,
  updateBusinessAdminStatusHandler,
} from './admin.controller'

const router = Router()

router.use(requireAuth, requireRole('ADMIN'))

router.get('/dashboard', getDashboardHandler)
router.get('/activity', listActivityHandler)
router.get('/business-admins', listBusinessAdminsHandler)
router.post('/business-admins', createBusinessAdminHandler)
router.get('/business-admins/:id', getBusinessAdminHandler)
router.patch('/business-admins/:id', updateBusinessAdminHandler)
router.patch('/business-admins/:id/status', updateBusinessAdminStatusHandler)
router.patch('/business-admins/:id/password', updateBusinessAdminPasswordHandler)
router.delete('/business-admins/:id', deleteBusinessAdminHandler)

export default router
