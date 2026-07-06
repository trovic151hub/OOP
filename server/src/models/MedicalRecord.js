import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const medicalRecordSchema = new mongoose.Schema({
  patientId:   String,
  patientName: String,
  date:        String,
  type:        String,
  doctorName:  String,
  diagnosis:   String,
  treatment:   String,
  prescription: String,
  notes:       String,
  followUpDate: String,
}, docSchemaOpts)

export default mongoose.model('MedicalRecord', medicalRecordSchema)
