import PharmacyOrder from '../models/PharmacyOrder.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'

const controller = makeCrudController(PharmacyOrder, {
  entity: 'Pharmacy Order',
  sort: { createdAt: -1 },
  label: (d) => d.patientName,
  audit: { add: true, update: false, delete: false },
})

export default makeCrudRouter(controller)
