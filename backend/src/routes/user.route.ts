import express from 'express'
import { verifyJwt } from '../middleware/auth.middleware.js'
import { loginUser, logoutUser, refreshAccessToken, registerUser, updateProfile } from '../controllers/auth.controller.js'
import { getDashboardStats } from '../controllers/dashboard.controller.js'
import { authLimiter } from '../middleware/rateLimiter.middleware.js'
const router = express.Router()

router.post('/register', authLimiter, registerUser)
router.post('/login', authLimiter, loginUser)
router.get('/logout',verifyJwt ,logoutUser)
router.get('/refresh', refreshAccessToken)
router.patch('/update-profile', verifyJwt, updateProfile)
router.get('/stats', verifyJwt, getDashboardStats)
export default router