import LabResult from '../models/LabResult.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'
import { requireRole, STAFF_ROLES } from '../middleware/role.middleware.js'
import { patientOwnedRecordQuery } from '../utils/patientScope.js'

const controller = makeCrudController(LabResult, {
  entity: 'Lab Result',
  key: 'labResults',
  sort: { date: -1 },
  label: (d) => `${d.testName} - ${d.patientName}`,
  audit: { add: true, update: false, delete: true },
  listQuery: (req) => patientOwnedRecordQuery(req.user),
})

export default makeCrudRouter(controller, {
  list: requireRole(...STAFF_ROLES, 'Patient'),
  create: requireRole(...STAFF_ROLES),
  update: requireRole(...STAFF_ROLES),
  remove: requireRole(...STAFF_ROLES),
})
