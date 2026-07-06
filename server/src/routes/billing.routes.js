import Invoice from '../models/Invoice.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'

const controller = makeCrudController(Invoice, {
  entity: 'Invoice',
  sort: { createdAt: -1 },
  label: (d) => `${d.patientName} - ${d.total}`,
  audit: { add: true, update: false, delete: true },
})

export default makeCrudRouter(controller)
