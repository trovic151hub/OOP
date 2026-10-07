import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const doctorSchema = new mongoose.Schema({
  name:         String,
  specialty:    String,
  department:   String,
  email:        String,
  phone:        String,
  photo:        { type: String, default: '' },
  availability: String,
  experience:   String,
  schedule:     String,
  about:        String,
  uid:          String, // links to a User's id once promoted to the 'Doctor' role
}, docSchemaOpts)

doctorSchema.index({ email: 1 })
doctorSchema.index({ uid: 1 })
doctorSchema.index({ department: 1, specialty: 1 })
doctorSchema.index({ createdAt: -1 })

export default mongoose.model('Doctor', doctorSchema)
