import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const departmentSchema = new mongoose.Schema({
  name:        String,
  head:        String,
  staffCount:  Number,
  description: String,
  color:       String,
  floor:       String,
  capacity:    String,
  status:      String,
  phone:       String,
}, docSchemaOpts)

export default mongoose.model('Department', departmentSchema)
