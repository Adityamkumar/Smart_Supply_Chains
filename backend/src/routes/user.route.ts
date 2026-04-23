import express from 'express'
import { verifyJwt } from '../middleware/auth.middleware.js'
import { loginUser, logoutUser, refreshAccessToken, registerUser, updateProfile, rateVolunteer, getAllVolunteers } from '../controllers/auth.controller.js'
import { getDashboardStats } from '../controllers/dashboard.controller.js'
import { authLimiter } from '../middleware/rateLimiter.middleware.js'
import { authorizeRoles } from '../middleware/role.middleware.js'
const router = express.Router()

router.post('/register', authLimiter, registerUser)
router.post('/login', authLimiter, loginUser)
router.get('/logout',verifyJwt ,logoutUser)
router.get('/refresh', refreshAccessToken)
router.patch('/update-profile', verifyJwt, updateProfile)
router.get('/stats', verifyJwt, getDashboardStats)
router.get('/all-volunteers', verifyJwt, authorizeRoles('admin'), getAllVolunteers)
router.post('/rate-volunteer', rateVolunteer)
export default router