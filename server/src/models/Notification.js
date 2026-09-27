import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const notificationSchema = new mongoose.Schema({
  userId: String,
  recipientUserId: String,
  recipientRoles: { type: [String], default: undefined },
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

export default mongoose.model('Notification', notificationSchema)
