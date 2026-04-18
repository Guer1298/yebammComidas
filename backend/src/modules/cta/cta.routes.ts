import { Router } from 'express'
import { registerCtaClickHandler } from './cta.controller'

const router = Router()

router.post('/click', registerCtaClickHandler)

export default router