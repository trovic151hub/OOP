import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const pharmacyOrderSchema = new mongoose.Schema({
  patientName:     String,
  doctorName:      String,
  medications:     mongoose.Schema.Types.Mixed,
  instructions:    String,
  status:          String,
  prescriptionId:  String,
  pharmacistName:  String,
  dispensedAt:     String,
  advancePayment:  Number,
  notes:           String,
}, docSchemaOpts)

export default mongoose.model('PharmacyOrder', pharmacyOrderSchema)
