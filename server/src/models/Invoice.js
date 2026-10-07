import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const invoiceSchema = new mongoose.Schema({
  patientName:   String,
  patientId:     String,
  doctorName:    String,
  description:   String,
  services:      String,
  subtotal:      Number,
  discount:      Number,
  total:         Number,
  date:          String,
  status:        String,
  paymentMethod: String,
  notes:         String,
}, docSchemaOpts)

invoiceSchema.index({ date: -1 })
invoiceSchema.index({ patientId: 1, date: -1 })
invoiceSchema.index({ patientEmail: 1, date: -1 })
invoiceSchema.index({ status: 1, date: -1 })

export default mongoose.model('Invoice', invoiceSchema)
