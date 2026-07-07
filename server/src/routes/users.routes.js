import { Router } from 'express'
import User from '../models/User.js'
import Doctor from '../models/Doctor.js'
import { requireRole } from '../middleware/role.middleware.js'
import { logAudit } from '../utils/audit.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const docs = await User.find({}).sort({ createdAt: 1 })
    res.json(docs)
  } catch (err) { next(err) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const body = { ...req.body }
    delete body.id
    delete body._id
    delete body.role
    delete body.password
    const user = await User.findByIdAndUpdate(req.params.id, body, { new: true })
    if (!user) return res.status(404).json({ message: 'Not found' })
    await logAudit(req, 'Updated', 'User Profile', body.name || req.params.id)
    res.json(user)
  } catch (err) { next(err) }
})

router.put('/:id/last-seen', async (req, res, next) => {
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

    // Unlink rather than delete their Doctor profile — the professional record
    // (appointments, patient history references) should survive the account
    // being removed; it just goes back to the "not linked" state.
    await Doctor.updateMany({ uid: targetId }, { uid: '' })
    await User.findByIdAndDelete(targetId)
    await logAudit(req, 'Deleted', 'User', `${user.name} (${user.email})`)
    res.status(204).end()
  } catch (err) { next(err) }
})

router.put('/:id/role', requireRole('Admin'), async (req, res, next) => {
  try {
    const { role } = req.body
    const uid = req.params.id
    const user = await User.findByIdAndUpdate(uid, { role }, { new: true })
    if (!user) return res.status(404).json({ message: 'Not found' })
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
      }
    }

    res.json(user)
  } catch (err) { next(err) }
})

export default router
