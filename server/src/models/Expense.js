import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const expenseSchema = new mongoose.Schema({
  description:   String,
  category:      String,
  amount:        Number,
  date:          String,
  status:        String,
  paymentMethod: String,
  vendor:        String,
  notes:         String,
  recurring:     Boolean,
}, docSchemaOpts)

export default mongoose.model('Expense', expenseSchema)
