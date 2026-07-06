import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const doctorSchema = new mongoose.Schema({
  name:         String,
  specialty:    String,
  department:   String,
  email:        String,
  phone:        String,
  availability: String,
  experience:   String,
  schedule:     String,
  about:        String,
  uid:          String, // links to a User's id once promoted to the 'Doctor' role
}, docSchemaOpts)

export default mongoose.model('Doctor', doctorSchema)
