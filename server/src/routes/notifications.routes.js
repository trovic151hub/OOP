import { Router } from 'express'
import Notification from '../models/Notification.js'
import { requireRole, STAFF_ROLES } from '../middleware/role.middleware.js'
import { patientOwnedRecordQuery } from '../utils/patientScope.js'
import { emitChanged } from '../utils/realtime.js'

const router = Router()

async function notificationScope(user) {
  if (user.role !== 'Patient') {
    return {
      audience: 'staff',
      excludedUserIds: { $ne: user.id },
      $or: [
        { recipientUserId: user.id },
        { recipientRoles: user.role },
        { recipientRoles: 'Staff' },
        { recipientRoles: { $exists: false } },
      ],
    }
  }
  const patientScope = await patientOwnedRecordQuery(user)
  return {
    audience: { $ne: 'staff' },
    $or: [
      { userId: user.id },
      { patientEmail: user.email },
      ...patientScope.$or,
    ],
  }
}

function serializeNotification(doc, user) {
  const obj = doc.toJSON()
  if (user.role !== 'Patient') {
    const readReceipt = (obj.readBy || []).find(r => r.userId === user.id)
    obj.read = !!readReceipt
    obj.readAt = readReceipt?.readAt || ''
  }
  return obj
}

router.get('/', requireRole(...STAFF_ROLES, 'Patient'), async (req, res, next) => {
  try {
    const docs = await Notification.find(await notificationScope(req.user)).sort({ createdAt: -1 }).limit(100)
    res.json(docs.map(doc => serializeNotification(doc, req.user)))
  } catch (err) {
    next(err)
  }
})

router.put('/:id/read', requireRole(...STAFF_ROLES, 'Patient'), async (req, res, next) => {
  try {
    const scope = await notificationScope(req.user)
    const readAt = new Date().toISOString()
    const update = req.user.role === 'Patient'
      ? { read: true, readAt }
      : { $pull: { readBy: { userId: req.user.id } } }
    let doc = await Notification.findOneAndUpdate({ _id: req.params.id, ...scope }, update, { new: true })
    if (doc && req.user.role !== 'Patient') {
      doc = await Notification.findOneAndUpdate(
        { _id: req.params.id, ...scope },
        { $addToSet: { readBy: { userId: req.user.id, readAt } } },
        { new: true }
      )
    }
    if (!doc) return res.status(404).json({ message: 'Notification not found' })
    emitChanged(req, 'notifications')
    res.json(serializeNotification(doc, req.user))
  } catch (err) {
    next(err)
  }
})

router.put('/read-all', requireRole(...STAFF_ROLES, 'Patient'), async (req, res, next) => {
  try {
    const scope = await notificationScope(req.user)
    const readAt = new Date().toISOString()
    if (req.user.role === 'Patient') {
      await Notification.updateMany(scope, { read: true, readAt })
    } else {
      await Notification.updateMany(scope, { $pull: { readBy: { userId: req.user.id } } })
      await Notification.updateMany(scope, { $addToSet: { readBy: { userId: req.user.id, readAt } } })
    }
    emitChanged(req, 'notifications')
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
