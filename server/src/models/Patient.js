import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const patientSchema = new mongoose.Schema({
  uid:              String,
  name:             String,
  age:              Number,
  gender:           String,
  blood:            String,
  condition:        String,
  status:           String,
  patientType:      String,
  location:         String,
  phone:            String,
  email:            String,
  avatar:           { type: String, default: '' },
  emergencyContact: String,
  allergies:        String,
  insurance:        String,
  notes:            String,
}, docSchemaOpts)

patientSchema.index({ uid: 1 })
patientSchema.index({ email: 1 })
patientSchema.index({ name: 1 })
patientSchema.index({ createdAt: -1 })

export default mongoose.model('Patient', patientSchema)
