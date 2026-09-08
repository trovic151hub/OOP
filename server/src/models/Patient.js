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
  emergencyContact: String,
  allergies:        String,
  insurance:        String,
  notes:            String,
}, docSchemaOpts)

export default mongoose.model('Patient', patientSchema)
