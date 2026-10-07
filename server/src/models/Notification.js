import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const notificationSchema = new mongoose.Schema({
  userId: String,
  recipientUserId: String,
  recipientRoles: { type: [String], default: undefined },
  excludedUserIds: { type: [String], default: undefined },
  audience: { type: String, enum: ['patient', 'staff'], default: 'patient' },
  patientId: String,
  patientEmail: String,
  title: String,
  message: String,
  type: String,
  target: String,
  targetEntityId: String,
  conversationKey: String,
  priority: { type: String, enum: ['Low', 'Normal', 'High'], default: 'Normal' },
  read: { type: Boolean, default: false },
  readAt: String,
  readBy: {
    type: [{
      userId: String,
      readAt: String,
    }],
    default: [],
  },
}, docSchemaOpts)

notificationSchema.index({ audience: 1, createdAt: -1 })
notificationSchema.index({ recipientUserId: 1, createdAt: -1 })
notificationSchema.index({ recipientRoles: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ patientEmail: 1, createdAt: -1 })
notificationSchema.index({ conversationKey: 1, createdAt: -1 })

export default mongoose.model('Notification', notificationSchema)
