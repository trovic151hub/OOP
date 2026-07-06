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

export default mongoose.model('Invoice', invoiceSchema)
