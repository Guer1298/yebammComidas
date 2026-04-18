import { Router } from 'express'
import { createEvent } from './analytics.controller'

const router = Router()

router.post('/', createEvent)

export default router