import mongoose from 'mongoose'
import { idTransform } from './plugins.js'

const auditLogSchema = new mongoose.Schema({
  action:     String,
  entity:     String,
  entityName: String,
  userId:     String,
  userName:   String,
  timestamp:  { type: String, default: () => new Date().toISOString() },
}, { toJSON: { transform: idTransform.transform, virtuals: true } })

export default mongoose.model('AuditLog', auditLogSchema)
