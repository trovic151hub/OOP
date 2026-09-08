import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const notificationSchema = new mongoose.Schema({
  userId: String,
  patientId: String,
  patientEmail: String,
  title: String,
  message: String,
  type: String,
  target: String,
  read: { type: Boolean, default: false },
  readAt: String,
}, docSchemaOpts)

export default mongoose.model('Notification', notificationSchema)
