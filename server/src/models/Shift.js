import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const shiftSchema = new mongoose.Schema({
  day:        String,
  shiftType:  String,
  doctorId:   String,
  doctorName: String,
  nurseId:    String,
  nurseName:  String,
  weekStart:  String,
}, docSchemaOpts)

export default mongoose.model('Shift', shiftSchema)
