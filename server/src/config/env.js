import dotenv from 'dotenv'

dotenv.config()

function required(name, fallback) {
  const value = process.env[name] ?? fallback
  if (value === undefined) throw new Error(`Missing required env var: ${name}`)
  return value
}

export const env = {
  nodeEnv:      process.env.NODE_ENV || 'development',
  port:         Number(process.env.PORT || 5001),
  mongoUri:     required('MONGODB_URI', 'mongodb://localhost:27017/medcore'),
  jwtSecret:    required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  csrfSecret:   required('CSRF_SECRET'),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5000',
  appUrl:       process.env.APP_URL || 'http://localhost:5000',
  smtp: {
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user:   process.env.SMTP_USER,
    pass:   process.env.SMTP_PASS,
    from:   process.env.MAIL_FROM || 'MedCore <no-reply@medcore.local>',
  },
}

// Frontend (Vercel) and backend (Render) live on different origins in
// production, so cookies must be SameSite=None to be sent on cross-origin
// fetch() calls at all — which in turn requires Secure. In dev, the Vite
// proxy makes everything same-origin, where 'lax' is correct and 'none'
// would be rejected anyway since dev runs over plain http.
export const crossSiteCookieOptions = {
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  secure:   env.nodeEnv === 'production',
}
