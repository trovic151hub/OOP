import mongoose from 'mongoose'
import { docSchemaOpts } from './plugins.js'

const inventorySchema = new mongoose.Schema({
  name:         String,
  category:     String,
  quantity:     Number,
  unit:         String,
  reorderLevel: Number,
  supplier:     String,
  location:     String,
  status:       String,
}, docSchemaOpts)

export default mongoose.model('Inventory', inventorySchema)
