import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const appointmentSchema = new mongoose.Schema({
  patientId:        String,
  patientEmail:     String,
  patientName:      String,
  doctorName:       String,
  type:             String,
  date:             String,
  timeStart:        String,
  timeEnd:          String,
  status:           String,
  notes:            String,
  requiresFollowUp: Boolean,
  followUpDate:     String,
}, docSchemaOpts)

appointmentSchema.index({ createdAt: -1 })
appointmentSchema.index({ patientId: 1, date: -1 })
appointmentSchema.index({ patientEmail: 1, date: -1 })
appointmentSchema.index({ status: 1, date: 1 })

export default mongoose.model('Appointment', appointmentSchema)
