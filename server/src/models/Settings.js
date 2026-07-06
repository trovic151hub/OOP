import mongoose from 'mongoose'
import { idTransform } from './plugins.js'

const settingsSchema = new mongoose.Schema({
  _id:                 { type: String, default: 'hospital' },
  hospitalName:        String,
  tagline:             String,
  licenseNumber:       String,
  address:             String,
  phone:               String,
  email:               String,
  website:             String,
  emergencyPhone:      String,
  timezone:            String,
  currency:            String,
  workingHoursStart:   String,
  workingHoursEnd:     String,
  appointmentDuration: Number,
  maxPatientsPerDay:   Number,
  bedCapacity:         Number,
  taxRate:             Number,
  invoicePrefix:       String,
  paymentTerms:        String,
  invoiceNotes:        String,
  logo:                String,
}, { strict: false, toJSON: { transform: idTransform.transform, virtuals: true } })

export const DEFAULT_SETTINGS = {
  hospitalName: 'MedCore Hospital',
  tagline: 'Excellence in Healthcare',
  address: '',
  phone: '',
  email: '',
  website: '',
  timezone: 'UTC',
  currency: 'USD',
  workingHoursStart: '08:00',
  workingHoursEnd: '18:00',
  appointmentDuration: 30,
  logo: '',
}

export default mongoose.model('Settings', settingsSchema)
