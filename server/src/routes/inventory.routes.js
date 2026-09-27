import { Router } from 'express'
import Inventory from '../models/Inventory.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { logAudit } from '../utils/audit.js'
import { emitChanged } from '../utils/realtime.js'
import { requireRole, FRONT_DESK_ROLES, STAFF_ROLES } from '../middleware/role.middleware.js'
import { deliverStaffNotification } from '../utils/notificationDelivery.js'

function stockStatus(item) {
  const quantity = parseInt(item.quantity) || 0
  const reorderLevel = parseInt(item.reorderLevel) || 0
  if (quantity === 0) return 'Out of Stock'
  if (quantity <= reorderLevel) return 'Low Stock'
  return 'In Stock'
}

async function notifyLowStock(doc, previous, req) {
  const status = stockStatus(doc)
  if (status === 'In Stock') return
  if (previous && stockStatus(previous) !== 'In Stock' && previous.quantity === doc.quantity) return
  await deliverStaffNotification({
    recipientRoles: ['Admin', 'Receptionist'],
    title: status === 'Out of Stock' ? 'Inventory out of stock' : 'Low stock alert',
    message: `${doc.name || 'Inventory item'} has ${parseInt(doc.quantity) || 0} ${doc.unit || ''} remaining.`,
    type: 'inventory',
    target: 'inventory',
    targetEntityId: doc._id.toString(),
    priority: status === 'Out of Stock' ? 'High' : 'Normal',
  }, req)
}

const controller = makeCrudController(Inventory, {
  entity: 'Inventory',
  key: 'inventory',
  sort: { createdAt: -1 },
  label: (d) => d.name,
  audit: { add: true, update: true, delete: true },
  afterCreate: async (doc, req) => notifyLowStock(doc, null, req),
  afterUpdate: async (doc, previous, req) => notifyLowStock(doc, previous, req),
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
        await notifyLowStock(item, null, req)
        deducted.push(item.name)
      }
    }
    if (deducted.length) emitChanged(req, 'inventory')
    res.json({ deducted })
  } catch (err) { next(err) }
})

export default router
