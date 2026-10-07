import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const documentSchema = new mongoose.Schema({
  patientName: String,
  patientId:   String,
  patientEmail: String,
  title:       String,
  type:        String,
  date:        String,
  description: String,
  url:         String,
  size:        String,
  uploadedBy:  String,
  notes:       String,
}, docSchemaOpts)

documentSchema.index({ date: -1 })
documentSchema.index({ patientId: 1, date: -1 })
documentSchema.index({ patientEmail: 1, date: -1 })
documentSchema.index({ reviewStatus: 1, date: -1 })

export default mongoose.model('Document', documentSchema)
