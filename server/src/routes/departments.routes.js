import Department from '../models/Department.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'
import { requireRole, STAFF_ROLES } from '../middleware/role.middleware.js'

const controller = makeCrudController(Department, {
  entity: 'Department',
  key: 'departments',
  sort: { createdAt: -1 },
  label: (d) => d.name,
  audit: { add: true, update: true, delete: true },
})

export default makeCrudRouter(controller, {
  list: requireRole(...STAFF_ROLES),
  create: requireRole('Admin'),
  update: requireRole('Admin'),
  remove: requireRole('Admin'),
})
