import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const messageSchema = new mongoose.Schema({
  text:        String,
  senderId:    String,
  senderName:  String,
  senderRole:  String,
  // null/absent = broadcast to the shared staff channel; a user id = private 1:1 DM
  recipientId: { type: String, default: null },
}, docSchemaOpts)

export default mongoose.model('Message', messageSchema)
