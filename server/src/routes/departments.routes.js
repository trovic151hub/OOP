import Department from '../models/Department.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'

const controller = makeCrudController(Department, {
  entity: 'Department',
  sort: { createdAt: -1 },
  label: (d) => d.name,
  audit: { add: true, update: true, delete: true },
})

export default makeCrudRouter(controller)
