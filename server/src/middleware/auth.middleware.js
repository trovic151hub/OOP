import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import User from '../models/User.js'

async function attachUserFromToken(req, res, next, { optional = false } = {}) {
  const token = req.cookies?.mc_token
  if (!token) {
    if (optional) return next()
    return res.status(401).json({ message: 'Not authenticated' })
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret)
    const user = await User.findById(payload.sub)
    if (!user) {
      if (optional) return next()
      return res.status(401).json({ message: 'Not authenticated' })
    }
    req.user = {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    }
    next()
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired session' })
    }
    next(err)
  }
}

export function verifyAuth(req, res, next) {
  return attachUserFromToken(req, res, next)
}

export function optionalAuth(req, res, next) {
  return attachUserFromToken(req, res, next, { optional: true })
}
