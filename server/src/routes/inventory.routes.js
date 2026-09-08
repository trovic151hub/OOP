import { Router } from 'express'
import Inventory from '../models/Inventory.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { logAudit } from '../utils/audit.js'
import { emitChanged } from '../utils/realtime.js'
import { requireRole, FRONT_DESK_ROLES, STAFF_ROLES } from '../middleware/role.middleware.js'

const controller = makeCrudController(Inventory, {
  entity: 'Inventory',
  key: 'inventory',
  sort: { createdAt: -1 },
  label: (d) => d.name,
  audit: { add: true, update: true, delete: true },
})

const router = Router()
router.get('/', requireRole(...FRONT_DESK_ROLES), controller.list)
router.post('/', requireRole('Admin'), controller.create)
router.put('/:id', requireRole('Admin'), controller.update)
router.delete('/:id', requireRole('Admin'), controller.remove)

router.post('/deduct-for-prescription', requireRole(...STAFF_ROLES), async (req, res, next) => {
  try {
    const { prescriptionText } = req.body
    if (!prescriptionText || !prescriptionText.trim()) return res.json({ deducted: [] })

    const items = await Inventory.find({})
    const lower = prescriptionText.toLowerCase()
    const deducted = []
    for (const item of items) {
      if (item.name && lower.includes(item.name.toLowerCase()) && (item.quantity || 0) > 0) {
        item.quantity = Math.max(0, (item.quantity || 0) - 1)
        await item.save()
        await logAudit(req, 'Deducted', 'Inventory', `${item.name} (Rx)`)
        deducted.push(item.name)
      }
    }
    if (deducted.length) emitChanged(req, 'inventory')
    res.json({ deducted })
  } catch (err) { next(err) }
})

export default router
