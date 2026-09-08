import crypto from 'crypto'
import bcrypt from 'bcrypt'
import Doctor from '../models/Doctor.js'
import User from '../models/User.js'
import Appointment from '../models/Appointment.js'
import Shift from '../models/Shift.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { Router } from 'express'
import { logAudit } from '../utils/audit.js'
import { requireRole, STAFF_ROLES } from '../middleware/role.middleware.js'
import { emitChanged } from '../utils/realtime.js'

const controller = makeCrudController(Doctor, {
  entity: 'Doctor',
  key: 'doctors',
  sort: { createdAt: -1 },
  label: (d) => d.name,
  audit: { add: true, update: true, delete: true },
  async cascadeOnDelete(doctor) {
    await Appointment.deleteMany({ doctorName: doctor.name })
    // Match by doctorId (shifts created through the app) or doctorName (seeded/
    // legacy shifts, which never got a doctorId), so deleting a doctor cleans up
    // their schedule regardless of how the shift was originally assigned.
    await Shift.deleteMany({ $or: [{ doctorId: doctor._id.toString() }, { doctorName: doctor.name }] })
  },
})

const router = Router()
router.get('/', requireRole(...STAFF_ROLES), controller.list)
router.post('/', requireRole('Admin'), controller.create)
router.put('/:id', async (req, res, next) => {
  try {
    if (req.user.role === 'Admin') return next()
    if (req.user.role !== 'Doctor') return res.status(403).json({ message: 'Forbidden' })
    const doctor = await Doctor.findById(req.params.id)
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' })
    if (String(doctor.uid || '') !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
    next()
  } catch (err) { next(err) }
}, controller.update)
router.delete('/:id', requireRole('Admin'), controller.remove)

// Onboards a new doctor "hospital-standard": one Admin action creates both the
// login account and the professional profile together, already linked — never
// two independently-created records that can drift apart or be left unlinked.
router.post('/onboard', requireRole('Admin'), async (req, res, next) => {
  try {
    const { name, email, specialty, department, phone, availability, schedule, about, experience, photo } = req.body
    if (!name?.trim() || !email?.trim() || !specialty?.trim()) {
      return res.status(400).json({ message: 'Name, email and specialty are required.' })
    }
    const normalizedEmail = email.toLowerCase().trim()
    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' })

    const tempPassword = crypto.randomBytes(6).toString('hex')
    const passwordHash = await bcrypt.hash(tempPassword, 10)
    const user = await User.create({
      name, email: normalizedEmail, password: passwordHash, phone: phone || '', avatar: photo || '',
      role: 'Doctor', mustChangePassword: true,
    })

    try {
      const doctor = await Doctor.create({
        name, specialty, department: department || '', phone: phone || '', email: normalizedEmail,
        availability: availability || 'Available', schedule: schedule || '', about: about || '',
        experience: experience || '', photo: photo || '', uid: user._id.toString(),
        createdAt: new Date().toISOString(),
      })
      await logAudit(req, 'Added', 'Doctor', name)
      emitChanged(req, 'doctors')
      emitChanged(req, 'users')
      res.status(201).json({ doctor, tempPassword })
    } catch (err) {
      await User.findByIdAndDelete(user._id)
      throw err
    }
  } catch (err) { next(err) }
})

router.put('/:id/link-user', requireRole('Admin'), async (req, res, next) => {
  try {
    const { userId } = req.body
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { uid: userId }, { new: true })
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' })
    await logAudit(req, 'Linked', 'Doctor Profile', `doctorId:${req.params.id} -> uid:${userId}`)
    emitChanged(req, 'doctors')
    res.json(doctor)
  } catch (err) { next(err) }
})

export default router
