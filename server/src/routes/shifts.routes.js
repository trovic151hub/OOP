import Shift from '../models/Shift.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'

const controller = makeCrudController(Shift, {
  entity: 'Shift',
  key: 'shifts',
  sort: { createdAt: 1 },
  audit: { add: false, update: false, delete: false },
})

export default makeCrudRouter(controller)
