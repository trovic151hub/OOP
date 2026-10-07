import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const nurseSchema = new mongoose.Schema({
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
  uid:          String, // links to a User's id once promoted to the 'Nurse' role
}, docSchemaOpts)

nurseSchema.index({ email: 1 })
nurseSchema.index({ uid: 1 })
nurseSchema.index({ department: 1, specialty: 1 })
nurseSchema.index({ createdAt: -1 })

export default mongoose.model('Nurse', nurseSchema)
