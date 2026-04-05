import express from 'express'
import { verifyJwt } from '../middleware/auth.middleware.js'
import { loginUser, logoutUser, refreshAccessToken, registerUser } from '../controllers/auth.controller.js'
const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/logout',verifyJwt ,logoutUser)
router.get('/refresh', refreshAccessToken)
export default router