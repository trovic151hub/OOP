import crypto from 'crypto'
import { crossSiteCookieOptions } from '../config/env.js'

const CSRF_COOKIE = 'mc_csrf'
const CSRF_HEADER = 'x-csrf-token'
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

// Double-submit cookie pattern: a non-httpOnly cookie holds a random token;
// the frontend echoes it back in a header on mutating requests. Since the
// httpOnly session cookie can't be read/forged by a cross-site page but this
// token cookie can, a mismatch means the request wasn't issued by our own JS.
export function issueCsrfToken(res) {
  const token = crypto.randomBytes(32).toString('hex')
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    ...crossSiteCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
  return token
}

export function verifyCsrf(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next()
  const cookieToken = req.cookies?.[CSRF_COOKIE]
  const headerToken = req.headers[CSRF_HEADER]
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ message: 'Invalid CSRF token' })
  }
  next()
}
