import { Router } from 'express'
import multer from 'multer'
import { setPrimaryMediaHandler, uploadMediaHandler } from './media.controller'
import { requireAuth } from '../../shared/middleware/requireAuth'
import { requireRole } from '../../shared/middleware/requireRole'

const router = Router()

const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
})

router.post(
  '/upload',
  requireAuth,
  requireRole('ADMIN', 'BUSINESS_ADMIN'),
  upload.single('file'),
  uploadMediaHandler
)

router.patch(
  '/primary',
  requireAuth,
  requireRole('ADMIN', 'BUSINESS_ADMIN'),
  setPrimaryMediaHandler
)

export default router
