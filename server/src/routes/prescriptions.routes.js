import Prescription from '../models/Prescription.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'

const controller = makeCrudController(Prescription, {
  entity: 'Prescription',
  sort: { date: -1 },
  label: (d) => d.patientName,
  audit: { add: true, update: true, delete: false },
})

export default makeCrudRouter(controller)
