import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const prescriptionSchema = new mongoose.Schema({
  patientName: String,
  doctorName:  String,
  date:        String,
  status:      String,
  notes:       String,
  medications: mongoose.Schema.Types.Mixed,
}, docSchemaOpts)

export default mongoose.model('Prescription', prescriptionSchema)
