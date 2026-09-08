import { Router } from 'express'
import Settings, { DEFAULT_SETTINGS } from '../models/Settings.js'
import { requireRole } from '../middleware/role.middleware.js'
import { logAudit } from '../utils/audit.js'
import { emitChanged } from '../utils/realtime.js'
import { sendTestEmail } from '../utils/mailer.js'

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

router.post('/test-email', requireRole('Admin'), async (req, res, next) => {
  try {
    const to = String(req.body?.email || '').trim()
    if (!to) return res.status(400).json({ message: 'Email address is required.' })
    await sendTestEmail(to)
    await logAudit(req, 'Tested', 'Settings', `SMTP email to ${to}`)
    res.json({ ok: true })
  } catch (err) {
    if (err.code === 'SMTP_NOT_CONFIGURED') {
      return res.status(400).json({ message: 'SMTP is not configured in server/.env.' })
    }
    next(err)
  }
})

export default router
