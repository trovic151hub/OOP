import mongoose from 'mongoose'
import { idTransform, timestampsOpt } from './plugins.js'

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role:     { type: String, enum: ['Admin', 'Doctor', 'Receptionist', 'Patient'], default: 'Receptionist' },
  phone:    { type: String, default: '' },
  bio:      { type: String, default: '' },
  avatar:   { type: String, default: '' },
  lastSeen: { type: Date },
  resetPasswordTokenHash:   { type: String, select: false },
  resetPasswordExpiresAt:  { type: Date, select: false },
  // Set when an Admin onboards a staff member with a system-generated temp
  // password, so the frontend can force a password change before granting
  // normal access — the temp password never quietly becomes permanent.
  mustChangePassword: { type: Boolean, default: false },
}, {
  timestamps: timestampsOpt,
  toJSON: {
    virtuals: true,
    // The frontend (carried over from the Firebase-era data shape) expects every
    // user object to expose `uid` alongside `id` — e.g. matching a doctor's linked
    // account, or comparing a row in the Users list against the logged-in user.
    transform(doc, ret) {
      idTransform.transform(doc, ret)
      ret.uid = ret.id
    },
  },
})

export default mongoose.model('User', userSchema)
