import Claim from '../models/Claim.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'

const controller = makeCrudController(Claim, {
  entity: 'Claim',
  sort: { submittedDate: -1 },
  label: (d) => `${d.patientName} - ${d.insuranceProvider}`,
  audit: { add: true, update: true, delete: true },
})

export default makeCrudRouter(controller)
