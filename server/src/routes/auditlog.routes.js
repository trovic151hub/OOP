import { Router } from 'express'
import AuditLog from '../models/AuditLog.js'
import { requireRole } from '../middleware/role.middleware.js'

const router = Router()

router.get('/', requireRole('Admin'), async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 500)
    const docs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(limit)
    res.json(docs)
  } catch (err) { next(err) }
})

export default router
