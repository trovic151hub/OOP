import LabResult from '../models/LabResult.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'
import { requireRole, STAFF_ROLES } from '../middleware/role.middleware.js'
import { patientOwnedRecordQuery } from '../utils/patientScope.js'
import { deliverStaffNotification } from '../utils/notificationDelivery.js'

const controller = makeCrudController(LabResult, {
  entity: 'Lab Result',
  key: 'labResults',
  sort: { date: -1 },
  label: (d) => `${d.testName} - ${d.patientName}`,
  audit: { add: true, update: false, delete: true },
  listQuery: (req) => patientOwnedRecordQuery(req.user),
  afterCreate: async (doc, req) => {
    if (doc.status !== 'Abnormal') return
    await deliverStaffNotification({
      recipientRoles: ['Admin', 'Doctor', 'Nurse'],
      title: 'Abnormal lab result',
      message: `${doc.testName || 'Lab result'} for ${doc.patientName || 'a patient'} was marked abnormal.`,
      type: 'lab-results',
      target: 'lab-results',
      targetEntityId: doc._id.toString(),
      priority: 'High',
    }, req)
  },
  afterUpdate: async (doc, previous, req) => {
    if (doc.status !== 'Abnormal' || previous?.status === 'Abnormal') return
    await deliverStaffNotification({
      recipientRoles: ['Admin', 'Doctor', 'Nurse'],
      title: 'Lab result changed to abnormal',
      message: `${doc.testName || 'Lab result'} for ${doc.patientName || 'a patient'} now needs clinical review.`,
      type: 'lab-results',
      target: 'lab-results',
      targetEntityId: doc._id.toString(),
      priority: 'High',
    }, req)
  },
})

export default makeCrudRouter(controller, {
  list: requireRole(...STAFF_ROLES, 'Patient'),
  create: requireRole(...STAFF_ROLES),
  update: requireRole(...STAFF_ROLES),
  remove: requireRole(...STAFF_ROLES),
})
