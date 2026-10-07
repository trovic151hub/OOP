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

roomSchema.index({ createdAt: -1 })
roomSchema.index({ status: 1, roomNumber: 1 })
roomSchema.index({ patientId: 1 })

export default mongoose.model('Room', roomSchema)
