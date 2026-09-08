import Patient from '../models/Patient.js'
import Appointment from '../models/Appointment.js'
import MedicalRecord from '../models/MedicalRecord.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'
import { requireRole, STAFF_ROLES } from '../middleware/role.middleware.js'

const PATIENT_EDIT_FIELDS = ['phone', 'address', 'emergencyContact', 'allergies', 'insurance', 'notes']

async function guardPatientSelfUpdate(req, res, next) {
  try {
    if (req.user.role !== 'Patient') return next()
    const patient = await Patient.findById(req.params.id)
    if (!patient) return res.status(404).json({ message: 'Patient not found' })
    const ownsRecord = patient.uid === req.user.id || patient.email === req.user.email || patient.name === req.user.name
    if (!ownsRecord) return res.status(403).json({ message: 'Forbidden' })
    req.body = Object.fromEntries(PATIENT_EDIT_FIELDS
      .filter(field => Object.prototype.hasOwnProperty.call(req.body, field))
      .map(field => [field, req.body[field]]))
    next()
  } catch (err) { next(err) }
}

const controller = makeCrudController(Patient, {
  entity: 'Patient',
  key: 'patients',
  sort: { createdAt: -1 },
  label: (d) => d.name,
  audit: { add: true, update: true, delete: true },
  listQuery: (req) => req.user.role === 'Patient'
    ? { $or: [{ uid: req.user.id }, { email: req.user.email }, { name: req.user.name }] }
    : {},
  async cascadeOnDelete(patient) {
    await Appointment.deleteMany({ patientName: patient.name })
    await MedicalRecord.deleteMany({ patientId: patient._id.toString() })
  },
})

export default makeCrudRouter(controller, {
  list: requireRole(...STAFF_ROLES, 'Patient'),
  create: requireRole(...STAFF_ROLES),
  update: [requireRole(...STAFF_ROLES, 'Patient'), guardPatientSelfUpdate],
  remove: requireRole(...STAFF_ROLES),
})
