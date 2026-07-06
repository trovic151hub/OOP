import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const roomSchema = new mongoose.Schema({
  roomNumber:  String,
  type:        String,
  floor:       String,
  capacity:    Number,
  status:      String,
  patientName: String,
  patientId:   String,
  notes:       String,
}, docSchemaOpts)

export default mongoose.model('Room', roomSchema)
