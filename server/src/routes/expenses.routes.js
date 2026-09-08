import Expense from '../models/Expense.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'
import { requireRole } from '../middleware/role.middleware.js'

const controller = makeCrudController(Expense, {
  entity: 'Expense',
  key: 'expenses',
  sort: { date: -1 },
  label: (d) => d.description,
  audit: { add: true, update: true, delete: true },
})

export default makeCrudRouter(controller, { all: requireRole('Admin') })
