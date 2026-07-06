import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const appointmentSchema = new mongoose.Schema({
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

export default mongoose.model('Appointment', appointmentSchema)
