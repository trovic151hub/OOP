import { Router } from 'express'
import Settings, { DEFAULT_SETTINGS } from '../models/Settings.js'
import { requireRole } from '../middleware/role.middleware.js'
import { logAudit } from '../utils/audit.js'
import { emitChanged } from '../utils/realtime.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const doc = await Settings.findById('hospital').lean()
    res.json({ ...DEFAULT_SETTINGS, ...(doc || {}) })
  } catch (err) { next(err) }
})

router.put('/', requireRole('Admin'), async (req, res, next) => {
  try {
    const body = { ...req.body }
    delete body.id
    delete body._id
    const doc = await Settings.findByIdAndUpdate('hospital', { $set: body }, { new: true, upsert: true }).lean()
    await logAudit(req, 'Updated', 'Settings', 'Hospital Settings')
    emitChanged(req, 'settings')
    res.json({ ...DEFAULT_SETTINGS, ...doc })
  } catch (err) { next(err) }
})

export default router
