import crypto from 'crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { env, crossSiteCookieOptions } from '../config/env.js'
import { issueCsrfToken } from '../middleware/csrf.middleware.js'
import { sendPasswordResetEmail } from '../utils/mailer.js'

const SESSION_COOKIE = 'mc_token'

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, name: user.name, email: user.email },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  )
}

function setSessionCookie(res, token) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    ...crossSiteCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

function toPublicUser(user) {
  return {
    id: user._id.toString(),
    uid: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    bio: user.bio || '',
    lastSeen: user.lastSeen || '',
    createdAt: user.createdAt,
    mustChangePassword: !!user.mustChangePassword,
  }
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' })
    }
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' })

    const isFirstUser = (await User.countDocuments({})) === 0
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: passwordHash,
      role: isFirstUser ? 'Admin' : 'Receptionist',
    })

    const token = signToken(user)
    setSessionCookie(res, token)
    const csrfToken = issueCsrfToken(res)
    res.status(201).json({ user: toPublicUser(user), csrfToken })
  } catch (err) { next(err) }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' })

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ message: 'Invalid email or password.' })

    const token = signToken(user)
    setSessionCookie(res, token)
    const csrfToken = issueCsrfToken(res)
    res.json({ user: toPublicUser(user), csrfToken })
  } catch (err) { next(err) }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })
    const csrfToken = issueCsrfToken(res)
    res.json({ user: toPublicUser(user), csrfToken })
  } catch (err) { next(err) }
}

export async function logout(req, res) {
  res.clearCookie(SESSION_COOKIE, crossSiteCookieOptions)
  res.clearCookie('mc_csrf', crossSiteCookieOptions)
  res.status(204).end()
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required.' })
    const user = await User.findOne({ email: email.toLowerCase() })
    // Always respond the same way whether or not the account exists, to avoid leaking which emails are registered.
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex')
      user.resetPasswordTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
      user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000)
      await user.save()
      const resetUrl = `${env.appUrl}/?resetToken=${rawToken}`
      await sendPasswordResetEmail(user.email, resetUrl)
    }
    res.json({ message: 'If an account with that email exists, a reset link has been sent.' })
  } catch (err) { next(err) }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required.' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' })
    }
    const user = await User.findById(req.user.id).select('+password')
    if (!user) return res.status(401).json({ message: 'Not authenticated' })

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect.' })

    user.password = await bcrypt.hash(newPassword, 10)
    user.mustChangePassword = false
    await user.save()
    res.json({ message: 'Password updated.' })
  } catch (err) { next(err) }
}

export async function resetPassword(req, res, next) {
  try {
    const { token } = req.params
    const { password } = req.body
    if (!password) return res.status(400).json({ message: 'A new password is required.' })

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    }).select('+password +resetPasswordTokenHash +resetPasswordExpiresAt')

    if (!user) return res.status(400).json({ message: 'This reset link is invalid or has expired.' })

    user.password = await bcrypt.hash(password, 10)
    user.resetPasswordTokenHash = undefined
    user.resetPasswordExpiresAt = undefined
    user.mustChangePassword = false
    await user.save()
    res.json({ message: 'Password updated. You can now log in.' })
  } catch (err) { next(err) }
}
