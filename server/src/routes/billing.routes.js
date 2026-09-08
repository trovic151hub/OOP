import Invoice from '../models/Invoice.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'
import { requireRole, FRONT_DESK_ROLES } from '../middleware/role.middleware.js'
import { patientOwnedRecordQuery } from '../utils/patientScope.js'
import { deliverNotification } from '../utils/notificationDelivery.js'

const controller = makeCrudController(Invoice, {
  entity: 'Invoice',
  key: 'billing',
  sort: { createdAt: -1 },
  label: (d) => `${d.patientName} - ${d.total}`,
  audit: { add: true, update: false, delete: true },
  listQuery: (req) => patientOwnedRecordQuery(req.user),
})

const router = makeCrudRouter(controller, {
  list: requireRole(...FRONT_DESK_ROLES, 'Patient'),
  create: requireRole(...FRONT_DESK_ROLES),
  update: requireRole(...FRONT_DESK_ROLES),
  remove: requireRole(...FRONT_DESK_ROLES),
})

router.post('/:id/pay', requireRole('Patient'), async (req, res, next) => {
  try {
    const scope = await patientOwnedRecordQuery(req.user)
    const invoice = await Invoice.findOne({ _id: req.params.id, ...scope })
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' })
    if (invoice.status === 'Paid') return res.json(invoice)
    if (invoice.status === 'Waived') return res.status(400).json({ message: 'This invoice does not require payment' })

    const method = String(req.body?.paymentMethod || 'Card').slice(0, 40)
    invoice.status = 'Paid'
    invoice.paymentMethod = method
    invoice.paidAt = new Date().toISOString()
    invoice.paymentReference = `STUB-${Date.now()}`
    invoice.patientPaymentStub = true
    await invoice.save()
    await deliverNotification({
      userId: req.user.id,
      patientId: invoice.patientId,
      patientEmail: invoice.patientEmail || req.user.email,
      title: 'Payment recorded',
      message: `Your payment for ${invoice.description || 'medical services'} was recorded.`,
      type: 'billing',
      target: 'billing',
      createdAt: new Date().toISOString(),
    })
    res.json(invoice)
  } catch (err) {
    next(err)
  }
})

export default router
