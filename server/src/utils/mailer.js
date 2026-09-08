import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

let transporter = null

function getTransporter() {
  if (!env.smtp.host) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host:   env.smtp.host,
      port:   env.smtp.port,
      secure: env.smtp.secure,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    })
  }
  return transporter
}

export async function sendPasswordResetEmail(toEmail, resetUrl) {
  const t = getTransporter()
  if (!t) {
    console.warn(`SMTP not configured — password reset link for ${toEmail}: ${resetUrl}`)
    return
  }
  await t.sendMail({
    from:    env.smtp.from,
    to:      toEmail,
    subject: 'Reset your MedCore password',
    html: `
      <p>We received a request to reset your MedCore password.</p>
      <p><a href="${resetUrl}">Click here to choose a new password</a> (link expires in 1 hour).</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  })
}

export async function sendTestEmail(toEmail) {
  const t = getTransporter()
  if (!t) {
    const err = new Error('SMTP is not configured.')
    err.code = 'SMTP_NOT_CONFIGURED'
    throw err
  }
  await t.sendMail({
    from: env.smtp.from,
    to: toEmail,
    subject: 'MedCore SMTP test',
    text: 'Your MedCore SMTP settings are working.',
  })
}
