import { Router } from 'express'
import Inventory from '../models/Inventory.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { logAudit } from '../utils/audit.js'

const controller = makeCrudController(Inventory, {
  entity: 'Inventory',
  sort: { createdAt: -1 },
  label: (d) => d.name,
  audit: { add: true, update: true, delete: true },
})

const router = Router()
router.get('/', controller.list)
router.post('/', controller.create)
router.put('/:id', controller.update)
router.delete('/:id', controller.remove)

router.post('/deduct-for-prescription', async (req, res, next) => {
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
    res.json({ deducted })
  } catch (err) { next(err) }
})

export default router
