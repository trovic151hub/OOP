import Expense from '../models/Expense.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'

const controller = makeCrudController(Expense, {
  entity: 'Expense',
  sort: { date: -1 },
  label: (d) => d.description,
  audit: { add: true, update: true, delete: true },
})

export default makeCrudRouter(controller)
