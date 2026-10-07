import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const labResultSchema = new mongoose.Schema({
  patientId:   String,
  patientEmail: String,
  patientName: String,
  testName:    String,
  category:    String,
  result:      String,
  unit:        String,
  normalRange: String,
  status:      String,
  date:        String,
  orderedBy:   String,
  notes:       String,
}, docSchemaOpts)

labResultSchema.index({ date: -1 })
labResultSchema.index({ patientId: 1, date: -1 })
labResultSchema.index({ patientEmail: 1, date: -1 })
labResultSchema.index({ status: 1, date: -1 })

export default mongoose.model('LabResult', labResultSchema)
