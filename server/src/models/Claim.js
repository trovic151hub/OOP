import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const claimSchema = new mongoose.Schema({
  patientName:       String,
  insuranceProvider: String,
  policyNumber:      String,
  groupNumber:       String,
  coverageType:      String,
  claimAmount:       Number,
  approvedAmount:    Number,
  invoiceNumber:     String,
  submittedDate:     String,
  status:            String,
  notes:             String,
}, docSchemaOpts)

export default mongoose.model('Claim', claimSchema)
