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

export default mongoose.model('Nurse', nurseSchema)
