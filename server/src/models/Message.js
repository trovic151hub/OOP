import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const messageSchema = new mongoose.Schema({
  text:        String,
  senderId:    String,
  senderName:  String,
  senderRole:  String,
  // null/absent = broadcast to the shared staff channel; a user id = private 1:1 DM
  recipientId: { type: String, default: null },
  readBy: [{ userId: String, readAt: String }],
}, docSchemaOpts)

messageSchema.index({ createdAt: 1 })
messageSchema.index({ recipientId: 1, createdAt: 1 })
messageSchema.index({ senderId: 1, recipientId: 1, createdAt: 1 })

export default mongoose.model('Message', messageSchema)
