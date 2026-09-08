import crypto from 'crypto'
import bcrypt from 'bcrypt'
import Nurse from '../models/Nurse.js'
import User from '../models/User.js'
import Shift from '../models/Shift.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { Router } from 'express'
import { logAudit } from '../utils/audit.js'
import { requireRole, STAFF_ROLES } from '../middleware/role.middleware.js'
import { emitChanged } from '../utils/realtime.js'

const controller = makeCrudController(Nurse, {
  entity: 'Nurse',
  key: 'nurses',
  sort: { createdAt: -1 },
  label: (n) => n.name,
  audit: { add: true, update: true, delete: true },
  async cascadeOnDelete(nurse) {
    // Match by nurseId (shifts created through the app) or nurseName (legacy
    // shifts without a nurseId), so deleting a nurse cleans up their schedule
    // regardless of how the shift was originally assigned.
    await Shift.deleteMany({ $or: [{ nurseId: nurse._id.toString() }, { nurseName: nurse.name }] })
  },
})

const router = Router()
router.get('/', requireRole(...STAFF_ROLES), controller.list)
router.post('/', requireRole('Admin'), controller.create)
router.put('/:id', async (req, res, next) => {
  try {
    if (req.user.role === 'Admin') return next()
    if (req.user.role !== 'Nurse') return res.status(403).json({ message: 'Forbidden' })
    const nurse = await Nurse.findById(req.params.id)
    if (!nurse) return res.status(404).json({ message: 'Nurse not found' })
    if (String(nurse.uid || '') !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
    next()
  } catch (err) { next(err) }
}, controller.update)
router.delete('/:id', requireRole('Admin'), controller.remove)

// Onboards a new nurse "hospital-standard": one Admin action creates both the
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
      role: 'Nurse', mustChangePassword: true,
    })

    try {
      const nurse = await Nurse.create({
        name, specialty, department: department || '', phone: phone || '', email: normalizedEmail,
        availability: availability || 'Available', schedule: schedule || '', about: about || '',
        experience: experience || '', photo: photo || '', uid: user._id.toString(),
        createdAt: new Date().toISOString(),
      })
      await logAudit(req, 'Added', 'Nurse', name)
      emitChanged(req, 'nurses')
      emitChanged(req, 'users')
      res.status(201).json({ nurse, tempPassword })
    } catch (err) {
      await User.findByIdAndDelete(user._id)
      throw err
    }
  } catch (err) { next(err) }
})

router.put('/:id/link-user', requireRole('Admin'), async (req, res, next) => {
  try {
    const { userId } = req.body
    const nurse = await Nurse.findByIdAndUpdate(req.params.id, { uid: userId }, { new: true })
    if (!nurse) return res.status(404).json({ message: 'Nurse not found' })
    await logAudit(req, 'Linked', 'Nurse Profile', `nurseId:${req.params.id} -> uid:${userId}`)
    emitChanged(req, 'nurses')
    res.json(nurse)
  } catch (err) { next(err) }
})

export default router
