import { Router } from 'express'
import Notification from '../models/Notification.js'
import { requireRole } from '../middleware/role.middleware.js'
import { patientOwnedRecordQuery } from '../utils/patientScope.js'

const router = Router()

async function notificationScope(user) {
  if (user.role !== 'Patient') return {}
  const patientScope = await patientOwnedRecordQuery(user)
  return {
    $or: [
      { userId: user.id },
      { patientEmail: user.email },
      ...patientScope.$or,
    ],
  }
}

router.get('/', requireRole('Patient'), async (req, res, next) => {
  try {
    const docs = await Notification.find(await notificationScope(req.user)).sort({ createdAt: -1 }).limit(100)
    res.json(docs)
  } catch (err) {
    next(err)
  }
})

router.put('/:id/read', requireRole('Patient'), async (req, res, next) => {
  try {
    const scope = await notificationScope(req.user)
    const doc = await Notification.findOneAndUpdate(
      { _id: req.params.id, ...scope },
      { read: true, readAt: new Date().toISOString() },
      { new: true }
    )
    if (!doc) return res.status(404).json({ message: 'Notification not found' })
    res.json(doc)
  } catch (err) {
    next(err)
  }
})

router.put('/read-all', requireRole('Patient'), async (req, res, next) => {
  try {
    const scope = await notificationScope(req.user)
    await Notification.updateMany(scope, { read: true, readAt: new Date().toISOString() })
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
