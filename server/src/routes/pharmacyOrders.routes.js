import PharmacyOrder from '../models/PharmacyOrder.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'
import { requireRole, FRONT_DESK_ROLES } from '../middleware/role.middleware.js'

const controller = makeCrudController(PharmacyOrder, {
  entity: 'Pharmacy Order',
  key: 'pharmacyOrders',
  sort: { createdAt: -1 },
  label: (d) => d.patientName,
  audit: { add: true, update: false, delete: false },
})

export default makeCrudRouter(controller, { all: requireRole(...FRONT_DESK_ROLES) })
