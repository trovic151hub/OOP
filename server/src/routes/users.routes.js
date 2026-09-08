import { Router } from 'express'
import User from '../models/User.js'
import Doctor from '../models/Doctor.js'
import Nurse from '../models/Nurse.js'
import Patient from '../models/Patient.js'
import { requireRole, requireSelfOrRole, STAFF_ROLES } from '../middleware/role.middleware.js'
import { logAudit } from '../utils/audit.js'
import { emitChanged } from '../utils/realtime.js'

const router = Router()
const ROLES = ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Patient']

router.get('/', requireRole(...STAFF_ROLES), async (req, res, next) => {
  try {
    const docs = await User.find({}).sort({ createdAt: 1 })
    res.json(docs)
  } catch (err) { next(err) }
})

router.put('/:id', requireSelfOrRole('id', 'Admin'), async (req, res, next) => {
  try {
    const body = { ...req.body }
    delete body.id
    delete body._id
    delete body.role
    delete body.password
    const user = await User.findByIdAndUpdate(req.params.id, body, { new: true })
    if (!user) return res.status(404).json({ message: 'Not found' })
    await logAudit(req, 'Updated', 'User Profile', body.name || req.params.id)
    emitChanged(req, 'users')
    res.json(user)
  } catch (err) { next(err) }
})

router.put('/:id/last-seen', requireSelfOrRole('id', 'Admin'), async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { lastSeen: new Date().toISOString() })
    res.status(204).end()
  } catch (err) { next(err) }
})

router.delete('/:id', requireRole('Admin'), async (req, res, next) => {
  try {
    const targetId = req.params.id
    if (targetId === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account.' })
    }
    const user = await User.findById(targetId)
    if (!user) return res.status(404).json({ message: 'Not found' })

    if (user.role === 'Admin') {
      const adminCount = await User.countDocuments({ role: 'Admin' })
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the only remaining Admin account.' })
      }
    }

    // Unlink rather than delete their Doctor/Nurse profile — the professional
    // record (appointments, patient history references) should survive the
    // account being removed; it just goes back to the "not linked" state.
    await Doctor.updateMany({ uid: targetId }, { uid: '' })
    await Nurse.updateMany({ uid: targetId }, { uid: '' })
    await User.findByIdAndDelete(targetId)
    await logAudit(req, 'Deleted', 'User', `${user.name} (${user.email})`)
    emitChanged(req, 'users')
    emitChanged(req, 'doctors')
    emitChanged(req, 'nurses')
    res.status(204).end()
  } catch (err) { next(err) }
})

router.put('/:id/role', requireRole('Admin'), async (req, res, next) => {
  try {
    const { role } = req.body
    const uid = req.params.id
    if (!ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role.' })

    const existingUser = await User.findById(uid)
    if (!existingUser) return res.status(404).json({ message: 'Not found' })
    if (existingUser.role === 'Admin' && role !== 'Admin') {
      const adminCount = await User.countDocuments({ role: 'Admin' })
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot remove the only remaining Admin account.' })
      }
    }

    const user = await User.findByIdAndUpdate(uid, { role }, { new: true })
    await logAudit(req, 'Role Changed', 'User', `${uid} -> ${role}`)

    if (role === 'Doctor') {
      const alreadyLinked = await Doctor.findOne({ uid })
      if (!alreadyLinked) {
        const byEmail = user.email ? await Doctor.findOne({ email: user.email }) : null
        if (byEmail) {
          byEmail.uid = uid
          await byEmail.save()
          await logAudit(req, 'Linked', 'Doctor Profile', `${user.email} -> uid:${uid}`)
        } else {
          await Doctor.create({
            uid,
            name: user.name || 'Doctor',
            email: user.email || '',
            phone: user.phone || '',
            specialty: '',
            department: '',
            availability: 'Available',
            schedule: '',
            about: '',
            experience: '',
            createdAt: new Date().toISOString(),
          })
        }
        emitChanged(req, 'doctors')
      }
    }

    if (role === 'Nurse') {
      const alreadyLinked = await Nurse.findOne({ uid })
      if (!alreadyLinked) {
        const byEmail = user.email ? await Nurse.findOne({ email: user.email }) : null
        if (byEmail) {
          byEmail.uid = uid
          await byEmail.save()
          await logAudit(req, 'Linked', 'Nurse Profile', `${user.email} -> uid:${uid}`)
        } else {
          await Nurse.create({
            uid,
            name: user.name || 'Nurse',
            email: user.email || '',
            phone: user.phone || '',
            specialty: '',
            department: '',
            availability: 'Available',
            schedule: '',
            about: '',
            experience: '',
            createdAt: new Date().toISOString(),
          })
        }
        emitChanged(req, 'nurses')
      }
    }

    if (role === 'Patient') {
      const alreadyLinked = await Patient.findOne({ uid })
      if (!alreadyLinked) {
        const byEmail = user.email ? await Patient.findOne({ email: user.email }) : null
        if (byEmail) {
          byEmail.uid = uid
          await byEmail.save()
          await logAudit(req, 'Linked', 'Patient Profile', `${user.email} -> uid:${uid}`)
        } else {
          await Patient.create({
            uid,
            name: user.name || 'Patient',
            email: user.email || '',
            phone: user.phone || '',
            status: 'Active',
            patientType: 'Outpatient',
            createdAt: new Date().toISOString(),
          })
        }
        emitChanged(req, 'patients')
      }
    }

    emitChanged(req, 'users')
    res.json(user)
  } catch (err) { next(err) }
})

export default router
