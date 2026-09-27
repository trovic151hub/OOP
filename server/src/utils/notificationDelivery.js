import nodemailer from 'nodemailer'
import Notification from '../models/Notification.js'
import { env } from '../config/env.js'
import { emitChanged } from './realtime.js'

let transporter

function getTransporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    })
  }
  return transporter
}

export async function deliverNotification(data, channels = {}) {
  const notification = await Notification.create({
    ...data,
    audience: data.audience || (data.recipientRoles?.length || data.recipientUserId ? 'staff' : 'patient'),
    read: false,
    createdAt: new Date().toISOString(),
  })

  if (channels.req) emitChanged(channels.req, 'notifications')

  const mailer = getTransporter()
  if (mailer && data.patientEmail) {
    await mailer.sendMail({
      from: env.smtp.from,
      to: data.patientEmail,
      subject: data.title,
      text: data.message,
    })
  } else if (data.patientEmail) {
    console.info(`[notification:email:stub] ${data.patientEmail} - ${data.title}`)
  }

  if (channels.phone) {
    console.info(`[notification:sms:stub] ${channels.phone} - ${data.title}`)
  }

  return notification
}

export function deliverStaffNotification(data, req) {
  return deliverNotification({
    audience: 'staff',
    recipientRoles: data.recipientRoles || ['Admin', 'Doctor', 'Nurse', 'Receptionist'],
    recipientUserId: data.recipientUserId || '',
    priority: data.priority || 'Normal',
    ...data,
  }, { req })
}
