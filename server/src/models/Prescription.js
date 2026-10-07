import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const prescriptionSchema = new mongoose.Schema({
  patientId:   String,
  patientEmail: String,
  patientName: String,
  doctorName:  String,
  date:        String,
  status:      String,
  notes:       String,
  medications: mongoose.Schema.Types.Mixed,
}, docSchemaOpts)

prescriptionSchema.index({ date: -1 })
prescriptionSchema.index({ patientId: 1, date: -1 })
prescriptionSchema.index({ patientEmail: 1, date: -1 })
prescriptionSchema.index({ status: 1, date: -1 })

export default mongoose.model('Prescription', prescriptionSchema)
