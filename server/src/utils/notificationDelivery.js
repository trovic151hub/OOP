import nodemailer from 'nodemailer'
import Notification from '../models/Notification.js'
import { env } from '../config/env.js'

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
    read: false,
    createdAt: new Date().toISOString(),
  })

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
