import Shift from '../models/Shift.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'
import { requireRole, STAFF_ROLES } from '../middleware/role.middleware.js'

const controller = makeCrudController(Shift, {
  entity: 'Shift',
  key: 'shifts',
  sort: { createdAt: 1 },
  audit: { add: false, update: false, delete: false },
})

export default makeCrudRouter(controller, {
  list: requireRole(...STAFF_ROLES),
  create: requireRole('Admin'),
  update: requireRole('Admin'),
  remove: requireRole('Admin'),
})
