import LabResult from '../models/LabResult.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'

const controller = makeCrudController(LabResult, {
  entity: 'Lab Result',
  sort: { date: -1 },
  label: (d) => `${d.testName} - ${d.patientName}`,
  audit: { add: true, update: false, delete: true },
})

export default makeCrudRouter(controller)
