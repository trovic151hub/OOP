import Claim from '../models/Claim.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'
import { requireRole, FRONT_DESK_ROLES } from '../middleware/role.middleware.js'

const controller = makeCrudController(Claim, {
  entity: 'Claim',
  key: 'claims',
  sort: { submittedDate: -1 },
  label: (d) => `${d.patientName} - ${d.insuranceProvider}`,
  audit: { add: true, update: true, delete: true },
})

export default makeCrudRouter(controller, { all: requireRole(...FRONT_DESK_ROLES) })
