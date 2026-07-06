import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function verifyAuth(req, res, next) {
  const token = req.cookies?.mc_token
  if (!token) return res.status(401).json({ message: 'Not authenticated' })
  try {
    const payload = jwt.verify(token, env.jwtSecret)
    req.user = { id: payload.sub, role: payload.role, name: payload.name, email: payload.email }
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session' })
  }
}
