import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const labResultSchema = new mongoose.Schema({
  patientName: String,
  testName:    String,
  category:    String,
  result:      String,
  unit:        String,
  normalRange: String,
  status:      String,
  date:        String,
  orderedBy:   String,
  notes:       String,
}, docSchemaOpts)

export default mongoose.model('LabResult', labResultSchema)
