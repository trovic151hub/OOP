import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { optionalAuth, verifyAuth } from '../middleware/auth.middleware.js'
import { verifyCsrf } from '../middleware/csrf.middleware.js'

const router = Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password/:token', authController.resetPassword)
router.get('/me', optionalAuth, authController.me)
router.put('/password', verifyAuth, verifyCsrf, authController.changePassword)

export default router
